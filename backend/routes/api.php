<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\RawMaterialController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\BomController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ProductionOrderController;
use App\Http\Controllers\InventoryStockController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\PartnerOrderController;
use App\Http\Controllers\AiInsightController;

// Public Auth Route
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/ai-insights', [AiInsightController::class, 'diagnose']);
    Route::post('/ai-insights/diagnose', [AiInsightController::class, 'diagnose']);
    Route::match(['get', 'post'], '/ai-insights/simulate', [AiInsightController::class, 'simulate']);

    // Super Admin: User Account Management
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // Products & Variants (Super Admin & Production & Supply Chain can view, Super Admin & Production can mutate)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/product-variants', [ProductVariantController::class, 'index']);

    Route::middleware('role:super_admin,production')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        Route::post('/product-variants', [ProductVariantController::class, 'store']);
        Route::put('/product-variants/{id}', [ProductVariantController::class, 'update']);
        Route::delete('/product-variants/{id}', [ProductVariantController::class, 'destroy']);

        // BOM Details
        Route::get('/bom-details/{productId}', [BomController::class, 'show']);
        Route::put('/bom-details/{productId}', [BomController::class, 'update']);
        Route::post('/bom-details/{productId}', [BomController::class, 'update']);

        // Production Orders
        Route::post('/production-orders/check-requirements', [ProductionOrderController::class, 'checkRequirements']);
        Route::post('/production-orders', [ProductionOrderController::class, 'store']);
        Route::post('/production-orders/{id}/start', [ProductionOrderController::class, 'start']);
        Route::post('/production-orders/{id}/complete', [ProductionOrderController::class, 'complete']);
    });

    Route::get('/production-orders', [ProductionOrderController::class, 'index']);
    Route::get('/production-orders/{id}', [ProductionOrderController::class, 'show']);

    // Raw Materials & Suppliers (Super Admin & Supply Chain can mutate, Production can view)
    Route::get('/raw-materials', [RawMaterialController::class, 'index']);
    Route::get('/raw-materials/{id}', [RawMaterialController::class, 'show']);
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::get('/suppliers/{id}', [SupplierController::class, 'show']);

    Route::middleware('role:super_admin,supply_chain')->group(function () {
        Route::post('/raw-materials', [RawMaterialController::class, 'store']);
        Route::put('/raw-materials/{id}', [RawMaterialController::class, 'update']);
        Route::delete('/raw-materials/{id}', [RawMaterialController::class, 'destroy']);

        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

        // Purchase Orders
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
        Route::post('/purchase-orders/{id}/receive', [PurchaseOrderController::class, 'receive']);

        // Partners & Partner Orders
        Route::post('/partners', [PartnerController::class, 'store']);
        Route::put('/partners/{id}', [PartnerController::class, 'update']);
        Route::delete('/partners/{id}', [PartnerController::class, 'destroy']);

        Route::post('/partner-orders', [PartnerOrderController::class, 'store']);
        Route::post('/partner-orders/{id}/ship', [PartnerOrderController::class, 'ship']);
        Route::post('/partner-orders/{id}/deliver', [PartnerOrderController::class, 'deliver']);
        Route::post('/partner-orders/{id}/cancel', [PartnerOrderController::class, 'cancel']);
    });

    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);

    Route::get('/partners', [PartnerController::class, 'index']);
    Route::get('/partners/{id}', [PartnerController::class, 'show']);

    Route::get('/partner-orders', [PartnerOrderController::class, 'index']);
    Route::get('/partner-orders/{id}', [PartnerOrderController::class, 'show']);

    // Inventory Stocks (accessible to all authenticated users)
    Route::get('/inventory-stocks', [InventoryStockController::class, 'index']);
    Route::post('/inventory-stocks/adjust', [InventoryStockController::class, 'adjust']);
    Route::delete('/inventory-stocks/{id}', [InventoryStockController::class, 'resetStock']);
});
