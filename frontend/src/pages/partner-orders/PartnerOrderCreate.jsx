import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Truck, 
  Plus, 
  Trash, 
  Sneaker, 
  WarningCircle, 
  Users 
} from '@phosphor-icons/react';

export const PartnerOrderCreate = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [partnerId, setPartnerId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    { product_variant_id: '', quantity: 10, unit_price: 200000 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    try {
      setLoading(true);
      const [partRes, varRes] = await Promise.all([
        api.get('/partners'),
        api.get('/product-variants')
      ]);

      if (partRes.data?.success && partRes.data.data.length > 0) {
        setPartners(partRes.data.data);
        setPartnerId(partRes.data.data[0].id);
        setShippingAddress(partRes.data.data[0].address || '');
      }

      if (varRes.data?.success && varRes.data.data.length > 0) {
        setVariants(varRes.data.data);
        setItems([
          { product_variant_id: varRes.data.data[0].id, quantity: 10, unit_price: 220000 }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerChange = (id) => {
    setPartnerId(id);
    const selected = partners.find(p => p.id === parseInt(id));
    if (selected && selected.address) {
      setShippingAddress(selected.address);
    }
  };

  const handleAddItem = () => {
    if (variants.length === 0) return;
    setItems([
      ...items,
      { product_variant_id: variants[0].id, quantity: 5, unit_price: 200000 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((sum, it) => {
      const q = parseInt(it.quantity) || 0;
      const p = parseFloat(it.unit_price) || 0;
      return sum + (q * p);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!partnerId) {
      setError('Silakan pilih mitra pemesan.');
      return;
    }

    if (!shippingAddress) {
      setError('Harap masukkan alamat pengiriman.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        partner_id: parseInt(partnerId),
        order_date: orderDate,
        shipping_address: shippingAddress,
        notes,
        items: items.map(it => ({
          product_variant_id: parseInt(it.product_variant_id),
          quantity: parseInt(it.quantity),
          unit_price: parseFloat(it.unit_price),
        })),
      };

      const res = await api.post('/partner-orders', payload);
      if (res.data?.success) {
        navigate(`/partner-orders/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pesanan mitra.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '960px' }}>
      {/* Back button */}
      <div className="mb-3">
        <Link to="/partner-orders" className="btn btn-sm btn-light border text-secondary">
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Pesanan Mitra</span>
        </Link>
      </div>

      <div className="card-nexora p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <Truck size={26} className="text-primary" weight="duotone" />
          <h3 className="fw-bold mb-0">Buat Pesanan Mitra (Distribusi Produk Jadi)</h3>
        </div>
        <p className="text-muted small mb-4">
          Pesanan mitra diverifikasi terhadap ketersediaan fisik gudang jadi tanpa reservasi (Make to Stock - BR-14).
        </p>

        {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Header Info */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label">Pilih Mitra (Reseller / Distributor)</label>
              <select 
                className="form-select"
                value={partnerId}
                onChange={(e) => handlePartnerChange(e.target.value)}
                required
              >
                {partners.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.partner_name} ({p.partner_type === 'distributor' ? 'Distributor' : 'Reseller'})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Tanggal Pesanan</label>
              <input 
                type="date"
                className="form-control"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Alamat Pengiriman Tujuan</label>
              <textarea 
                className="form-control"
                rows="2"
                placeholder="Alamat lengkap tujuan pengiriman..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="col-12">
              <label className="form-label">Catatan Tambahan (Opsional)</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Catatan pesanan mitra..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Ordered Variant Items */}
          <div className="border-top pt-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Rincian Sepatu / Sandal yang Dipesan</h5>
                <small className="text-muted">Pilih varian SKU dan jumlah pasang</small>
              </div>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddItem}>
                <Plus size={14} weight="bold" />
                <span>Tambah Varian</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="table-clean mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>Varian Produk (SKU)</th>
                    <th style={{ width: '20%' }}>Kuantitas (Pasang)</th>
                    <th style={{ width: '25%' }}>Harga Satuan (Rp)</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const selectedVar = variants.find(v => v.id === parseInt(row.product_variant_id));
                    const stockAvailable = selectedVar?.stock?.quantity || 0;
                    const isExceeding = parseInt(row.quantity) > stockAvailable;

                    return (
                      <tr key={idx}>
                        <td>
                          <select 
                            className="form-select form-select-sm"
                            value={row.product_variant_id}
                            onChange={(e) => handleItemChange(idx, 'product_variant_id', e.target.value)}
                            required
                          >
                            {variants.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.sku} - {v.product?.product_name} (Size {v.size}, {v.color}) - Stok: {v.stock?.quantity || 0}
                              </option>
                            ))}
                          </select>
                          {isExceeding && (
                            <small className="text-danger d-flex align-items-center gap-1 mt-1">
                              <WarningCircle size={13} /> Kuantitas ({row.quantity}) melebihi stok siap kirim saat ini ({stockAvailable} psg).
                            </small>
                          )}
                        </td>
                        <td>
                          <input 
                            type="number"
                            min="1"
                            className="form-control form-control-sm text-center"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input 
                            type="number"
                            step="1000"
                            min="0"
                            className="form-control form-control-sm"
                            value={row.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                            required
                          />
                        </td>
                        <td className="text-end">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger p-1"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length === 1}
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Card */}
            <div className="d-flex justify-content-end mt-3">
              <div className="card-nexora p-3 bg-light" style={{ minWidth: '280px' }}>
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Total Kuantitas:</span>
                  <span className="fw-semibold">
                    {items.reduce((acc, it) => acc + (parseInt(it.quantity) || 0), 0)} Pasang
                  </span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 text-dark border-top pt-2">
                  <span>Total Nilai Pesanan:</span>
                  <span className="text-primary">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <Link to="/partner-orders" className="btn btn-light">
              Batal
            </Link>
            <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Buat Pesanan Mitra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
