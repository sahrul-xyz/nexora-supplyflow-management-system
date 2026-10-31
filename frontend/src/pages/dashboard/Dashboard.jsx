import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Sparkline } from '../../components/charts/Sparkline';
import { DonutChart } from '../../components/charts/DonutChart';
import { ForecastLineChart } from '../../components/charts/ForecastLineChart';
import { 
  Package, 
  TrendUp, 
  Clock, 
  CurrencyCircleDollar, 
  Truck, 
  WarningCircle, 
  CheckCircle, 
  Sparkle, 
  ArrowRight, 
  CaretRight,
  CheckSquare,
  Square,
  Sneaker,
  Factory,
  CaretDown,
  ArrowClockwise,
  ShieldCheck,
  Barcode
} from '@phosphor-icons/react';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forecastScenario, setForecastScenario] = useState('all'); // 'all', 'forecast', 'high', 'low'
  const [scenarioDropdown, setScenarioDropdown] = useState(false);
  const [actionDone, setActionDone] = useState([false, false, false]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/dashboard');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleAction = (idx) => {
    const updated = [...actionDone];
    updated[idx] = !updated[idx];
    setActionDone(updated);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
        <div className="text-muted small">Memuat metrik real-time SupplyFlow SCM...</div>
      </div>
    );
  }

  const { kpis, sparklines, charts, logistics, alerts, ai_insight } = data || {};

  // Formatter for Rupiah
  const formatRupiah = (num) => {
    if (!num || num === 0) return 'Rp 0';
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(1)} M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)} jt`;
    return `Rp ${Number(num).toLocaleString('id-ID')}`;
  };

  return (
    <div className="container-fluid px-0">
      {/* Real-time Indicator & Refresh Action */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }} role="status"></span>
          <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
            Data Real-Time Terhubung Database MySQL
          </span>
        </div>
        <button 
          onClick={fetchDashboard}
          disabled={refreshing}
          className="header-pill-btn py-1 px-3 border-0 bg-white shadow-sm"
          style={{ fontSize: '0.75rem' }}
          title="Klik untuk menyinkronkan data terbaru"
        >
          <ArrowClockwise size={14} className={refreshing ? 'spinner-border spinner-border-sm' : ''} />
          <span>{refreshing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. TOP METRICS ROW (4 Cards with Dynamic Real Sparklines)        */}
      {/* ============================================================== */}
      <div className="row g-3 mb-4">
        {/* Metric Card 1: Total Inventory */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-nexora p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold">Total Inventory (Stok)</span>
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '36px', height: '36px', backgroundColor: '#EFF6FF' }}
                >
                  <Package size={20} weight="duotone" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">
                  {(kpis?.total_inventory_units || 0).toLocaleString('id-ID')}
                </h3>
                <span className="badge-trend-up">
                  ↑ Aktual
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                Bahan: {(kpis?.total_raw_material_quantity || 0).toLocaleString('id-ID')} | Jadi: {(kpis?.total_finished_goods_quantity || 0).toLocaleString('id-ID')} Psg
              </div>
            </div>
            <div className="mt-3">
              <Sparkline data={sparklines?.inventory || []} color="blue" />
            </div>
          </div>
        </div>

        {/* Metric Card 2: Production Target (MTS) */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-nexora p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold">Target Produksi (MTS)</span>
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center text-success"
                  style={{ width: '36px', height: '36px', backgroundColor: '#ECFDF5' }}
                >
                  <TrendUp size={20} weight="duotone" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">
                  {(kpis?.total_target || 0).toLocaleString('id-ID')} Psg
                </h3>
                <span className="badge-trend-up">
                  {kpis?.in_production_units || 0} In-Process
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                Aktif: {kpis?.active_prod_count || 0} Batch | Selesai: {kpis?.completed_prod_count || 0}
              </div>
            </div>
            <div className="mt-3">
              <Sparkline data={sparklines?.production || []} color="green" />
            </div>
          </div>
        </div>

        {/* Metric Card 3: Quality Control Pass Rate */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-nexora p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold">Tingkat Lolos QC</span>
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center text-purple"
                  style={{ width: '36px', height: '36px', backgroundColor: '#F5F3FF', color: '#8B5CF6' }}
                >
                  <ShieldCheck size={20} weight="duotone" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">
                  {kpis?.qc_pass_rate || 100}%
                </h3>
                <span className={kpis?.qc_pass_rate >= 95 ? "badge-trend-up" : "badge-trend-down"}>
                  {kpis?.qc_reject_rate || 0}% Reject
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                Lolos: {kpis?.total_passed_qc || 0} | Reject: {kpis?.total_rejected_qc || 0} Pasang
              </div>
            </div>
            <div className="mt-3">
              <Sparkline data={sparklines?.qc || []} color="purple" dashed={true} />
            </div>
          </div>
        </div>

        {/* Metric Card 4: Total Supply Chain Value */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-nexora p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold">Valuasi Supply Chain</span>
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px', backgroundColor: '#FAF5FF', color: '#A855F7' }}
                >
                  <CurrencyCircleDollar size={20} weight="duotone" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">
                  {formatRupiah(kpis?.total_supply_chain_value)}
                </h3>
                <span className="badge-trend-up">
                  Aktif
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                PO: {formatRupiah(kpis?.total_po_cost)} | Sales: {formatRupiah(kpis?.total_sales_value)}
              </div>
            </div>
            <div className="mt-3">
              <Sparkline data={sparklines?.distribution || []} color="purple" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MIDDLE ROW: 3 Visual Analysis Cards (Donut, Forecast, QC)    */}
      {/* ============================================================== */}
      <div className="row g-3 mb-4">
        {/* Card 1: Inventory Overview (Dynamic Donut Chart) */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Inventory Overview</h6>
                <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Gudang Bahan & Jadi</span>
              </div>

              <div className="d-flex align-items-center justify-content-center py-2">
                <DonutChart 
                  data={charts?.inventory_donut || []}
                  size={160}
                  strokeWidth={22}
                  centerPrimary={
                    (kpis?.total_inventory_units >= 1000) 
                      ? `${(kpis?.total_inventory_units / 1000).toFixed(1)}k` 
                      : `${kpis?.total_inventory_units || 0}`
                  }
                  centerSecondary="Total Unit"
                />
              </div>

              {/* Dynamic Legends matching backend real data */}
              <div className="d-flex flex-column gap-2 mt-3">
                {charts?.inventory_donut?.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between small">
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: item.color }}></span>
                      <span className="text-secondary">{item.label}</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold text-dark">{item.display}</span>
                      <span className="text-muted" style={{ minWidth: '36px', textAlign: 'right' }}>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
              <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Status Gudang</span>
              <span className="badge-trend-up">Sinkron Real-time</span>
            </div>
          </div>
        </div>

        {/* Card 2: Demand Forecast & Production Trends (Multi-line SVG Chart) */}
        <div className="col-12 col-xl-5">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Perencanaan & Tren Produksi</h6>
                  <small className="text-muted" style={{ fontSize: '0.725rem' }}>Kurva target aktual vs perkiraan batch MTS</small>
                </div>
                <div className="d-flex gap-2">
                  <div className="dropdown">
                    <button 
                      className="header-pill-btn py-1 px-2 small border" 
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setScenarioDropdown(!scenarioDropdown)}
                    >
                      <span className="text-capitalize">{forecastScenario === 'all' ? 'Semua Skenario' : `Skenario: ${forecastScenario}`}</span>
                      <CaretDown size={10} />
                    </button>
                    {scenarioDropdown && (
                      <div className="dropdown-menu show shadow-sm border-0 position-absolute p-1 end-0 mt-1" style={{ zIndex: 10 }}>
                        <button className="dropdown-item small rounded-2 py-1" onClick={() => { setForecastScenario('all'); setScenarioDropdown(false); }}>Semua Skenario</button>
                        <button className="dropdown-item small rounded-2 py-1" onClick={() => { setForecastScenario('forecast'); setScenarioDropdown(false); }}>Target Saja</button>
                        <button className="dropdown-item small rounded-2 py-1 text-success" onClick={() => { setForecastScenario('high'); setScenarioDropdown(false); }}>Skenario Tinggi (+15%)</button>
                        <button className="dropdown-item small rounded-2 py-1 text-danger" onClick={() => { setForecastScenario('low'); setScenarioDropdown(false); }}>Skenario Rendah (-15%)</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Line Chart */}
              <ForecastLineChart 
                data={charts?.forecast_timeline || []} 
                scenario={forecastScenario}
                height={165} 
              />
            </div>
          </div>
        </div>

        {/* Card 3: Quality Control & Delivery Performance (Gauge Donut) */}
        <div className="col-12 col-xl-3">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Performa Kualitas (QC)</h6>
                <span className="badge-clean badge-completed small" style={{ fontSize: '0.675rem' }}>Standar Mutu</span>
              </div>

              <div className="d-flex align-items-center justify-content-center py-2">
                <DonutChart 
                  data={charts?.qc_donut || []}
                  size={155}
                  strokeWidth={20}
                  centerPrimary={`${kpis?.qc_pass_rate || 100}%`}
                  centerSecondary="Lolos QC"
                />
              </div>

              {/* Dynamic Legends matching real QC numbers */}
              <div className="d-flex flex-column gap-2 mt-3">
                {charts?.qc_donut?.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between small">
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: item.color }}></span>
                      <span className="text-secondary">{item.label}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark">{item.display}</span>
                      <span className="text-muted" style={{ minWidth: '32px', textAlign: 'right' }}>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
              <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Total Diinspeksi</span>
              <span className="fw-bold text-dark small">{kpis?.total_actual || 0} Pasang</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LOWER MIDDLE ROW: Logistics Snapshot, Defect Progress, Cost */}
      {/* ============================================================== */}
      <div className="row g-3 mb-4">
        {/* Card 1: Logistics Snapshot */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h6 className="fw-bold mb-3 text-dark">Logistics Snapshot (Distribusi)</h6>

              {/* 4 Mini Stat Boxes matching real DB counts */}
              <div className="row g-2 mb-3">
                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>In Transit</div>
                    <div className="fw-bold text-dark fs-6 my-1">
                      {logistics?.in_transit || 0}
                    </div>
                    <span className="badge bg-white text-secondary border small px-1" style={{ fontSize: '0.6rem' }}>Resi Aktif</span>
                  </div>
                </div>

                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>On-Time</div>
                    <div className="fw-bold text-success fs-6 my-1">
                      {logistics?.on_time_rate || 100}%
                    </div>
                    <span className="badge bg-white text-success border small px-1" style={{ fontSize: '0.6rem' }}>Tepat</span>
                  </div>
                </div>

                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>Diproses</div>
                    <div className="fw-bold text-primary fs-6 my-1">
                      {logistics?.processing || 0}
                    </div>
                    <span className="badge bg-white text-primary border small px-1" style={{ fontSize: '0.6rem' }}>Packing</span>
                  </div>
                </div>

                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>Terkirim</div>
                    <div className="fw-bold text-dark fs-6 my-1">
                      {logistics?.delivered || 0}
                    </div>
                    <span className="badge bg-white text-secondary border small px-1" style={{ fontSize: '0.6rem' }}>Selesai</span>
                  </div>
                </div>
              </div>

              {/* Visual Logistics Graphic */}
              <div 
                className="rounded-3 p-3 text-center position-relative overflow-hidden mb-2"
                style={{ 
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%)',
                  height: '110px'
                }}
              >
                <div className="position-absolute top-50 start-50 translate-middle w-100 opacity-25">
                  <svg viewBox="0 0 300 90" className="w-100 h-100">
                    <circle cx="40" cy="45" r="4" fill="#3B82F6" />
                    <circle cx="120" cy="30" r="4" fill="#8B5CF6" />
                    <circle cx="200" cy="60" r="4" fill="#10B981" />
                    <circle cx="260" cy="40" r="4" fill="#F59E0B" />
                    <path d="M 40,45 Q 80,10 120,30 T 200,60 T 260,40" fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="3,3" />
                  </svg>
                </div>
                <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center h-100">
                  <Truck size={28} className="text-primary mb-1" weight="duotone" />
                  <span className="small fw-semibold text-dark">
                    {logistics?.recent_shipments?.length > 0 
                      ? `${logistics.recent_shipments.length} Pengiriman Terdaftar` 
                      : 'Distribusi Pesanan Mitra'}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {logistics?.in_transit > 0 
                      ? `${logistics.in_transit} pesanan sedang dalam perjalanan ekspedisi` 
                      : 'Semua pesanan mitra telah sampai atau sedang dipacking'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-top">
              <Link to="/partner-orders" className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                <span>Kelola semua pengiriman</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Top Defect / Delay Reasons (Real Defect Progress Bars) */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Analisis Reject & Cacat Produksi</h6>
                <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Hasil QC Lapangan</span>
              </div>

              {/* Dynamic Progress Bars based on real QC data */}
              <div className="d-flex flex-column gap-3">
                {charts?.defect_bars?.map((bar, idx) => (
                  <div key={idx}>
                    <div className="d-flex align-items-center justify-content-between small mb-1">
                      <span className="text-secondary text-truncate" style={{ maxWidth: '240px' }}>
                        {bar.label}
                      </span>
                      <span className="fw-bold text-dark">{bar.rate}%</span>
                    </div>
                    <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${Math.max(2, bar.rate)}%`, 
                          backgroundColor: bar.color || '#6366F1', 
                          borderRadius: '4px',
                          transition: 'width 0.6s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-top mt-3">
              <Link to="/production-orders" className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                <span>Rincian riwayat order produksi & QC</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Supply Chain Cost Breakdown (Real Calculated Currency) */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Alokasi Biaya & Valuasi SCM</h6>
                <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Total Nilai Finansial</span>
              </div>

              <div className="d-flex align-items-center justify-content-center py-2">
                <DonutChart 
                  data={charts?.cost_donut || []}
                  size={155}
                  strokeWidth={20}
                  centerPrimary={formatRupiah(kpis?.total_supply_chain_value)}
                  centerSecondary="Total SCM"
                />
              </div>

              {/* Real Legend with percentages and formatted currency */}
              <div className="d-flex flex-column gap-2 mt-3">
                {charts?.cost_donut?.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between small">
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: item.color }}></span>
                      <span className="text-secondary text-truncate" style={{ maxWidth: '170px' }}>{item.label}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark">{item.display}</span>
                      <span className="text-muted" style={{ minWidth: '32px', textAlign: 'right' }}>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
              <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Akumulasi Real-Time</span>
              <span className="badge-trend-up">Sinkron PO & Sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM ROW: Alerts, AI Insights, Recommended Actions        */}
      {/* ============================================================== */}
      <div className="row g-3">
        {/* Alerts & Notifications (Real alerts from database) */}
        <div className="col-12 col-xl-5">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Notifikasi & Peringatan Ambang Batas</h6>
                <span className="badge bg-light text-secondary border small">{alerts?.length || 0} Aktif</span>
              </div>

              <div className="d-flex flex-column gap-2">
                {alerts?.length === 0 ? (
                  <div className="p-3 bg-light rounded-3 text-center text-muted small py-4">
                    <CheckCircle size={28} className="text-success mb-2 d-block mx-auto" />
                    Kondisi aman: Tidak ada peringatan batas stok atau PO tertunda saat ini.
                  </div>
                ) : (
                  alerts?.map((alt, idx) => (
                    <div key={idx} className="p-3 rounded-3 border border-subtle bg-white hover-shadow transition">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className={`badge-clean ${alt.priority === 'High' ? 'badge-danger' : alt.priority === 'Medium' ? 'badge-warning-low' : 'badge-planned'} py-1 px-2`} style={{ fontSize: '0.675rem' }}>
                          Prioritas {alt.priority}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>{alt.timestamp}</span>
                      </div>
                      <h6 className="fw-bold mb-1 fs-6 text-dark">{alt.title}</h6>
                      <p className="text-muted small mb-2">{alt.description}</p>
                      {alt.action_url && (
                        <Link to={alt.action_url} className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                          <span>{alt.action_label}</span>
                          <ArrowRight size={13} weight="bold" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-top mt-3">
              <Link to="/inventory" className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                <span>Periksa Gudang Bahan Baku & Barang Jadi</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* AI Insights Card with Glowing Radial Aura */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora ai-insights-card p-4 h-100 d-flex flex-column justify-content-between position-relative">
            <div className="ai-insights-aura"></div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
                >
                  <Sparkle size={18} weight="fill" />
                </div>
                <h6 className="fw-bold mb-0 text-dark">AI Insights Engine</h6>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold text-dark fs-6 mb-2">
                  {ai_insight?.title || 'Analisis Sistem Manufaktur'}
                </h6>
                <p className="text-secondary small lh-base mb-0">
                  {ai_insight?.text || 'Sistem memantau kondisi bahan baku dan pesanan secara terus menerus.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-3 border border-indigo-subtle shadow-xs mb-3">
                <div className="d-flex align-items-center gap-2 text-indigo fw-bold small mb-1">
                  <Factory size={16} />
                  <span>Kondisi Kapasitas MTS</span>
                </div>
                <div className="small text-muted">
                  Beban produksi saat ini berada pada {kpis?.in_production_units || 0} unit pasang dengan rasio kelulusan QC {kpis?.qc_pass_rate || 100}%.
                </div>
              </div>
            </div>

            <div>
              <button 
                onClick={fetchDashboard}
                className="btn btn-outline-primary btn-sm rounded-pill w-100 justify-content-center py-2"
                style={{ borderColor: '#8B5CF6', color: '#6D28D9' }}
              >
                <span>Evaluasi Ulang Parameter Sistem</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Actions Checklist */}
        <div className="col-12 col-xl-3">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Tindakan Rekomendasi</h6>
                <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Checklist SCM</span>
              </div>

              <div className="d-flex flex-column gap-2">
                <div 
                  className="p-3 rounded-3 border border-subtle bg-light d-flex align-items-center justify-content-between cursor-pointer"
                  onClick={() => toggleAction(0)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {actionDone[0] ? (
                      <CheckSquare size={20} className="text-primary" weight="fill" />
                    ) : (
                      <Square size={20} className="text-muted" />
                    )}
                    <span className={`small ${actionDone[0] ? 'text-decoration-line-through text-muted' : 'fw-semibold text-dark'}`}>
                      Verifikasi safety stock bahan baku
                    </span>
                  </div>
                  <CaretRight size={14} className="text-muted" />
                </div>

                <div 
                  className="p-3 rounded-3 border border-subtle bg-light d-flex align-items-center justify-content-between cursor-pointer"
                  onClick={() => toggleAction(1)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {actionDone[1] ? (
                      <CheckSquare size={20} className="text-primary" weight="fill" />
                    ) : (
                      <Square size={20} className="text-muted" />
                    )}
                    <span className={`small ${actionDone[1] ? 'text-decoration-line-through text-muted' : 'fw-semibold text-dark'}`}>
                      Jadwalkan batch produksi sepatu baru
                    </span>
                  </div>
                  <CaretRight size={14} className="text-muted" />
                </div>

                <div 
                  className="p-3 rounded-3 border border-subtle bg-light d-flex align-items-center justify-content-between cursor-pointer"
                  onClick={() => toggleAction(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {actionDone[2] ? (
                      <CheckSquare size={20} className="text-primary" weight="fill" />
                    ) : (
                      <Square size={20} className="text-muted" />
                    )}
                    <span className={`small ${actionDone[2] ? 'text-decoration-line-through text-muted' : 'fw-semibold text-dark'}`}>
                      Kirim pesanan mitra & input resi
                    </span>
                  </div>
                  <CaretRight size={14} className="text-muted" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-top mt-3">
              <span className="small text-muted d-block text-center" style={{ fontSize: '0.725rem' }}>
                Centang tindakan setelah selesai dijalankan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
