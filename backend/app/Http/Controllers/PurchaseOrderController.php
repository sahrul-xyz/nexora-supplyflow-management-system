<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderDetail;
use App\Models\InventoryStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'creator', 'details.rawMaterial']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('supplier_name', 'like', "%{$search}%");
                  });
            });
        }

        $pos = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $pos,
        ]);
    }

    public function show($id)
    {
        $po = PurchaseOrder::with(['supplier', 'creator', 'details.rawMaterial.stock'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $po,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.raw_material_id' => 'required|exists:raw_materials,id',
            'items.*.quantity_ordered' => 'required|numeric|gt:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $po = DB::transaction(function () use ($validated, $request) {
            // Auto generate PO number if not provided
            $yearMonth = date('Ym');
            $latestPo = PurchaseOrder::where('po_number', 'like', "PO-{$yearMonth}-%")->latest('id')->first();
            $nextSequence = 1;
            if ($latestPo && preg_match('/-(\d+)$/', $latestPo->po_number, $matches)) {
                $nextSequence = (int)$matches[1] + 1;
            }
            $poNumber = sprintf('PO-%s-%03d', $yearMonth, $nextSequence);

            $purchaseOrder = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $validated['supplier_id'],
                'created_by' => $request->user()->id,
                'order_date' => $validated['order_date'],
                'status' => 'ordered',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                PurchaseOrderDetail::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'raw_material_id' => $item['raw_material_id'],
                    'quantity_ordered' => $item['quantity_ordered'],
                    'quantity_received' => 0,
                    'unit_price' => $item['unit_price'],
                ]);
            }

            return $purchaseOrder;
        });

        return response()->json([
            'success' => true,
            'message' => "Purchase Order {$po->po_number} berhasil dibuat.",
            'data' => $po->load(['supplier', 'creator', 'details.rawMaterial']),
        ], 201);
    }

    public function receive(Request $request, $id)
    {
        $po = PurchaseOrder::with('details')->findOrFail($id);

        if ($po->status !== 'ordered') {
            return response()->json([
                'success' => false,
                'message' => "PO ini berstatus '{$po->status}' dan tidak dapat diproses penerimaan.",
            ], 422);
        }

        // On MVP, receiving records full received quantity for ordered items
        DB::transaction(function () use ($po) {
            foreach ($po->details as $detail) {
                $receivedQty = (float)$detail->quantity_ordered;
                $detail->quantity_received = $receivedQty;
                $detail->save();

                // Increment raw material inventory stock with row lock
                $stock = InventoryStock::where('raw_material_id', $detail->raw_material_id)
                    ->where('warehouse_type', 'raw_material')
                    ->lockForUpdate()
                    ->first();

                if ($stock) {
                    $stock->quantity += $receivedQty;
                    $stock->save();
                } else {
                    InventoryStock::create([
                        'raw_material_id' => $detail->raw_material_id,
                        'product_variant_id' => null,
                        'warehouse_type' => 'raw_material',
                        'quantity' => $receivedQty,
                    ]);
                }
            }

            $po->status = 'completed';
            $po->save();
        });

        return response()->json([
            'success' => true,
            'message' => "Penerimaan PO {$po->po_number} berhasil dicatat. Stok bahan baku telah diperbarui.",
            'data' => $po->fresh(['supplier', 'creator', 'details.rawMaterial.stock']),
        ]);
    }
}
