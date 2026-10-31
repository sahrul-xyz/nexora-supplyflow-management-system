<?php

namespace App\Http\Controllers;

use App\Models\PartnerOrder;
use App\Models\PartnerOrderDetail;
use App\Models\ProductVariant;
use App\Models\InventoryStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartnerOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PartnerOrder::with(['partner', 'creator', 'details.productVariant.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('partner_id')) {
            $query->where('partner_id', $request->partner_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('tracking_number', 'like', "%{$search}%")
                  ->orWhereHas('partner', function ($pq) use ($search) {
                      $pq->where('partner_name', 'like', "%{$search}%");
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
        $order = PartnerOrder::with([
            'partner',
            'creator',
            'details.productVariant.product',
            'details.productVariant.stock',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'partner_id' => 'required|exists:partners,id',
            'order_date' => 'required|date',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|gt:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            $yearMonth = date('Ym');
            $latest = PartnerOrder::where('order_number', 'like', "ORD-{$yearMonth}-%")->latest('id')->first();
            $nextSequence = 1;
            if ($latest && preg_match('/-(\d+)$/', $latest->order_number, $matches)) {
                $nextSequence = (int)$matches[1] + 1;
            }
            $orderNumber = sprintf('ORD-%s-%03d', $yearMonth, $nextSequence);

            $partnerOrder = PartnerOrder::create([
                'order_number' => $orderNumber,
                'partner_id' => $validated['partner_id'],
                'created_by' => $request->user()->id,
                'order_date' => $validated['order_date'],
                'status' => 'processing',
                'shipping_address' => $validated['shipping_address'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $qty = (int)$item['quantity'];
                $price = (float)$item['unit_price'];
                $subtotal = $qty * $price;

                PartnerOrderDetail::create([
                    'partner_order_id' => $partnerOrder->id,
                    'product_variant_id' => $item['product_variant_id'],
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'subtotal' => $subtotal,
                ]);
            }

            return $partnerOrder;
        });

        return response()->json([
            'success' => true,
            'message' => "Pesanan mitra {$order->order_number} berhasil dibuat (status processing).",
            'data' => $order->load(['partner', 'creator', 'details.productVariant.product']),
        ], 201);
    }

    public function ship(Request $request, $id)
    {
        $order = PartnerOrder::with(['details.productVariant'])->findOrFail($id);

        if ($order->status !== 'processing') {
            return response()->json([
                'success' => false,
                'message' => "Pesanan berstatus '{$order->status}'. Hanya pesanan 'processing' yang dapat dikirim.",
            ], 422);
        }

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:100',
            'shipped_at' => 'nullable|date',
            'shipping_address' => 'nullable|string',
        ]);

        $insufficient = [];

        DB::transaction(function () use ($order, $validated, &$insufficient) {
            // First check finished goods stock availability for all items with row locks (BR-16)
            foreach ($order->details as $item) {
                $stock = InventoryStock::where('product_variant_id', $item->product_variant_id)
                    ->where('warehouse_type', 'finished_goods')
                    ->lockForUpdate()
                    ->first();

                $currentQty = $stock ? (int)$stock->quantity : 0;
                $needed = (int)$item->quantity;

                if ($currentQty < $needed) {
                    $insufficient[] = [
                        'sku' => $item->productVariant->sku,
                        'needed' => $needed,
                        'available' => $currentQty,
                        'shortage' => $needed - $currentQty,
                    ];
                }
            }

            if (!empty($insufficient)) {
                return; // abort without modifying
            }

            // Deduct finished goods stock (BR-15, BR-17)
            foreach ($order->details as $item) {
                $stock = InventoryStock::where('product_variant_id', $item->product_variant_id)
                    ->where('warehouse_type', 'finished_goods')
                    ->lockForUpdate()
                    ->first();

                $stock->quantity -= (int)$item->quantity;
                $stock->save();
            }

            $order->status = 'shipped';
            $order->tracking_number = $validated['tracking_number'];
            $order->shipped_at = $validated['shipped_at'] ?? now();
            if (!empty($validated['shipping_address'])) {
                $order->shipping_address = $validated['shipping_address'];
            }
            $order->save();
        });

        if (!empty($insufficient)) {
            return response()->json([
                'success' => false,
                'message' => 'Pengiriman ditolak karena stok barang jadi tidak mencukupi (BR-16).',
                'shortages' => $insufficient,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Pesanan {$order->order_number} berhasil dikirim. Stok barang jadi telah dikurangi.",
            'data' => $order->fresh(['partner', 'creator', 'details.productVariant.stock']),
        ]);
    }

    public function deliver(Request $request, $id)
    {
        $order = PartnerOrder::findOrFail($id);

        if ($order->status !== 'shipped') {
            return response()->json([
                'success' => false,
                'message' => "Hanya pesanan berstatus 'shipped' yang dapat ditandai sebagai 'delivered'.",
            ], 422);
        }

        $order->status = 'delivered';
        $order->delivered_at = $request->delivered_at ?? now();
        $order->save();

        return response()->json([
            'success' => true,
            'message' => "Pesanan {$order->order_number} telah berhasil ditandai sebagai terkirim (delivered).",
            'data' => $order->fresh(['partner', 'creator', 'details.productVariant']),
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $order = PartnerOrder::findOrFail($id);

        if ($order->status !== 'processing') {
            return response()->json([
                'success' => false,
                'message' => "Pesanan dengan status '{$order->status}' tidak dapat dibatalkan. Pembatalan hanya berlaku saat pesanan masih 'processing'.",
            ], 422);
        }

        $order->status = 'cancelled';
        if ($request->filled('reason')) {
            $order->notes = ($order->notes ? $order->notes . ' | ' : '') . 'Alasan pembatalan: ' . $request->reason;
        }
        $order->save();

        return response()->json([
            'success' => true,
            'message' => "Pesanan {$order->order_number} berhasil dibatalkan.",
            'data' => $order,
        ]);
    }
}
