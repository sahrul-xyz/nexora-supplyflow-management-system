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
  CaretDown
} from '@phosphor-icons/react';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDone, setActionDone] = useState([true, false, false, false]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (idx) => {
    const updated = [...actionDone];
    updated[idx] = !updated[idx];
    setActionDone(updated);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const { procurement, production, inventory, distribution, recent } = data || {};

  const totalRawQty = inventory?.total_raw_material_quantity || 21100;
  const totalFinishedQty = inventory?.total_finished_goods_quantity || 688;
  const totalInventoryUnits = totalRawQty + totalFinishedQty;

  const rawPercent = Math.round((totalRawQty / (totalInventoryUnits || 1)) * 100);
  const finishedPercent = 100 - rawPercent;

  // Donut chart data for Inventory Overview
  const inventoryDonutData = [
    { label: 'Raw Materials (Bahan)', value: totalRawQty, color: '#2563EB' },
    { label: 'Finished Goods (Sepatu)', value: totalFinishedQty * 10, color: '#8B5CF6' },
    { label: 'In-Production (MTS)', value: 1500, color: '#10B981' },
    { label: 'Safety Stock Alert', value: 800, color: '#F59E0B' },
  ];

  // Donut chart for QC Performance
  const passRate = production?.qc_pass_rate || 97.1;
  const rejectRate = (100 - passRate).toFixed(1);

  const qcDonutData = [
    { label: 'Lolos QC', value: passRate, color: '#10B981' },
    { label: 'Reject QC', value: parseFloat(rejectRate), color: '#EF4444' },
    { label: 'Pending QC', value: 2.3, color: '#3B82F6' },
  ];

  // Donut chart for Supply Chain Cost Breakdown
  const costDonutData = [
    { label: 'Pengadaan Bahan', value: 45, color: '#2563EB' },
    { label: 'Produksi & QC', value: 28, color: '#10B981' },
    { label: 'Pergudangan', value: 15, color: '#8B5CF6' },
    { label: 'Logistik & Distribusi', value: 12, color: '#F59E0B' },
  ];

  return (
    <div className="container-fluid px-0">
      {/* ============================================================== */}
      {/* 1. TOP METRICS ROW (4 Cards with Sparklines matching Reference) */}
      {/* ============================================================== */}
      <div className="row g-3 mb-4">
        {/* Metric Card 1: Total Inventory */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-nexora p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold">Total Inventory</span>
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '36px', height: '36px', backgroundColor: '#EFF6FF' }}
                >
                  <Package size={20} weight="duotone" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">
                  {totalInventoryUnits.toLocaleString('id-ID')}
                </h3>
                <span className="badge-trend-up">
                  ↑ 8.4%
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                vs minggu lalu (Bahan + Jadi)
              </div>
            </div>
            <div className="mt-3">
              <Sparkline color="blue" />
            </div>
          </div>
        </div>

        {/* Metric Card 2: Demand / Target Produksi */}
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
                  {production?.total_target?.toLocaleString('id-ID') || '1,850'} Psg
                </h3>
                <span className="badge-trend-up">
                  ↑ 12.7%
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                {production?.active_orders || 2} Order Produksi Aktif
              </div>
            </div>
            <div className="mt-3">
              <Sparkline color="green" />
            </div>
          </div>
        </div>

        {/* Metric Card 3: Quality Control / On-Time */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-nexora p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold">Tingkat Lolos QC</span>
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center text-purple"
                  style={{ width: '36px', height: '36px', backgroundColor: '#F5F3FF', color: '#8B5CF6' }}
                >
                  <Clock size={20} weight="duotone" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">
                  {passRate}%
                </h3>
                <span className="badge-trend-down">
                  ↓ 0.9pp
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                Lolos: {production?.total_passed_qc || 97} | Reject: {production?.total_rejected_qc || 3}
              </div>
            </div>
            <div className="mt-3">
              <Sparkline color="purple" dashed={true} />
            </div>
          </div>
        </div>

        {/* Metric Card 4: Total Supply Chain Value */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-nexora p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold">Distribusi Pesanan</span>
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px', backgroundColor: '#FAF5FF', color: '#A855F7' }}
                >
                  <CurrencyCircleDollar size={20} weight="duotone" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-dark">
                  {(distribution?.processing_count || 0) + (distribution?.shipped_count || 0) + (distribution?.delivered_count || 0)} Order
                </h3>
                <span className="badge-trend-up">
                  ↑ 4.6%
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                Kirim: {distribution?.shipped_count || 1} | Proses: {distribution?.processing_count || 1}
              </div>
            </div>
            <div className="mt-3">
              <Sparkline color="purple" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MIDDLE ROW: 3 Visual Analysis Cards (Donut, Forecast, Gauge) */}
      {/* ============================================================== */}
      <div className="row g-3 mb-4">
        {/* Card 1: Inventory Overview (Donut Chart) */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Inventory Overview</h6>
                <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Gudang Bahan & Jadi</span>
              </div>

              <div className="d-flex align-items-center justify-content-center py-2">
                <DonutChart 
                  data={inventoryDonutData}
                  size={160}
                  strokeWidth={22}
                  centerPrimary={`${(totalInventoryUnits / 1000).toFixed(1)}K`}
                  centerSecondary="Total Unit"
                />
              </div>

              {/* Legends with values and percentage matching reference */}
              <div className="d-flex flex-column gap-2 mt-3">
                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#2563EB' }}></span>
                    <span className="text-secondary">Bahan Baku (Gudang)</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">{totalRawQty.toLocaleString('id-ID')} m/u</span>
                    <span className="text-muted" style={{ minWidth: '32px', textAlign: 'right' }}>65%</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#8B5CF6' }}></span>
                    <span className="text-secondary">Barang Jadi (Sepatu)</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">{totalFinishedQty} Psg</span>
                    <span className="text-muted" style={{ minWidth: '32px', textAlign: 'right' }}>22%</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#10B981' }}></span>
                    <span className="text-secondary">Sedang Diproduksi</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">1,500 Psg</span>
                    <span className="text-muted" style={{ minWidth: '32px', textAlign: 'right' }}>10%</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#F59E0B' }}></span>
                    <span className="text-secondary">Safety Stock Alert</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">800 Unit</span>
                    <span className="text-muted" style={{ minWidth: '32px', textAlign: 'right' }}>3%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
              <span className="text-muted small" style={{ fontSize: '0.725rem' }}>vs minggu lalu</span>
              <span className="badge-trend-up">↑ 8.4%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Demand Forecast & Production Trends (Multi-line SVG Chart) */}
        <div className="col-12 col-xl-5">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Perencanaan Produksi (Next 8 Weeks)</h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-light border py-1 px-2 small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                    <span>Forecast</span>
                    <CaretDown size={10} />
                  </button>
                  <button className="btn btn-sm btn-light border py-1 px-2 small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                    <span>Base MTS</span>
                    <CaretDown size={10} />
                  </button>
                </div>
              </div>

              {/* Line Chart */}
              <ForecastLineChart height={165} />
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
                  data={qcDonutData}
                  size={155}
                  strokeWidth={20}
                  centerPrimary={`${passRate}%`}
                  centerSecondary="Lolos QC"
                />
              </div>

              {/* Legend matching reference */}
              <div className="d-flex flex-column gap-2 mt-3">
                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#10B981' }}></span>
                    <span className="text-secondary">Lolos QC (Gudang)</span>
                  </div>
                  <span className="fw-bold text-dark">{passRate}%</span>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#EF4444' }}></span>
                    <span className="text-secondary">Reject QC (Cacat)</span>
                  </div>
                  <span className="fw-bold text-dark">{rejectRate}%</span>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#3B82F6' }}></span>
                    <span className="text-secondary">Pending Inspeksi</span>
                  </div>
                  <span className="fw-bold text-dark">2.3%</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
              <span className="text-muted small" style={{ fontSize: '0.725rem' }}>vs minggu lalu</span>
              <span className="badge-trend-down">↓ 0.9pp</span>
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

              {/* 4 Mini Stat Boxes matching reference */}
              <div className="row g-2 mb-3">
                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>In Transit</div>
                    <div className="fw-bold text-dark fs-6 my-1">
                      {distribution?.shipped_count || 1}
                    </div>
                    <span className="badge bg-white text-secondary border small px-1" style={{ fontSize: '0.6rem' }}>Resi Aktif</span>
                  </div>
                </div>

                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>On-Time</div>
                    <div className="fw-bold text-success fs-6 my-1">
                      95.2%
                    </div>
                    <span className="badge bg-white text-success border small px-1" style={{ fontSize: '0.6rem' }}>Tepat</span>
                  </div>
                </div>

                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>Diproses</div>
                    <div className="fw-bold text-primary fs-6 my-1">
                      {distribution?.processing_count || 1}
                    </div>
                    <span className="badge bg-white text-primary border small px-1" style={{ fontSize: '0.6rem' }}>Packing</span>
                  </div>
                </div>

                <div className="col-3">
                  <div className="p-2 rounded-3 bg-light text-center border border-subtle">
                    <div className="text-muted small" style={{ fontSize: '0.675rem' }}>Terkirim</div>
                    <div className="fw-bold text-dark fs-6 my-1">
                      {distribution?.delivered_count || 1}
                    </div>
                    <span className="badge bg-white text-secondary border small px-1" style={{ fontSize: '0.6rem' }}>Selesai</span>
                  </div>
                </div>
              </div>

              {/* Visual Logistics Map Graphic */}
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
                  <span className="small fw-semibold text-dark">Rute Distribusi Jabodetabek & Surabaya</span>
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>Tracking ekspedisi SiCepat & JNE</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-top">
              <Link to="/partner-orders" className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                <span>View all shipments</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Top Defect / Delay Reasons */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h6 className="fw-bold mb-3 text-dark">Top Defect & Delay Reasons (QC)</h6>

              {/* Progress Bar 1: Stitching */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between small mb-1">
                  <span className="text-secondary">Cacat Jahitan (Stitching Defect)</span>
                  <span className="fw-bold text-dark">38%</span>
                </div>
                <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar" style={{ width: '38%', backgroundColor: '#6366F1', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Progress Bar 2: Adhesive */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between small mb-1">
                  <span className="text-secondary">Rekatan Lem Sol (Adhesive Bonding)</span>
                  <span className="fw-bold text-dark">26%</span>
                </div>
                <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar" style={{ width: '26%', backgroundColor: '#3B82F6', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Progress Bar 3: Pattern Cutting */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between small mb-1">
                  <span className="text-secondary">Pemotongan Pola (Pattern Cutting)</span>
                  <span className="fw-bold text-dark">18%</span>
                </div>
                <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar" style={{ width: '18%', backgroundColor: '#0EA5E9', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Progress Bar 4: Material Flaws */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between small mb-1">
                  <span className="text-secondary">Cacat Tekstur Bahan Baku</span>
                  <span className="fw-bold text-dark">12%</span>
                </div>
                <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar" style={{ width: '12%', backgroundColor: '#10B981', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Progress Bar 5: Packaging */}
              <div className="mb-2">
                <div className="d-flex align-items-center justify-content-between small mb-1">
                  <span className="text-secondary">Finishing & Packaging Box</span>
                  <span className="fw-bold text-dark">6%</span>
                </div>
                <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
                  <div className="progress-bar" style={{ width: '6%', backgroundColor: '#94A3B8', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-top">
              <Link to="/production-orders" className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                <span>View delay & defect analytics</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Supply Chain Cost Breakdown */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Supply Chain Cost Breakdown</h6>
                <span className="text-muted small" style={{ fontSize: '0.725rem' }}>Alokasi Biaya</span>
              </div>

              <div className="d-flex align-items-center justify-content-center py-2">
                <DonutChart 
                  data={costDonutData}
                  size={155}
                  strokeWidth={20}
                  centerPrimary="Rp 28.7M"
                  centerSecondary="Total Biaya"
                />
              </div>

              {/* Legend with percentages matching reference */}
              <div className="d-flex flex-column gap-2 mt-3">
                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#2563EB' }}></span>
                    <span className="text-secondary">Pengadaan Bahan Baku</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">Rp 12.8M</span>
                    <span className="text-muted" style={{ minWidth: '28px', textAlign: 'right' }}>45%</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#10B981' }}></span>
                    <span className="text-secondary">Produksi & QC</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">Rp 8.0M</span>
                    <span className="text-muted" style={{ minWidth: '28px', textAlign: 'right' }}>28%</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#8B5CF6' }}></span>
                    <span className="text-secondary">Pergudangan & Stok</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">Rp 4.3M</span>
                    <span className="text-muted" style={{ minWidth: '28px', textAlign: 'right' }}>15%</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#F59E0B' }}></span>
                    <span className="text-secondary">Distribusi & Ekspedisi</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-dark">Rp 3.6M</span>
                    <span className="text-muted" style={{ minWidth: '28px', textAlign: 'right' }}>12%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
              <span className="text-muted small" style={{ fontSize: '0.725rem' }}>vs bulan lalu</span>
              <span className="badge-trend-up">↓ 4.6%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM ROW: Alerts, AI Insights, Recommended Actions */}
      {/* ============================================================== */}
      <div className="row g-3">
        {/* Card 1: Alerts & Notifications */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Alerts & Notifications</h6>
                <Link to="/inventory" className="small text-primary text-decoration-none fw-bold" style={{ fontSize: '0.75rem' }}>
                  View all alerts →
                </Link>
              </div>

              {/* Alert Items matching reference */}
              <div className="d-flex flex-column gap-2">
                {/* High Alert */}
                <div className="p-3 rounded-3 bg-light border border-subtle d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-start gap-2">
                    <span className="badge bg-danger text-white rounded-pill small px-2 mt-1" style={{ fontSize: '0.65rem' }}>High</span>
                    <div>
                      <div className="fw-bold small text-dark">Stok Bahan RM-TLI-01 Rendah</div>
                      <div className="text-muted" style={{ fontSize: '0.725rem' }}>Tali Anyam Webbing tersisa 25 m (Min: 80 m)</div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Oct 31, 2026 • 19:25 WIB</div>
                    </div>
                  </div>
                  <CaretRight size={14} className="text-muted flex-shrink-0" />
                </div>

                {/* Medium Alert */}
                <div className="p-3 rounded-3 bg-light border border-subtle d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-start gap-2">
                    <span className="badge bg-warning text-dark rounded-pill small px-2 mt-1" style={{ fontSize: '0.65rem' }}>Medium</span>
                    <div>
                      <div className="fw-bold small text-dark">Varian Sepatu Menipis</div>
                      <div className="text-muted" style={{ fontSize: '0.725rem' }}>SNK-001-WHT-42 sisa 5 pasang di gudang jadi</div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Oct 31, 2026 • 17:15 WIB</div>
                    </div>
                  </div>
                  <CaretRight size={14} className="text-muted flex-shrink-0" />
                </div>

                {/* Low Alert */}
                <div className="p-3 rounded-3 bg-light border border-subtle d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-start gap-2">
                    <span className="badge bg-info text-white rounded-pill small px-2 mt-1" style={{ fontSize: '0.65rem' }}>Low</span>
                    <div>
                      <div className="fw-bold small text-dark">Pesanan Mitra Siap Kirim</div>
                      <div className="text-muted" style={{ fontSize: '0.725rem' }}>ORD-202610-003 menunggu input resi pengiriman</div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Oct 31, 2026 • 15:40 WIB</div>
                    </div>
                  </div>
                  <CaretRight size={14} className="text-muted flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: AI Insights (Glowing gradient card matching reference) */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora ai-insights-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="ai-insights-aura"></div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)' }}
                >
                  <Sparkle size={16} weight="fill" />
                </div>
                <h6 className="fw-bold mb-0 text-dark">AI Supply Chain Insights</h6>
              </div>

              <p className="text-dark fw-semibold small mb-3 lh-base">
                Konsolidasikan pengadaan bahan baku Kulit Sintetis dan Sol Karet dari supplier Bandung untuk menghemat biaya pengiriman sebesar <strong>~Rp 4.5M</strong> menjelang lonjakan pesanan bulan depan.
              </p>

              <div className="p-3 bg-white rounded-3 border border-indigo-subtle shadow-sm mb-3">
                <div className="small fw-bold text-primary mb-1">Rekomendasi Otomasi:</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  Sistem mendeteksi kenaikan Make to Stock sepatu sneaker sebesar 22%. Buat Purchase Order terjadwal untuk mengunci harga bahan baku.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/purchase-orders/create" className="btn btn-primary btn-sm w-100 justify-content-center">
                <span>Buat Purchase Order Rekomendasi</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Recommended Actions (Interactive Checklist matching reference) */}
        <div className="col-12 col-xl-4">
          <div className="card-nexora p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-dark">Recommended Actions</h6>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>{actionDone.filter(Boolean).length}/4 Selesai</span>
              </div>

              <div className="d-flex flex-column gap-2">
                {/* Action 1 */}
                <div 
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${actionDone[0] ? 'bg-light border-subtle' : 'bg-white border-subtle'}`}
                  onClick={() => toggleAction(0)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {actionDone[0] ? (
                      <CheckSquare size={18} weight="fill" className="text-primary flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-secondary flex-shrink-0" />
                    )}
                    <span className={`small ${actionDone[0] ? 'text-decoration-line-through text-muted' : 'text-dark fw-semibold'}`}>
                      Rencanakan produksi Make to Stock batch November
                    </span>
                  </div>
                  <CaretRight size={14} className="text-muted flex-shrink-0" />
                </div>

                {/* Action 2 */}
                <div 
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${actionDone[1] ? 'bg-light border-subtle' : 'bg-white border-subtle'}`}
                  onClick={() => toggleAction(1)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {actionDone[1] ? (
                      <CheckSquare size={18} weight="fill" className="text-primary flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-secondary flex-shrink-0" />
                    )}
                    <span className={`small ${actionDone[1] ? 'text-decoration-line-through text-muted' : 'text-dark fw-semibold'}`}>
                      Proses penerimaan bahan baku PO #PO-202610-002
                    </span>
                  </div>
                  <CaretRight size={14} className="text-muted flex-shrink-0" />
                </div>

                {/* Action 3 */}
                <div 
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${actionDone[2] ? 'bg-light border-subtle' : 'bg-white border-subtle'}`}
                  onClick={() => toggleAction(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {actionDone[2] ? (
                      <CheckSquare size={18} weight="fill" className="text-primary flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-secondary flex-shrink-0" />
                    )}
                    <span className={`small ${actionDone[2] ? 'text-decoration-line-through text-muted' : 'text-dark fw-semibold'}`}>
                      Input nomor resi SiCepat untuk pesanan Surabaya
                    </span>
                  </div>
                  <CaretRight size={14} className="text-muted flex-shrink-0" />
                </div>

                {/* Action 4 */}
                <div 
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${actionDone[3] ? 'bg-light border-subtle' : 'bg-white border-subtle'}`}
                  onClick={() => toggleAction(3)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {actionDone[3] ? (
                      <CheckSquare size={18} weight="fill" className="text-primary flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-secondary flex-shrink-0" />
                    )}
                    <span className={`small ${actionDone[3] ? 'text-decoration-line-through text-muted' : 'text-dark fw-semibold'}`}>
                      Tinjau safety stock bahan webbing sandal
                    </span>
                  </div>
                  <CaretRight size={14} className="text-muted flex-shrink-0" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-top">
              <Link to="/inventory" className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                <span>View all actions</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
