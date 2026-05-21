import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import AppLayout     from './components/AppLayout.jsx';
import LandingPage   from './pages/LandingPage.jsx';
import AuthPage      from './pages/AuthPage.jsx';
import ProductsPage  from './pages/ProductsPage.jsx';
import CheckoutPage  from './pages/CheckoutPage.jsx';
import OrdersPage    from './pages/OrdersPage.jsx';
import VendorProductsPage from './pages/VendorProductsPage.jsx';
import AddProductPage     from './pages/AddProductPage.jsx';
import EditProductPage    from './pages/EditProductPage.jsx';
import VendorOrdersPage   from './pages/VendorOrdersPage.jsx';
import AdminPage     from './pages/AdminPage.jsx';

import { getStoredToken } from './auth/tokenStore.js';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/** Redirect logged-in users away from landing/auth pages */
function PublicOnly({ children }) {
  const stored = getStoredToken();
  if (stored?.token) return <Navigate to="/products" replace />;
  return children;
}

/** Require auth + optional role check */
function RequireAuth({ roles, children }) {
  const stored = getStoredToken();
  if (!stored?.token) return <Navigate to="/auth/login" replace />;
  if (roles && !roles.includes(stored.role)) return <Navigate to="/products" replace />;
  return children;
}

export default function App() {
  const [tick, setTick] = useState(0);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: BASE });
    // Inject token from localStorage on every request
    instance.interceptors.request.use((config) => {
      const stored = getStoredToken();
      if (stored?.token) config.headers.Authorization = `Bearer ${stored.token}`;
      return config;
    });
    return instance;
  }, []);

  // Re-render on auth change events (login / logout)
  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener('nexus:auth', handler);
    return () => window.removeEventListener('nexus:auth', handler);
  }, []);

  const onAuth = () => setTick((t) => t + 1);

  return (
    <Routes>
      {/* ── Landing — public only ── */}
      <Route path="/" element={
        <PublicOnly>
          <LandingPage />
        </PublicOnly>
      } />

      {/* ── Auth — public only ── */}
      <Route path="/auth/login" element={
        <PublicOnly>
          <AppLayout>
            <AuthPage mode="login" api={api} onAuth={onAuth} />
          </AppLayout>
        </PublicOnly>
      } />
      <Route path="/auth/register" element={
        <PublicOnly>
          <AppLayout>
            <AuthPage mode="register" api={api} onAuth={onAuth} />
          </AppLayout>
        </PublicOnly>
      } />

      {/* ── Products (all roles) ── */}
      <Route path="/products" element={
        <RequireAuth roles={['Buyer','Vendor','Admin']}>
          <AppLayout>
            <ProductsPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />

      {/* ── Checkout (Buyer only) ── */}
      <Route path="/checkout/:productId" element={
        <RequireAuth roles={['Buyer']}>
          <AppLayout>
            <CheckoutPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />

      {/* ── Buyer Orders ── */}
      <Route path="/orders" element={
        <RequireAuth roles={['Buyer','Admin']}>
          <AppLayout>
            <OrdersPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />

      {/* ── Vendor ── */}
      <Route path="/vendor/products" element={
        <RequireAuth roles={['Vendor']}>
          <AppLayout>
            <VendorProductsPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />
      <Route path="/vendor/products/add" element={
        <RequireAuth roles={['Vendor']}>
          <AppLayout>
            <AddProductPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />
      <Route path="/vendor/products/:id/edit" element={
        <RequireAuth roles={['Vendor']}>
          <AppLayout>
            <EditProductPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />
      <Route path="/vendor/orders" element={
        <RequireAuth roles={['Vendor']}>
          <AppLayout>
            <VendorOrdersPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />

      {/* ── Admin ── */}
      <Route path="/admin" element={
        <RequireAuth roles={['Admin']}>
          <AppLayout>
            <AdminPage api={api} />
          </AppLayout>
        </RequireAuth>
      } />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
