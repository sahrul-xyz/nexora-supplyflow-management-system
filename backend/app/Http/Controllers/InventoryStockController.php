<?php

namespace App\Http\Controllers;

use App\Models\InventoryStock;
use App\Models\RawMaterial;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class InventoryStockController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('warehouse_type'); // 'raw_material', 'finished_goods', or null for both

        $rawMaterialsStock = [];
        if (!$type || $type === 'raw_material') {
            $rawMaterialsStock = RawMaterial::with('stock')
                ->where('is_active', true)
                ->orderBy('material_name')
                ->get()
                ->map(function ($item) {
                    $qty = $item->stock ? (float)$item->stock->quantity : 0.0;
                    $min = (float)$item->minimum_stock;
                    return [
                        'id' => $item->id,
                        'stock_id' => $item->stock ? $item->stock->id : null,
                        'material_code' => $item->material_code,
                        'material_name' => $item->material_name,
                        'unit' => $item->unit,
                        'minimum_stock' => $min,
                        'current_stock' => $qty,
                        'is_low_stock' => $qty <= $min,
                    ];
                });
        }

        $finishedGoodsStock = [];
        if (!$type || $type === 'finished_goods') {
            $finishedGoodsStock = ProductVariant::with(['product', 'stock'])
                ->where('is_active', true)
                ->orderBy('sku')
                ->get()
                ->map(function ($v) {
                    $qty = $v->stock ? (float)$v->stock->quantity : 0;
                    return [
                        'id' => $v->id,
                        'stock_id' => $v->stock ? $v->stock->id : null,
                        'sku' => $v->sku,
                        'product_id' => $v->product_id,
                        'product_name' => $v->product ? $v->product->product_name : '',
                        'category' => $v->product ? $v->product->category : '',
                        'size' => $v->size,
                        'color' => $v->color,
                        'current_stock' => (int)$qty,
                        'is_low_stock' => $qty < 10,
                    ];
                });
        }

        return response()->json([
            'success' => true,
            'data' => [
                'raw_materials' => $rawMaterialsStock,
                'finished_goods' => $finishedGoodsStock,
                'summary' => [
                    'total_raw_material_items' => count($rawMaterialsStock),
                    'total_finished_goods_items' => count($finishedGoodsStock),
                    'low_raw_material_count' => collect($rawMaterialsStock)->where('is_low_stock', true)->count(),
                    'low_finished_goods_count' => collect($finishedGoodsStock)->where('is_low_stock', true)->count(),
                ],
            ],
        ]);
    }

    /**
     * Penyesuaian stok gudang: Tambah, Kurangi, Set Nilai Baru, atau Kosongkan/Hapus stok.
     */
    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'warehouse_type' => 'required|in:raw_material,finished_goods',
            'raw_material_id' => 'required_if:warehouse_type,raw_material|nullable|exists:raw_materials,id',
            'product_variant_id' => 'required_if:warehouse_type,finished_goods|nullable|exists:product_variants,id',
            'action' => 'required|in:add,reduce,set,reset',
            'quantity' => 'required_unless:action,reset|nullable|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $type = $validated['warehouse_type'];
        $action = $validated['action'];
        $amount = isset($validated['quantity']) ? (float)$validated['quantity'] : 0.0;

        if ($type === 'raw_material') {
            $stock = InventoryStock::firstOrCreate(
                ['warehouse_type' => 'raw_material', 'raw_material_id' => $validated['raw_material_id']],
                ['quantity' => 0]
            );
            $material = RawMaterial::find($validated['raw_material_id']);
            $itemName = $material ? $material->material_name : 'Bahan Baku';
            $unit = $material ? $material->unit : 'unit';
        } else {
            $stock = InventoryStock::firstOrCreate(
                ['warehouse_type' => 'finished_goods', 'product_variant_id' => $validated['product_variant_id']],
                ['quantity' => 0]
            );
            $variant = ProductVariant::with('product')->find($validated['product_variant_id']);
            $itemName = $variant ? ($variant->product->product_name . ' (' . $variant->sku . ')') : 'Barang Jadi';
            $unit = 'pasang';
        }

        $currentQty = (float) $stock->quantity;
        $newQty = $currentQty;

        switch ($action) {
            case 'add':
                $newQty = $currentQty + $amount;
                $msg = "Stok {$itemName} berhasil ditambah sebanyak {$amount} {$unit}. Total stok saat ini: {$newQty} {$unit}.";
                break;
            case 'reduce':
                if ($amount > $currentQty) {
                    return response()->json([
                        'success' => false,
                        'message' => "Pengurangan ({$amount} {$unit}) melebihi stok yang tersedia saat ini ({$currentQty} {$unit}).",
                    ], 422);
                }
                $newQty = max(0, $currentQty - $amount);
                $msg = "Stok {$itemName} berhasil dikurangi sebanyak {$amount} {$unit}. Sisa stok saat ini: {$newQty} {$unit}.";
                break;
            case 'set':
                $newQty = max(0, $amount);
                $msg = "Stok {$itemName} berhasil diatur menjadi {$newQty} {$unit}.";
                break;
            case 'reset':
                $newQty = 0.0;
                $msg = "Stok {$itemName} berhasil dikosongkan/dihapus (0 {$unit}).";
                break;
        }

        $stock->quantity = $newQty;
        $stock->save();

        return response()->json([
            'success' => true,
            'message' => $msg,
            'data' => [
                'stock_id' => $stock->id,
                'warehouse_type' => $stock->warehouse_type,
                'previous_quantity' => $currentQty,
                'new_quantity' => $newQty,
                'notes' => $validated['notes'] ?? null,
            ],
        ]);
    }

    /**
     * Hapus / Kosongkan stok secara spesifik berdasarkan ID InventoryStock
     */
    public function resetStock($id)
    {
        $stock = InventoryStock::findOrFail($id);
        $prev = (float) $stock->quantity;
        $stock->quantity = 0;
        $stock->save();

        return response()->json([
            'success' => true,
            'message' => "Stok berhasil dikosongkan/dihapus dari {$prev} menjadi 0.",
            'data' => $stock,
        ]);
    }
}
