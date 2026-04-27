import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ReactGA from "react-ga4";

// Public Pages
import Home from './pages/Home';
import Store from './pages/Store';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';

// Portals
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminDrivers from './pages/AdminDrivers'; 
import DriverPortal from './pages/DriverPortal';

function App() {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />

          {/* 2. PROTECTED: ONLY DRIVERS */}
          <Route path="/driver" element={
            <ProtectedRoute roleRequired="driver">
              <DriverPortal />
            </ProtectedRoute>
          } />

          {/* 3. PROTECTED: ONLY ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute roleRequired="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute roleRequired="admin">
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute roleRequired="admin">
              <AdminInventory />
            </ProtectedRoute>
          } />
          <Route path="/admin/drivers" element={
            <ProtectedRoute roleRequired="admin">
              <AdminDrivers />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;