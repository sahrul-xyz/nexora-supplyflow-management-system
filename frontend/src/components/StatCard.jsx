import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', badgeText }) => {
  const colorMap = {
    primary: { bg: '#eff6ff', text: '#2563eb' },
    secondary: { bg: '#e0f2fe', text: '#0284c7' },
    accent: { bg: '#fff7ed', text: '#ea580c' },
    success: { bg: '#ecfdf5', text: '#059669' },
    warning: { bg: '#fffbeb', text: '#d97706' },
    danger: { bg: '#fef2f2', text: '#dc2626' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card-nexora p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-secondary small fw-semibold text-uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div 
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: '42px', height: '42px', backgroundColor: scheme.bg, color: scheme.text }}
          >
            <Icon size={22} weight="duotone" />
          </div>
        )}
      </div>
      <div className="d-flex align-items-baseline gap-2">
        <h3 className="mb-0 fw-bold">{value}</h3>
        {badgeText && (
          <span className="badge-clean badge-planned small">
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-muted small mb-0 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
