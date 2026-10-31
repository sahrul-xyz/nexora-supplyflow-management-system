<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\RawMaterial;
use App\Models\Supplier;
use App\Models\BomDetail;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderDetail;
use App\Models\ProductionOrder;
use App\Models\ProductionOrderDetail;
use App\Models\InventoryStock;
use App\Models\Partner;
use App\Models\PartnerOrder;
use App\Models\PartnerOrderDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Users (3 roles)
        $superAdmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'admin@supplyflow.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
        ]);

        $supplyChain = User::create([
            'name' => 'Bambang Supply Chain',
            'email' => 'supplychain@supplyflow.com',
            'password' => Hash::make('password123'),
            'role' => 'supply_chain',
        ]);

        $production = User::create([
            'name' => 'Doni Production Head',
            'email' => 'production@supplyflow.com',
            'password' => Hash::make('password123'),
            'role' => 'production',
        ]);

        // 2. Seed Suppliers
        $sup1 = Supplier::create([
            'supplier_name' => 'PT Indo Kulit Nusantara',
            'contact_person' => 'Budi Santoso',
            'phone' => '081234567890',
            'email' => 'sales@indokulit.co.id',
            'address' => 'Kawasan Industri Cibaduyut No. 45, Bandung',
        ]);

        $sup2 = Supplier::create([
            'supplier_name' => 'CV Sol Makmur Perkasa',
            'contact_person' => 'Hendra Wijaya',
            'phone' => '081987654321',
            'email' => 'hendra@solmakmur.com',
            'address' => 'Jl. Rungkut Industri III No. 12, Surabaya',
        ]);

        $sup3 = Supplier::create([
            'supplier_name' => 'PT Kimia Prima Adhesif',
            'contact_person' => 'Rina Marlina',
            'phone' => '082133445566',
            'email' => 'rina@kimiaadhesif.co.id',
            'address' => 'Jl. Manis Raya No. 88, Tangerang',
        ]);

        // 3. Seed Raw Materials
        $rawMaterialsData = [
            ['code' => 'RM-KLT-01', 'name' => 'Kulit Sintetis Premium (Black)', 'unit' => 'meter', 'min' => 40.00, 'stock' => 120.00],
            ['code' => 'RM-KLT-02', 'name' => 'Kulit Sintetis Camel Brown', 'unit' => 'meter', 'min' => 30.00, 'stock' => 85.00],
            ['code' => 'RM-SOL-01', 'name' => 'Sol Karet Sneaker Rubber Sole', 'unit' => 'pasang', 'min' => 100.00, 'stock' => 450.00],
            ['code' => 'RM-SOL-02', 'name' => 'Outsole Sandal Phylon Ringan', 'unit' => 'pasang', 'min' => 80.00, 'stock' => 320.00],
            ['code' => 'RM-LEM-01', 'name' => 'Lem Khusus Sepatu SuperBond', 'unit' => 'ml', 'min' => 3000.00, 'stock' => 15000.00],
            ['code' => 'RM-BNG-01', 'name' => 'Benang Nilon Rajut Kuat', 'unit' => 'meter', 'min' => 500.00, 'stock' => 2500.00],
            ['code' => 'RM-KVS-01', 'name' => 'Kain Kanvas Heavy 12oz Off-White', 'unit' => 'meter', 'min' => 35.00, 'stock' => 90.00],
            ['code' => 'RM-EVA-01', 'name' => 'Busa EVA Insole Empuk', 'unit' => 'lembar', 'min' => 25.00, 'stock' => 60.00],
            ['code' => 'RM-TLI-01', 'name' => 'Tali Anyam Webbing Nylon 25mm', 'unit' => 'meter', 'min' => 80.00, 'stock' => 25.00], // Low stock alert!
        ];

        $rmModels = [];
        foreach ($rawMaterialsData as $rm) {
            $model = RawMaterial::create([
                'material_code' => $rm['code'],
                'material_name' => $rm['name'],
                'unit' => $rm['unit'],
                'minimum_stock' => $rm['min'],
                'is_active' => true,
            ]);
            $rmModels[$rm['code']] = $model;

            // Create initial stock for raw material
            InventoryStock::create([
                'raw_material_id' => $model->id,
                'product_variant_id' => null,
                'warehouse_type' => 'raw_material',
                'quantity' => $rm['stock'],
            ]);
        }

        // 4. Seed Products
        $p1 = Product::create([
            'product_code' => 'SH-AERO-01',
            'product_name' => 'AeroStride Classic Sneaker',
            'category' => 'shoes',
            'description' => 'Sepatu sneaker kasual berbahan kulit sintetis premium dengan sol karet vulkanisir tahan lama.',
            'is_active' => true,
        ]);

        $p2 = Product::create([
            'product_code' => 'SH-URBAN-02',
            'product_name' => 'UrbanRunner Canvas Sport',
            'category' => 'shoes',
            'description' => 'Sepatu lari kasual kanvas 12oz breathable dengan insole busa EVA super empuk.',
            'is_active' => true,
        ]);

        $p3 = Product::create([
            'product_code' => 'SD-TERRA-01',
            'product_name' => 'TerraComfort Outdoor Sandal',
            'category' => 'sandals',
            'description' => 'Sandal outdoor webbing tali anyam dengan outsole phylon anti slip.',
            'is_active' => true,
        ]);

        $p4 = Product::create([
            'product_code' => 'SD-SLIDE-02',
            'product_name' => 'SlideEasy Casual Slippers',
            'category' => 'sandals',
            'description' => 'Sandal slide harian santai dengan bantalan EVA fleksibel dan ringan.',
            'is_active' => true,
        ]);

        // 5. Seed BOM Details (1 BOM per product model)
        // P1 AeroStride
        BomDetail::create(['product_id' => $p1->id, 'raw_material_id' => $rmModels['RM-KLT-01']->id, 'quantity_required' => 0.450]);
        BomDetail::create(['product_id' => $p1->id, 'raw_material_id' => $rmModels['RM-SOL-01']->id, 'quantity_required' => 1.000]);
        BomDetail::create(['product_id' => $p1->id, 'raw_material_id' => $rmModels['RM-LEM-01']->id, 'quantity_required' => 20.000]);
        BomDetail::create(['product_id' => $p1->id, 'raw_material_id' => $rmModels['RM-BNG-01']->id, 'quantity_required' => 8.000]);
        BomDetail::create(['product_id' => $p1->id, 'raw_material_id' => $rmModels['RM-EVA-01']->id, 'quantity_required' => 0.150]);

        // P2 UrbanRunner
        BomDetail::create(['product_id' => $p2->id, 'raw_material_id' => $rmModels['RM-KVS-01']->id, 'quantity_required' => 0.500]);
        BomDetail::create(['product_id' => $p2->id, 'raw_material_id' => $rmModels['RM-SOL-01']->id, 'quantity_required' => 1.000]);
        BomDetail::create(['product_id' => $p2->id, 'raw_material_id' => $rmModels['RM-LEM-01']->id, 'quantity_required' => 25.000]);
        BomDetail::create(['product_id' => $p2->id, 'raw_material_id' => $rmModels['RM-BNG-01']->id, 'quantity_required' => 10.000]);
        BomDetail::create(['product_id' => $p2->id, 'raw_material_id' => $rmModels['RM-EVA-01']->id, 'quantity_required' => 0.200]);

        // P3 TerraComfort Sandal
        BomDetail::create(['product_id' => $p3->id, 'raw_material_id' => $rmModels['RM-TLI-01']->id, 'quantity_required' => 1.200]);
        BomDetail::create(['product_id' => $p3->id, 'raw_material_id' => $rmModels['RM-SOL-02']->id, 'quantity_required' => 1.000]);
        BomDetail::create(['product_id' => $p3->id, 'raw_material_id' => $rmModels['RM-LEM-01']->id, 'quantity_required' => 15.000]);
        BomDetail::create(['product_id' => $p3->id, 'raw_material_id' => $rmModels['RM-EVA-01']->id, 'quantity_required' => 0.100]);

        // P4 SlideEasy Sandal
        BomDetail::create(['product_id' => $p4->id, 'raw_material_id' => $rmModels['RM-SOL-02']->id, 'quantity_required' => 1.000]);
        BomDetail::create(['product_id' => $p4->id, 'raw_material_id' => $rmModels['RM-EVA-01']->id, 'quantity_required' => 0.300]);
        BomDetail::create(['product_id' => $p4->id, 'raw_material_id' => $rmModels['RM-LEM-01']->id, 'quantity_required' => 10.000]);

        // 6. Seed Product Variants
        $variants = [
            // P1 Variants
            ['p' => $p1, 'sku' => 'SNK-001-BLK-40', 'size' => '40', 'color' => 'Black', 'stock' => 50],
            ['p' => $p1, 'sku' => 'SNK-001-BLK-41', 'size' => '41', 'color' => 'Black', 'stock' => 65],
            ['p' => $p1, 'sku' => 'SNK-001-BLK-42', 'size' => '42', 'color' => 'Black', 'stock' => 40],
            ['p' => $p1, 'sku' => 'SNK-001-WHT-41', 'size' => '41', 'color' => 'White', 'stock' => 30],
            ['p' => $p1, 'sku' => 'SNK-001-WHT-42', 'size' => '42', 'color' => 'White', 'stock' => 5], // low stock!

            // P2 Variants
            ['p' => $p2, 'sku' => 'RUN-002-NVY-40', 'size' => '40', 'color' => 'Navy', 'stock' => 45],
            ['p' => $p2, 'sku' => 'RUN-002-NVY-41', 'size' => '41', 'color' => 'Navy', 'stock' => 55],
            ['p' => $p2, 'sku' => 'RUN-002-GRY-42', 'size' => '42', 'color' => 'Grey', 'stock' => 35],

            // P3 Variants
            ['p' => $p3, 'sku' => 'SND-001-OLV-40', 'size' => '40', 'color' => 'Olive', 'stock' => 60],
            ['p' => $p3, 'sku' => 'SND-001-OLV-41', 'size' => '41', 'color' => 'Olive', 'stock' => 80],
            ['p' => $p3, 'sku' => 'SND-001-BLK-42', 'size' => '42', 'color' => 'Black', 'stock' => 70],

            // P4 Variants
            ['p' => $p4, 'sku' => 'SLD-002-BLK-39', 'size' => '39', 'color' => 'Black', 'stock' => 90],
            ['p' => $p4, 'sku' => 'SLD-002-BLK-40', 'size' => '40', 'color' => 'Black', 'stock' => 110],
            ['p' => $p4, 'sku' => 'SLD-002-BRN-41', 'size' => '41', 'color' => 'Brown', 'stock' => 8], // low stock!
        ];

        $variantModels = [];
        foreach ($variants as $v) {
            $var = ProductVariant::create([
                'product_id' => $v['p']->id,
                'sku' => $v['sku'],
                'size' => $v['size'],
                'color' => $v['color'],
                'is_active' => true,
            ]);
            $variantModels[$v['sku']] = $var;

            // Seed inventory stock for finished goods
            InventoryStock::create([
                'raw_material_id' => null,
                'product_variant_id' => $var->id,
                'warehouse_type' => 'finished_goods',
                'quantity' => $v['stock'],
            ]);
        }

        // 7. Seed Partners
        $pt1 = Partner::create([
            'partner_code' => 'PT-DIST-001',
            'partner_name' => 'PT Langkah Maju Footwear',
            'partner_type' => 'distributor',
            'contact_person' => 'Hadi Purnomo',
            'phone' => '081122334455',
            'email' => 'hadi@langkahmaju.com',
            'address' => 'Jl. Daan Mogot KM 14 No. 20, Jakarta Barat',
            'is_active' => true,
        ]);

        $pt2 = Partner::create([
            'partner_code' => 'PT-RESL-002',
            'partner_name' => 'Toko Sepatu Berkah Abadi',
            'partner_type' => 'reseller',
            'contact_person' => 'Siti Aminah',
            'phone' => '081299887766',
            'email' => 'berkahsepatu@gmail.com',
            'address' => 'Pasar Turi Blok B No. 15, Surabaya',
            'is_active' => true,
        ]);

        $pt3 = Partner::create([
            'partner_code' => 'PT-RESL-003',
            'partner_name' => 'Sneakerhead Jogja Store',
            'partner_type' => 'reseller',
            'contact_person' => 'Dimas Anggara',
            'phone' => '081377665544',
            'email' => 'sneakerheadjogja@gmail.com',
            'address' => 'Jl. Gejayan No. 28, Yogyakarta',
            'is_active' => true,
        ]);

        // 8. Seed Sample Purchase Orders
        $po1 = PurchaseOrder::create([
            'po_number' => 'PO-202610-001',
            'supplier_id' => $sup1->id,
            'created_by' => $supplyChain->id,
            'order_date' => '2026-10-15',
            'status' => 'completed',
            'notes' => 'Pengadaan bahan baku kulit untuk produksi batch awal Oktober',
        ]);
        PurchaseOrderDetail::create([
            'purchase_order_id' => $po1->id,
            'raw_material_id' => $rmModels['RM-KLT-01']->id,
            'quantity_ordered' => 50.00,
            'quantity_received' => 50.00,
            'unit_price' => 75000.00,
        ]);

        $po2 = PurchaseOrder::create([
            'po_number' => 'PO-202610-002',
            'supplier_id' => $sup2->id,
            'created_by' => $supplyChain->id,
            'order_date' => '2026-10-25',
            'status' => 'ordered',
            'notes' => 'Pesanan rutin sol karet dan outsole sandal',
        ]);
        PurchaseOrderDetail::create([
            'purchase_order_id' => $po2->id,
            'raw_material_id' => $rmModels['RM-SOL-01']->id,
            'quantity_ordered' => 150.00,
            'quantity_received' => 0.00,
            'unit_price' => 35000.00,
        ]);
        PurchaseOrderDetail::create([
            'purchase_order_id' => $po2->id,
            'raw_material_id' => $rmModels['RM-SOL-02']->id,
            'quantity_ordered' => 100.00,
            'quantity_received' => 0.00,
            'unit_price' => 28000.00,
        ]);

        // 9. Seed Sample Production Orders
        $prod1 = ProductionOrder::create([
            'production_number' => 'PROD-202610-001',
            'created_by' => $production->id,
            'product_id' => $p1->id,
            'production_date' => '2026-10-18',
            'status' => 'completed',
            'notes' => 'Batch produksi AeroStride Classic Sneaker batch 1',
        ]);
        ProductionOrderDetail::create([
            'production_order_id' => $prod1->id,
            'product_variant_id' => $variantModels['SNK-001-BLK-40']->id,
            'target_quantity' => 50,
            'actual_quantity' => 50,
            'passed_quantity' => 48,
            'rejected_quantity' => 2,
            'qc_checked_by' => $production->id,
            'qc_checked_at' => '2026-10-20 15:30:00',
        ]);
        ProductionOrderDetail::create([
            'production_order_id' => $prod1->id,
            'product_variant_id' => $variantModels['SNK-001-BLK-41']->id,
            'target_quantity' => 50,
            'actual_quantity' => 50,
            'passed_quantity' => 49,
            'rejected_quantity' => 1,
            'qc_checked_by' => $production->id,
            'qc_checked_at' => '2026-10-20 15:30:00',
        ]);

        $prod2 = ProductionOrder::create([
            'production_number' => 'PROD-202610-002',
            'created_by' => $production->id,
            'product_id' => $p3->id,
            'production_date' => '2026-10-28',
            'status' => 'in_progress',
            'notes' => 'Produksi TerraComfort Sandal warna Olive',
        ]);
        ProductionOrderDetail::create([
            'production_order_id' => $prod2->id,
            'product_variant_id' => $variantModels['SND-001-OLV-40']->id,
            'target_quantity' => 40,
            'actual_quantity' => 0,
            'passed_quantity' => 0,
            'rejected_quantity' => 0,
        ]);
        ProductionOrderDetail::create([
            'production_order_id' => $prod2->id,
            'product_variant_id' => $variantModels['SND-001-OLV-41']->id,
            'target_quantity' => 40,
            'actual_quantity' => 0,
            'passed_quantity' => 0,
            'rejected_quantity' => 0,
        ]);

        $prod3 = ProductionOrder::create([
            'production_number' => 'PROD-202610-003',
            'created_by' => $production->id,
            'product_id' => $p2->id,
            'production_date' => '2026-10-30',
            'status' => 'planned',
            'notes' => 'Perencanaan UrbanRunner Sport Navy',
        ]);
        ProductionOrderDetail::create([
            'production_order_id' => $prod3->id,
            'product_variant_id' => $variantModels['RUN-002-NVY-40']->id,
            'target_quantity' => 30,
            'actual_quantity' => 0,
            'passed_quantity' => 0,
            'rejected_quantity' => 0,
        ]);

        // 10. Seed Sample Partner Orders
        $poDist1 = PartnerOrder::create([
            'order_number' => 'ORD-202610-001',
            'partner_id' => $pt1->id,
            'created_by' => $supplyChain->id,
            'order_date' => '2026-10-22',
            'status' => 'delivered',
            'shipping_address' => 'Gudang Langkah Maju, Jl. Daan Mogot KM 14 No. 20, Jakarta',
            'tracking_number' => 'JNE-REG-991823712',
            'shipped_at' => '2026-10-23 10:00:00',
            'delivered_at' => '2026-10-25 14:20:00',
            'notes' => 'Pesanan distributor Jakarta batch 1',
        ]);
        PartnerOrderDetail::create([
            'partner_order_id' => $poDist1->id,
            'product_variant_id' => $variantModels['SNK-001-BLK-40']->id,
            'quantity' => 20,
            'unit_price' => 220000.00,
            'subtotal' => 4400000.00,
        ]);
        PartnerOrderDetail::create([
            'partner_order_id' => $poDist1->id,
            'product_variant_id' => $variantModels['SNK-001-BLK-41']->id,
            'quantity' => 20,
            'unit_price' => 220000.00,
            'subtotal' => 4400000.00,
        ]);

        $poDist2 = PartnerOrder::create([
            'order_number' => 'ORD-202610-002',
            'partner_id' => $pt2->id,
            'created_by' => $supplyChain->id,
            'order_date' => '2026-10-29',
            'status' => 'shipped',
            'shipping_address' => 'Pasar Turi Blok B No. 15, Surabaya',
            'tracking_number' => 'SICEPAT-882736192',
            'shipped_at' => '2026-10-30 09:30:00',
            'notes' => 'Pengiriman via SiCepat Cargo',
        ]);
        PartnerOrderDetail::create([
            'partner_order_id' => $poDist2->id,
            'product_variant_id' => $variantModels['SND-001-OLV-40']->id,
            'quantity' => 15,
            'unit_price' => 110000.00,
            'subtotal' => 1650000.00,
        ]);

        $poDist3 = PartnerOrder::create([
            'order_number' => 'ORD-202610-003',
            'partner_id' => $pt3->id,
            'created_by' => $supplyChain->id,
            'order_date' => '2026-10-31',
            'status' => 'processing',
            'shipping_address' => 'Jl. Gejayan No. 28, Yogyakarta',
            'notes' => 'Pesanan baru menunggu proses pengemasan',
        ]);
        PartnerOrderDetail::create([
            'partner_order_id' => $poDist3->id,
            'product_variant_id' => $variantModels['SLD-002-BLK-40']->id,
            'quantity' => 25,
            'unit_price' => 85000.00,
            'subtotal' => 2125000.00,
        ]);
    }
}
