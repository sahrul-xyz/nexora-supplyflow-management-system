import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  MagnifyingGlass, 
  Phone, 
  PencilSimple, 
  Truck,
  Tag
} from '@phosphor-icons/react';

export const PartnerList = () => {
  const { hasRole } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    partner_code: '',
    partner_name: '',
    partner_type: 'reseller',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const res = await api.get('/partners', { params });
      if (res.data?.success) {
        setPartners(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPartners();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      partner_code: '',
      partner_name: '',
      partner_type: 'reseller',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setIsEditing(true);
    setSelectedId(p.id);
    setFormData({
      partner_code: p.partner_code,
      partner_name: p.partner_name,
      partner_type: p.partner_type,
      contact_person: p.contact_person || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
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
        await api.put(`/partners/${selectedId}`, formData);
      } else {
        await api.post('/partners', formData);
      }
      setShowModal(false);
      fetchPartners();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan mitra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.delete(`/partners/${id}`);
      fetchPartners();
    } catch (err) {
      alert('Gagal mengubah status mitra.');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Data Mitra (Reseller & Distributor)</h2>
          <p className="text-muted small mb-0">
            Kelola saluran distribusi hilir sepatu dan sandal ke reseller toko retail dan distributor besar
          </p>
        </div>
        {hasRole(['supply_chain']) && (
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={16} weight="bold" />
            <span>Tambah Mitra Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="card-nexora p-3 mb-4">
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="header-search-pill w-100">
              <MagnifyingGlass size={18} className="text-muted" />
              <input 
                type="text" 
                className="header-search-input w-100" 
                placeholder="Cari kode mitra, nama partner, atau PIC..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select 
              className="form-select rounded-pill px-3 py-2 text-muted border-1"
              style={{ fontSize: '0.875rem' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Semua Tipe Mitra</option>
              <option value="reseller">Reseller Retail</option>
              <option value="distributor">Distributor Utama</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button type="submit" className="header-pill-btn w-100 justify-content-center py-2">
              Filter Data
            </button>
          </div>
        </form>
      </div>

      {/* Partners Table */}
      <div className="card-nexora p-0 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Mitra</th>
                <th>Tipe</th>
                <th>Kontak Person</th>
                <th>Kontak & Alamat</th>
                <th>Pesanan</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat data mitra...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Tidak ditemukan data mitra.
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="fw-bold font-monospace text-primary">{p.partner_code}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{p.partner_name}</div>
                    </td>
                    <td>
                      <span className={`badge-clean ${p.partner_type === 'distributor' ? 'badge-planned' : 'badge-completed'}`}>
                        <Tag size={12} weight="bold" />
                        {p.partner_type === 'distributor' ? 'Distributor' : 'Reseller'}
                      </span>
                    </td>
                    <td>{p.contact_person || '-'}</td>
                    <td>
                      <div className="small">
                        {p.phone && <div className="text-muted"><Phone size={12} /> {p.phone}</div>}
                        {p.address && <div className="text-truncate text-muted" style={{ maxWidth: '200px' }}>{p.address}</div>}
                      </div>
                    </td>
                    <td>
                      <span className="badge-clean badge-planned">
                        <Truck size={12} weight="bold" />
                        {p.orders_count || 0} Order
                      </span>
                    </td>
                    <td>
                      {p.is_active ? (
                        <span className="badge-clean badge-completed">Aktif</span>
                      ) : (
                        <span className="badge-clean badge-danger">Non-aktif</span>
                      )}
                    </td>
                    <td className="text-end">
                      {hasRole(['supply_chain']) && (
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button 
                            onClick={() => openEditModal(p)}
                            className="btn btn-sm btn-outline-secondary py-1 px-2"
                            title="Edit Mitra"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button 
                            onClick={() => handleToggleActive(p.id)}
                            className={`btn btn-sm py-1 px-2 ${p.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          >
                            {p.is_active ? 'Nonaktif' : 'Aktif'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Ubah Data Mitra' : 'Tambah Mitra Baru'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Kode Mitra (Unik)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: PT-DIST-004 atau PT-RESL-005" 
                      value={formData.partner_code}
                      onChange={(e) => setFormData({ ...formData, partner_code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nama Perusahaan / Toko Mitra</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: PT Footwear Sejahtera" 
                      value={formData.partner_name}
                      onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Tipe Kemitraan</label>
                      <select 
                        className="form-select"
                        value={formData.partner_type}
                        onChange={(e) => setFormData({ ...formData, partner_type: e.target.value })}
                      >
                        <option value="reseller">Reseller (Retail)</option>
                        <option value="distributor">Distributor (Grosir)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Kontak Person (PIC)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nama PIC" 
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Telepon / WhatsApp</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="08123456789" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="mitra@domain.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Alamat Pengiriman Utama</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Alamat lengkap toko / gudang mitra..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : (isEditing ? 'Perbarui Mitra' : 'Simpan Mitra')}
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
