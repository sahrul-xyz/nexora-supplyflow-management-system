<?php

namespace App\Http\Controllers;

use App\Models\ProductionOrder;
use App\Models\ProductionOrderDetail;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\BomDetail;
use App\Models\InventoryStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductionOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductionOrder::with(['product', 'creator', 'details.productVariant.stock']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('production_number', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('product_name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function show($id)
    {
        $order = ProductionOrder::with([
            'product.bomDetails.rawMaterial.stock',
            'creator',
            'details.productVariant.stock',
            'details.qcChecker',
        ])->findOrFail($id);

        // Calculate material requirements for this order
        $totalTarget = $order->details->sum('target_quantity');
        $materialRequirements = [];

        foreach ($order->product->bomDetails as $bom) {
            $required = $totalTarget * (float)$bom->quantity_required;
            $currentStock = $bom->rawMaterial->stock ? (float)$bom->rawMaterial->stock->quantity : 0.0;
            $materialRequirements[] = [
                'raw_material_id' => $bom->raw_material_id,
                'material_code' => $bom->rawMaterial->material_code,
                'material_name' => $bom->rawMaterial->material_name,
                'unit' => $bom->rawMaterial->unit,
                'bom_per_unit' => (float)$bom->quantity_required,
                'total_required' => $required,
                'available_stock' => $currentStock,
                'is_sufficient' => $currentStock >= $required,
                'shortage' => max(0, $required - $currentStock),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'production_order' => $order,
                'total_target' => $totalTarget,
                'material_requirements' => $materialRequirements,
            ],
        ]);
    }

    public function checkRequirements(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variants' => 'required|array|min:1',
            'variants.*.target_quantity' => 'required|integer|gt:0',
        ]);

        $product = Product::with(['bomDetails.rawMaterial.stock'])->findOrFail($request->product_id);

        $totalTarget = 0;
        foreach ($request->variants as $v) {
            $totalTarget += (int)$v['target_quantity'];
        }

        $allSufficient = true;
        $requirements = [];

        foreach ($product->bomDetails as $bom) {
            $required = $totalTarget * (float)$bom->quantity_required;
            $currentStock = $bom->rawMaterial->stock ? (float)$bom->rawMaterial->stock->quantity : 0.0;
            $isSufficient = $currentStock >= $required;

            if (!$isSufficient) {
                $allSufficient = false;
            }

            $requirements[] = [
                'raw_material_id' => $bom->raw_material_id,
                'material_code' => $bom->rawMaterial->material_code,
                'material_name' => $bom->rawMaterial->material_name,
                'unit' => $bom->rawMaterial->unit,
                'bom_per_unit' => (float)$bom->quantity_required,
                'total_required' => $required,
                'available_stock' => $currentStock,
                'is_sufficient' => $isSufficient,
                'shortage' => max(0, $required - $currentStock),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'product_id' => $product->id,
                'product_name' => $product->product_name,
                'total_target' => $totalTarget,
                'all_sufficient' => $allSufficient,
                'requirements' => $requirements,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'production_date' => 'required|date',
            'notes' => 'nullable|string',
            'variants' => 'required|array|min:1',
            'variants.*.product_variant_id' => 'required|exists:product_variants,id',
            'variants.*.target_quantity' => 'required|integer|gt:0',
        ]);

        // Validate variants belong to the product (BR-08)
        $product = Product::with('bomDetails')->findOrFail($validated['product_id']);
        if ($product->bomDetails->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Produk ini belum memiliki Bill of Materials (BOM). Silakan isi BOM terlebih dahulu.',
            ], 422);
        }

        $validVariantIds = ProductVariant::where('product_id', $product->id)->pluck('id')->toArray();
        foreach ($validated['variants'] as $v) {
            if (!in_array($v['product_variant_id'], $validVariantIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salah satu varian yang dipilih bukan milik model produk ini (BR-08).',
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($validated, $request, $product) {
            $yearMonth = date('Ym');
            $latest = ProductionOrder::where('production_number', 'like', "PROD-{$yearMonth}-%")->latest('id')->first();
            $nextSequence = 1;
            if ($latest && preg_match('/-(\d+)$/', $latest->production_number, $matches)) {
                $nextSequence = (int)$matches[1] + 1;
            }
            $prodNumber = sprintf('PROD-%s-%03d', $yearMonth, $nextSequence);

            $prodOrder = ProductionOrder::create([
                'production_number' => $prodNumber,
                'created_by' => $request->user()->id,
                'product_id' => $product->id,
                'production_date' => $validated['production_date'],
                'status' => 'planned',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['variants'] as $v) {
                ProductionOrderDetail::create([
                    'production_order_id' => $prodOrder->id,
                    'product_variant_id' => $v['product_variant_id'],
                    'target_quantity' => $v['target_quantity'],
                    'actual_quantity' => 0,
                    'passed_quantity' => 0,
                    'rejected_quantity' => 0,
                ]);
            }

            return $prodOrder;
        });

        return response()->json([
            'success' => true,
            'message' => "Production Order {$order->production_number} berhasil direncanakan.",
            'data' => $order->load(['product', 'creator', 'details.productVariant']),
        ], 201);
    }

    public function start(Request $request, $id)
    {
        $order = ProductionOrder::with(['product.bomDetails.rawMaterial', 'details'])->findOrFail($id);

        if ($order->status !== 'planned') {
            return response()->json([
                'success' => false,
                'message' => "Production order berstatus '{$order->status}', hanya status 'planned' yang dapat dimulai.",
            ], 422);
        }

        $totalTarget = $order->details->sum('target_quantity');
        $bomDetails = $order->product->bomDetails;

        if ($bomDetails->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Produk ini belum memiliki Bill of Materials (BOM).',
            ], 422);
        }

        $insufficient = [];

        DB::transaction(function () use ($order, $totalTarget, $bomDetails, &$insufficient) {
            // First check all raw materials with row locks (BR-09)
            foreach ($bomDetails as $bom) {
                $required = $totalTarget * (float)$bom->quantity_required;

                $stock = InventoryStock::where('raw_material_id', $bom->raw_material_id)
                    ->where('warehouse_type', 'raw_material')
                    ->lockForUpdate()
                    ->first();

                $currentQty = $stock ? (float)$stock->quantity : 0.0;

                if ($currentQty < $required) {
                    $insufficient[] = [
                        'material_name' => $bom->rawMaterial->material_name,
                        'required' => $required,
                        'available' => $currentQty,
                        'shortage' => $required - $currentQty,
                        'unit' => $bom->rawMaterial->unit,
                    ];
                }
            }

            if (!empty($insufficient)) {
                return; // will abort after transaction
            }

            // Deduct raw material stocks (BR-10, BR-17)
            foreach ($bomDetails as $bom) {
                $required = $totalTarget * (float)$bom->quantity_required;

                $stock = InventoryStock::where('raw_material_id', $bom->raw_material_id)
                    ->where('warehouse_type', 'raw_material')
                    ->lockForUpdate()
                    ->first();

                $stock->quantity -= $required;
                $stock->save();
            }

            $order->status = 'in_progress';
            $order->save();
        });

        if (!empty($insufficient)) {
            return response()->json([
                'success' => false,
                'message' => 'Produksi tidak dapat dimulai karena stok bahan baku tidak mencukupi (BR-09).',
                'shortages' => $insufficient,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Produksi {$order->production_number} berhasil dimulai. Stok bahan baku telah dikurangkan.",
            'data' => $order->fresh(['product', 'creator', 'details.productVariant']),
        ]);
    }

    public function complete(Request $request, $id)
    {
        $order = ProductionOrder::with(['details.productVariant'])->findOrFail($id);

        if ($order->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => "Production order berstatus '{$order->status}', hanya status 'in_progress' yang dapat diselesaikan.",
            ], 422);
        }

        $validated = $request->validate([
            'results' => 'required|array|min:1',
            'results.*.detail_id' => 'required|exists:production_order_details,id',
            'results.*.actual_quantity' => 'required|integer|min:0',
            'results.*.passed_quantity' => 'required|integer|min:0',
            'results.*.rejected_quantity' => 'required|integer|min:0',
        ]);

        // Validate BR-11: actual = passed + rejected
        foreach ($validated['results'] as $res) {
            $act = (int)$res['actual_quantity'];
            $pass = (int)$res['passed_quantity'];
            $rej = (int)$res['rejected_quantity'];

            if ($act !== ($pass + $rej)) {
                return response()->json([
                    'success' => false,
                    'message' => "Jumlah aktual ({$act}) harus sama dengan jumlah lolos QC ({$pass}) ditambah reject ({$rej}) (BR-11).",
                ], 422);
            }
        }

        DB::transaction(function () use ($order, $validated, $request) {
            $now = now();
            $userId = $request->user()->id;

            foreach ($validated['results'] as $res) {
                $detail = ProductionOrderDetail::where('id', $res['detail_id'])
                    ->where('production_order_id', $order->id)
                    ->firstOrFail();

                $detail->actual_quantity = (int)$res['actual_quantity'];
                $detail->passed_quantity = (int)$res['passed_quantity'];
                $detail->rejected_quantity = (int)$res['rejected_quantity'];
                $detail->qc_checked_by = $userId;
                $detail->qc_checked_at = $now;
                $detail->save();

                // Only QC passed enters finished goods stock (BR-13)
                $passedQty = (int)$res['passed_quantity'];
                if ($passedQty > 0) {
                    $stock = InventoryStock::where('product_variant_id', $detail->product_variant_id)
                        ->where('warehouse_type', 'finished_goods')
                        ->lockForUpdate()
                        ->first();

                    if ($stock) {
                        $stock->quantity += $passedQty;
                        $stock->save();
                    } else {
                        InventoryStock::create([
                            'product_variant_id' => $detail->product_variant_id,
                            'raw_material_id' => null,
                            'warehouse_type' => 'finished_goods',
                            'quantity' => $passedQty,
                        ]);
                    }
                }
            }

            $order->status = 'completed';
            $order->save();
        });

        return response()->json([
            'success' => true,
            'message' => "Hasil produksi dan QC {$order->production_number} berhasil dicatat. Stok barang jadi telah bertambah sesuai jumlah lolos QC.",
            'data' => $order->fresh(['product', 'creator', 'details.productVariant.stock', 'details.qcChecker']),
        ]);
    }
}
