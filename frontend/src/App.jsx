import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import ErrorPage from './pages/ErrorPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Favorites from './pages/Favorites';
import OrderSuccess from './pages/OrderSuccess';
import LoginSuccess from './pages/LoginSuccess';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { useApp } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

import { AnimatePresence } from 'framer-motion';
import QuickView from './components/QuickView';

function MainLayout() {
  const { loading, user, quickViewProduct, setQuickViewProduct } = useApp();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Protected Routes */}
        <Route path="/checkout" element={<ProtectedRoute user={user}><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute user={user}><Orders /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<ProtectedRoute user={user}><OrderSuccess /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
        <Route path="/favorites" element={<Favorites />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        
        {/* Error Routes */}
        <Route path="/error/:status" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage status={404} />} />
      </Routes>
      <Footer />

      <AnimatePresence>
        {quickViewProduct && (
          <QuickView 
            product={quickViewProduct} 
            onClose={() => setQuickViewProduct(null)} 
          />
        )}
      </AnimatePresence>
      <Toast />
    </>
  );
}

function ProtectedRoute({ user, children }) {
  if (!user) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?redirect=${currentPath}`} replace />;
  }
  return children;
}

function AdminLayout() {
  const { user, loading } = useApp();
  
  if (loading) return null;
  
  if (!user || user.role !== 'admin') {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }
  
  return <AdminDashboard />;
}

export default App;