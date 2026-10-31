import React from 'react';

export const ForecastLineChart = ({ 
  data = [], 
  scenario = 'all', // 'all', 'forecast', 'high', 'low'
  height = 180 
}) => {
  // Fallback points if data is empty
  const defaultPoints = [
    { period: 'Minggu 1', actual: 45, target: 50, forecast: 50, high: 58, low: 42 },
    { period: 'Minggu 2', actual: 60, target: 60, forecast: 60, high: 70, low: 52 },
    { period: 'Minggu 3', actual: 75, target: 70, forecast: 70, high: 82, low: 60 },
    { period: 'Minggu 4 (Kini)', actual: 85, target: 80, forecast: 85, high: 98, low: 72 },
    { period: 'Minggu 5 (Forecast)', actual: null, target: 95, forecast: 95, high: 112, low: 80 },
    { period: 'Minggu 6', actual: null, target: 110, forecast: 110, high: 130, low: 90 },
  ];

  const points = (Array.isArray(data) && data.length >= 2) ? data : defaultPoints;

  // Find min and max for scaling
  let allVals = [];
  points.forEach(p => {
    if (p.actual !== null && p.actual !== undefined) allVals.push(p.actual);
    if (p.target) allVals.push(p.target);
    if (p.forecast) allVals.push(p.forecast);
    if (p.high) allVals.push(p.high);
    if (p.low) allVals.push(p.low);
  });

  const minVal = Math.max(0, Math.min(...allVals) * 0.8);
  const maxVal = Math.max(10, Math.max(...allVals) * 1.15);
  const valRange = (maxVal - minVal) || 1;

  const chartWidth = 500;
  const chartHeight = 160;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 25;

  const getX = (idx) => {
    return paddingLeft + (idx / (points.length - 1)) * (chartWidth - paddingLeft - paddingRight);
  };

  const getY = (val) => {
    if (val === null || val === undefined) return null;
    const norm = (val - minVal) / valRange;
    return (chartHeight - paddingBottom) - norm * (chartHeight - paddingTop - paddingBottom);
  };

  // Find pivot index between historical and forecast
  const lastActualIdx = points.reduce((latest, p, idx) => {
    return (p.actual !== null && p.actual !== undefined) ? idx : latest;
  }, 0);

  // Generate historical actual path
  const actualCoords = points
    .map((p, idx) => ({ x: getX(idx), y: getY(p.actual) }))
    .filter(c => c.y !== null);

  let actualPath = '';
  let areaPath = '';
  if (actualCoords.length > 0) {
    actualPath = `M ${actualCoords[0].x},${actualCoords[0].y}`;
    for (let i = 0; i < actualCoords.length - 1; i++) {
      const p0 = actualCoords[i];
      const p1 = actualCoords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      actualPath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    const lastCoord = actualCoords[actualCoords.length - 1];
    areaPath = `${actualPath} L ${lastCoord.x},${chartHeight - paddingBottom} L ${actualCoords[0].x},${chartHeight - paddingBottom} Z`;
  }

  // Generate Forecast Target path
  const forecastCoords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.forecast || p.target) }));
  let forecastPath = '';
  if (forecastCoords.length > 0) {
    forecastPath = `M ${forecastCoords[0].x},${forecastCoords[0].y}`;
    for (let i = 0; i < forecastCoords.length - 1; i++) {
      const p0 = forecastCoords[i];
      const p1 = forecastCoords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      forecastPath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
  }

  // Generate High Scenario path
  const highCoords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.high || (p.forecast * 1.15)) }));
  let highPath = '';
  if (highCoords.length > 0) {
    highPath = `M ${highCoords[0].x},${highCoords[0].y}`;
    for (let i = 0; i < highCoords.length - 1; i++) {
      const p0 = highCoords[i];
      const p1 = highCoords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      highPath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
  }

  // Generate Low Scenario path
  const lowCoords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.low || (p.forecast * 0.85)) }));
  let lowPath = '';
  if (lowCoords.length > 0) {
    lowPath = `M ${lowCoords[0].x},${lowCoords[0].y}`;
    for (let i = 0; i < lowCoords.length - 1; i++) {
      const p0 = lowCoords[i];
      const p1 = lowCoords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      lowPath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
  }

  // Grid line levels
  const yLabels = [
    { y: getY(maxVal), val: Math.round(maxVal) },
    { y: getY(minVal + valRange * 0.66), val: Math.round(minVal + valRange * 0.66) },
    { y: getY(minVal + valRange * 0.33), val: Math.round(minVal + valRange * 0.33) },
    { y: getY(minVal), val: Math.round(minVal) },
  ];

  return (
    <div className="w-100 position-relative">
      <div style={{ height: `${height}px`, width: '100%' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-100 h-100">
          <defs>
            <linearGradient id="blueGlowDynamic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Labels */}
          {yLabels.map((lbl, idx) => (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={lbl.y} 
                x2={chartWidth - paddingRight} 
                y2={lbl.y} 
                stroke="#f1f5f9" 
                strokeWidth="1" 
              />
              <text 
                x="8" 
                y={lbl.y + 4} 
                fill="#94a3b8" 
                fontSize="10" 
                fontFamily="sans-serif"
                fontWeight="500"
              >
                {lbl.val >= 1000 ? `${(lbl.val / 1000).toFixed(1)}k` : lbl.val}
              </text>
            </g>
          ))}

          {/* Blue area fill under historical curve */}
          {areaPath && (
            <path d={areaPath} fill="url(#blueGlowDynamic)" />
          )}

          {/* High Scenario Curve (Green) */}
          {(scenario === 'all' || scenario === 'high') && highPath && (
            <path
              d={highPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4,4"
              strokeLinecap="round"
              style={{ transition: 'all 0.4s ease' }}
            />
          )}

          {/* Low Scenario Curve (Coral Red) */}
          {(scenario === 'all' || scenario === 'low') && lowPath && (
            <path
              d={lowPath}
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
              strokeDasharray="4,4"
              strokeLinecap="round"
              style={{ transition: 'all 0.4s ease' }}
            />
          )}

          {/* Forecast Target Curve (Cyan Dashed) */}
          {(scenario === 'all' || scenario === 'forecast') && forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.2"
              strokeDasharray="4,4"
              strokeLinecap="round"
              style={{ transition: 'all 0.4s ease' }}
            />
          )}

          {/* Historical Actual Solid Curve (Blue) */}
          {actualPath && (
            <path
              d={actualPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.8"
              strokeLinecap="round"
              style={{ transition: 'all 0.4s ease' }}
            />
          )}

          {/* Data point dots on historical actual */}
          {actualCoords.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={idx === lastActualIdx ? 5 : 3.5}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={idx === lastActualIdx ? 2.5 : 1.5}
            />
          ))}
        </svg>
      </div>

      {/* X Axis Labels */}
      <div 
        className="d-flex justify-content-between text-muted small mt-1" 
        style={{ fontSize: '0.7rem', paddingLeft: `${paddingLeft}px`, paddingRight: `${paddingRight}px` }}
      >
        {points.map((p, idx) => (
          <span 
            key={idx} 
            className={`text-truncate ${idx === lastActualIdx ? 'fw-bold text-primary' : ''}`}
            style={{ maxWidth: `${Math.floor(100 / points.length)}%`, textAlign: 'center' }}
            title={p.period}
          >
            {p.period}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 pt-3 border-top mt-3" style={{ fontSize: '0.75rem' }}>
        <div className="d-flex align-items-center gap-1">
          <span style={{ width: 14, height: 3, backgroundColor: '#2563eb', borderRadius: 2 }}></span>
          <span className="text-secondary">Historis Aktual</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span style={{ width: 14, height: 3, backgroundColor: '#0ea5e9', borderTop: '2px dashed #0ea5e9' }}></span>
          <span className="text-secondary">Target Produksi</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span style={{ width: 14, height: 3, backgroundColor: '#10b981', borderTop: '2px dashed #10b981' }}></span>
          <span className="text-secondary">Skenario Tinggi (+15%)</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span style={{ width: 14, height: 3, backgroundColor: '#f87171', borderTop: '2px dashed #f87171' }}></span>
          <span className="text-secondary">Skenario Rendah (-15%)</span>
        </div>
      </div>
    </div>
  );
};
