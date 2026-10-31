# SupplyFlow Management System

**Aplikasi Web Pengelolaan Rantai Pasok Terintegrasi Pabrik Sepatu & Sandal (Make to Stock)**  
*Tugas Akhir / Proyek UAS Web Application Development (WAD)*  
**Versi PRD:** 2.6  

---

## 1. Tentang Sistem

**SupplyFlow Management System** adalah aplikasi web modern berbasis Client-Server untuk mengelola seluruh rantai pasok pabrik manufaktur sepatu dan sandal. Sistem mencakup:
1. **Pengadaan Bahan Baku (Procurement):** Pembuatan Purchase Order (PO) langsung oleh Supply Chain kepada satu vendor supplier terpilih, dan pencatatan penerimaan fisik bahan baku ke gudang.
2. **Perencanaan & Eksekusi Manufaktur (Production):** Perencanaan Production Order Make to Stock (MTS) dengan multi-varian dari satu model produk, perhitungan kebutuhan bahan otomatis berbasis Bill of Materials (BOM), dan pemeriksaan kendali mutu (Quality Control / QC) dengan pemisahan produk lolos dan reject.
3. **Monitoring Inventaris Terpusat (Inventory):** Pemantauan real-time untuk dua gudang: Gudang Bahan Baku (dengan safety stock threshold) dan Gudang Barang Jadi (sepatu/sandal siap kirim).
4. **Distribusi & Penjualan (Distribution):** Pencatatan pesanan mitra reseller dan distributor, eksekusi pengiriman dengan nomor resi ekspedisi (JNE/SiCepat), dan pemotongan stok otomatis saat pengiriman.

---

## 2. Arsitektur & Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | React 19, Vite, JavaScript | Single Page Application (SPA) responsif |
| **Desain Antarmuka** | Bootstrap 5, UI/UX Pro Max, Phosphor Icons | Konsep **Clean Modern**, tipografi Plus Jakarta Sans |
| **Backend REST API** | Laravel 13, PHP 8.3+ | 52 REST API Endpoints, Sanctum Auth |
| **Database** | MySQL / MariaDB | 14 tabel relasional, foreign keys, row-level locking |
| **Keamanan** | Laravel Sanctum, Form Validation | Proteksi role middleware: Super Admin, Supply Chain, Production |

---

## 3. Akun Pengguna Bawaan (Default Seeded Accounts)

Sistem telah dilengkapi data awal (seed) dengan 3 role pengguna. Semua akun menggunakan kata sandi default: `password123`.

| Role | Email | Kata Sandi | Tanggung Jawab Operasional |
|---|---|---|---|
| **Super Admin** | `admin@supplyflow.com` | `password123` | Akses penuh, manajemen akun staf, konfigurasi sistem |
| **Supply Chain** | `supplychain@supplyflow.com` | `password123` | Supplier, PO bahan, penerimaan barang, mitra, pesanan mitra, pengiriman resi |
| **Production** | `production@supplyflow.com` | `password123` | Master produk & varian (SKU), BOM, Production Order, kalkulasi bahan, pencatatan hasil QC |

*(Pada halaman login tersedia tombol cepat 1-klik untuk memilih role demo tersebut)*.

---

## 4. Panduan Instalasi & Menjalankan Aplikasi

### 4.1 Prasyarat Sistem
- PHP 8.3 atau lebih baru (dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `bcmath`)
- Composer 2.x
- Node.js 18+ dan npm
- MySQL / MariaDB server berjalan pada port 3306

---

### 4.2 Langkah 1: Pengaturan Backend (Laravel 13)

1. Buka terminal dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```

2. Salin file environment:
   ```bash
   copy .env.example .env
   ```

3. Sesuaikan konfigurasi database pada `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=supplyflow_scm
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. Buat database `supplyflow_scm` di MySQL jika belum ada:
   ```sql
   CREATE DATABASE IF NOT EXISTS supplyflow_scm;
   ```

5. Jalankan migrasi dan seeder awal:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *(Atau Anda dapat mengimpor file SQL dump yang telah disediakan di `backend/database/supplyflow_scm.sql`)*

6. Jalankan development server backend:
   ```bash
   php artisan serve --port=8000
   ```
   Backend REST API akan aktif di `http://localhost:8000`.

---

### 4.3 Langkah 2: Pengaturan Frontend (React + Vite)

1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```

2. Pastikan file `.env` mengarah ke backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. Jalankan development server frontend:
   ```bash
   npm run dev
   ```
   Frontend akan aktif di `http://localhost:5173`.

4. Buka peramban (browser) dan akses:
   ```
   http://localhost:5173/login
   ```

---

## 5. Implementasi Aturan Bisnis (Business Rules)

Sistem menerapkan secara ketat 17 Business Rules dari PRD v2.6:

- **BR-01 (SKU Unik):** Setiap varian sepatu/sandal memiliki SKU unik (contoh: `SNK-001-BLK-40`).
- **BR-02 (Satu BOM per Model):** Satu model produk memiliki satu BOM aktif yang berlaku untuk seluruh ukuran dan warna.
- **BR-03 (PO Langsung & Satu Vendor):** Supply Chain membuat PO langsung tanpa alur Purchase Request (PR), dan satu PO hanya memilih satu supplier.
- **BR-04 & BR-05 (Penerimaan Penuh MVP):** Penerimaan bahan baku dicatat satu kali penuh, dan kuantitas diterima tidak melebihi pesanan.
- **BR-06 (Update Stok Bahan):** Pencatatan penerimaan otomatis menambah stok fisik bahan baku.
- **BR-07 & BR-08 (Kebutuhan Bahan & Multi-Varian):** Kebutuhan bahan = total target produksi seluruh varian × kebutuhan BOM per unit. Satu order produksi memuat varian dari satu model produk.
- **BR-09 & BR-10 (Validasi Stok Bahan Saat Produksi):** Produksi hanya dapat dimulai jika seluruh bahan mencukupi. Saat produksi dimulai, sistem langsung memotong stok bahan baku dari gudang.
- **BR-11 (Konsistensi QC):** Sistem memvalidasi bahwa `Jumlah Aktual = Lolos QC + Reject`.
- **BR-12 & BR-13 (Pemisahan Reject & Lolos QC):** Produk reject hanya dicatat untuk laporan kualitas, sedangkan HANYA produk lolos QC yang masuk ke stok gudang barang jadi.
- **BR-14 (Pesanan Mitra Non-Reservasi):** Pesanan mitra tidak mencadangkan/mereservasi stok.
- **BR-15 & BR-16 (Pengurangan Stok Saat Pengiriman):** Stok barang jadi berkurang saat pengiriman dicatat dengan nomor resi. Sistem menolak pengiriman jika stok barang jadi tidak mencukupi.
- **BR-17 (Integritas Stok & Konkurensi):** Stok tidak boleh bernilai negatif. Seluruh perubahan stok menggunakan `lockForUpdate()` dan database transaction di backend.

---

## 6. Struktur Direktori Proyek

```text
Final project WAD/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/       # Auth, Dashboard, Products, PO, ProdOrder, dll
│   │   │   └── Middleware/        # RoleMiddleware (super_admin, supply_chain, production)
│   │   └── Models/                # 14 Eloquent Models
│   ├── database/
│   │   ├── migrations/            # 14 tabel relasional
│   │   ├── seeders/               # DatabaseSeeder realistis pabrik sepatu/sandal
│   │   └── supplyflow_scm.sql     # File SQL export database lengkap
│   ├── routes/
│   │   └── api.php                # 52 REST API routes
│   ├── tests/
│   │   └── Feature/               # SupplyFlowApiTest (100% passed)
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/            # StatCard, StatusBadge, dll
│   │   ├── contexts/              # AuthContext (Sanctum state & role checking)
│   │   ├── layouts/               # MainLayout (Clean Modern Sidebar & Topbar)
│   │   ├── pages/
│   │   │   ├── auth/              # Login page dengan demo account 1-klik
│   │   │   ├── dashboard/         # Dashboard 4 pilar rantai pasok
│   │   │   ├── products/          # Katalog produk, varian SKU, dan BOM
│   │   │   ├── raw-materials/     # Master bahan baku & safety stock
│   │   │   ├── suppliers/         # Master data supplier
│   │   │   ├── purchase-orders/   # PO bahan baku & material receiving
│   │   │   ├── production-orders/ # Production order MTS & pemeriksaan QC
│   │   │   ├── inventory/         # Monitoring dual warehouse (bahan & jadi)
│   │   │   ├── partners/          # Master reseller & distributor
│   │   │   ├── partner-orders/    # Pesanan mitra & eksekusi pengiriman
│   │   │   └── users/             # Manajemen akun staf (Super Admin)
│   │   ├── services/api.js        # Axios instance dengan interceptor
│   │   ├── App.jsx                # Protected routes & role authorization
│   │   └── index.css              # Clean modern UI/UX styling system
│   └── .env.example
│
├── docs/
│   ├── ERD.md                     # ERD diagram Mermaid & kamus data lengkap
│   ├── API-DOCUMENTATION.md       # Dokumentasi 52 REST API endpoints
│   └── ARCHITECTURE.md            # Desain arsitektur, UI tokens, & flow
│
└── README.md
```

---

## 7. Pengujian API Otomatis (Feature Testing)

Backend telah dilengkapi dengan pengujian otomatis:
```bash
cd backend
php artisan test --filter=SupplyFlowApiTest
```
**Hasil Pengujian:**
- `test_login_success_and_returns_token_and_role`: **PASSED**
- `test_dashboard_endpoint_returns_all_four_pillars`: **PASSED**
- `test_purchase_order_flow_and_material_receiving`: **PASSED**
- `test_production_order_validation_and_qc_flow`: **PASSED**

---

## 8. Lisensi & Hak Cipta

Dikembangkan untuk memenuhi Deliverables Ujian Akhir Semester (UAS) mata kuliah Web Application Development (WAD).
All rights reserved © 2026.
