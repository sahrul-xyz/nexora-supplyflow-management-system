# Dokumentasi REST API
## SupplyFlow Management System v2.6

Semua endpoint bertransaksi menggunakan JSON (`Content-Type: application/json`, `Accept: application/json`).
Endpoint terproteksi memerlukan header `Authorization: Bearer <token_sanctum>`.

Base URL Development: `http://localhost:8000/api`

---

## 1. Autentikasi (Authentication)

### 1.1 Login
- **URL:** `POST /api/login`
- **Role:** Publik
- **Request Body:**
```json
{
  "email": "admin@supplyflow.com",
  "password": "password123"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": 1,
      "name": "Super Administrator",
      "email": "admin@supplyflow.com",
      "role": "super_admin"
    },
    "token": "1|AbCdEf123456..."
  }
}
```
- **Response 422 Unprocessable Entity:**
```json
{
  "message": "Kombinasi email dan password tidak sesuai.",
  "errors": {
    "email": ["Kombinasi email dan password tidak sesuai."]
  }
}
```

### 1.2 Logout
- **URL:** `POST /api/logout`
- **Header:** `Authorization: Bearer <token>`
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Logout berhasil."
}
```

### 1.3 Informasi Pengguna Login
- **URL:** `GET /api/user`
- **Header:** `Authorization: Bearer <token>`
- **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Super Administrator",
    "email": "admin@supplyflow.com",
    "role": "super_admin"
  }
}
```

---

## 2. Dashboard

### 2.1 Ringkasan 4 Pilar Rantai Pasok
- **URL:** `GET /api/dashboard`
- **Header:** `Authorization: Bearer <token>`
- **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "procurement": {
      "active_pos": 1,
      "completed_pos": 1,
      "low_stock_materials_count": 1,
      "low_stock_materials": [...]
    },
    "production": {
      "active_orders": 2,
      "completed_orders": 1,
      "total_target": 100,
      "total_actual": 100,
      "total_passed_qc": 97,
      "total_rejected_qc": 3,
      "qc_pass_rate": 97.0
    },
    "inventory": {
      "total_raw_material_quantity": 21100.0,
      "total_finished_goods_quantity": 688,
      "low_stock_finished_goods_count": 2,
      "low_stock_finished_goods": [...]
    },
    "distribution": {
      "processing_count": 1,
      "shipped_count": 1,
      "delivered_count": 1
    },
    "recent": {
      "purchase_orders": [...],
      "production_orders": [...],
      "partner_orders": [...]
    }
  }
}
```

---

## 3. Master Data

### 3.1 Produk (Products)
- `GET /api/products` (Semua role)
  - Query Params: `category` (`shoes`|`sandals`), `search`, `is_active`
- `GET /api/products/{id}` (Semua role)
- `POST /api/products` (Super Admin, Production)
  - Request Body:
```json
{
  "product_code": "SH-NEW-01",
  "product_name": "AeroPro Running",
  "category": "shoes",
  "description": "Sepatu lari sol karet fleksibel",
  "variants": [
    { "sku": "RUN-PRO-BLK-40", "size": "40", "color": "Black" },
    { "sku": "RUN-PRO-BLK-41", "size": "41", "color": "Black" }
  ]
}
```
- `PUT /api/products/{id}` (Super Admin, Production)
- `DELETE /api/products/{id}` (Soft deactivate toggle)

### 3.2 Varian Produk (Product Variants)
- `GET /api/product-variants` (Semua role)
  - Query Params: `product_id`, `search`
- `POST /api/product-variants` (Super Admin, Production)
  - Request Body:
```json
{
  "product_id": 1,
  "sku": "SNK-001-WHT-43",
  "size": "43",
  "color": "White",
  "initial_stock": 0
}
```
- `PUT /api/product-variants/{id}`
- `DELETE /api/product-variants/{id}` (Soft toggle)

### 3.3 Bahan Baku (Raw Materials)
- `GET /api/raw-materials` (Semua role)
- `GET /api/raw-materials/{id}` (Semua role)
- `POST /api/raw-materials` (Super Admin, Supply Chain)
  - Request Body:
```json
{
  "material_code": "RM-KLT-03",
  "material_name": "Kulit Nubuck Asli",
  "unit": "meter",
  "minimum_stock": 25.0,
  "initial_stock": 50.0
}
```
- `PUT /api/raw-materials/{id}`
- `DELETE /api/raw-materials/{id}` (Soft toggle)

### 3.4 Supplier
- `GET /api/suppliers` (Semua role)
- `POST /api/suppliers` (Super Admin, Supply Chain)
  - Request Body:
```json
{
  "supplier_name": "PT Sumber Kulit Garut",
  "contact_person": "Rahmat Hidayat",
  "phone": "081234567890",
  "email": "sales@sumberkulit.co.id",
  "address": "Kawasan Industri Sukaregang, Garut"
}
```
- `PUT /api/suppliers/{id}`
- `DELETE /api/suppliers/{id}` (Ditolak jika sudah ada relasi PO)

### 3.5 Bill of Materials (BOM)
- `GET /api/bom-details/{productId}` (Semua role)
- `PUT /api/bom-details/{productId}` (Super Admin, Production)
  - Request Body:
```json
{
  "materials": [
    { "raw_material_id": 1, "quantity_required": 0.450 },
    { "raw_material_id": 3, "quantity_required": 1.000 },
    { "raw_material_id": 5, "quantity_required": 20.000 }
  ]
}
```

### 3.6 Mitra Reseller & Distributor
- `GET /api/partners` (Semua role)
  - Query Params: `type` (`reseller`|`distributor`), `search`
- `POST /api/partners` (Super Admin, Supply Chain)
  - Request Body:
```json
{
  "partner_code": "PT-DIST-004",
  "partner_name": "CV Langkah Sejati",
  "partner_type": "distributor",
  "contact_person": "Agus Salim",
  "phone": "081388776655",
  "email": "langkahsejati@gmail.com",
  "address": "Jl. Gajah Mada No. 12, Semarang"
}
```
- `PUT /api/partners/{id}`
- `DELETE /api/partners/{id}`

### 3.7 Akun Pengguna (Super Admin)
- `GET /api/users` (Super Admin)
- `POST /api/users` (Super Admin)
  - Request Body:
```json
{
  "name": "Andi Operator",
  "email": "andi@supplyflow.com",
  "password": "password123",
  "role": "production"
}
```
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}` (Tidak dapat menghapus akun sendiri)

---

## 4. Pengadaan (Purchase Order)

### 4.1 Daftar & Detail PO
- `GET /api/purchase-orders`
  - Query Params: `status` (`ordered`|`completed`), `search`
- `GET /api/purchase-orders/{id}`

### 4.2 Buat Purchase Order
- **URL:** `POST /api/purchase-orders`
- **Role:** Super Admin, Supply Chain
- **Request Body:**
```json
{
  "supplier_id": 1,
  "order_date": "2026-10-31",
  "notes": "Pengadaan bahan sol dan lem",
  "items": [
    {
      "raw_material_id": 3,
      "quantity_ordered": 100.0,
      "unit_price": 35000.0
    },
    {
      "raw_material_id": 5,
      "quantity_ordered": 2000.0,
      "unit_price": 45.0
    }
  ]
}
```
- **Response 201 Created:** Mengembalikan data PO dengan status `ordered`.

### 4.3 Penerimaan Bahan Baku (Material Receiving)
- **URL:** `POST /api/purchase-orders/{id}/receive`
- **Role:** Super Admin, Supply Chain
- **Proses Bisnis:**
  - Menandai `quantity_received = quantity_ordered` (penerimaan penuh MVP - BR-04, BR-05).
  - Menambah stok fisik bahan baku pada tabel `inventory_stocks` menggunakan row locking database transaction (BR-06, BR-17).
  - Mengubah status PO menjadi `completed`.
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Penerimaan PO PO-202610-003 berhasil dicatat. Stok bahan baku telah diperbarui.",
  "data": { ... }
}
```

---

## 5. Manufaktur & QC (Production Order)

### 5.1 Cek Kebutuhan Bahan (Live BOM Check)
- **URL:** `POST /api/production-orders/check-requirements`
- **Role:** Super Admin, Production
- **Request Body:**
```json
{
  "product_id": 1,
  "variants": [
    { "product_variant_id": 1, "target_quantity": 25 },
    { "product_variant_id": 2, "target_quantity": 25 }
  ]
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "product_name": "AeroStride Classic Sneaker",
    "total_target": 50,
    "all_sufficient": true,
    "requirements": [
      {
        "raw_material_id": 1,
        "material_name": "Kulit Sintetis Premium (Black)",
        "bom_per_unit": 0.45,
        "total_required": 22.5,
        "available_stock": 120.0,
        "is_sufficient": true,
        "shortage": 0
      }
    ]
  }
}
```

### 5.2 Rencanakan Production Order
- **URL:** `POST /api/production-orders`
- **Role:** Super Admin, Production
- **Request Body:**
```json
{
  "product_id": 1,
  "production_date": "2026-11-01",
  "notes": "Produksi Make to Stock batch November",
  "variants": [
    { "product_variant_id": 1, "target_quantity": 30 },
    { "product_variant_id": 2, "target_quantity": 30 }
  ]
}
```
- **Response 201 Created:** Status awal `planned`.

### 5.3 Mulai Produksi (Start Production)
- **URL:** `POST /api/production-orders/{id}/start`
- **Role:** Super Admin, Production
- **Proses Bisnis:**
  - Memeriksa stok bahan baku berdasarkan BOM * total target (BR-07, BR-09).
  - Jika kurang, merespons `422 Unprocessable Entity` beserta daftar kekurangan bahan (BR-09).
  - Jika cukup, memotong stok fisik bahan baku menggunakan DB transaction + row lock (BR-10, BR-17).
  - Mengubah status menjadi `in_progress`.

### 5.4 Catat Hasil Produksi & QC (Complete)
- **URL:** `POST /api/production-orders/{id}/complete`
- **Role:** Super Admin, Production
- **Request Body:**
```json
{
  "results": [
    {
      "detail_id": 1,
      "actual_quantity": 30,
      "passed_quantity": 29,
      "rejected_quantity": 1
    },
    {
      "detail_id": 2,
      "actual_quantity": 30,
      "passed_quantity": 30,
      "rejected_quantity": 0
    }
  ]
}
```
- **Validasi Bisnis:**
  - `actual_quantity == passed_quantity + rejected_quantity` (BR-11).
  - Hanya `passed_quantity` yang masuk ke stok barang jadi (BR-13).
  - `rejected_quantity` hanya disimpan untuk laporan audit/kualitas (BR-12).
  - Mengubah status order menjadi `completed`, mencatat `qc_checked_by` dan `qc_checked_at`.

---

## 6. Inventaris Terpusat

### 6.1 Lihat Stok Seluruh Gudang
- **URL:** `GET /api/inventory-stocks`
- **Role:** Semua Pengguna Terautentikasi
- **Query Params:** `warehouse_type` (`raw_material`|`finished_goods`|null)
- **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "raw_materials": [
      {
        "id": 1,
        "material_code": "RM-KLT-01",
        "material_name": "Kulit Sintetis Premium (Black)",
        "unit": "meter",
        "minimum_stock": 40.0,
        "current_stock": 120.0,
        "is_low_stock": false
      }
    ],
    "finished_goods": [
      {
        "id": 1,
        "sku": "SNK-001-BLK-40",
        "product_name": "AeroStride Classic Sneaker",
        "category": "shoes",
        "size": "40",
        "color": "Black",
        "current_stock": 50,
        "is_low_stock": false
      }
    ],
    "summary": {
      "total_raw_material_items": 9,
      "total_finished_goods_items": 14,
      "low_raw_material_count": 1,
      "low_finished_goods_count": 2
    }
  }
}
```

---

## 7. Distribusi & Pesanan Mitra

### 7.1 Daftar & Detail Pesanan
- `GET /api/partner-orders`
  - Query Params: `status`, `partner_id`, `search`
- `GET /api/partner-orders/{id}`

### 7.2 Buat Pesanan Mitra
- **URL:** `POST /api/partner-orders`
- **Role:** Super Admin, Supply Chain
- **Request Body:**
```json
{
  "partner_id": 1,
  "order_date": "2026-10-31",
  "shipping_address": "Gudang Distributor Jakarta Barat",
  "notes": "Pengiriman batch pertama",
  "items": [
    {
      "product_variant_id": 1,
      "quantity": 20,
      "unit_price": 220000.0
    }
  ]
}
```
- **Response 201 Created:** Status awal `processing`. Tidak menggunakan sistem reservasi (BR-14).

### 7.3 Eksekusi Pengiriman (Ship Order)
- **URL:** `POST /api/partner-orders/{id}/ship`
- **Role:** Super Admin, Supply Chain
- **Request Body:**
```json
{
  "tracking_number": "JNE-REG-991823712",
  "shipped_at": "2026-10-31 14:00:00",
  "shipping_address": "Gudang Distributor Jakarta Barat"
}
```
- **Proses Bisnis:**
  - Memeriksa ketersediaan stok fisik barang jadi (BR-16).
  - Jika stok kurang, pengiriman ditolak dengan status `422` (BR-16).
  - Jika cukup, stok gudang jadi dikurangkan secara atomic menggunakan row locks (BR-15, BR-17).
  - Status berubah menjadi `shipped`.

### 7.4 Konfirmasi Pesanan Diterima (Deliver)
- **URL:** `POST /api/partner-orders/{id}/deliver`
- **Role:** Super Admin, Supply Chain
- **Response 200 OK:** Status berubah menjadi `delivered`.

### 7.5 Pembatalan Pesanan (Cancel)
- **URL:** `POST /api/partner-orders/{id}/cancel`
- **Role:** Super Admin, Supply Chain
- **Proses Bisnis:** Hanya diizinkan jika pesanan berstatus `processing` (sebelum pengiriman fisik).
