<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\ProductionOrder;
use App\Models\ProductionOrderDetail;
use App\Models\InventoryStock;
use App\Models\PartnerOrder;
use App\Models\RawMaterial;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Pengadaan (Procurement)
        $activePosCount = PurchaseOrder::where('status', 'ordered')->count();
        $completedPosCount = PurchaseOrder::where('status', 'completed')->count();
        
        $lowStockRawMaterials = RawMaterial::where('is_active', true)
            ->with(['stock'])
            ->get()
            ->filter(function ($item) {
                $currentStock = $item->stock ? (float)$item->stock->quantity : 0.0;
                return $currentStock <= (float)$item->minimum_stock;
            })
            ->values();

        // 2. Produksi (Production)
        $activeProdCount = ProductionOrder::whereIn('status', ['planned', 'in_progress'])->count();
        $completedProdCount = ProductionOrder::where('status', 'completed')->count();

        $qcStats = ProductionOrderDetail::select(
            DB::raw('SUM(target_quantity) as total_target'),
            DB::raw('SUM(actual_quantity) as total_actual'),
            DB::raw('SUM(passed_quantity) as total_passed'),
            DB::raw('SUM(rejected_quantity) as total_rejected')
        )->first();

        // 3. Inventaris (Inventory)
        $totalRawMaterialsStock = InventoryStock::where('warehouse_type', 'raw_material')->sum('quantity');
        $totalFinishedGoodsStock = InventoryStock::where('warehouse_type', 'finished_goods')->sum('quantity');
        
        $lowStockFinishedGoods = ProductVariant::where('is_active', true)
            ->with(['product', 'stock'])
            ->get()
            ->filter(function ($variant) {
                $qty = $variant->stock ? (float)$variant->stock->quantity : 0;
                return $qty < 10; // Low threshold alert for finished shoes
            })
            ->values();

        // 4. Distribusi (Distribution)
        $ordersProcessingCount = PartnerOrder::where('status', 'processing')->count();
        $ordersShippedCount = PartnerOrder::where('status', 'shipped')->count();
        $ordersDeliveredCount = PartnerOrder::where('status', 'delivered')->count();

        // Recent orders / production activities
        $recentPOs = PurchaseOrder::with(['supplier', 'creator'])
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        $recentProdOrders = ProductionOrder::with(['product', 'creator'])
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        $recentPartnerOrders = PartnerOrder::with(['partner', 'creator'])
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'procurement' => [
                    'active_pos' => $activePosCount,
                    'completed_pos' => $completedPosCount,
                    'low_stock_materials_count' => $lowStockRawMaterials->count(),
                    'low_stock_materials' => $lowStockRawMaterials,
                ],
                'production' => [
                    'active_orders' => $activeProdCount,
                    'completed_orders' => $completedProdCount,
                    'total_target' => (int)($qcStats->total_target ?? 0),
                    'total_actual' => (int)($qcStats->total_actual ?? 0),
                    'total_passed_qc' => (int)($qcStats->total_passed ?? 0),
                    'total_rejected_qc' => (int)($qcStats->total_rejected ?? 0),
                    'qc_pass_rate' => ($qcStats->total_actual > 0) 
                        ? round(($qcStats->total_passed / $qcStats->total_actual) * 100, 1) 
                        : 100,
                ],
                'inventory' => [
                    'total_raw_material_quantity' => (float)$totalRawMaterialsStock,
                    'total_finished_goods_quantity' => (int)$totalFinishedGoodsStock,
                    'low_stock_finished_goods_count' => $lowStockFinishedGoods->count(),
                    'low_stock_finished_goods' => $lowStockFinishedGoods,
                ],
                'distribution' => [
                    'processing_count' => $ordersProcessingCount,
                    'shipped_count' => $ordersShippedCount,
                    'delivered_count' => $ordersDeliveredCount,
                ],
                'recent' => [
                    'purchase_orders' => $recentPOs,
                    'production_orders' => $recentProdOrders,
                    'partner_orders' => $recentPartnerOrders,
                ],
            ],
        ]);
    }
}
