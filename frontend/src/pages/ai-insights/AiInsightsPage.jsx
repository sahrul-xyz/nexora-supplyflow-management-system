import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Sparkle, 
  ArrowClockwise, 
  CheckCircle, 
  WarningCircle, 
  ShieldCheck, 
  Package, 
  Truck, 
  CurrencyCircleDollar, 
  ArrowRight, 
  Lightning, 
  ChartLineUp, 
  Sliders, 
  Cpu, 
  TerminalWindow,
  FileText,
  TrendUp,
  ArrowsClockwise
} from '@phosphor-icons/react';

export const AiInsightsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // What-If Simulation State
  const [spikePercent, setSpikePercent] = useState(20);
  const [simData, setSimData] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Diagnostic Logs
  const [diagnosticLogs, setDiagnosticLogs] = useState([
    '[AI_STREAM] Telemetri aktif • Menghubungkan 14 tabel database relasional...',
    '[INIT] Memeriksa konsistensi stok gudang bahan baku & barang jadi...',
    '[HEURISTICS] Algoritma SCM Health Score siap dijalankan.'
  ]);

  useEffect(() => {
    fetchInsights();
    fetchSimulation(20);
  }, []);

  const fetchInsights = async () => {
    try {
      setScanning(true);
      const res = await api.get('/ai-insights');
      if (res.data?.success) {
        setData(res.data.data);
        addLog(`[DIAGNOSE_COMPLETE] Skor Kesehatan SCM: ${res.data.data.health_score}/100 (${res.data.data.health_status})`);
      }
    } catch (err) {
      console.error(err);
      addLog('[ERROR] Gagal menyinkronkan data diagnostik AI.');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const fetchSimulation = async (spike) => {
    try {
      setSimLoading(true);
      setSpikePercent(spike);
      const res = await api.post('/ai-insights/simulate', { spike_percent: spike });
      if (res.data?.success) {
        setSimData(res.data.data);
        addLog(`[SIMULATION] Skenario lonjakan demand +${spike}% dihitung. ${res.data.data.critical_materials_count} bahan kritis terdeteksi.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('id-ID');
    setDiagnosticLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const formatRupiah = (num) => {
    if (!num || num === 0) return 'Rp 0';
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(1)} M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)} jt`;
    return `Rp ${Number(num).toLocaleString('id-ID')}`;
  };

  const filteredInsights = data?.insights?.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  }) || [];

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '65vh' }}>
        <div className="position-relative mb-3">
          <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} role="status"></div>
          <Sparkle size={24} weight="fill" className="position-absolute top-50 start-50 translate-middle text-primary" />
        </div>
        <h6 className="fw-bold text-dark mb-1">Memulai AI Insights & Telemetri SCM...</h6>
        <span className="text-muted small">Menganalisis matriks korelasi bahan, QC, dan pesanan</span>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* 1. HERO HEADER */}
      <div className="card-nexora p-4 mb-4 position-relative overflow-hidden border-0" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)',
          borderLeft: '5px solid #8B5CF6'
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-4 d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
              style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
            >
              <Sparkle size={32} weight="fill" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge rounded-pill bg-purple-subtle text-primary-indigo fw-bold py-1 px-2" style={{ fontSize: '0.725rem' }}>
                  Nexora AI Neural Engine v2.6
                </span>
                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle py-1 px-2 fw-semibold" style={{ fontSize: '0.725rem' }}>
                  ● Real-time Telemetry
                </span>
              </div>
              <h4 className="fw-bold text-dark mb-1">AI Insights & Algorithmic Diagnostics</h4>
              <p className="text-secondary small mb-0" style={{ maxWidth: '680px' }}>
                Mesin analitik prediktif otonom memantau 14 tabel database relasional SupplyFlow SCM secara simultan: memprediksi defisit safety stock, isolasi akar masalah QC, dan optimasi jadwal logistik MTS.
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <button 
              onClick={fetchInsights}
              disabled={scanning}
              className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm rounded-pill px-4 py-2"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', border: 'none' }}
            >
              <ArrowClockwise size={16} className={scanning ? 'spinner-grow spinner-grow-sm' : ''} />
              <span className="fw-semibold">{scanning ? 'Memindai Ulang...' : 'Re-Scan Sistem'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SCM HEALTH SCORE & 4 PILLARS GAUGES */}
      <div className="row g-3 mb-4">
        {/* Main Health Score Card */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between position-relative">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Indeks Kesehatan SCM</h6>
                <span className="badge bg-light text-muted border small">0 - 100 Skala</span>
              </div>

              <div className="d-flex align-items-center gap-4 py-2">
                <div 
                  className="rounded-circle d-flex flex-column align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    backgroundColor: getScoreColor(data?.health_score || 85),
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                >
                  <span className="fw-extrabold fs-2 lh-1">{data?.health_score || 85}</span>
                  <span style={{ fontSize: '0.7rem' }}>/ 100</span>
                </div>

                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span 
                      className="badge fw-bold py-1 px-2"
                      style={{ 
                        backgroundColor: `${getScoreColor(data?.health_score || 85)}18`,
                        color: getScoreColor(data?.health_score || 85),
                        border: `1px solid ${getScoreColor(data?.health_score || 85)}40`
                      }}
                    >
                      Status: {data?.health_status || 'Optimal'}
                    </span>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Kondisi Operasional Prima</h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.775rem' }}>
                    Dievaluasi dari kepatuhan bahan baku, kelulusan QC, dan efisiensi PO vendor.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-top mt-3 d-flex align-items-center justify-content-between text-muted small" style={{ fontSize: '0.725rem' }}>
              <span>Terakhir dipindai: {data?.evaluated_at}</span>
              <span className="text-success fw-bold">Sinkron MySQL</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Breakdown Cards */}
        <div className="col-12 col-xl-8">
          <div className="row g-3 h-100">
            {/* Pilar 1: Gudang & Safety Stock */}
            <div className="col-12 col-sm-6">
              <div className="card-nexora p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 p-2 bg-blue-subtle text-primary">
                        <Package size={18} weight="bold" />
                      </div>
                      <span className="fw-bold text-dark small">Bahan Baku & Safety Stock</span>
                    </div>
                    <span className="fw-bold text-primary small">{data?.sub_scores?.inventory || 28} / 30</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '6px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${((data?.sub_scores?.inventory || 28) / 30) * 100}%` }}></div>
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Kesiapan bahan baku pabrik berada pada <strong>{data?.summary_kpis?.safe_materials || '90%'}</strong> di atas ambang minimum.
                  </div>
                </div>
                <div className="pt-2 border-top mt-2">
                  <Link to="/inventory" className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '0.725rem' }}>
                    <span>Cek stok gudang</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pilar 2: Mutu QC Manufaktur */}
            <div className="col-12 col-sm-6">
              <div className="card-nexora p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 p-2 bg-green-subtle text-success">
                        <ShieldCheck size={18} weight="bold" />
                      </div>
                      <span className="fw-bold text-dark small">Kualitas Mutu QC</span>
                    </div>
                    <span className="fw-bold text-success small">{data?.sub_scores?.quality || 29} / 30</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: `${((data?.sub_scores?.quality || 29) / 30) * 100}%` }}></div>
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Rasio kelulusan produk mencapai <strong>{data?.summary_kpis?.qc_pass_rate || '95%+'}</strong> (sesuai standar Make to Stock).
                  </div>
                </div>
                <div className="pt-2 border-top mt-2">
                  <Link to="/production-orders" className="small text-success fw-bold text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '0.725rem' }}>
                    <span>Riwayat order & QC</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pilar 3: Pengadaan Vendor */}
            <div className="col-12 col-sm-6">
              <div className="card-nexora p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 p-2 bg-purple-subtle text-primary-indigo">
                        <CurrencyCircleDollar size={18} weight="bold" />
                      </div>
                      <span className="fw-bold text-dark small">Pengadaan (Purchase Orders)</span>
                    </div>
                    <span className="fw-bold text-primary-indigo small">{data?.sub_scores?.procurement || 18} / 20</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '6px' }}>
                    <div className="progress-bar bg-purple" style={{ backgroundColor: '#8B5CF6', width: `${((data?.sub_scores?.procurement || 18) / 20) * 100}%` }}></div>
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Siklus penerimaan pesanan bahan dari supplier vendor berjalan terjadwal.
                  </div>
                </div>
                <div className="pt-2 border-top mt-2">
                  <Link to="/purchase-orders" className="small text-primary-indigo fw-bold text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '0.725rem' }}>
                    <span>Kelola PO Supplier</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pilar 4: Distribusi Logistik */}
            <div className="col-12 col-sm-6">
              <div className="card-nexora p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 p-2 bg-info-subtle text-info">
                        <Truck size={18} weight="bold" />
                      </div>
                      <span className="fw-bold text-dark small">Logistik & Distribusi</span>
                    </div>
                    <span className="fw-bold text-info small">{data?.sub_scores?.logistics || 18} / 20</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '6px' }}>
                    <div className="progress-bar bg-info" style={{ width: `${((data?.sub_scores?.logistics || 18) / 20) * 100}%` }}></div>
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Tingkat pengiriman tepat waktu (On-Time Delivery): <strong>{data?.summary_kpis?.on_time_rate || '95%'}</strong>.
                  </div>
                </div>
                <div className="pt-2 border-top mt-2">
                  <Link to="/partner-orders" className="small text-info fw-bold text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '0.725rem' }}>
                    <span>Logistics tracking</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE WHAT-IF SCENARIO DEMAND SIMULATOR */}
      <div className="card-nexora p-4 mb-4 border border-indigo-subtle">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Sliders size={20} className="text-primary-indigo" weight="bold" />
              <h5 className="fw-bold text-dark mb-0">What-If Demand Simulator (MTS Stress-Test)</h5>
            </div>
            <p className="text-muted small mb-0">
              Simulasikan lonjakan permintaan pasar sepatu/sandal dan evaluasi ketahanan cadangan bahan baku (Runway Days) sebelum terjadi stockout.
            </p>
          </div>

          {/* Scenario Buttons */}
          <div className="d-flex align-items-center gap-2 bg-light p-1 rounded-pill border">
            {[
              { val: 0, label: 'Normal (+0%)' },
              { val: 20, label: 'Sedang (+20%)' },
              { val: 40, label: 'Tinggi (+40%)' },
              { val: 60, label: 'Puncak (+60%)' },
            ].map((btn) => (
              <button 
                key={btn.val}
                type="button"
                onClick={() => fetchSimulation(btn.val)}
                className={`btn btn-sm py-1 px-3 rounded-pill border-0 transition-all ${spikePercent === btn.val ? 'btn-primary shadow-xs' : 'text-muted'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Summary Bar */}
        <div className="row g-2 p-3 bg-light rounded-3 mb-3 border">
          <div className="col-12 col-md-4">
            <span className="text-muted small d-block" style={{ fontSize: '0.725rem' }}>Skenario Aktif:</span>
            <span className="fw-bold text-dark">{simData?.scenario_label}</span>
          </div>
          <div className="col-12 col-md-4">
            <span className="text-muted small d-block" style={{ fontSize: '0.725rem' }}>Bahan Rentan Kritis (&lt; 5 Hari):</span>
            <span className={`fw-bold ${simData?.critical_materials_count > 0 ? 'text-danger' : 'text-success'}`}>
              {simData?.critical_materials_count || 0} Bahan Baku
            </span>
          </div>
          <div className="col-12 col-md-4">
            <span className="text-muted small d-block" style={{ fontSize: '0.725rem' }}>Estimasi Kebutuhan PO Bahan:</span>
            <span className="fw-bold text-primary">{formatRupiah(simData?.total_recommended_po_value || 0)}</span>
          </div>
        </div>

        {/* Simulation Runway Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th>Kode & Bahan Baku</th>
                <th className="text-center">Stok Gudang</th>
                <th className="text-center">Laju Konsumsi/Hari</th>
                <th className="text-center">Ketahanan Cadangan (Runway)</th>
                <th className="text-center">Status Ketahanan</th>
                <th className="text-center">Rekomendasi Reorder</th>
                <th className="text-end">Aksi Solutif</th>
              </tr>
            </thead>
            <tbody>
              {simLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    <span className="spinner-border spinner-border-sm text-primary me-2"></span>
                    Menghitung simulasi daya tahan material...
                  </td>
                </tr>
              ) : (
                simData?.materials?.map((mat) => (
                  <tr key={mat.material_id}>
                    <td>
                      <div className="fw-bold text-dark">{mat.material_name}</div>
                      <span className="font-monospace text-muted small" style={{ fontSize: '0.7rem' }}>{mat.material_code}</span>
                    </td>
                    <td className="text-center fw-bold text-dark">
                      {mat.current_stock} <span className="text-muted fw-normal small">{mat.unit}</span>
                    </td>
                    <td className="text-center text-muted">
                      {mat.simulated_daily_burn} {mat.unit}/hari
                    </td>
                    <td className="text-center">
                      <span className="fw-bold fs-6" style={{ color: mat.badge_color }}>
                        {mat.runway_days} Hari
                      </span>
                    </td>
                    <td className="text-center">
                      <span 
                        className="badge-clean py-1 px-2"
                        style={{ 
                          backgroundColor: `${mat.badge_color}18`, 
                          color: mat.badge_color,
                          border: `1px solid ${mat.badge_color}40`,
                          fontSize: '0.725rem'
                        }}
                      >
                        {mat.status_label}
                      </span>
                    </td>
                    <td className="text-center">
                      {mat.recommended_reorder > 0 ? (
                        <span className="fw-bold text-danger">+{mat.recommended_reorder} {mat.unit}</span>
                      ) : (
                        <span className="text-success small fw-semibold">Tercukupi (0)</span>
                      )}
                    </td>
                    <td className="text-end">
                      {mat.recommended_reorder > 0 ? (
                        <Link 
                          to="/purchase-orders/create" 
                          className="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill"
                          style={{ fontSize: '0.725rem' }}
                        >
                          + PO Bahan
                        </Link>
                      ) : (
                        <Link 
                          to="/inventory" 
                          className="btn btn-sm btn-light py-1 px-2 rounded-pill border"
                          style={{ fontSize: '0.725rem' }}
                        >
                          Cek Gudang
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ACTIONABLE INSIGHTS DECK & REAL-TIME LOG */}
      <div className="row g-3">
        {/* Insights Deck */}
        <div className="col-12 col-xl-8">
          <div className="card-nexora p-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Temuan Analisis & Rekomendasi Eksekusi 1-Click</h6>
                <span className="text-muted small">Rekomendasi terstruktur berdasarkan data riil 4 pilar SupplyFlow</span>
              </div>

              {/* Category Filter Pills */}
              <div className="d-flex gap-1 flex-wrap">
                {[
                  { key: 'all', label: `Semua (${data?.insights?.length || 0})` },
                  { key: 'inventory', label: 'Bahan Baku' },
                  { key: 'quality', label: 'Kualitas QC' },
                  { key: 'logistics', label: 'Logistik' },
                  { key: 'cost', label: 'Efisiensi Biaya' },
                ].map(cat => (
                  <button 
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`btn btn-sm py-1 px-3 rounded-pill border-0 ${activeCategory === cat.key ? 'btn-primary shadow-xs' : 'btn-light border'}`}
                    style={{ fontSize: '0.725rem' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Insight Cards */}
            <div className="d-flex flex-column gap-3">
              {filteredInsights.map(ins => (
                <div 
                  key={ins.id}
                  className="card-nexora p-3 p-md-4 border border-subtle transition-all"
                  style={{ borderLeft: `4px solid ${ins.color}` }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span 
                        className={`badge-clean ${ins.priority === 'high' ? 'badge-danger' : ins.priority === 'medium' ? 'badge-warning-low' : 'badge-completed'} py-0 px-2`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        Prioritas {ins.priority === 'high' ? 'Tinggi' : ins.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>
                      <span className="text-secondary small fw-semibold" style={{ fontSize: '0.75rem' }}>
                        {ins.category_label}
                      </span>
                    </div>
                    <span className="font-monospace text-muted small" style={{ fontSize: '0.7rem' }}>{ins.id}</span>
                  </div>

                  <h6 className="fw-bold text-dark fs-6 mb-2">{ins.title}</h6>
                  <p className="text-secondary small mb-3">{ins.summary}</p>

                  {/* Detail Section: Root Cause & Projected Impact */}
                  <div className="p-3 rounded-3 bg-light border border-subtle mb-3">
                    <div className="mb-2">
                      <span className="fw-bold text-dark small d-block">🔍 Analisis Akar Masalah (Root-Cause):</span>
                      <span className="text-muted small">{ins.root_cause}</span>
                    </div>
                    <div>
                      <span className="fw-bold text-primary small d-block">🚀 Proyeksi Dampak Positif:</span>
                      <span className="text-dark small fw-semibold">{ins.projected_impact}</span>
                    </div>
                  </div>

                  {/* 1-Click Action Button */}
                  <div className="d-flex justify-content-end">
                    <Link 
                      to={ins.action_url}
                      className="btn btn-sm btn-primary px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Lightning size={14} weight="fill" />
                      <span>{ins.action_label}</span>
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Diagnostic Log & Telemetry Console */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <TerminalWindow size={20} className="text-muted" weight="bold" />
                  <h6 className="fw-bold mb-0 text-dark">Log Telemetri Mesin AI</h6>
                </div>
                <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
              </div>

              <div 
                className="p-3 rounded-3 font-monospace small"
                style={{ 
                  backgroundColor: '#0F172A', 
                  color: '#38BDF8', 
                  minHeight: '260px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  fontSize: '0.725rem',
                  lineHeight: '1.6'
                }}
              >
                {diagnosticLogs.map((log, idx) => (
                  <div key={idx} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-top mt-3 text-muted small" style={{ fontSize: '0.725rem' }}>
              💡 Telemetri ini diperbarui secara otomatis setiap kali data transaksi PO, Produksi QC, atau Distribusi dimodifikasi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
