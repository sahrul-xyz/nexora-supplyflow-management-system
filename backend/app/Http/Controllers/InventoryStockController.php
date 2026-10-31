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
}
