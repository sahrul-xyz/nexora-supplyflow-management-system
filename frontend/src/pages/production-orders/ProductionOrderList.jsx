import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Factory, 
  Plus, 
  MagnifyingGlass, 
  Play, 
  CheckCircle, 
  Eye, 
  Calendar,
  Sneaker
} from '@phosphor-icons/react';

export const ProductionOrderList = () => {
  const { hasRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/production-orders', { params });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Perencanaan & Eksekusi Produksi</h2>
          <p className="text-muted small mb-0">
            Perintah kerja manufaktur Make to Stock (MTS), perhitungan kebutuhan bahan baku (BOM), dan pemeriksaan QC
          </p>
        </div>
        {hasRole(['production']) && (
          <Link to="/production-orders/create" className="btn btn-primary btn-sm">
            <Plus size={16} weight="bold" />
            <span>Rencanakan Produksi Baru</span>
          </Link>
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
                placeholder="Cari nomor produksi atau model sepatu/sandal..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select 
              className="form-select rounded-pill px-3 py-2 text-muted border-1"
              style={{ fontSize: '0.875rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status Produksi</option>
              <option value="planned">Direncanakan (Planned)</option>
              <option value="in_progress">Dalam Proses (In Progress)</option>
              <option value="completed">Selesai QC (Completed)</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button type="submit" className="header-pill-btn w-100 justify-content-center py-2">
              Filter Produksi
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="card-nexora p-0 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>No. Produksi</th>
                <th>Model Produk</th>
                <th>Tanggal</th>
                <th>Target Total</th>
                <th>Lolos QC (Stok)</th>
                <th>Reject</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat data Production Orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Tidak ditemukan data Production Order.
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  const totalTarget = po.details?.reduce((acc, d) => acc + d.target_quantity, 0) || 0;
                  const totalPassed = po.details?.reduce((acc, d) => acc + d.passed_quantity, 0) || 0;
                  const totalRejected = po.details?.reduce((acc, d) => acc + d.rejected_quantity, 0) || 0;

                  return (
                    <tr key={po.id}>
                      <td>
                        <Link to={`/production-orders/${po.id}`} className="fw-bold font-monospace text-primary text-decoration-none">
                          {po.production_number}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{po.product?.product_name}</div>
                        <small className="text-muted">{po.product?.category === 'shoes' ? 'Sepatu' : 'Sandal'}</small>
                      </td>
                      <td>
                        <span className="small text-secondary d-flex align-items-center gap-1">
                          <Calendar size={13} /> {po.production_date}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold">{totalTarget} Pasang</span>
                      </td>
                      <td>
                        <span className="badge-clean badge-completed">
                          <CheckCircle size={12} weight="bold" />
                          <span>{totalPassed} Pasang</span>
                        </span>
                      </td>
                      <td>
                        <span className="badge-clean badge-danger">
                          {totalRejected} Unit
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="text-end">
                        <Link to={`/production-orders/${po.id}`} className="btn btn-sm btn-outline-primary py-1 px-2">
                          <Eye size={15} />
                          <span className="d-none d-md-inline">Lihat & Proses</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
