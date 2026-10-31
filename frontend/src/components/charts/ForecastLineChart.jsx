import React from 'react';

export const ForecastLineChart = ({ height = 180 }) => {
  return (
    <div className="w-100 position-relative">
      {/* Grid Lines & Chart Area */}
      <div style={{ height: `${height}px`, width: '100%' }}>
        <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-100 h-100">
          <defs>
            <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="40" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="40" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="40" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeWidth="1" />

          {/* Y Axis text */}
          <text x="5" y="24" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">60K</text>
          <text x="5" y="64" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">45K</text>
          <text x="5" y="104" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">30K</text>
          <text x="5" y="144" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">15K</text>

          {/* Historical Solid Line (Left to Middle) */}
          <path
            d="M 40,135 Q 70,120 100,128 T 160,110 T 220,95 T 280,75"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Blue area under curve */}
          <path
            d="M 40,135 Q 70,120 100,128 T 160,110 T 220,95 T 280,75 L 280,150 L 40,150 Z"
            fill="url(#blueGlow)"
          />

          {/* Forecast Teal Dashed Line */}
          <path
            d="M 280,75 Q 330,65 380,55 T 440,48 T 490,40"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            strokeDasharray="4,4"
            strokeLinecap="round"
          />

          {/* High Scenario Green Dashed Line */}
          <path
            d="M 280,75 Q 330,55 380,45 T 440,32 T 490,25"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4,4"
            strokeLinecap="round"
          />

          {/* Low Scenario Coral/Red Dashed Line */}
          <path
            d="M 280,75 Q 330,80 380,75 T 440,78 T 490,75"
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            strokeDasharray="4,4"
            strokeLinecap="round"
          />

          {/* Pivot point dot */}
          <circle cx="280" cy="75" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>

      {/* X Axis Labels */}
      <div className="d-flex justify-content-between text-muted small ps-5 pe-2 mt-1" style={{ fontSize: '0.725rem' }}>
        <span>Minggu 1</span>
        <span>Minggu 2</span>
        <span>Minggu 3 (Kini)</span>
        <span>Minggu 4 (Forecast)</span>
        <span>Minggu 5</span>
      </div>

      {/* Legend matching reference */}
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
          <span className="text-secondary">Skenario Tinggi</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span style={{ width: 14, height: 3, backgroundColor: '#f87171', borderTop: '2px dashed #f87171' }}></span>
          <span className="text-secondary">Skenario Rendah</span>
        </div>
      </div>
    </div>
  );
};
