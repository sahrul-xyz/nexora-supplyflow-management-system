import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  SquaresFour, 
  Warehouse, 
  TrendUp, 
  Truck, 
  Handshake, 
  Package, 
  Bell, 
  Gear, 
  MagnifyingGlass, 
  CalendarBlank, 
  Funnel, 
  Sun, 
  Moon, 
  Globe, 
  CaretDown, 
  CaretLeft, 
  CaretRight,
  SignOut,
  UserCircle,
  Sneaker,
  ShieldCheck,
  Factory,
  ShoppingCart
} from '@phosphor-icons/react';

export const MainLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard';
    if (p.startsWith('/inventory')) return 'Monitoring Stok Pergudangan';
    if (p.startsWith('/production-orders')) return 'Perencanaan & Produksi (MTS)';
    if (p.startsWith('/partner-orders')) return 'Distribusi & Pesanan Mitra';
    if (p.startsWith('/purchase-orders')) return 'Pengadaan Bahan (Purchase Order)';
    if (p.startsWith('/products')) return 'Katalog Produk & BOM';
    if (p.startsWith('/raw-materials')) return 'Master Bahan Baku';
    if (p.startsWith('/suppliers')) return 'Master Data Supplier';
    if (p.startsWith('/partners')) return 'Master Reseller & Distributor';
    if (p.startsWith('/users')) return 'Manajemen Akun Staf';
    return 'SupplyFlow SCM';
  };

  const getRoleLabel = (r) => {
    switch (r) {
      case 'super_admin': return 'Super Admin';
      case 'supply_chain': return 'Supply Chain';
      case 'production': return 'Production Head';
      default: return r;
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#F4F6FA' }}>
      {/* Sidebar matching Nexora reference */}
      <aside 
        className="nexora-sidebar d-flex flex-column position-fixed h-100 z-3 p-3"
        style={{ 
          width: collapsed ? '80px' : '250px', 
          top: 0, 
          left: 0,
          borderRight: '1px solid #EAEFF6'
        }}
      >
        {/* Brand Logo & Name */}
        <div className="d-flex align-items-center gap-2 px-2 py-2 mb-4">
          <div 
            className="d-flex align-items-center justify-content-center text-white rounded-3 flex-shrink-0 shadow-sm"
            style={{ 
              width: '38px', 
              height: '38px', 
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)' 
            }}
          >
            <Sneaker size={22} weight="bold" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h5 className="mb-0 fw-bold lh-1" style={{ letterSpacing: '-0.03em', color: '#0F172A' }}>
                SupplyFlow
              </h5>
              <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Make to Stock SCM</span>
            </div>
          )}
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-grow-1 overflow-y-auto d-flex flex-column">
          <nav className="d-flex flex-column gap-1">
            <NavLink to="/" end className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Dashboard">
              <SquaresFour size={22} weight="duotone" className="flex-shrink-0" />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            <NavLink to="/inventory" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Monitoring Stok">
              <Warehouse size={22} weight="duotone" className="flex-shrink-0" />
              {!collapsed && <span>Inventory (Stok)</span>}
            </NavLink>

            {(hasRole(['production']) || user?.role === 'super_admin') && (
              <NavLink to="/production-orders" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Perencanaan Produksi">
                <Factory size={22} weight="duotone" className="flex-shrink-0" />
                {!collapsed && <span>Produksi (MTS)</span>}
              </NavLink>
            )}

            {(hasRole(['supply_chain']) || user?.role === 'super_admin') && (
              <NavLink to="/partner-orders" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Distribusi Pesanan Mitra">
                <Truck size={22} weight="duotone" className="flex-shrink-0" />
                {!collapsed && <span>Logistics Tracking</span>}
              </NavLink>
            )}

            {(hasRole(['supply_chain']) || user?.role === 'super_admin') && (
              <NavLink to="/purchase-orders" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Pengadaan Bahan">
                <ShoppingCart size={22} weight="duotone" className="flex-shrink-0" />
                {!collapsed && <span>Purchase Orders</span>}
              </NavLink>
            )}

            <NavLink to="/products" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Katalog Produk & BOM">
              <Sneaker size={22} weight="duotone" className="flex-shrink-0" />
              {!collapsed && <span>Produk & BOM</span>}
            </NavLink>

            <NavLink to="/raw-materials" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Master Bahan Baku">
              <Package size={22} weight="duotone" className="flex-shrink-0" />
              {!collapsed && <span>Bahan Baku</span>}
            </NavLink>

            <NavLink to="/suppliers" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Data Supplier">
              <Handshake size={22} weight="duotone" className="flex-shrink-0" />
              {!collapsed && <span>Supplier Vendor</span>}
            </NavLink>

            <NavLink to="/partners" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Data Mitra">
              <Globe size={22} weight="duotone" className="flex-shrink-0" />
              {!collapsed && <span>Mitra Distribusi</span>}
            </NavLink>

            {user?.role === 'super_admin' && (
              <NavLink to="/users" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="Pengaturan Akun">
                <Gear size={22} weight="duotone" className="flex-shrink-0" />
                {!collapsed && <span>Settings (Akun)</span>}
              </NavLink>
            )}
          </nav>
        </div>

        {/* Bottom Section: Theme Switch, Org Pill, Collapse button */}
        <div className="pt-3 border-top d-flex flex-column gap-3">
          {/* Light/Dark Toggle Pill matching reference */}
          {!collapsed ? (
            <div className="theme-switch-pill d-flex align-items-center justify-content-between p-1 bg-light rounded-pill">
              <button 
                type="button" 
                className={`theme-switch-btn flex-grow-1 ${!darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(false)}
              >
                <Sun size={16} weight={!darkMode ? "fill" : "regular"} className={!darkMode ? "text-warning" : ""} />
                <span className="small fw-semibold ms-1" style={{ fontSize: '0.75rem' }}>Light</span>
              </button>
              <button 
                type="button" 
                className={`theme-switch-btn flex-grow-1 ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(true)}
              >
                <Moon size={16} weight={darkMode ? "fill" : "regular"} />
                <span className="small fw-semibold ms-1" style={{ fontSize: '0.75rem' }}>Dark</span>
              </button>
            </div>
          ) : (
            <button className="btn btn-sm btn-light rounded-circle mx-auto p-2" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          )}

          {/* Org / Factory Pill Dropdown matching reference */}
          {!collapsed ? (
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border border-subtle">
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <Globe size={18} className="text-secondary flex-shrink-0" />
                <div className="overflow-hidden">
                  <div className="fw-bold small text-dark text-truncate" style={{ fontSize: '0.8rem' }}>SupplyFlow Factory</div>
                  <div className="text-muted small text-truncate" style={{ fontSize: '0.675rem' }}>{getRoleLabel(user?.role)}</div>
                </div>
              </div>
              <CaretDown size={14} className="text-secondary flex-shrink-0" />
            </div>
          ) : null}

          {/* Collapse Button */}
          <div className="d-flex justify-content-end">
            <button 
              className="btn btn-sm btn-light border p-1 rounded-circle"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            >
              {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Body */}
      <div 
        className="d-flex flex-column flex-grow-1 min-vh-100" 
        style={{ 
          marginLeft: collapsed ? '80px' : '250px',
          transition: 'margin-left 0.25s ease'
        }}
      >
        {/* Top Header Navbar matching Nexora reference */}
        <header 
          className="sticky-top bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
          style={{ borderColor: '#EAEFF6', zIndex: 1020 }}
        >
          {/* Left: Page Title */}
          <div>
            <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.03em' }}>
              {getPageTitle()}
            </h3>
          </div>

          {/* Center & Right Controls matching reference */}
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Search Pill with Cmd K */}
            <div className="header-search-pill d-none d-md-flex align-items-center">
              <MagnifyingGlass size={16} className="text-muted" />
              <input 
                type="text" 
                className="header-search-input"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="badge bg-light text-secondary border font-monospace px-1 py-0" style={{ fontSize: '0.65rem' }}>
                ⌘ K
              </span>
            </div>

            {/* Date Range Selector Pill */}
            <div className="header-pill-btn d-none d-sm-flex align-items-center">
              <CalendarBlank size={16} className="text-secondary" />
              <span className="small">Oct 25 – Oct 31, 2026</span>
              <CaretDown size={12} className="text-muted ms-1" />
            </div>

            {/* Filters Pill Button */}
            <div className="header-pill-btn d-none d-sm-flex align-items-center">
              <Funnel size={16} className="text-secondary" />
              <span className="small">Filters</span>
            </div>

            {/* Notification Bell with Badge */}
            <div className="position-relative">
              <button 
                className="btn btn-light rounded-circle p-2 border border-subtle d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
                title="Notifikasi Sistem"
              >
                <Bell size={18} className="text-secondary" />
              </button>
              <span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                style={{ fontSize: '0.65rem', padding: '0.2rem 0.35rem' }}
              >
                3
              </span>
            </div>

            {/* User Profile Avatar with Dropdown */}
            <div className="position-relative">
              <button 
                className="btn p-0 border-0 rounded-circle d-flex align-items-center gap-2"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    background: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
                    fontSize: '0.85rem'
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </button>

              {showUserDropdown && (
                <div 
                  className="position-absolute end-0 mt-2 card-nexora p-3 shadow-float"
                  style={{ width: '220px', zIndex: 1050 }}
                >
                  <div className="fw-bold text-dark">{user?.name}</div>
                  <div className="text-muted small mb-2">{user?.email}</div>
                  <div className="badge-clean badge-completed small mb-3">
                    {getRoleLabel(user?.role)}
                  </div>
                  <div className="border-top pt-2">
                    <button 
                      onClick={handleLogout}
                      className="btn btn-sm btn-outline-danger w-100 justify-content-center"
                    >
                      <SignOut size={16} />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
