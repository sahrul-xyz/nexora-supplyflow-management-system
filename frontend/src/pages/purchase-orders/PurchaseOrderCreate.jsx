import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  ShoppingCart
} from '@phosphor-icons/react';

export const PurchaseOrderCreate = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { raw_material_id: '', quantity_ordered: 10, unit_price: 50000 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPrerequisites = async () => {
    try {
      setLoading(true);
      const [supRes, matRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/raw-materials')
      ]);

      if (supRes.data?.success && supRes.data.data.length > 0) {
        setSuppliers(supRes.data.data);
        setSupplierId(supRes.data.data[0].id);
      }

      if (matRes.data?.success && matRes.data.data.length > 0) {
        setRawMaterials(matRes.data.data);
        setItems([
          { raw_material_id: matRes.data.data[0].id, quantity_ordered: 50, unit_price: 35000 }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const handleAddItem = () => {
    if (rawMaterials.length === 0) return;
    setItems([
      ...items,
      { raw_material_id: rawMaterials[0].id, quantity_ordered: 10, unit_price: 25000 }
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
    return items.reduce((sum, item) => {
      const q = parseFloat(item.quantity_ordered) || 0;
      const p = parseFloat(item.unit_price) || 0;
      return sum + (q * p);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Silakan pilih supplier (BR-03).');
      return;
    }

    if (items.length === 0) {
      setError('Harap tambahkan minimal satu bahan baku.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplier_id: supplierId,
        order_date: orderDate,
        notes,
        items: items.map(it => ({
          raw_material_id: parseInt(it.raw_material_id),
          quantity_ordered: parseFloat(it.quantity_ordered),
          unit_price: parseFloat(it.unit_price),
        })),
      };

      const res = await api.post('/purchase-orders', payload);
      if (res.data?.success) {
        navigate(`/purchase-orders/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat Purchase Order.');
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
        <Link to="/purchase-orders" className="btn btn-sm btn-light border text-secondary">
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar PO</span>
        </Link>
      </div>

      <div className="card-nexora p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <ShoppingCart size={24} className="text-primary" weight="duotone" />
          <h3 className="fw-bold mb-0">Buat Purchase Order (PO) Bahan Baku</h3>
        </div>
        <p className="text-muted small mb-4">
          Pembuatan PO langsung oleh Supply Chain kepada satu supplier terpilih (Make to Stock flow - BR-03).
        </p>

        {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Header Section */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label">Pilih Supplier (Vendor Tunggal)</label>
              <select 
                className="form-select"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.supplier_name} {s.contact_person ? `(PIC: ${s.contact_person})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Tanggal Pemesanan</label>
              <input 
                type="date" 
                className="form-control"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Catatan Tambahan (Opsional)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Misal: Pengadaan bahan batch produksi bulan ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="border-top pt-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Daftar Bahan Baku yang Dipesan</h5>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddItem}>
                <Plus size={14} weight="bold" />
                <span>Tambah Bahan</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="table-clean mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>Bahan Baku</th>
                    <th style={{ width: '20%' }}>Kuantitas</th>
                    <th style={{ width: '25%' }}>Harga Satuan (Rp)</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <select 
                          className="form-select form-select-sm"
                          value={row.raw_material_id}
                          onChange={(e) => handleItemChange(idx, 'raw_material_id', e.target.value)}
                          required
                        >
                          {rawMaterials.map(rm => (
                            <option key={rm.id} value={rm.id}>
                              {rm.material_name} ({rm.unit}) - Stok: {rm.stock?.quantity || 0}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="form-control form-control-sm"
                          value={row.quantity_ordered}
                          onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input 
                          type="number"
                          step="100"
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div className="d-flex justify-content-end mt-3">
              <div className="card-clean p-3 bg-light" style={{ minWidth: '280px' }}>
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Total Kategori Bahan:</span>
                  <span className="fw-semibold">{items.length} jenis</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 text-dark border-top pt-2">
                  <span>Estimasi Total:</span>
                  <span className="text-primary">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <Link to="/purchase-orders" className="btn btn-light">
              Batal
            </Link>
            <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
              {submitting ? 'Menyimpan PO...' : 'Buat Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
