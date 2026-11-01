import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  SquaresFour, 
  Warehouse, 
  Truck, 
  Handshake, 
  Package, 
  Bell, 
  Gear, 
  MagnifyingGlass, 
  CalendarBlank, 
  Sun, 
  Moon, 
  Globe, 
  CaretDown, 
  CaretLeft, 
  CaretRight,
  SignOut,
  Sneaker,
  Factory,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react';

export const MainLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Dark Mode State with LocalStorage Persistence
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('supplyflow_dark_mode') === 'true';
  });

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Synchronize Dark Mode Class with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('supplyflow_dark_mode', 'true');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('supplyflow_dark_mode', 'false');
    }
  }, [darkMode]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data?.success && res.data.data?.alerts) {
        setNotifications(res.data.data.alerts);
        setUnreadCount(res.data.data.alerts.length);
      }
    } catch {
      // Ignore background fetch error
    }
  };

  // Fetch real notifications from dashboard alerts
  useEffect(() => {
    fetchNotifications();
  }, [location.pathname]);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard';
    if (p.startsWith('/ai-insights')) return 'AI Insights Engine & Diagnostik SCM';
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

  const filteredNotifications = notifications.filter(item => {
    if (filterType === 'high') return item.priority === 'High';
    if (filterType === 'medium') return item.priority === 'Medium';
    if (filterType === 'low') return item.priority === 'Low';
    return true;
  });

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar matching Nexora reference */}
      <aside 
        className="nexora-sidebar d-flex flex-column position-fixed h-100 z-3 p-3"
        style={{ 
          width: collapsed ? '80px' : '250px', 
          top: 0, 
          left: 0,
          borderRight: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-card)'
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
            <div className="d-flex flex-column">
              <span className="fw-bold fs-5 lh-1 text-dark" style={{ letterSpacing: '-0.02em' }}>Nexora</span>
              <span className="text-muted small" style={{ fontSize: '0.65rem' }}>SupplyFlow SCM v2.6</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-grow-1 overflow-y-auto pe-1">
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

            {/* AI Insights Engine & Diagnostik SCM */}
            <NavLink to="/ai-insights" className={({ isActive }) => `nexora-nav-item ${isActive ? 'active' : ''}`} title="AI Insights Engine">
              <Sparkle size={22} weight="duotone" className="flex-shrink-0 text-primary-indigo" />
              {!collapsed && (
                <div className="d-flex align-items-center justify-content-between flex-grow-1">
                  <span>AI Insights</span>
                  <span className="badge rounded-pill bg-purple-subtle text-primary-indigo fw-bold" style={{ fontSize: '0.625rem' }}>AI Live</span>
                </div>
              )}
            </NavLink>

            {/* Sidebar Notifications Trigger */}
            <button 
              type="button" 
              className={`nexora-nav-item border-0 w-100 text-start bg-transparent ${showNotificationDropdown ? 'active' : ''}`}
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              title="Notifikasi Sistem"
            >
              <Bell size={22} weight="duotone" className="flex-shrink-0" />
              {!collapsed && (
                <div className="d-flex align-items-center justify-content-between flex-grow-1">
                  <span>Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>{unreadCount}</span>
                  )}
                </div>
              )}
            </button>

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
          {/* Light/Dark Toggle Pill */}
          {!collapsed ? (
            <div className="theme-switch-pill d-flex align-items-center justify-content-between p-1 rounded-pill">
              <button 
                type="button" 
                className={`theme-switch-btn flex-grow-1 ${!darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(false)}
                title="Aktifkan Mode Terang (Light)"
              >
                <Sun size={16} weight={!darkMode ? "fill" : "regular"} className={!darkMode ? "text-warning" : ""} />
                <span className="small fw-semibold ms-1" style={{ fontSize: '0.75rem' }}>Light</span>
              </button>
              <button 
                type="button" 
                className={`theme-switch-btn flex-grow-1 ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(true)}
                title="Aktifkan Mode Gelap (Dark)"
              >
                <Moon size={16} weight={darkMode ? "fill" : "regular"} className={darkMode ? "text-primary" : ""} />
                <span className="small fw-semibold ms-1" style={{ fontSize: '0.75rem' }}>Dark</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button 
                className="btn btn-sm btn-light rounded-circle p-2"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
              >
                {darkMode ? <Sun size={16} className="text-warning" /> : <Moon size={16} />}
              </button>
            </div>
          )}

          {/* Plant Org Pill */}
          {!collapsed && (
            <div className="header-pill-btn d-flex align-items-center justify-content-between px-3 py-2">
              <div className="d-flex align-items-center gap-2">
                <Factory size={16} className="text-secondary" />
                <span className="small fw-semibold text-truncate" style={{ maxWidth: '120px' }}>Pabrik Mojokerto</span>
              </div>
              <CaretDown size={14} className="text-muted" />
            </div>
          )}

          {/* Collapse sidebar arrow button */}
          <div className="d-flex justify-content-end">
            <button 
              className="btn btn-light btn-sm rounded-circle p-1 border shadow-xs d-flex align-items-center justify-content-center"
              style={{ width: '28px', height: '28px' }}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            >
              {collapsed ? <CaretRight size={14} /> : <CaretLeft size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div 
        className="flex-grow-1 d-flex flex-column" 
        style={{ 
          marginLeft: collapsed ? '80px' : '250px', 
          transition: 'margin-left 0.25s ease' 
        }}
      >
        {/* Header matching Nexora reference */}
        <header 
          className="sticky-top border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-card)', zIndex: 1020 }}
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
              <span className="small">Hari Ini • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Notification Bell with Badge and Interactive Dropdown */}
            <div className="position-relative">
              <button 
                className={`btn btn-light rounded-circle p-2 border border-subtle d-flex align-items-center justify-content-center ${showNotificationDropdown ? 'active border-primary' : ''}`}
                style={{ width: '38px', height: '38px' }}
                onClick={() => {
                  setShowNotificationDropdown(!showNotificationDropdown);
                  setShowUserDropdown(false);
                }}
                title="Notifikasi & Alerts Sistem"
              >
                <Bell size={18} className={unreadCount > 0 ? "text-primary" : "text-secondary"} weight={unreadCount > 0 ? "fill" : "regular"} />
              </button>
              {unreadCount > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                  style={{ fontSize: '0.65rem', padding: '0.2rem 0.35rem' }}
                >
                  {unreadCount}
                </span>
              )}

              {/* FLOATING NOTIFICATION CENTER DROPDOWN */}
              {showNotificationDropdown && (
                <div 
                  className="position-absolute end-0 mt-2 card-nexora shadow-float p-0 overflow-hidden"
                  style={{ width: '360px', zIndex: 1060 }}
                >
                  {/* Dropdown Header */}
                  <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                    <div className="d-flex align-items-center gap-2">
                      <Bell size={18} weight="fill" className="text-primary" />
                      <h6 className="fw-bold mb-0 text-dark">Pusat Notifikasi</h6>
                      {unreadCount > 0 && (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle small py-0 px-2" style={{ fontSize: '0.7rem' }}>
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="btn btn-link btn-sm p-0 text-decoration-none small text-primary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="px-3 py-2 border-bottom d-flex gap-1 bg-white">
                    <button 
                      className={`btn btn-sm py-0 px-2 rounded-pill ${filterType === 'all' ? 'btn-primary' : 'btn-light border'}`}
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => setFilterType('all')}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button 
                      className={`btn btn-sm py-0 px-2 rounded-pill ${filterType === 'high' ? 'btn-danger' : 'btn-light border'}`}
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => setFilterType('high')}
                    >
                      Kritis
                    </button>
                    <button 
                      className={`btn btn-sm py-0 px-2 rounded-pill ${filterType === 'medium' ? 'btn-warning' : 'btn-light border'}`}
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => setFilterType('medium')}
                    >
                      Peringatan
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
                    {filteredNotifications.length === 0 ? (
                      <div className="p-4 text-center text-muted small">
                        <CheckCircle size={32} className="text-success mb-2 d-block mx-auto" />
                        Semua operasional berjalan lancar. Tidak ada peringatan baru.
                      </div>
                    ) : (
                      filteredNotifications.map((n, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 border-bottom transition-all hover-bg"
                          style={{ backgroundColor: idx % 2 === 0 ? 'var(--surface-card)' : 'rgba(0,0,0,0.01)' }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span 
                              className={`badge-clean ${n.priority === 'High' ? 'badge-danger' : n.priority === 'Medium' ? 'badge-warning-low' : 'badge-planned'} py-0 px-2`}
                              style={{ fontSize: '0.65rem' }}
                            >
                              Prioritas {n.priority}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.675rem' }}>{n.timestamp}</span>
                          </div>
                          <h6 className="fw-bold mb-1 fs-6 text-dark" style={{ fontSize: '0.85rem' }}>{n.title}</h6>
                          <p className="text-muted small mb-2" style={{ fontSize: '0.775rem' }}>{n.description}</p>
                          {n.action_url && (
                            <Link 
                              to={n.action_url}
                              onClick={() => setShowNotificationDropdown(false)}
                              className="small text-primary fw-bold text-decoration-none d-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <span>{n.action_label}</span>
                              <ArrowRight size={12} weight="bold" />
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2 border-top text-center bg-light">
                    <Link 
                      to="/" 
                      onClick={() => setShowNotificationDropdown(false)}
                      className="small text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <span>Lihat Analisis Lengkap di Dashboard</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Dropdown */}
            <div className="position-relative">
              <button 
                className="btn p-0 border-0 rounded-circle d-flex align-items-center gap-2"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotificationDropdown(false);
                }}
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
