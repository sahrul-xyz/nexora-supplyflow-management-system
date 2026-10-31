import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShieldCheck, 
  Plus, 
  Trash, 
  PencilSimple, 
  UserCircle, 
  Envelope, 
  LockKey 
} from '@phosphor-icons/react';

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'supply_chain',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'supply_chain',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setIsEditing(true);
    setSelectedId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
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
        await api.put(`/users/${selectedId}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus akun ${name}?`)) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="badge-clean badge-planned">Super Admin</span>;
      case 'supply_chain':
        return <span className="badge-clean badge-completed">Supply Chain</span>;
      case 'production':
        return <span className="badge-clean badge-in_progress">Production</span>;
      default:
        return <span className="badge-clean badge-ordered">{role}</span>;
    }
  };

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Pengaturan Akun & Hak Akses Staf</h2>
          <p className="text-muted small mb-0">
            Khusus Super Admin: Kelola akun pengguna dan penugasan role (Super Admin, Supply Chain, Production)
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <Plus size={16} weight="bold" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card-nexora p-0 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Email</th>
                <th>Role Akses</th>
                <th>Tanggal Dibuat</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat data akun pengguna...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center text-primary bg-primary-subtle"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <UserCircle size={20} weight="duotone" />
                        </div>
                        <span className="fw-semibold text-dark">{u.name}</span>
                        {u.id === currentUser.id && (
                          <span className="badge bg-secondary text-white" style={{ fontSize: '0.65rem' }}>Anda</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-secondary small">{u.email}</span>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <span className="text-muted small">{u.created_at?.split('T')[0] || '-'}</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <button 
                          onClick={() => openEditModal(u)}
                          className="btn btn-sm btn-outline-secondary py-1 px-2"
                          title="Edit Akun"
                        >
                          <PencilSimple size={16} />
                        </button>
                        {u.id !== currentUser.id && (
                          <button 
                            onClick={() => handleDelete(u.id, u.name)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            title="Hapus Akun"
                          >
                            <Trash size={16} />
                          </button>
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

      {/* Modal Add / Edit User */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Ubah Data Akun Staf' : 'Tambah Akun Staf Baru'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Nama Lengkap</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Doni Staf Produksi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Alamat Email Login</label>
                    <input 
                      type="email"
                      className="form-control"
                      placeholder="doni@supplyflow.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {isEditing ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi (Password)'}
                    </label>
                    <input 
                      type="password"
                      className="form-control"
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!isEditing}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Role Akses (Hak Operasional)</label>
                    <select 
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="super_admin">Super Admin (Akses Penuh Master Data & Akun)</option>
                      <option value="supply_chain">Supply Chain (Supplier, PO, Penerimaan, Mitra, Kirim)</option>
                      <option value="production">Production (BOM, Production Order, QC, Lolos/Reject)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : (isEditing ? 'Perbarui Akun' : 'Simpan Akun')}
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
