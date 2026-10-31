import React from 'react';

export const DonutChart = ({ 
  data = [], 
  size = 170, 
  strokeWidth = 24, 
  centerPrimary = 'Total', 
  centerSecondary = 'Unit',
  gap = 3 
}) => {
  const total = data.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform-rotate" style={{ transform: 'rotate(-90deg)' }}>
        {data.map((item, idx) => {
          const percent = total > 0 ? (item.value / total) : 0;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += percent;

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
      </svg>
      {/* Center Label */}
      <div className="position-absolute text-center" style={{ pointerEvents: 'none' }}>
        <div className="fw-bold fs-5 lh-1 text-dark" style={{ letterSpacing: '-0.02em' }}>
          {centerPrimary}
        </div>
        {centerSecondary && (
          <div className="text-muted small fw-medium mt-1" style={{ fontSize: '0.725rem' }}>
            {centerSecondary}
          </div>
        )}
      </div>
    </div>
  );
};
