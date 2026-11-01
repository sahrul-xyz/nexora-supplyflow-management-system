import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  Tag, 
  Trash, 
  FloppyDisk
} from '@phosphor-icons/react';

export const ProductDetail = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [product, setProduct] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Variant Modal
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantForm, setVariantForm] = useState({ sku: '', size: '40', color: 'Black', initial_stock: 0 });
  const [variantError, setVariantError] = useState('');

  // BOM Editing State
  const [isEditingBom, setIsEditingBom] = useState(false);
  const [bomRows, setBomRows] = useState([]);
  const [bomError, setBomError] = useState('');
  const [bomSuccess, setBomSuccess] = useState('');

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      if (res.data?.success) {
        setProduct(res.data.data);
        // Initialize BOM rows
        const currentBoms = res.data.data.bom_details?.map(b => ({
          raw_material_id: b.raw_material_id,
          quantity_required: b.quantity_required,
        })) || [];
        setBomRows(currentBoms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const res = await api.get('/raw-materials');
      if (res.data?.success) {
        setRawMaterials(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchRawMaterials();
  }, [id]);

  const handleAddVariant = async (e) => {
    e.preventDefault();
    setVariantError('');
    try {
      await api.post('/product-variants', {
        product_id: product.id,
        ...variantForm,
      });
      setShowVariantModal(false);
      setVariantForm({ sku: '', size: '40', color: 'Black', initial_stock: 0 });
      fetchProductDetails();
    } catch (err) {
      setVariantError(err.response?.data?.message || 'Gagal menambahkan varian.');
    }
  };

  const handleAddBomRow = () => {
    if (rawMaterials.length === 0) return;
    setBomRows([...bomRows, { raw_material_id: rawMaterials[0].id, quantity_required: 1.0 }]);
  };

  const handleRemoveBomRow = (index) => {
    const updated = [...bomRows];
    updated.splice(index, 1);
    setBomRows(updated);
  };

  const handleBomRowChange = (index, field, value) => {
    const updated = [...bomRows];
    updated[index][field] = value;
    setBomRows(updated);
  };

  const handleSaveBom = async () => {
    setBomError('');
    setBomSuccess('');
    try {
      if (bomRows.length === 0) {
        setBomError('BOM harus memiliki minimal satu bahan baku.');
        return;
      }
      await api.put(`/bom-details/${product.id}`, { materials: bomRows });
      setBomSuccess('Bill of Materials (BOM) berhasil disimpan.');
      setIsEditingBom(false);
      fetchProductDetails();
    } catch (err) {
      setBomError(err.response?.data?.message || 'Gagal menyimpan BOM.');
    }
  };

  if (loading || !product) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Back button */}
      <div className="mb-3">
        <Link to="/products" className="btn btn-sm btn-light border text-secondary">
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog Produk</span>
        </Link>
      </div>

      {/* Product Hero Info */}
      <div className="card-nexora p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-clean badge-planned">
                <Tag size={12} weight="bold" />
                {product.category === 'shoes' ? 'Sepatu (Shoes)' : 'Sandal (Sandals)'}
              </span>
              <span className="badge-clean badge-completed">
                {product.is_active ? 'Status: Aktif' : 'Status: Non-aktif'}
              </span>
            </div>
            <h2 className="fw-bold mb-1">{product.product_name}</h2>
            <div className="font-monospace text-primary fw-semibold">{product.product_code}</div>
            <p className="text-muted small mt-2 mb-0" style={{ maxWidth: '700px' }}>
              {product.description || 'Tidak ada deskripsi spesifikasi.'}
            </p>
          </div>
          <div>
            <Link to="/production-orders/create" className="btn btn-primary">
              <Plus size={16} weight="bold" />
              <span>Rencanakan Produksi Model Ini</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs / 2-Columns: Variants & Bill of Materials */}
      <div className="row g-4">
        {/* Left Column: Product Variants (SKUs) */}
        <div className="col-12 col-lg-6">
          <div className="card-nexora p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Daftar Varian Produk (SKU)</h5>
                <small className="text-muted">Varian ukuran dan warna untuk model sepatu/sandal ini</small>
              </div>
              {hasRole(['production']) && (
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowVariantModal(true)}
                >
                  <Plus size={14} weight="bold" />
                  <span>Tambah SKU</span>
                </button>
              )}
            </div>

            <div className="table-responsive">
              <table className="table-clean mb-0">
                <thead>
                  <tr>
                    <th>SKU Unik</th>
                    <th>Ukuran</th>
                    <th>Warna</th>
                    <th>Stok Jadi</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Belum ada varian ukuran/warna untuk produk ini.
                      </td>
                    </tr>
                  ) : (
                    product.variants.map((v) => (
                      <tr key={v.id}>
                        <td className="fw-bold font-monospace">{v.sku}</td>
                        <td>Size {v.size}</td>
                        <td>{v.color}</td>
                        <td>
                          <span className={`badge-clean ${(v.stock?.quantity || 0) < 10 ? 'badge-warning-low' : 'badge-completed'}`}>
                            {v.stock?.quantity || 0} Pasang
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Bill of Materials (BOM) */}
        <div className="col-12 col-lg-6">
          <div className="card-nexora p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Bill of Materials (BOM)</h5>
                <small className="text-muted">Kebutuhan bahan baku per 1 pasang (berlaku semua varian - BR-02)</small>
              </div>
              {hasRole(['production']) && !isEditingBom && (
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setIsEditingBom(true)}
                >
                  Edit BOM
                </button>
              )}
            </div>

            {bomSuccess && <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">{bomSuccess}</div>}
            {bomError && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{bomError}</div>}

            {!isEditingBom ? (
              <div className="table-responsive">
                <table className="table-clean mb-0">
                  <thead>
                    <tr>
                      <th>Bahan Baku</th>
                      <th>Kebutuhan per Unit</th>
                      <th>Stok Tersedia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.bom_details?.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted">
                          BOM belum diatur. Silakan klik "Edit BOM" untuk menambahkan kebutuhan bahan baku.
                        </td>
                      </tr>
                    ) : (
                      product.bom_details.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <div className="fw-semibold">{b.raw_material?.material_name}</div>
                            <small className="text-muted font-monospace">{b.raw_material?.material_code}</small>
                          </td>
                          <td className="fw-bold text-primary">
                            {b.quantity_required} {b.raw_material?.unit}
                          </td>
                          <td>
                            <span className="small text-muted">
                              {b.raw_material?.stock?.quantity || 0} {b.raw_material?.unit}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <div className="d-flex flex-column gap-2 mb-3">
                  {bomRows.map((row, idx) => (
                    <div key={idx} className="d-flex gap-2 align-items-center">
                      <select 
                        className="form-select form-select-sm"
                        value={row.raw_material_id}
                        onChange={(e) => handleBomRowChange(idx, 'raw_material_id', e.target.value)}
                        style={{ flex: 2 }}
                      >
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>
                            {rm.material_name} ({rm.unit})
                          </option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        step="0.001" 
                        min="0.001"
                        className="form-control form-control-sm"
                        placeholder="Qty"
                        value={row.quantity_required}
                        onChange={(e) => handleBomRowChange(idx, 'quantity_required', parseFloat(e.target.value) || 0)}
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger p-1"
                        onClick={() => handleRemoveBomRow(idx)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-sm btn-light border" onClick={handleAddBomRow}>
                    <Plus size={14} />
                    <span>Tambah Baris Bahan</span>
                  </button>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setIsEditingBom(false)}>
                      Batal
                    </button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveBom}>
                      <FloppyDisk size={14} />
                      <span>Simpan BOM</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah SKU Varian */}
      {showVariantModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Tambah Varian SKU Baru</h5>
                <button type="button" className="btn-close" onClick={() => setShowVariantModal(false)}></button>
              </div>
              <form onSubmit={handleAddVariant}>
                <div className="modal-body p-4">
                  {variantError && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{variantError}</div>}

                  <div className="mb-3">
                    <label className="form-label">SKU (Kode Unik)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: SNK-001-BLK-42" 
                      value={variantForm.sku}
                      onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Ukuran (Size)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="40" 
                        value={variantForm.size}
                        onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Warna (Color)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Black" 
                        value={variantForm.color}
                        onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Stok Awal Gudang Jadi</label>
                    <input 
                      type="number" 
                      min="0"
                      className="form-control" 
                      placeholder="0" 
                      value={variantForm.initial_stock}
                      onChange={(e) => setVariantForm({ ...variantForm, initial_stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowVariantModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">Simpan Varian</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
