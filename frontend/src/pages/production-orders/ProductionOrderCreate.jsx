import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Factory, 
  Plus, 
  Trash, 
  CheckCircle, 
  WarningCircle, 
  Calendar,
  Sneaker
} from '@phosphor-icons/react';

export const ProductionOrderCreate = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Selected variant targets: { [variantId]: quantity }
  const [variantTargets, setVariantTargets] = useState({});

  // Requirements preview
  const [checkLoading, setCheckLoading] = useState(false);
  const [previewRequirements, setPreviewRequirements] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data?.success && res.data.data.length > 0) {
        setProducts(res.data.data);
        handleSelectProduct(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    // Initialize targets for each variant of this product
    const initialTargets = {};
    if (product.variants) {
      product.variants.forEach(v => {
        initialTargets[v.id] = 20; // default 20 units
      });
    }
    setVariantTargets(initialTargets);
  };

  // Check requirements whenever variantTargets change
  useEffect(() => {
    if (!selectedProduct) return;

    const items = Object.entries(variantTargets)
      .filter(([_, qty]) => parseInt(qty) > 0)
      .map(([variantId, qty]) => ({
        product_variant_id: parseInt(variantId),
        target_quantity: parseInt(qty),
      }));

    if (items.length === 0) {
      setPreviewRequirements(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckLoading(true);
        const res = await api.post('/production-orders/check-requirements', {
          product_id: selectedProduct.id,
          variants: items,
        });
        if (res.data?.success) {
          setPreviewRequirements(res.data.data);
        }
      } catch (err) {
        console.error('Error checking requirements', err);
      } finally {
        setCheckLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedProduct, variantTargets]);

  const handleTargetChange = (variantId, qty) => {
    setVariantTargets({
      ...variantTargets,
      [variantId]: Math.max(0, parseInt(qty) || 0),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const variantList = Object.entries(variantTargets)
      .filter(([_, qty]) => parseInt(qty) > 0)
      .map(([variantId, qty]) => ({
        product_variant_id: parseInt(variantId),
        target_quantity: parseInt(qty),
      }));

    if (variantList.length === 0) {
      setError('Harap masukkan target produksi minimal untuk satu varian.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: selectedProduct.id,
        production_date: productionDate,
        notes,
        variants: variantList,
      };

      const res = await api.post('/production-orders', payload);
      if (res.data?.success) {
        navigate(`/production-orders/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal merencanakan Production Order.');
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

  const totalTargetPlanned = Object.values(variantTargets).reduce((a, b) => a + (parseInt(b) || 0), 0);

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '1000px' }}>
      {/* Back button */}
      <div className="mb-3">
        <Link to="/production-orders" className="btn btn-sm btn-light border text-secondary">
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Produksi</span>
        </Link>
      </div>

      <div className="card-nexora p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <Factory size={26} className="text-primary" weight="duotone" />
          <h3 className="fw-bold mb-0">Rencanakan Production Order Baru (MTS)</h3>
        </div>
        <p className="text-muted small mb-4">
          Pilih satu model sepatu/sandal, tentukan target per ukuran/warna, dan sistem akan menghitung kebutuhan bahan baku otomatis berdasarkan BOM (BR-07, BR-08).
        </p>

        {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Model & Date */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label">Pilih Model Produk (Tunggal)</label>
              <select 
                className="form-select"
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const p = products.find(prod => prod.id === parseInt(e.target.value));
                  if (p) handleSelectProduct(p);
                }}
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} ({p.product_code}) - {p.category === 'shoes' ? 'Sepatu' : 'Sandal'}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Tanggal Rencana Mulai Produksi</label>
              <input 
                type="date"
                className="form-control"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Catatan Batch Produksi</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Contoh: Batch pemenuhan stok Make to Stock menjelang akhir bulan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Step 2: Targets per Variant */}
          <div className="border-top pt-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Target Produksi per Varian (Ukuran & Warna)</h5>
                <small className="text-muted">Masukkan jumlah target pasang untuk setiap varian model ini</small>
              </div>
              <div className="badge-clean badge-completed fs-6">
                Total Target: {totalTargetPlanned} Pasang
              </div>
            </div>

            <div className="row g-2">
              {selectedProduct?.variants?.map((v) => (
                <div key={v.id} className="col-12 col-sm-6 col-md-4">
                  <div className="card-nexora p-3 bg-light">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold font-monospace text-primary small">{v.sku}</span>
                      <span className="small text-muted">Stok: {v.stock?.quantity || 0}</span>
                    </div>
                    <div className="small text-secondary mb-2">Size {v.size} - Warna {v.color}</div>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white">Target:</span>
                      <input 
                        type="number"
                        min="0"
                        className="form-control fw-bold text-center"
                        value={variantTargets[v.id] || 0}
                        onChange={(e) => handleTargetChange(v.id, e.target.value)}
                      />
                      <span className="input-group-text bg-white">psg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Live BOM Requirements Calculator */}
          <div className="border-top pt-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Kalkulasi Kebutuhan Bahan Baku (Live BOM Check)</h5>
                <small className="text-muted">Dihitung otomatis: Total Kebutuhan = Target ({totalTargetPlanned} psg) × Kebutuhan BOM per unit</small>
              </div>
              {checkLoading && <div className="spinner-border spinner-border-sm text-primary"></div>}
            </div>

            {previewRequirements ? (
              <div>
                {/* Sufficiency Alert */}
                {previewRequirements.all_sufficient ? (
                  <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
                    <CheckCircle size={18} weight="bold" />
                    <span>Semua bahan baku mencukupi di gudang. Produksi dapat segera dimulai saat order disimpan.</span>
                  </div>
                ) : (
                  <div className="alert alert-warning py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
                    <WarningCircle size={18} weight="bold" />
                    <span>Perhatian: Ada bahan baku yang kurang untuk target ini. Buat PO bahan baku terlebih dahulu sebelum memulai produksi (BR-09).</span>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table-clean mb-0">
                    <thead>
                      <tr>
                        <th>Bahan Baku</th>
                        <th>Kebutuhan per Unit</th>
                        <th>Total Dibutuhkan</th>
                        <th>Stok Tersedia</th>
                        <th>Status Bahan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRequirements.requirements?.map((req) => (
                        <tr key={req.raw_material_id}>
                          <td>
                            <div className="fw-semibold">{req.material_name}</div>
                            <small className="text-muted font-monospace">{req.material_code}</small>
                          </td>
                          <td>{req.bom_per_unit} {req.unit}</td>
                          <td className="fw-bold text-primary">{req.total_required} {req.unit}</td>
                          <td>{req.available_stock} {req.unit}</td>
                          <td>
                            {req.is_sufficient ? (
                              <span className="badge-clean badge-completed">
                                <CheckCircle size={12} weight="bold" />
                                <span>Cukup</span>
                              </span>
                            ) : (
                              <span className="badge-clean badge-warning-low">
                                <WarningCircle size={12} weight="bold" />
                                <span>Kurang {req.shortage} {req.unit}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted bg-light rounded-3">
                Masukkan minimal 1 target varian untuk melihat kalkulasi kebutuhan bahan baku.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <Link to="/production-orders" className="btn btn-light">
              Batal
            </Link>
            <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Rencanakan Production Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
