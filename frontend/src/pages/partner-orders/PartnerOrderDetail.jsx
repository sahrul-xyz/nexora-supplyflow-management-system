import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ArrowLeft, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  MapPin, 
  Tag, 
  Barcode 
} from '@phosphor-icons/react';

export const PartnerOrderDetail = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ship Modal
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingDate, setShippingDate] = useState(new Date().toISOString().split('T')[0]);
  const [shipSubmitting, setShipSubmitting] = useState(false);
  const [shipError, setShipError] = useState('');

  // Cancel Modal / Prompt
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/partner-orders/${id}`);
      if (res.data?.success) {
        setOrder(res.data.data);
        setShippingAddress(res.data.data.shipping_address || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (e) => {
    e.preventDefault();
    setShipError('');
    setShipSubmitting(true);
    try {
      const res = await api.post(`/partner-orders/${id}/ship`, {
        tracking_number: trackingNumber,
        shipping_address: shippingAddress,
        shipped_at: shippingDate,
      });
      if (res.data?.success) {
        setShowShipModal(false);
        setActionMessage(res.data.message);
        fetchOrder();
      }
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.shortages) {
        const shortagesMsg = resData.shortages.map(s => `${s.sku} (Kurang: ${s.shortage} psg)`).join(', ');
        setShipError(`Pengiriman ditolak: Stok barang jadi tidak mencukupi (BR-16). Detail: ${shortagesMsg}`);
      } else {
        setShipError(resData?.message || 'Gagal memproses pengiriman.');
      }
    } finally {
      setShipSubmitting(false);
    }
  };

  const handleDeliverOrder = async () => {
    if (!window.confirm(`Konfirmasi bahwa pesanan ${order.order_number} telah sampai dan diterima oleh mitra?`)) {
      return;
    }
    setActionError('');
    setActionMessage('');
    try {
      const res = await api.post(`/partner-orders/${id}/deliver`);
      if (res.data?.success) {
        setActionMessage(res.data.message);
        fetchOrder();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Gagal mengubah status pesanan.');
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Masukkan alasan pembatalan pesanan:');
    if (reason === null) return;

    setActionError('');
    setActionMessage('');
    try {
      const res = await api.post(`/partner-orders/${id}/cancel`, { reason });
      if (res.data?.success) {
        setActionMessage(res.data.message);
        fetchOrder();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Gagal membatalkan pesanan.');
    }
  };

  if (loading || !order) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const grandTotal = order.details?.reduce((acc, d) => acc + parseFloat(d.subtotal), 0) || 0;

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '960px' }}>
      {/* Back button */}
      <div className="mb-3">
        <Link to="/partner-orders" className="btn btn-sm btn-light border text-secondary">
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Pesanan Mitra</span>
        </Link>
      </div>

      {actionMessage && <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">{actionMessage}</div>}
      {actionError && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{actionError}</div>}

      {/* Order Card */}
      <div className="card-nexora p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 border-bottom pb-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-clean badge-planned">
                <Truck size={14} weight="bold" />
                <span>Distribusi Pesanan Mitra</span>
              </span>
              <StatusBadge status={order.status} />
            </div>
            <h2 className="fw-bold font-monospace text-primary mb-1">{order.order_number}</h2>
            <div className="text-muted small d-flex flex-wrap gap-3">
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} /> Tanggal: {order.order_date}
              </span>
              <span className="d-flex align-items-center gap-1">
                <User size={14} /> Dicatat oleh: {order.creator?.name || 'Supply Chain'}
              </span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {hasRole(['supply_chain']) && order.status === 'processing' && (
              <>
                <button 
                  onClick={() => {
                    setTrackingNumber(`EXP-${Date.now().toString().slice(-6)}`);
                    setShowShipModal(true);
                  }}
                  className="btn btn-primary px-3"
                >
                  <Truck size={18} weight="bold" />
                  <span>Kirim Pesanan (Potong Stok Jadi)</span>
                </button>
                <button 
                  onClick={handleCancelOrder}
                  className="btn btn-outline-danger px-3"
                >
                  <XCircle size={18} />
                  <span>Batalkan</span>
                </button>
              </>
            )}

            {hasRole(['supply_chain']) && order.status === 'shipped' && (
              <button 
                onClick={handleDeliverOrder}
                className="btn btn-success text-white px-3"
              >
                <CheckCircle size={18} weight="bold" />
                <span>Konfirmasi Barang Diterima Mitra</span>
              </button>
            )}

            {order.status === 'delivered' && (
              <span className="badge-clean badge-completed p-2 px-3 fs-6">
                <CheckCircle size={18} weight="bold" />
                <span>Pesanan Telah Sampai & Selesai</span>
              </span>
            )}
          </div>
        </div>

        {/* Partner & Shipping Info */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <h6 className="fw-bold text-secondary text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Identitas Mitra Pemesan
            </h6>
            <div className="card-nexora p-3 bg-light">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="fw-bold mb-0 text-dark">{order.partner?.partner_name}</h5>
                <span className="badge-clean badge-planned small">
                  {order.partner?.partner_type === 'distributor' ? 'Distributor' : 'Reseller'}
                </span>
              </div>
              <div className="small text-muted mb-1">Kode: <span className="font-monospace fw-bold">{order.partner?.partner_code}</span></div>
              <div className="small text-muted mb-1">PIC: {order.partner?.contact_person || '-'}</div>
              <div className="small text-muted">Telepon: {order.partner?.phone || '-'}</div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h6 className="fw-bold text-secondary text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Informasi Pengiriman & Ekspedisi
            </h6>
            <div className="card-nexora p-3 bg-light">
              <div className="mb-2">
                <div className="small text-muted">Nomor Resi Pelacakan:</div>
                {order.tracking_number ? (
                  <div className="font-monospace fw-bold fs-6 text-primary d-flex align-items-center gap-1">
                    <Barcode size={18} />
                    <span>{order.tracking_number}</span>
                  </div>
                ) : (
                  <span className="text-muted small">Belum ada nomor resi</span>
                )}
              </div>
              <div className="small text-muted">Alamat Tujuan:</div>
              <div className="small fw-semibold text-dark">{order.shipping_address}</div>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <h5 className="fw-bold mb-3">Varian Sepatu / Sandal yang Dikirim</h5>
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Model Produk</th>
                <th>Ukuran</th>
                <th>Warna</th>
                <th>Kuantitas</th>
                <th>Harga Satuan</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.details?.map(d => (
                <tr key={d.id}>
                  <td className="font-monospace fw-bold text-primary">{d.product_variant?.sku}</td>
                  <td className="fw-semibold">{d.product_variant?.product?.product_name}</td>
                  <td>Size {d.product_variant?.size}</td>
                  <td>{d.product_variant?.color}</td>
                  <td className="fw-bold">{d.quantity} Pasang</td>
                  <td>Rp {parseFloat(d.unit_price).toLocaleString('id-ID')}</td>
                  <td className="text-end fw-bold">
                    Rp {parseFloat(d.subtotal).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6" className="text-end fw-bold pt-3 fs-6">Grand Total Pesanan:</td>
                <td className="text-end fw-bold pt-3 fs-5 text-primary">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Shipment Modal */}
      {showShipModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <Truck size={22} className="text-primary" weight="bold" />
                  <h5 className="modal-title fw-bold">Eksekusi Pengiriman Pesanan Mitra</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowShipModal(false)}></button>
              </div>
              <form onSubmit={handleShipOrder}>
                <div className="modal-body p-4">
                  <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
                    <strong>Aturan Bisnis (BR-15, BR-16):</strong> Saat pengiriman dicatat, stok fisik sepatu/sandal di gudang barang jadi akan otomatis dipotong. Pengiriman akan ditolak bila stok tidak mencukupi.
                  </div>

                  {shipError && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{shipError}</div>}

                  <div className="mb-3">
                    <label className="form-label">Nomor Resi / AWB Ekspedisi</label>
                    <input 
                      type="text"
                      className="form-control font-monospace"
                      placeholder="Contoh: JNE-REG-882910291 atau SICEPAT-0091283"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tanggal Pengiriman</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={shippingDate}
                      onChange={(e) => setShippingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Konfirmasi Alamat Pengiriman</label>
                    <textarea 
                      className="form-control"
                      rows="2"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowShipModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={shipSubmitting}>
                    {shipSubmitting ? 'Memproses Pengiriman...' : 'Konfirmasi Kirim & Potong Stok'}
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
