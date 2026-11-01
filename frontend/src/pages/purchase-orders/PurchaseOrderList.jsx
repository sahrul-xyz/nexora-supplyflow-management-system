import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Plus, 
  MagnifyingGlass, 
  CheckCircle, 
  Eye, 
  Calendar
} from '@phosphor-icons/react';

export const PurchaseOrderList = () => {
  const { hasRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/purchase-orders', { params });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleReceive = async (poId, poNumber) => {
    if (!window.confirm(`Catat penerimaan penuh untuk Purchase Order ${poNumber}? Stok bahan baku akan langsung bertambah.`)) {
      return;
    }
    try {
      await api.post(`/purchase-orders/${poId}/receive`);
      alert(`Penerimaan PO ${poNumber} berhasil dicatat.`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses penerimaan PO.');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Pengadaan Bahan Baku (Purchase Order)</h2>
          <p className="text-muted small mb-0">
            Alur pembelian bahan langsung oleh Supply Chain dan pencatatan penerimaan ke gudang bahan baku
          </p>
        </div>
        {hasRole(['supply_chain']) && (
          <Link to="/purchase-orders/create" className="btn btn-primary btn-sm">
            <Plus size={16} weight="bold" />
            <span>Buat PO Bahan Baku</span>
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
                placeholder="Cari nomor PO atau nama supplier vendor..." 
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
              <option value="">Semua Status PO</option>
              <option value="ordered">Dipesan (Ordered)</option>
              <option value="completed">Selesai Diterima (Completed)</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button type="submit" className="header-pill-btn w-100 justify-content-center py-2">
              Filter PO
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
                <th>No. PO</th>
                <th>Supplier</th>
                <th>Tanggal Order</th>
                <th>Item Dipesan</th>
                <th>Dibuat Oleh</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Memuat data Purchase Order...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Tidak ditemukan Purchase Order.
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  const totalItems = po.details?.length || 0;
                  return (
                    <tr key={po.id}>
                      <td>
                        <Link to={`/purchase-orders/${po.id}`} className="fw-bold font-monospace text-primary text-decoration-none">
                          {po.po_number}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{po.supplier?.supplier_name}</div>
                        <small className="text-muted">{po.supplier?.phone || '-'}</small>
                      </td>
                      <td>
                        <span className="small text-secondary d-flex align-items-center gap-1">
                          <Calendar size={13} /> {po.order_date}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold">{totalItems} Jenis Bahan</span>
                      </td>
                      <td>
                        <small className="text-muted">{po.creator?.name || 'Supply Chain'}</small>
                      </td>
                      <td>
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <Link to={`/purchase-orders/${po.id}`} className="btn btn-sm btn-outline-secondary py-1 px-2" title="Detail">
                            <Eye size={15} />
                            <span className="d-none d-md-inline">Detail</span>
                          </Link>
                          {hasRole(['supply_chain']) && po.status === 'ordered' && (
                            <button 
                              onClick={() => handleReceive(po.id, po.po_number)}
                              className="btn btn-sm btn-success py-1 px-2 text-white"
                              title="Catat Penerimaan Bahan"
                            >
                              <CheckCircle size={15} weight="bold" />
                              <span>Terima Bahan</span>
                            </button>
                          )}
                        </div>
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
