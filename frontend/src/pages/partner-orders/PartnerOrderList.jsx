import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Truck, 
  Plus, 
  MagnifyingGlass, 
  Eye, 
  Calendar,
  Users
} from '@phosphor-icons/react';

export const PartnerOrderList = () => {
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
      const res = await api.get('/partner-orders', { params });
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
          <h2 className="fw-bold mb-1">Pesanan Mitra (Distribusi Hilir)</h2>
          <p className="text-muted small mb-0">
            Pencatatan pesanan reseller dan distributor, eksekusi pengiriman (potong stok jadi), dan pelacakan resi
          </p>
        </div>
        {hasRole(['supply_chain']) && (
          <Link to="/partner-orders/create" className="btn btn-primary btn-sm">
            <Plus size={16} weight="bold" />
            <span>Buat Pesanan Mitra</span>
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
                placeholder="Cari nomor pesanan, nama mitra, atau no. resi pengiriman..." 
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
              <option value="">Semua Status Pesanan</option>
              <option value="processing">Diproses (Processing)</option>
              <option value="shipped">Dikirim (Shipped)</option>
              <option value="delivered">Terkirim (Delivered)</option>
              <option value="cancelled">Dibatalkan (Cancelled)</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button type="submit" className="header-pill-btn w-100 justify-content-center py-2">
              Filter Pesanan
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
                <th>No. Pesanan</th>
                <th>Mitra (Pemesan)</th>
                <th>Tanggal Order</th>
                <th>Jumlah Item</th>
                <th>No. Resi Pengiriman</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat pesanan mitra...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Tidak ditemukan pesanan mitra.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const totalQty = o.details?.reduce((acc, d) => acc + d.quantity, 0) || 0;
                  return (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/partner-orders/${o.id}`} className="fw-bold font-monospace text-primary text-decoration-none">
                          {o.order_number}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{o.partner?.partner_name}</div>
                        <span className="badge-clean badge-planned small" style={{ fontSize: '0.65rem' }}>
                          {o.partner?.partner_type === 'distributor' ? 'Distributor' : 'Reseller'}
                        </span>
                      </td>
                      <td>
                        <span className="small text-secondary d-flex align-items-center gap-1">
                          <Calendar size={13} /> {o.order_date}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold">{totalQty} Pasang</span>
                      </td>
                      <td>
                        {o.tracking_number ? (
                          <span className="font-monospace small fw-bold text-dark">
                            {o.tracking_number}
                          </span>
                        ) : (
                          <span className="text-muted small">Belum Dikirim</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="text-end">
                        <Link to={`/partner-orders/${o.id}`} className="btn btn-sm btn-outline-primary py-1 px-2">
                          <Eye size={15} />
                          <span className="d-none d-md-inline">Detail & Kirim</span>
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
