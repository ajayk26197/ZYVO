import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

// Lazy load all pages
const Home        = lazy(() => import('../pages/Home'));
const Login       = lazy(() => import('../pages/Login'));
const Signup      = lazy(() => import('../pages/Signup'));
const Menu        = lazy(() => import('../pages/Menu'));
const FoodDetails = lazy(() => import('../pages/FoodDetails'));
const Cart        = lazy(() => import('../pages/Cart'));
const Checkout    = lazy(() => import('../pages/Checkout'));
const Orders      = lazy(() => import('../pages/Orders'));
const OrderDetails= lazy(() => import('../pages/OrderDetails'));
const Profile     = lazy(() => import('../pages/Profile'));
const Rewards     = lazy(() => import('../pages/Rewards'));

// Admin
const AdminLayout = lazy(() => import('../admin/AdminLayout'));
const Dashboard   = lazy(() => import('../admin/Dashboard'));
const AdminOrders = lazy(() => import('../admin/Orders'));
const AdminFood   = lazy(() => import('../admin/Food'));
const AddFood     = lazy(() => import('../admin/AddFood'));
const Categories  = lazy(() => import('../admin/Categories'));
const Customers   = lazy(() => import('../admin/Customers'));
const Settings    = lazy(() => import('../admin/Settings'));

// Protected route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullscreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// Admin route
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Loading fullscreen />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Suspense fallback={<Loading fullscreen text="Loading page..." />}>
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Home />} />
      <Route path="/menu"     element={<Menu />} />
      <Route path="/food/:id" element={<FoodDetails />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/signup"   element={<Signup />} />

      {/* Protected */}
      <Route path="/cart"         element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout"     element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders"       element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/orders/:id"   element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/rewards"      element={<ProtectedRoute><Rewards /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index        element={<Dashboard />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="food"       element={<AdminFood />} />
        <Route path="food/add"   element={<AddFood />} />
        <Route path="food/edit/:id" element={<AddFood />} />
        <Route path="categories" element={<Categories />} />
        <Route path="customers"  element={<Customers />} />
        <Route path="settings"   element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
