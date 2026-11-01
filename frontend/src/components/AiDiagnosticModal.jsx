import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
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
  ChartLineUp
} from '@phosphor-icons/react';

export const AiDiagnosticModal = ({ show, onClose }) => {
  const [scanning, setScanning] = useState(true);
  const [scanStep, setScanStep] = useState(0);
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const scanSteps = [
    'Memindai stok 10 bahan baku & batas minimum safety stock...',
    'Menganalisis pola reject & kualitas QC pada batch produksi...',
    'Mengevaluasi SLA ekspedisi logistik & pesanan mitra...',
    'Menghitung efisiensi biaya pengadaan & valuasi pergudangan...',
    'Menghasilkan rekomendasi AI prediktif...'
  ];

  useEffect(() => {
    if (!show) return;
    let isMounted = true;
    let intervalId = null;
    let timeoutId = null;

    const run = async () => {
      setScanning(true);
      setScanStep(0);

      intervalId = setInterval(() => {
        setScanStep((prev) => {
          if (prev < scanSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 400);

      try {
        const res = await api.get('/ai-insights');
        timeoutId = setTimeout(() => {
          if (intervalId) clearInterval(intervalId);
          if (isMounted) {
            if (res.data?.success) {
              setData(res.data.data);
            }
            setScanning(false);
          }
        }, 1600);
      } catch (err) {
        if (intervalId) clearInterval(intervalId);
        if (isMounted) {
          console.error(err);
          setScanning(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [show]);

  if (!show) return null;

  const runDiagnostic = async () => {
    setScanning(true);
    setScanStep(0);

    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < scanSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 400);

    try {
      const res = await api.get('/ai-insights');
      setTimeout(() => {
        clearInterval(interval);
        if (res.data?.success) {
          setData(res.data.data);
        }
        setScanning(false);
      }, 1600);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const filteredInsights = data?.insights?.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  }) || [];

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1075 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '820px' }}>
        <div className="modal-content card-nexora border-0 shadow-float overflow-hidden" style={{ borderRadius: '24px' }}>
          {/* Header with Glowing AI Aura */}
          <div 
            className="modal-header px-4 pt-4 pb-3 border-bottom position-relative"
            style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)' 
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
                style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
              >
                <Sparkle size={20} weight="fill" />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">Nexora AI Insights & Diagnostic Engine</h5>
                <small className="text-muted">Analisis algoritmik prediktif rantai pasok (MTS Sepatu & Sandal)</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} disabled={scanning}></button>
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Scanning State Animation */}
            {scanning ? (
              <div className="text-center py-5">
                <div className="position-relative d-inline-block mb-4">
                  <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} role="status"></div>
                  <Sparkle 
                    size={24} 
                    weight="fill" 
                    className="position-absolute top-50 start-50 translate-middle text-primary animate-pulse" 
                  />
                </div>
                <h6 className="fw-bold text-dark mb-2">Menjalankan Diagnostik AI Multi-Pilar SCM...</h6>
                <p className="text-muted small mb-3" style={{ minHeight: '24px' }}>
                  {scanSteps[scanStep]}
                </p>
                <div className="progress mx-auto" style={{ height: '6px', maxWidth: '320px', borderRadius: '3px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                    style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%`, transition: 'width 0.4s ease' }}
                  ></div>
                </div>
              </div>
            ) : (
              <div>
                {/* Health Score Overview Banner */}
                <div className="card-nexora p-4 mb-4 border border-indigo-subtle bg-light">
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-4 d-flex flex-column align-items-center justify-content-center text-white p-3 shadow-sm"
                        style={{ 
                          width: '84px', 
                          height: '84px', 
                          backgroundColor: getScoreColor(data?.health_score || 85),
                          flexShrink: 0
                        }}
                      >
                        <span className="fw-extrabold fs-3 lh-1">{data?.health_score || 85}</span>
                        <span style={{ fontSize: '0.65rem' }}>/ 100</span>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 fw-bold" style={{ fontSize: '0.725rem' }}>
                            Status: {data?.health_status || 'Optimal'}
                          </span>
                          <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                            Dievaluasi: {data?.evaluated_at}
                          </span>
                        </div>
                        <h5 className="fw-bold text-dark mb-1">Indeks Kesehatan Rantai Pasok (SCM Health Score)</h5>
                        <p className="text-muted small mb-0">
                          Hasil evaluasi ketersediaan bahan, kepatuhan mutu QC, pemenuhan PO, dan kelancaran distribusi mitra.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={runDiagnostic}
                      className="header-pill-btn py-2 px-3 align-self-start align-self-md-center flex-shrink-0"
                      title="Jalankan ulang pemindaian AI"
                    >
                      <ArrowClockwise size={15} />
                      <span className="small">Re-Scan Sistem</span>
                    </button>
                  </div>

                  {/* Sub-scores Progress */}
                  <div className="row g-3 pt-3 mt-2 border-top">
                    <div className="col-6 col-md-3">
                      <div className="text-muted small mb-1" style={{ fontSize: '0.725rem' }}>Bahan Baku (Gudang)</div>
                      <div className="d-flex align-items-center justify-content-between small fw-bold mb-1">
                        <span>{data?.sub_scores?.inventory || 28} / 30</span>
                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>Aman</span>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div className="progress-bar bg-primary" style={{ width: `${((data?.sub_scores?.inventory || 28) / 30) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="text-muted small mb-1" style={{ fontSize: '0.725rem' }}>Kualitas QC Manufaktur</div>
                      <div className="d-flex align-items-center justify-content-between small fw-bold mb-1">
                        <span>{data?.sub_scores?.quality || 29} / 30</span>
                        <span className="text-success" style={{ fontSize: '0.65rem' }}>{data?.summary_kpis?.qc_pass_rate}</span>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div className="progress-bar bg-success" style={{ width: `${((data?.sub_scores?.quality || 29) / 30) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="text-muted small mb-1" style={{ fontSize: '0.725rem' }}>Pengadaan Supplier</div>
                      <div className="d-flex align-items-center justify-content-between small fw-bold mb-1">
                        <span>{data?.sub_scores?.procurement || 18} / 20</span>
                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>Aktif</span>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div className="progress-bar bg-purple" style={{ backgroundColor: '#8B5CF6', width: `${((data?.sub_scores?.procurement || 18) / 20) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="text-muted small mb-1" style={{ fontSize: '0.725rem' }}>Logistik & Distribusi</div>
                      <div className="d-flex align-items-center justify-content-between small fw-bold mb-1">
                        <span>{data?.sub_scores?.logistics || 18} / 20</span>
                        <span className="text-info" style={{ fontSize: '0.65rem' }}>SLA 95%+</span>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div className="progress-bar bg-info" style={{ width: `${((data?.sub_scores?.logistics || 18) / 20) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold text-dark mb-0">Temuan Analisis & Tindakan Rekomendasi</h6>
                  <div className="d-flex gap-1">
                    <button 
                      className={`btn btn-sm py-1 px-3 rounded-pill ${activeCategory === 'all' ? 'btn-primary' : 'btn-light border'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setActiveCategory('all')}
                    >
                      Semua ({data?.insights?.length || 0})
                    </button>
                    <button 
                      className={`btn btn-sm py-1 px-3 rounded-pill ${activeCategory === 'inventory' ? 'btn-primary' : 'btn-light border'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setActiveCategory('inventory')}
                    >
                      Gudang
                    </button>
                    <button 
                      className={`btn btn-sm py-1 px-3 rounded-pill ${activeCategory === 'quality' ? 'btn-primary' : 'btn-light border'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setActiveCategory('quality')}
                    >
                      Kualitas QC
                    </button>
                    <button 
                      className={`btn btn-sm py-1 px-3 rounded-pill ${activeCategory === 'logistics' ? 'btn-primary' : 'btn-light border'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setActiveCategory('logistics')}
                    >
                      Logistik
                    </button>
                  </div>
                </div>

                {/* Insight Action Cards */}
                <div className="d-flex flex-column gap-3">
                  {filteredInsights.map((ins) => (
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
                          onClick={onClose}
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
            )}
          </div>

          <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between">
            <span className="text-muted small" style={{ fontSize: '0.725rem' }}>
              💡 Mesin diagnostik menganalisis 14 tabel database relasional SupplyFlow SCM secara otomatis.
            </span>
            <button type="button" className="btn btn-light border btn-sm" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
