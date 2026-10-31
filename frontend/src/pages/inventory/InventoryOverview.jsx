import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Warehouse, 
  Package, 
  Sneaker, 
  WarningCircle, 
  CheckCircle, 
  MagnifyingGlass,
  ArrowClockwise
} from '@phosphor-icons/react';

export const InventoryOverview = () => {
  const [activeTab, setActiveTab] = useState('raw'); // 'raw' or 'finished'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory-stocks');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rawMaterials = data?.raw_materials?.filter(m => 
    !search || m.material_name.toLowerCase().includes(search.toLowerCase()) || m.material_code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const finishedGoods = data?.finished_goods?.filter(g =>
    !search || g.product_name.toLowerCase().includes(search.toLowerCase()) || g.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Monitoring Stok Pergudangan</h2>
          <p className="text-muted small mb-0">
            Pelacakan real-time ketersediaan Gudang Bahan Baku dan Gudang Barang Jadi (Sepatu & Sandal)
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchInventory} disabled={loading}>
          <ArrowClockwise size={16} />
          <span>Segarkan Data Stok</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="card-nexora p-4 d-flex align-items-center justify-content-between bg-white">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle text-primary"
                style={{ width: '48px', height: '48px', background: '#eff6ff' }}
              >
                <Package size={24} weight="duotone" />
              </div>
              <div>
                <div className="text-muted small">Total Jenis Bahan Baku</div>
                <h3 className="fw-bold mb-0">{data?.summary?.total_raw_material_items || 0} Jenis</h3>
              </div>
            </div>
            {data?.summary?.low_raw_material_count > 0 ? (
              <span className="badge-clean badge-warning-low">
                <WarningCircle size={14} weight="bold" />
                <span>{data.summary.low_raw_material_count} Di Bawah Batas</span>
              </span>
            ) : (
              <span className="badge-clean badge-completed">Semua Aman</span>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card-nexora p-4 d-flex align-items-center justify-content-between bg-white">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle text-success"
                style={{ width: '48px', height: '48px', background: '#ecfdf5' }}
              >
                <Sneaker size={24} weight="duotone" />
              </div>
              <div>
                <div className="text-muted small">Total Varian Barang Jadi (SKU)</div>
                <h3 className="fw-bold mb-0">{data?.summary?.total_finished_goods_items || 0} Varian</h3>
              </div>
            </div>
            {data?.summary?.low_finished_goods_count > 0 ? (
              <span className="badge-clean badge-warning-low">
                <WarningCircle size={14} weight="bold" />
                <span>{data.summary.low_finished_goods_count} Menipis</span>
              </span>
            ) : (
              <span className="badge-clean badge-completed">Stok Siap Kirim</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="card-nexora p-3 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex gap-2">
            <button 
              className={`btn btn-sm ${activeTab === 'raw' ? 'btn-primary' : 'header-pill-btn'}`}
              onClick={() => setActiveTab('raw')}
            >
              <Package size={16} />
              <span>Gudang Bahan Baku ({data?.raw_materials?.length || 0})</span>
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'finished' ? 'btn-primary' : 'header-pill-btn'}`}
              onClick={() => setActiveTab('finished')}
            >
              <Sneaker size={16} />
              <span>Gudang Barang Jadi ({data?.finished_goods?.length || 0})</span>
            </button>
          </div>

          <div style={{ maxWidth: '320px', width: '100%' }}>
            <div className="header-search-pill w-100">
              <MagnifyingGlass size={16} className="text-muted" />
              <input 
                type="text" 
                className="header-search-input w-100" 
                placeholder="Cari kode atau nama item..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tables based on Tab */}
      <div className="card-nexora p-0 overflow-hidden mb-4">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 small">Memuat data inventaris...</div>
          </div>
        ) : activeTab === 'raw' ? (
          <div className="table-responsive">
            <table className="table-clean mb-0">
              <thead>
                <tr>
                  <th>Kode Bahan</th>
                  <th>Nama Bahan Baku</th>
                  <th>Satuan</th>
                  <th>Batas Minimum (Safety)</th>
                  <th>Stok Fisik Saat Ini</th>
                  <th>Status Persediaan</th>
                </tr>
              </thead>
              <tbody>
                {rawMaterials.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Tidak ditemukan bahan baku di gudang.
                    </td>
                  </tr>
                ) : (
                  rawMaterials.map((rm) => (
                    <tr key={rm.id}>
                      <td className="fw-bold font-monospace text-primary">{rm.material_code}</td>
                      <td>
                        <div className="fw-semibold text-dark">{rm.material_name}</div>
                      </td>
                      <td>
                        <span className="badge-clean badge-planned">{rm.unit}</span>
                      </td>
                      <td>{rm.minimum_stock} {rm.unit}</td>
                      <td>
                        <span className="fw-bold fs-6">
                          {rm.current_stock} {rm.unit}
                        </span>
                      </td>
                      <td>
                        {rm.is_low_stock ? (
                          <span className="badge-clean badge-warning-low">
                            <WarningCircle size={14} weight="bold" />
                            <span>Di Bawah Batas Minimum</span>
                          </span>
                        ) : (
                          <span className="badge-clean badge-completed">
                            <CheckCircle size={14} weight="bold" />
                            <span>Stok Aman</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-clean mb-0">
              <thead>
                <tr>
                  <th>SKU Produk</th>
                  <th>Model Produk</th>
                  <th>Kategori</th>
                  <th>Ukuran</th>
                  <th>Warna</th>
                  <th>Stok Siap Kirim</th>
                  <th>Status Gudang Jadi</th>
                </tr>
              </thead>
              <tbody>
                {finishedGoods.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Tidak ditemukan barang jadi di gudang.
                    </td>
                  </tr>
                ) : (
                  finishedGoods.map((g) => (
                    <tr key={g.id}>
                      <td className="fw-bold font-monospace text-primary">{g.sku}</td>
                      <td className="fw-semibold text-dark">{g.product_name}</td>
                      <td>
                        <span className="badge-clean badge-planned">
                          {g.category === 'shoes' ? 'Sepatu' : 'Sandal'}
                        </span>
                      </td>
                      <td>Size {g.size}</td>
                      <td>{g.color}</td>
                      <td>
                        <span className="fw-bold fs-6 text-dark">
                          {g.current_stock} Pasang
                        </span>
                      </td>
                      <td>
                        {g.is_low_stock ? (
                          <span className="badge-clean badge-warning-low">
                            <WarningCircle size={14} weight="bold" />
                            <span>Stok Terbatas (&lt;10)</span>
                          </span>
                        ) : (
                          <span className="badge-clean badge-completed">
                            <CheckCircle size={14} weight="bold" />
                            <span>Siap Distribusi</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
