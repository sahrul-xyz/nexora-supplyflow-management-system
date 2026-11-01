import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StockAdjustModal } from '../../components/StockAdjustModal';
import { 
  Package, 
  Plus, 
  MagnifyingGlass, 
  WarningCircle, 
  CheckCircle,
  PencilSimple,
  SlidersHorizontal,
  Trash,
  DotsThreeVertical,
  ArrowClockwise
} from '@phosphor-icons/react';

export const RawMaterialList = () => {
  const { hasRole } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    material_code: '',
    material_name: '',
    unit: 'meter',
    minimum_stock: 50,
    current_stock: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/raw-materials', { params: { search } });
      if (res.data?.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      material_code: '',
      material_name: '',
      unit: 'meter',
      minimum_stock: 50,
      current_stock: 0,
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setIsEditing(true);
    setSelectedId(m.id);
    setFormData({
      material_code: m.material_code,
      material_name: m.material_name,
      unit: m.unit,
      minimum_stock: m.minimum_stock,
      current_stock: m.stock?.quantity || 0,
    });
    setError('');
    setShowModal(true);
  };

  const openAdjustModal = (m) => {
    setSelectedStockItem({
      warehouse_type: 'raw_material',
      id: m.id,
      name: `${m.material_name} (${m.material_code})`,
      unit: m.unit,
      current_stock: m.stock?.quantity || 0,
    });
    setShowAdjustModal(true);
  };

  const handleAdjustmentSuccess = (msg) => {
    setToastMessage(msg);
    fetchMaterials();
    setTimeout(() => setToastMessage(''), 6000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/raw-materials/${selectedId}`, {
          material_code: formData.material_code,
          material_name: formData.material_name,
          unit: formData.unit,
          minimum_stock: formData.minimum_stock,
          current_stock: formData.current_stock,
        });
        setToastMessage(`Data dan stok '${formData.material_name}' berhasil diperbarui.`);
      } else {
        await api.post('/raw-materials', {
          ...formData,
          initial_stock: formData.current_stock,
        });
        setToastMessage(`Bahan baku '${formData.material_name}' berhasil ditambahkan.`);
      }
      setShowModal(false);
      fetchMaterials();
      setTimeout(() => setToastMessage(''), 6000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan bahan baku.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetStock = async (m) => {
    if (!window.confirm(`Yakin ingin mengosongkan/menghapus seluruh stok '${m.material_name}' (reset ke 0)?`)) return;
    try {
      const res = await api.delete(`/raw-materials/${m.id}?action=reset_stock`);
      setToastMessage(res.data?.message || 'Stok berhasil dikosongkan.');
      fetchMaterials();
      setTimeout(() => setToastMessage(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengosongkan stok.');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await api.delete(`/raw-materials/${id}`);
      setToastMessage(res.data?.message || 'Status bahan baku berhasil diubah.');
      fetchMaterials();
      setTimeout(() => setToastMessage(''), 6000);
    } catch (err) {
      alert('Gagal mengubah status bahan baku.');
    }
  };

  const handleDeletePermanent = async (m) => {
    if (!window.confirm(`PERINGATAN: Yakin ingin menghapus permanen bahan baku '${m.material_name}'? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await api.delete(`/raw-materials/${m.id}?permanent=true`);
      setToastMessage(res.data?.message || 'Bahan baku berhasil dihapus permanen.');
      fetchMaterials();
      setTimeout(() => setToastMessage(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus permanen. Bahan baku mungkin terikat dengan riwayat PO atau BOM.');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Master Data Bahan Baku</h2>
          <p className="text-muted small mb-0">
            Kelola master komponen sepatu & sandal, kurangi / tambah stok, set safety stock, dan hapus persediaan
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchMaterials} disabled={loading}>
            <ArrowClockwise size={16} />
            <span>Segarkan</span>
          </button>
          {hasRole(['supply_chain']) && (
            <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
              <Plus size={16} weight="bold" />
              <span>Tambah Bahan Baku</span>
            </button>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={18} weight="bold" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" className="btn-close btn-sm" onClick={() => setToastMessage('')}></button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card-nexora p-3 mb-4">
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-12 col-md-9">
            <div className="header-search-pill w-100">
              <MagnifyingGlass size={18} className="text-muted" />
              <input 
                type="text" 
                className="header-search-input w-100" 
                placeholder="Cari kode atau nama bahan baku (Kulit, Sol TPR, Benang, Lem, Foam)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <button type="submit" className="header-pill-btn w-100 justify-content-center py-2">
              Cari Bahan
            </button>
          </div>
        </form>
      </div>

      {/* Materials Table */}
      <div className="card-nexora p-0 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>Kode Bahan</th>
                <th>Nama Bahan Baku</th>
                <th>Satuan</th>
                <th>Batas Min. (Safety)</th>
                <th>Stok Fisik Saat Ini</th>
                <th>Kondisi Stok</th>
                <th>Status</th>
                <th className="text-end">Aksi & Kelola Stok</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat data bahan baku...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Tidak ditemukan bahan baku.
                  </td>
                </tr>
              ) : (
                materials.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="fw-bold font-monospace text-primary">{m.material_code}</span>
                    </td>
                    <td className="fw-semibold text-dark">{m.material_name}</td>
                    <td>
                      <span className="badge-clean badge-planned">{m.unit}</span>
                    </td>
                    <td>{m.minimum_stock} {m.unit}</td>
                    <td>
                      <span className="fw-bold fs-6 text-dark">
                        {m.stock?.quantity || 0}
                      </span> {m.unit}
                    </td>
                    <td>
                      {m.is_low_stock ? (
                        <span className="badge-clean badge-warning-low">
                          <WarningCircle size={14} weight="bold" />
                          <span>Di Bawah Batas</span>
                        </span>
                      ) : (
                        <span className="badge-clean badge-completed">
                          <CheckCircle size={14} weight="bold" />
                          <span>Stok Aman</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {m.is_active ? (
                        <span className="badge-clean badge-completed">Aktif</span>
                      ) : (
                        <span className="badge-clean badge-danger">Non-aktif</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        {hasRole(['supply_chain']) && (
                          <>
                            {/* Stock Adjustment Trigger */}
                            <button 
                              onClick={() => openAdjustModal(m)} 
                              className="btn btn-sm btn-outline-primary py-1 px-2 d-inline-flex align-items-center gap-1"
                              title="Sesuaikan Stok (Kurangi / Tambah / Kosongkan)"
                            >
                              <SlidersHorizontal size={14} />
                              <span className="small">Stok</span>
                            </button>

                            {/* Edit Material Details & Stock */}
                            <button 
                              onClick={() => openEditModal(m)} 
                              className="btn btn-sm btn-outline-secondary py-1 px-2"
                              title="Edit Detail & Stok"
                            >
                              <PencilSimple size={15} />
                            </button>

                            {/* Reset Stock to 0 */}
                            <button 
                              onClick={() => handleResetStock(m)}
                              className="btn btn-sm btn-outline-warning py-1 px-2 text-dark"
                              title="Kosongkan Stok (Reset ke 0)"
                            >
                              <Trash size={14} />
                            </button>

                            {/* Toggle Active / Inactive */}
                            <button 
                              onClick={() => handleToggleActive(m.id)}
                              className={`btn btn-sm py-1 px-2 ${m.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              title={m.is_active ? 'Nonaktifkan Bahan' : 'Aktifkan Kembali'}
                            >
                              {m.is_active ? 'Nonaktif' : 'Aktif'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Bahan & Stok */}
      {showModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
            <div className="modal-content card-nexora border-0 shadow-float" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-dark">
                  {isEditing ? 'Ubah Data & Stok Bahan Baku' : 'Tambah Bahan Baku Baru'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-3">
                  {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Kode Bahan (Unik)</label>
                    <input 
                      type="text" 
                      className="form-control font-monospace" 
                      placeholder="Contoh: RM-KLT-03" 
                      value={formData.material_code}
                      onChange={(e) => setFormData({ ...formData, material_code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nama Bahan Baku</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Kulit Suede Sintetis" 
                      value={formData.material_name}
                      onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Satuan</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="meter, pasang, roll, ml" 
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Batas Safety Stock</label>
                      <input 
                        type="number" 
                        step="any"
                        min="0"
                        className="form-control" 
                        value={formData.minimum_stock}
                        onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  {/* Stock field editable in both Create and Edit mode */}
                  <div className="mb-3 p-3 rounded-3 bg-light border border-subtle">
                    <label className="form-label fw-bold text-dark mb-1">
                      {isEditing ? `Stok Fisik Saat Ini (${formData.unit || 'unit'}):` : `Stok Awal Gudang (${formData.unit || 'unit'}):`}
                    </label>
                    <input 
                      type="number" 
                      step="any"
                      min="0"
                      className="form-control font-monospace fw-bold fs-6" 
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                    />
                    <small className="text-muted d-block mt-1">
                      {isEditing 
                        ? 'Anda dapat mengubah angka stok di atas secara langsung untuk memperbarui ketersediaan gudang.' 
                        : 'Masukkan jumlah stok awal yang tersedia di gudang.'}
                    </small>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 d-flex justify-content-between">
                  {isEditing ? (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeletePermanent({ id: selectedId, material_name: formData.material_name })}
                    >
                      Hapus Permanen
                    </button>
                  ) : <div></div>}
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-light border" onClick={() => setShowModal(false)}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                      {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      <StockAdjustModal 
        show={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onSuccess={handleAdjustmentSuccess}
        item={selectedStockItem}
      />
    </div>
  );
};
