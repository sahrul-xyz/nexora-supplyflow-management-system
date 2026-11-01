import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Truck, 
  Plus, 
  MagnifyingGlass, 
  Phone, 
  Envelope, 
  MapPin, 
  PencilSimple, 
  Trash,
  ShoppingCart
} from '@phosphor-icons/react';

export const SupplierList = () => {
  const { hasRole } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers', { params: { search } });
      if (res.data?.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      supplier_name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setIsEditing(true);
    setSelectedId(s.id);
    setFormData({
      supplier_name: s.supplier_name,
      contact_person: s.contact_person || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
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
        await api.put(`/suppliers/${selectedId}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus supplier ini?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus supplier.');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Master Data Supplier</h2>
          <p className="text-muted small mb-0">
            Daftar vendor dan pemasok bahan baku (kulit sintetis, sol, lem, benang, dan kain)
          </p>
        </div>
        {hasRole(['supply_chain']) && (
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={16} weight="bold" />
            <span>Tambah Supplier</span>
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
                placeholder="Cari nama supplier, kontak person, email, atau kota vendor..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <button type="submit" className="header-pill-btn w-100 justify-content-center py-2">
              Cari Supplier
            </button>
          </div>
        </form>
      </div>

      {/* Suppliers Table */}
      <div className="card-nexora p-0 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>Nama Supplier</th>
                <th>Kontak Person</th>
                <th>Telepon & Email</th>
                <th>Alamat</th>
                <th>Total PO</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat data supplier...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Tidak ditemukan data supplier.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-bold text-dark">{s.supplier_name}</div>
                    </td>
                    <td>
                      <span className="text-secondary">{s.contact_person || '-'}</span>
                    </td>
                    <td>
                      <div className="d-flex flex-column small">
                        {s.phone && (
                          <span className="text-muted d-flex align-items-center gap-1">
                            <Phone size={13} /> {s.phone}
                          </span>
                        )}
                        {s.email && (
                          <span className="text-muted d-flex align-items-center gap-1">
                            <Envelope size={13} /> {s.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '240px' }}>
                        {s.address || '-'}
                      </small>
                    </td>
                    <td>
                      <span className="badge-clean badge-planned">
                        <ShoppingCart size={13} weight="bold" />
                        <span>{s.purchase_orders_count || 0} PO</span>
                      </span>
                    </td>
                    <td className="text-end">
                      {hasRole(['supply_chain']) && (
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button 
                            onClick={() => openEditModal(s)}
                            className="btn btn-sm btn-outline-secondary py-1 px-2"
                            title="Edit Supplier"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            title="Hapus Supplier"
                          >
                            <Trash size={16} />
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

      {/* Modal Add / Edit Supplier */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Ubah Data Supplier' : 'Tambah Supplier Baru'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Nama Perusahaan / Supplier</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: PT Kulit Mandiri Perkasa" 
                      value={formData.supplier_name}
                      onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nama Kontak Person</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Bapak Anton" 
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Nomor Telepon</label>
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
                        placeholder="sales@supplier.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Alamat Kantor / Gudang</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Alamat lengkap supplier..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : (isEditing ? 'Perbarui Supplier' : 'Simpan Supplier')}
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
