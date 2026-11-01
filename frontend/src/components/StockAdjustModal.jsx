import React, { useState } from 'react';
import api from '../services/api';
import { 
  X, 
  MinusCircle, 
  PlusCircle, 
  PencilSimple, 
  Trash, 
  WarningCircle, 
  CheckCircle,
  ArrowRight
} from '@phosphor-icons/react';

export const StockAdjustModal = ({ show, onClose, onSuccess, item }) => {
  if (!show || !item) return null;

  const [action, setAction] = useState('reduce'); // 'reduce', 'add', 'set', 'reset'
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentStock = parseFloat(item.current_stock) || 0;
  const numQty = parseFloat(quantity) || 0;

  // Calculate projected new stock
  let projectedStock = currentStock;
  if (action === 'reduce') projectedStock = Math.max(0, currentStock - numQty);
  if (action === 'add') projectedStock = currentStock + numQty;
  if (action === 'set') projectedStock = Math.max(0, numQty);
  if (action === 'reset') projectedStock = 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (action === 'reduce' && numQty > currentStock) {
      setError(`Jumlah pengurangan (${numQty} ${item.unit}) melebihi stok yang tersedia (${currentStock} ${item.unit}).`);
      return;
    }

    if (action !== 'reset' && numQty <= 0) {
      setError('Jumlah penyesuaian harus lebih besar dari 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        warehouse_type: item.warehouse_type,
        action,
        quantity: action === 'reset' ? 0 : numQty,
        notes: notes || undefined,
      };

      if (item.warehouse_type === 'raw_material') {
        payload.raw_material_id = item.id;
      } else {
        payload.product_variant_id = item.id;
      }

      const res = await api.post('/inventory-stocks/adjust', payload);
      if (res.data?.success) {
        onSuccess(res.data.message);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyesuaikan stok.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1070 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div className="modal-content card-nexora border-0 shadow-float" style={{ borderRadius: '20px' }}>
          {/* Header */}
          <div className="modal-header border-bottom px-4 pt-4 pb-3">
            <div>
              <h5 className="modal-title fw-bold mb-0 text-dark">Penyesuaian Stok Gudang</h5>
              <small className="text-muted">Tambah, kurangi, atau kosongkan stok fisik</small>
            </div>
            <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
                  <WarningCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Item Info Card */}
              <div className="p-3 rounded-3 bg-light border border-subtle mb-3">
                <div className="small text-muted">{item.warehouse_type === 'raw_material' ? 'Bahan Baku' : 'Barang Jadi (Sepatu/Sandal)'}</div>
                <div className="fw-bold text-dark fs-6 mb-1">{item.name}</div>
                <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2">
                  <span className="small text-secondary">Stok Fisik Saat Ini:</span>
                  <span className="fw-bold text-primary fs-6">
                    {currentStock} {item.unit}
                  </span>
                </div>
              </div>

              {/* Action Type Selector (4 Pills) */}
              <div className="mb-3">
                <label className="form-label mb-2">Pilih Jenis Penyesuaian:</label>
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-2 small justify-content-start text-start ${action === 'reduce' ? 'btn-danger text-white' : 'btn-light border'}`}
                      onClick={() => setAction('reduce')}
                    >
                      <MinusCircle size={18} />
                      <div className="lh-1 ms-1">
                        <div className="fw-bold">Kurangi Stok</div>
                        <small style={{ fontSize: '0.65rem' }}>Rusak / Terpakai / Opname</small>
                      </div>
                    </button>
                  </div>

                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-2 small justify-content-start text-start ${action === 'add' ? 'btn-success text-white' : 'btn-light border'}`}
                      onClick={() => setAction('add')}
                    >
                      <PlusCircle size={18} />
                      <div className="lh-1 ms-1">
                        <div className="fw-bold">Tambah Stok</div>
                        <small style={{ fontSize: '0.65rem' }}>Retur / Tambahan Fisik</small>
                      </div>
                    </button>
                  </div>

                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-2 small justify-content-start text-start ${action === 'set' ? 'btn-primary text-white' : 'btn-light border'}`}
                      onClick={() => setAction('set')}
                    >
                      <PencilSimple size={18} />
                      <div className="lh-1 ms-1">
                        <div className="fw-bold">Set Nilai Baru</div>
                        <small style={{ fontSize: '0.65rem' }}>Koreksi Angka Eksak</small>
                      </div>
                    </button>
                  </div>

                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-2 small justify-content-start text-start ${action === 'reset' ? 'btn-outline-danger active' : 'btn-light border'}`}
                      onClick={() => setAction('reset')}
                    >
                      <Trash size={18} />
                      <div className="lh-1 ms-1">
                        <div className="fw-bold">Kosongkan (0)</div>
                        <small style={{ fontSize: '0.65rem' }}>Hapus Seluruh Stok</small>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity Input (hidden if reset) */}
              {action !== 'reset' && (
                <div className="mb-3">
                  <label className="form-label">
                    {action === 'reduce' && 'Jumlah yang Dikurangi:'}
                    {action === 'add' && 'Jumlah yang Ditambahkan:'}
                    {action === 'set' && 'Nilai Stok Baru (Eksak):'}
                  </label>
                  <div className="input-group">
                    <input 
                      type="number" 
                      step="any"
                      min="0.01"
                      className="form-control font-monospace fw-bold"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                    <span className="input-group-text bg-white border-start-0 text-muted fw-semibold">
                      {item.unit}
                    </span>
                  </div>

                  {/* Quick change pills */}
                  {action === 'reduce' && (
                    <div className="d-flex gap-1 mt-2">
                      {[1, 5, 10, 50].map((step) => (
                        <button
                          key={step}
                          type="button"
                          className="btn btn-sm btn-light border py-0 px-2 small"
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => setQuantity(step)}
                        >
                          -{step} {item.unit}
                        </button>
                      ))}
                    </div>
                  )}

                  {action === 'add' && (
                    <div className="d-flex gap-1 mt-2">
                      {[5, 10, 50, 100].map((step) => (
                        <button
                          key={step}
                          type="button"
                          className="btn btn-sm btn-light border py-0 px-2 small"
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => setQuantity(step)}
                        >
                          +{step} {item.unit}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes / Reason */}
              <div className="mb-3">
                <label className="form-label">Alasan Penyesuaian (Opsional):</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Contoh: Barang cacat/rusak, koreksi stock opname, sampel toko..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Calculation Preview */}
              <div className="p-3 rounded-3 bg-primary-subtle border border-primary-subtle d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Hasil Stok Akhir:</div>
                  <div className="fw-bold fs-5 text-primary">
                    {projectedStock} {item.unit}
                  </div>
                </div>
                <div className="text-end">
                  <span className={`badge-clean ${action === 'reduce' || action === 'reset' ? 'badge-danger' : 'badge-completed'}`}>
                    {action === 'reduce' && `-${numQty} ${item.unit}`}
                    {action === 'add' && `+${numQty} ${item.unit}`}
                    {action === 'set' && `Set ke ${numQty}`}
                    {action === 'reset' && 'Reset 0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top px-4 py-3">
              <button 
                type="button" 
                className="btn btn-light border" 
                onClick={onClose}
                disabled={submitting}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className={`btn ${action === 'reduce' || action === 'reset' ? 'btn-danger' : 'btn-primary'} px-4`}
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
