<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\RawMaterial;
use App\Models\Supplier;
use App\Models\Partner;
use App\Models\PurchaseOrder;
use App\Models\ProductionOrder;
use App\Models\InventoryStock;
use Tests\TestCase;

class SupplyFlowApiTest extends TestCase
{
    public function test_login_success_and_returns_token_and_role()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@supplyflow.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'super_admin');
        
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_dashboard_endpoint_returns_all_four_pillars()
    {
        $user = User::where('email', 'admin@supplyflow.com')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'procurement' => ['active_pos', 'completed_pos', 'low_stock_materials_count'],
                    'production' => ['active_orders', 'completed_orders', 'total_target', 'total_actual', 'qc_pass_rate'],
                    'inventory' => ['total_raw_material_quantity', 'total_finished_goods_quantity'],
                    'distribution' => ['processing_count', 'shipped_count', 'delivered_count'],
                ],
            ]);
    }

    public function test_purchase_order_flow_and_material_receiving()
    {
        $supplyChain = User::where('email', 'supplychain@supplyflow.com')->first();
        $token = $supplyChain->createToken('test')->plainTextToken;
        $supplier = Supplier::first();
        $rawMaterial = RawMaterial::first();

        $initialStock = (float)($rawMaterial->stock ? $rawMaterial->stock->quantity : 0);

        // 1. Create PO
        $createResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/purchase-orders', [
                'supplier_id' => $supplier->id,
                'order_date' => date('Y-m-d'),
                'notes' => 'Test PO Automasi',
                'items' => [
                    [
                        'raw_material_id' => $rawMaterial->id,
                        'quantity_ordered' => 20,
                        'unit_price' => 50000,
                    ]
                ]
            ]);

        $createResponse->assertStatus(201);
        $poId = $createResponse->json('data.id');

        // 2. Receive PO
        $receiveResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/purchase-orders/{$poId}/receive");

        $receiveResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        // 3. Verify stock increased
        $updatedStock = (float)InventoryStock::where('raw_material_id', $rawMaterial->id)
            ->where('warehouse_type', 'raw_material')
            ->value('quantity');

        $this->assertEquals($initialStock + 20, $updatedStock);
    }

    public function test_production_order_validation_and_qc_flow()
    {
        $productionUser = User::where('email', 'production@supplyflow.com')->first();
        $token = $productionUser->createToken('test')->plainTextToken;
        $product = Product::with(['variants', 'bomDetails'])->first();
        $variant = $product->variants->first();

        // 1. Create production order
        $createResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/production-orders', [
                'product_id' => $product->id,
                'production_date' => date('Y-m-d'),
                'notes' => 'Test Produksi Batch',
                'variants' => [
                    [
                        'product_variant_id' => $variant->id,
                        'target_quantity' => 10,
                    ]
                ]
            ]);

        $createResponse->assertStatus(201);
        $orderId = $createResponse->json('data.id');
        $detailId = $createResponse->json('data.details.0.id');

        // 2. Start production (deducts raw material stock)
        $startResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/production-orders/{$orderId}/start");

        $startResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');

        // 3. Complete production with QC validation: actual must equal passed + rejected
        $invalidQcResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/production-orders/{$orderId}/complete", [
                'results' => [
                    [
                        'detail_id' => $detailId,
                        'actual_quantity' => 10,
                        'passed_quantity' => 8,
                        'rejected_quantity' => 1, // 8 + 1 != 10
                    ]
                ]
            ]);
        $invalidQcResponse->assertStatus(422);

        // Valid QC: 9 passed, 1 rejected = 10 actual
        $validQcResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/production-orders/{$orderId}/complete", [
                'results' => [
                    [
                        'detail_id' => $detailId,
                        'actual_quantity' => 10,
                        'passed_quantity' => 9,
                        'rejected_quantity' => 1,
                    ]
                ]
            ]);

        $validQcResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_stock_adjustment_add_and_reduce_raw_material()
    {
        $admin = User::where('email', 'admin@supplyflow.com')->first();
        $token = $admin->createToken('test')->plainTextToken;
        $material = RawMaterial::first();

        // 1. Add 50 units
        $addRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/inventory-stocks/adjust', [
                'warehouse_type' => 'raw_material',
                'raw_material_id' => $material->id,
                'action' => 'add',
                'quantity' => 50,
                'notes' => 'Test tambah stok',
            ]);
        $addRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Reduce 20 units
        $reduceRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/inventory-stocks/adjust', [
                'warehouse_type' => 'raw_material',
                'raw_material_id' => $material->id,
                'action' => 'reduce',
                'quantity' => 20,
                'notes' => 'Test kurangi stok',
            ]);
        $reduceRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 3. Try to reduce more than available (should fail with 422)
        $excessRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/inventory-stocks/adjust', [
                'warehouse_type' => 'raw_material',
                'raw_material_id' => $material->id,
                'action' => 'reduce',
                'quantity' => 9999999,
            ]);
        $excessRes->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
