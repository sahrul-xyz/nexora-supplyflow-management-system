import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  MagnifyingGlass, 
  Tag, 
  CheckCircle,
  Eye
} from '@phosphor-icons/react';

export const ProductList = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_code: '',
    product_name: '',
    category: 'shoes',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/products', formData);
      setShowModal(false);
      setFormData({ product_code: '', product_name: '', category: 'shoes', description: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Gagal mengubah status produk.');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Katalog Produk & Varian</h2>
          <p className="text-muted small mb-0">
            Kelola model sepatu, sandal, varian ukuran/warna (SKU), dan Bill of Materials (BOM)
          </p>
        </div>
        {hasRole(['production']) && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} weight="bold" />
            <span>Tambah Model Produk</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-nexora p-3 mb-4">
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="header-search-pill w-100">
              <MagnifyingGlass size={18} className="text-muted" />
              <input 
                type="text" 
                className="header-search-input w-100" 
                placeholder="Cari kode atau nama model sepatu/sandal..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-4">
            <select 
              className="form-select rounded-pill px-3 py-2 text-muted border-1"
              style={{ fontSize: '0.875rem' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Semua Kategori (Sepatu & Sandal)</option>
              <option value="shoes">Sepatu (Shoes)</option>
              <option value="sandals">Sandal (Sandals)</option>
            </select>
          </div>
          <div className="col-6 col-md-3 d-flex gap-2">
            <button type="submit" className="header-pill-btn w-100 justify-content-center py-2">
              Filter Data
            </button>
          </div>
        </form>
      </div>

      {/* Product List Table */}
      <div className="card-nexora p-0 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Total Varian</th>
                <th>BOM Status</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat data produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Tidak ditemukan produk yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="fw-bold font-monospace text-primary">{p.product_code}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{p.product_name}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '280px' }}>
                        {p.description || '-'}
                      </small>
                    </td>
                    <td>
                      <span className="badge-clean badge-planned">
                        <Tag size={12} weight="bold" />
                        {p.category === 'shoes' ? 'Sepatu' : 'Sandal'}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold">{p.variants?.length || 0} SKU</span>
                    </td>
                    <td>
                      {p.bom_details?.length > 0 ? (
                        <span className="badge-clean badge-completed">
                          <CheckCircle size={12} weight="bold" />
                          <span>{p.bom_details.length} Bahan (BOM)</span>
                        </span>
                      ) : (
                        <span className="badge-clean badge-warning-low">
                          BOM Belum Diatur
                        </span>
                      )}
                    </td>
                    <td>
                      {p.is_active ? (
                        <span className="badge-clean badge-completed">Aktif</span>
                      ) : (
                        <span className="badge-clean badge-danger">Non-aktif</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <Link to={`/products/${p.id}`} className="btn btn-sm btn-outline-primary py-1 px-2" title="Detail Varian & BOM">
                          <Eye size={16} />
                          <span className="d-none d-md-inline">Detail & BOM</span>
                        </Link>
                        {hasRole(['production']) && (
                          <button 
                            onClick={() => handleToggleActive(p.id)}
                            className={`btn btn-sm py-1 px-2 ${p.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            title={p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
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

      {/* Modal Tambah Produk */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Tambah Model Produk Baru</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Kode Produk (Unik)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: SH-AERO-03" 
                      value={formData.product_code}
                      onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nama Model Produk</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: AeroStride High Sneaker" 
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Kategori</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="shoes">Sepatu (Shoes)</option>
                      <option value="sandals">Sandal (Sandals)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Deskripsi</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Keterangan spesifikasi model produk..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Produk'}
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
