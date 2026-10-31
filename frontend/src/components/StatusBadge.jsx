import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Gear, 
  WarningCircle, 
  Package 
} from '@phosphor-icons/react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = (s) => {
    switch (s?.toLowerCase()) {
      case 'ordered':
        return { label: 'Dipesan', className: 'badge-ordered', icon: Clock };
      case 'planned':
        return { label: 'Direncanakan', className: 'badge-planned', icon: Clock };
      case 'in_progress':
        return { label: 'Dalam Proses', className: 'badge-in_progress', icon: Gear };
      case 'completed':
        return { label: 'Selesai', className: 'badge-completed', icon: CheckCircle };
      case 'processing':
        return { label: 'Diproses', className: 'badge-processing', icon: Clock };
      case 'shipped':
        return { label: 'Dikirim', className: 'badge-shipped', icon: Truck };
      case 'delivered':
        return { label: 'Terkirim', className: 'badge-delivered', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Dibatalkan', className: 'badge-cancelled', icon: XCircle };
      case 'low_stock':
        return { label: 'Stok Menipis', className: 'badge-warning-low', icon: WarningCircle };
      case 'normal':
        return { label: 'Aman', className: 'badge-completed', icon: CheckCircle };
      default:
        return { label: s || 'Unknown', className: 'badge-ordered', icon: Package };
    }
  };

  const config = getBadgeConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`badge-clean ${config.className}`}>
      <IconComponent size={14} weight="bold" />
      <span>{config.label}</span>
    </span>
  );
};
