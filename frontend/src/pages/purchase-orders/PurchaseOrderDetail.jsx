import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ArrowLeft, 
  ShoppingCart, 
  CheckCircle, 
  Truck, 
  Calendar, 
  User, 
  FileText 
} from '@phosphor-icons/react';

export const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiving, setReceiving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPo();
  }, [id]);

  const fetchPo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/purchase-orders/${id}`);
      if (res.data?.success) {
        setPo(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveMaterials = async () => {
    if (!window.confirm(`Catat penerimaan penuh untuk PO ${po.po_number}? Seluruh stok bahan baku terkait akan ditambahkan ke gudang.`)) {
      return;
    }
    setReceiving(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post(`/purchase-orders/${po.id}/receive`);
      if (res.data?.success) {
        setMessage(res.data.message);
        fetchPo();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses penerimaan bahan.');
    } finally {
      setReceiving(false);
    }
  };

  if (loading || !po) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const grandTotal = po.details?.reduce((acc, d) => acc + (parseFloat(d.quantity_ordered) * parseFloat(d.unit_price)), 0) || 0;

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '960px' }}>
      {/* Back button */}
      <div className="mb-3">
        <Link to="/purchase-orders" className="btn btn-sm btn-light border text-secondary">
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar PO</span>
        </Link>
      </div>

      {message && <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">{message}</div>}
      {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

      {/* PO Card Header */}
      <div className="card-nexora p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 border-bottom pb-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-clean badge-planned">
                <ShoppingCart size={14} weight="bold" />
                <span>Purchase Order</span>
              </span>
              <StatusBadge status={po.status} />
            </div>
            <h2 className="fw-bold font-monospace text-primary mb-1">{po.po_number}</h2>
            <div className="text-muted small d-flex flex-wrap gap-3">
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} /> Tanggal: {po.order_date}
              </span>
              <span className="d-flex align-items-center gap-1">
                <User size={14} /> Dibuat oleh: {po.creator?.name || 'Supply Chain'}
              </span>
            </div>
          </div>

          <div>
            {hasRole(['supply_chain']) && po.status === 'ordered' && (
              <button 
                onClick={handleReceiveMaterials} 
                className="btn btn-success text-white px-3"
                disabled={receiving}
              >
                <CheckCircle size={18} weight="bold" />
                <span>{receiving ? 'Memproses...' : 'Catat Penerimaan Bahan (Full Receive)'}</span>
              </button>
            )}
            {po.status === 'completed' && (
              <span className="badge-clean badge-completed p-2 px-3 fs-6">
                <CheckCircle size={18} weight="bold" />
                <span>Bahan Telah Masuk Gudang</span>
              </span>
            )}
          </div>
        </div>

        {/* Supplier Info */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <h6 className="fw-bold text-secondary text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Informasi Supplier (Vendor)
            </h6>
            <div className="card-clean p-3 bg-light">
              <h5 className="fw-bold mb-1">{po.supplier?.supplier_name}</h5>
              <div className="small text-muted mb-1">PIC: {po.supplier?.contact_person || '-'}</div>
              <div className="small text-muted mb-1">Telepon: {po.supplier?.phone || '-'}</div>
              <div className="small text-muted mb-1">Email: {po.supplier?.email || '-'}</div>
              <div className="small text-muted">Alamat: {po.supplier?.address || '-'}</div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h6 className="fw-bold text-secondary text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Catatan Pengadaan
            </h6>
            <div className="card-clean p-3 bg-light h-100">
              <p className="small text-muted mb-0">
                {po.notes || 'Tidak ada catatan khusus pada Purchase Order ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <h5 className="fw-bold mb-3">Rincian Bahan Baku yang Dipesan</h5>
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>Kode Bahan</th>
                <th>Nama Bahan Baku</th>
                <th>Kuantitas Dipesan</th>
                <th>Kuantitas Diterima</th>
                <th>Harga Satuan</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {po.details?.map(d => {
                const subtotal = parseFloat(d.quantity_ordered) * parseFloat(d.unit_price);
                return (
                  <tr key={d.id}>
                    <td className="font-monospace text-primary fw-bold">
                      {d.raw_material?.material_code}
                    </td>
                    <td>
                      <div className="fw-semibold">{d.raw_material?.material_name}</div>
                    </td>
                    <td className="fw-bold">
                      {d.quantity_ordered} {d.raw_material?.unit}
                    </td>
                    <td>
                      <span className={`badge-clean ${parseFloat(d.quantity_received) > 0 ? 'badge-completed' : 'badge-planned'}`}>
                        {d.quantity_received} {d.raw_material?.unit}
                      </span>
                    </td>
                    <td>Rp {parseFloat(d.unit_price).toLocaleString('id-ID')}</td>
                    <td className="text-end fw-bold">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" className="text-end fw-bold pt-3 fs-6">Total Nilai Pembelian:</td>
                <td className="text-end fw-bold pt-3 fs-5 text-primary">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
