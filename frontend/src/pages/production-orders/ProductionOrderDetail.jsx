import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ArrowLeft, 
  Factory, 
  Play, 
  CheckCircle, 
  WarningCircle, 
  Calendar, 
  User, 
  ShieldCheck, 
  XCircle
} from '@phosphor-icons/react';

export const ProductionOrderDetail = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Start production state
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const [startSuccess, setStartSuccess] = useState('');

  // QC Modal state
  const [showQcModal, setShowQcModal] = useState(false);
  const [qcResults, setQcResults] = useState({});
  const [qcSubmitting, setQcSubmitting] = useState(false);
  const [qcError, setQcError] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/production-orders/${id}`);
      if (res.data?.success) {
        setData(res.data.data);
        // Initialize QC inputs if order is in_progress
        const order = res.data.data.production_order;
        const initial = {};
        order.details?.forEach(d => {
          initial[d.id] = {
            detail_id: d.id,
            target_quantity: d.target_quantity,
            actual_quantity: d.actual_quantity || d.target_quantity,
            passed_quantity: d.passed_quantity || d.target_quantity,
            rejected_quantity: d.rejected_quantity || 0,
          };
        });
        setQcResults(initial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStartProduction = async () => {
    if (!window.confirm('Mulai produksi sekarang? Stok bahan baku yang dibutuhkan akan otomatis dikurangi dari gudang (BR-10).')) {
      return;
    }
    setStarting(true);
    setStartError('');
    setStartSuccess('');
    try {
      const res = await api.post(`/production-orders/${id}/start`);
      if (res.data?.success) {
        setStartSuccess(res.data.message);
        fetchOrder();
      }
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.shortages) {
        const shortagesMsg = resData.shortages.map(s => `${s.material_name} (Kurang: ${s.shortage} ${s.unit})`).join(', ');
        setStartError(`Gagal memulai: Stok bahan tidak mencukupi (BR-09). Detail: ${shortagesMsg}`);
      } else {
        setStartError(resData?.message || 'Gagal memulai produksi.');
      }
    } finally {
      setStarting(false);
    }
  };

  const handleQcChange = (detailId, field, value) => {
    const current = { ...qcResults[detailId] };
    const num = Math.max(0, parseInt(value) || 0);
    current[field] = num;

    // Auto calculate if actual changed: default passed = actual - reject
    if (field === 'actual_quantity') {
      current.passed_quantity = Math.max(0, num - current.rejected_quantity);
    } else if (field === 'passed_quantity') {
      current.rejected_quantity = Math.max(0, current.actual_quantity - num);
    } else if (field === 'rejected_quantity') {
      current.passed_quantity = Math.max(0, current.actual_quantity - num);
    }

    setQcResults({
      ...qcResults,
      [detailId]: current,
    });
  };

  const handleSubmitQc = async (e) => {
    e.preventDefault();
    setQcError('');

    // Client-side verification of BR-11: actual == passed + rejected
    for (const res of Object.values(qcResults)) {
      if (res.actual_quantity !== (res.passed_quantity + res.rejected_quantity)) {
        setQcError(`Validasi gagal: Pada varian, jumlah aktual (${res.actual_quantity}) harus sama dengan lolos QC (${res.passed_quantity}) + reject (${res.rejected_quantity}) (BR-11).`);
        return;
      }
    }

    setQcSubmitting(true);
    try {
      const payload = {
        results: Object.values(qcResults).map(r => ({
          detail_id: r.detail_id,
          actual_quantity: r.actual_quantity,
          passed_quantity: r.passed_quantity,
          rejected_quantity: r.rejected_quantity,
        })),
      };

      const res = await api.post(`/production-orders/${id}/complete`, payload);
      if (res.data?.success) {
        setShowQcModal(false);
        alert(res.data.message);
        fetchOrder();
      }
    } catch (err) {
      setQcError(err.response?.data?.message || 'Gagal mencatat hasil QC.');
    } finally {
      setQcSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const { production_order: order, total_target, material_requirements } = data;
  const allMaterialsAvailable = material_requirements?.every(m => m.is_sufficient);

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '1000px' }}>
      {/* Back button */}
      <div className="mb-3">
        <Link to="/production-orders" className="btn btn-sm btn-light border text-secondary">
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Produksi</span>
        </Link>
      </div>

      {startSuccess && <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">{startSuccess}</div>}
      {startError && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{startError}</div>}

      {/* Production Order Card */}
      <div className="card-nexora p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 border-bottom pb-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-clean badge-planned">
                <Factory size={14} weight="bold" />
                <span>Production Order (MTS)</span>
              </span>
              <StatusBadge status={order.status} />
            </div>
            <h2 className="fw-bold font-monospace text-primary mb-1">{order.production_number}</h2>
            <div className="text-muted small d-flex flex-wrap gap-3">
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} /> Tanggal: {order.production_date}
              </span>
              <span className="d-flex align-items-center gap-1">
                <User size={14} /> Dibuat oleh: {order.creator?.name || 'Production'}
              </span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {hasRole(['production']) && order.status === 'planned' && (
              <button 
                onClick={handleStartProduction}
                className="btn btn-primary px-3"
                disabled={starting}
              >
                <Play size={18} weight="bold" />
                <span>{starting ? 'Memulai...' : 'Mulai Produksi (Pakai Bahan)'}</span>
              </button>
            )}

            {hasRole(['production']) && order.status === 'in_progress' && (
              <button 
                onClick={() => setShowQcModal(true)}
                className="btn btn-success text-white px-3"
              >
                <ShieldCheck size={18} weight="bold" />
                <span>Catat Hasil Produksi & QC</span>
              </button>
            )}

            {order.status === 'completed' && (
              <span className="badge-clean badge-completed p-2 px-3 fs-6">
                <CheckCircle size={18} weight="bold" />
                <span>Selesai & Lolos QC Masuk Stok</span>
              </span>
            )}
          </div>
        </div>

        {/* Product Model Info */}
        <div className="card-nexora p-3 bg-light mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="badge-clean badge-planned small mb-1">
                {order.product?.category === 'shoes' ? 'Model Sepatu' : 'Model Sandal'}
              </span>
              <h4 className="fw-bold mb-1 text-dark">{order.product?.product_name}</h4>
              <div className="font-monospace text-primary small">{order.product?.product_code}</div>
            </div>
            <div className="text-end">
              <span className="text-muted small">Total Target Produksi:</span>
              <h3 className="fw-bold mb-0 text-primary">{total_target} Pasang</h3>
            </div>
          </div>
          {order.notes && (
            <p className="small text-muted mb-0 mt-2 border-top pt-2">
              <strong>Catatan:</strong> {order.notes}
            </p>
          )}
        </div>

        {/* Variant Targets & QC Results Table */}
        <h5 className="fw-bold mb-3">Rincian Varian & Hasil QC (BR-11, BR-12, BR-13)</h5>
        <div className="table-responsive mb-4">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th>SKU Varian</th>
                <th>Ukuran</th>
                <th>Warna</th>
                <th>Target</th>
                <th>Aktual Output</th>
                <th>Lolos QC (Stok)</th>
                <th>Reject</th>
                <th>Status QC</th>
              </tr>
            </thead>
            <tbody>
              {order.details?.map(d => (
                <tr key={d.id}>
                  <td className="fw-bold font-monospace text-primary">{d.product_variant?.sku}</td>
                  <td>Size {d.product_variant?.size}</td>
                  <td>{d.product_variant?.color}</td>
                  <td className="fw-bold">{d.target_quantity} psg</td>
                  <td>
                    {order.status === 'completed' ? (
                      <span className="fw-semibold">{d.actual_quantity} psg</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {order.status === 'completed' ? (
                      <span className="badge-clean badge-completed">
                        <CheckCircle size={12} weight="bold" />
                        <span>{d.passed_quantity} psg</span>
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {order.status === 'completed' ? (
                      d.rejected_quantity > 0 ? (
                        <span className="badge-clean badge-danger">{d.rejected_quantity} unit</span>
                      ) : (
                        <span className="badge-clean badge-completed">0 unit</span>
                      )
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {order.status === 'completed' ? (
                      <small className="text-muted">
                        Dicek oleh: {d.qc_checker?.name || 'QC Inspector'}
                      </small>
                    ) : (
                      <span className="text-muted small">Menunggu QC</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOM Material Requirements Section */}
        <div className="border-top pt-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-0">Analisis Kebutuhan Bahan Baku (BOM Requirements)</h5>
              <small className="text-muted">Total Bahan Dibutuhkan = Target ({total_target} psg) × Kebutuhan BOM per pasang</small>
            </div>
            {order.status === 'planned' && (
              allMaterialsAvailable ? (
                <span className="badge-clean badge-completed">
                  <CheckCircle size={14} weight="bold" />
                  <span>Stok Mencukupi Siap Mulai</span>
                </span>
              ) : (
                <span className="badge-clean badge-warning-low">
                  <WarningCircle size={14} weight="bold" />
                  <span>Stok Bahan Kurang</span>
                </span>
              )
            )}
          </div>

          <div className="table-responsive">
            <table className="table-clean mb-0">
              <thead>
                <tr>
                  <th>Kode Bahan</th>
                  <th>Nama Bahan Baku</th>
                  <th>BOM / Pasang</th>
                  <th>Total Kebutuhan</th>
                  <th>Stok Tersedia</th>
                  <th>Status Ketersediaan</th>
                </tr>
              </thead>
              <tbody>
                {material_requirements?.map(m => (
                  <tr key={m.raw_material_id}>
                    <td className="font-monospace text-primary fw-bold">{m.material_code}</td>
                    <td>{m.material_name}</td>
                    <td>{m.bom_per_unit} {m.unit}</td>
                    <td className="fw-bold text-dark">{m.total_required} {m.unit}</td>
                    <td>{m.available_stock} {m.unit}</td>
                    <td>
                      {order.status === 'in_progress' || order.status === 'completed' ? (
                        <span className="badge-clean badge-completed">
                          <CheckCircle size={12} weight="bold" />
                          <span>Telah Dipotong dari Gudang</span>
                        </span>
                      ) : m.is_sufficient ? (
                        <span className="badge-clean badge-completed">
                          <CheckCircle size={12} weight="bold" />
                          <span>Mencukupi</span>
                        </span>
                      ) : (
                        <span className="badge-clean badge-warning-low">
                          <WarningCircle size={12} weight="bold" />
                          <span>Kurang {m.shortage} {m.unit}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QC Result Modal */}
      {showQcModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={24} className="text-success" weight="bold" />
                  <h5 className="modal-title fw-bold">Pemeriksaan Quality Control (QC) & Hasil Produksi</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowQcModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitQc}>
                <div className="modal-body p-4">
                  <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
                    <strong>Aturan Bisnis (BR-11, BR-12, BR-13):</strong> Jumlah Aktual harus persis sama dengan Lolos QC ditambah Reject. Hanya produk Lolos QC yang akan otomatis ditambahkan ke stok barang jadi.
                  </div>

                  {qcError && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{qcError}</div>}

                  <div className="table-responsive">
                    <table className="table-clean mb-0">
                      <thead>
                        <tr>
                          <th>Varian SKU</th>
                          <th>Target</th>
                          <th style={{ width: '130px' }}>Aktual Output</th>
                          <th style={{ width: '130px' }}>Lolos QC (Stok)</th>
                          <th style={{ width: '130px' }}>Reject (Cacat)</th>
                          <th>Status Hitung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.details?.map(d => {
                          const res = qcResults[d.id] || { actual_quantity: d.target_quantity, passed_quantity: d.target_quantity, rejected_quantity: 0 };
                          const isValid = res.actual_quantity === (res.passed_quantity + res.rejected_quantity);

                          return (
                            <tr key={d.id}>
                              <td>
                                <div className="fw-bold font-monospace">{d.product_variant?.sku}</div>
                                <small className="text-muted">Size {d.product_variant?.size} ({d.product_variant?.color})</small>
                              </td>
                              <td className="fw-bold text-muted">{d.target_quantity}</td>
                              <td>
                                <input 
                                  type="number"
                                  min="0"
                                  className="form-control form-control-sm text-center fw-bold"
                                  value={res.actual_quantity}
                                  onChange={(e) => handleQcChange(d.id, 'actual_quantity', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input 
                                  type="number"
                                  min="0"
                                  className="form-control form-control-sm text-center fw-bold text-success"
                                  value={res.passed_quantity}
                                  onChange={(e) => handleQcChange(d.id, 'passed_quantity', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input 
                                  type="number"
                                  min="0"
                                  className="form-control form-control-sm text-center fw-bold text-danger"
                                  value={res.rejected_quantity}
                                  onChange={(e) => handleQcChange(d.id, 'rejected_quantity', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                {isValid ? (
                                  <span className="badge-clean badge-completed small">
                                    <CheckCircle size={12} weight="bold" /> Sesuai
                                  </span>
                                ) : (
                                  <span className="badge-clean badge-danger small">
                                    <XCircle size={12} weight="bold" /> Tidak Valid
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowQcModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-success text-white" disabled={qcSubmitting}>
                    {qcSubmitting ? 'Menyimpan...' : 'Selesaikan & Masukkan ke Stok Gudang Jadi'}
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
