import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Package, 
  Plus, 
  MagnifyingGlass, 
  WarningCircle, 
  CheckCircle,
  PencilSimple
} from '@phosphor-icons/react';

export const RawMaterialList = () => {
  const { hasRole } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    material_code: '',
    material_name: '',
    unit: 'meter',
    minimum_stock: 50,
    initial_stock: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      initial_stock: 0,
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
      initial_stock: m.stock?.quantity || 0,
    });
    setError('');
    setShowModal(true);
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
        });
      } else {
        await api.post('/raw-materials', formData);
      }
      setShowModal(false);
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan bahan baku.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.delete(`/raw-materials/${id}`);
      fetchMaterials();
    } catch (err) {
      alert('Gagal mengubah status bahan baku.');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Master Data Bahan Baku</h2>
          <p className="text-muted small mb-0">
            Daftar komponen manufaktur sepatu & sandal, satuan, dan ambang batas minimum stok (Safety Stock)
          </p>
        </div>
        {hasRole(['supply_chain']) && (
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={16} weight="bold" />
            <span>Tambah Bahan Baku</span>
          </button>
        )}
      </div>

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
                <th>Stok Saat Ini</th>
                <th>Kondisi Stok</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
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
                      <span className="fw-bold fs-6">
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
                            <button 
                              onClick={() => openEditModal(m)} 
                              className="btn btn-sm btn-outline-secondary py-1 px-2"
                              title="Edit Bahan"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button 
                              onClick={() => handleToggleActive(m.id)}
                              className={`btn btn-sm py-1 px-2 ${m.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
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

      {/* Modal Tambah / Edit Bahan */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Ubah Data Bahan Baku' : 'Tambah Bahan Baku Baru'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Kode Bahan (Unik)</label>
                    <input 
                      type="text" 
                      className="form-control" 
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
                        placeholder="meter, pasang, ml, lembar" 
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Batas Minimum Stok</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        className="form-control" 
                        value={formData.minimum_stock}
                        onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="mb-3">
                      <label className="form-label">Stok Awal Gudang Bahan</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        className="form-control" 
                        value={formData.initial_stock}
                        onChange={(e) => setFormData({ ...formData, initial_stock: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : (isEditing ? 'Perbarui Bahan' : 'Simpan Bahan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
