import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProductList } from './pages/products/ProductList';
import { ProductDetail } from './pages/products/ProductDetail';
import { RawMaterialList } from './pages/raw-materials/RawMaterialList';
import { SupplierList } from './pages/suppliers/SupplierList';
import { PartnerList } from './pages/partners/PartnerList';
import { PurchaseOrderList } from './pages/purchase-orders/PurchaseOrderList';
import { PurchaseOrderCreate } from './pages/purchase-orders/PurchaseOrderCreate';
import { PurchaseOrderDetail } from './pages/purchase-orders/PurchaseOrderDetail';
import { ProductionOrderList } from './pages/production-orders/ProductionOrderList';
import { ProductionOrderCreate } from './pages/production-orders/ProductionOrderCreate';
import { ProductionOrderDetail } from './pages/production-orders/ProductionOrderDetail';
import { InventoryOverview } from './pages/inventory/InventoryOverview';
import { PartnerOrderList } from './pages/partner-orders/PartnerOrderList';
import { PartnerOrderCreate } from './pages/partner-orders/PartnerOrderCreate';
import { PartnerOrderDetail } from './pages/partner-orders/PartnerOrderDetail';
import { UserManagement } from './pages/users/UserManagement';
import { AiInsightsPage } from './pages/ai-insights/AiInsightsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning d-inline-block p-4 rounded-4 shadow-sm">
          <h4 className="fw-bold mb-2">Akses Terbatas</h4>
          <p className="text-muted mb-3">Role akun Anda ({user.role}) tidak memiliki izin untuk mengakses halaman ini.</p>
          <a href="/" className="btn btn-primary btn-sm">Kembali ke Dashboard</a>
        </div>
      </div>
    );
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Master Data */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="raw-materials" element={<RawMaterialList />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="partners" element={<PartnerList />} />

            {/* Procurement */}
            <Route 
              path="purchase-orders" 
              element={
                <ProtectedRoute allowedRoles={['supply_chain']}>
                  <PurchaseOrderList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="purchase-orders/create" 
              element={
                <ProtectedRoute allowedRoles={['supply_chain']}>
                  <PurchaseOrderCreate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="purchase-orders/:id" 
              element={
                <ProtectedRoute allowedRoles={['supply_chain']}>
                  <PurchaseOrderDetail />
                </ProtectedRoute>
              } 
            />

            {/* Production */}
            <Route 
              path="production-orders" 
              element={
                <ProtectedRoute allowedRoles={['production']}>
                  <ProductionOrderList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="production-orders/create" 
              element={
                <ProtectedRoute allowedRoles={['production']}>
                  <ProductionOrderCreate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="production-orders/:id" 
              element={
                <ProtectedRoute allowedRoles={['production']}>
                  <ProductionOrderDetail />
                </ProtectedRoute>
              } 
            />

            {/* Inventory Monitoring (all authenticated users) */}
            <Route path="inventory" element={<InventoryOverview />} />

            {/* AI Insights & Diagnostics Engine */}
            <Route path="ai-insights" element={<AiInsightsPage />} />

            {/* Distribution */}
            <Route 
              path="partner-orders" 
              element={
                <ProtectedRoute allowedRoles={['supply_chain']}>
                  <PartnerOrderList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner-orders/create" 
              element={
                <ProtectedRoute allowedRoles={['supply_chain']}>
                  <PartnerOrderCreate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="partner-orders/:id" 
              element={
                <ProtectedRoute allowedRoles={['supply_chain']}>
                  <PartnerOrderDetail />
                </ProtectedRoute>
              } 
            />

            {/* Super Admin User Management */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
