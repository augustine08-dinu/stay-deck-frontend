import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Properties from './components/admin/Properties';
import Rooms from './components/admin/Rooms';
import Requests from './components/admin/Requests';
import Feedback from './components/admin/Feedback';

// Guest Components
import GuestLayout from './components/guest/GuestLayout';
import RoomEntry from './components/guest/RoomEntry';
import GuestDashboard from './components/guest/GuestDashboard';
import ServiceRequest from './components/guest/ServiceRequest';
import FeedbackForm from './components/guest/FeedbackForm';

// Hooks
import { useAuth } from './hooks/useAuth';

// Admin Route Guard
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'property_admin' && user.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Guest Route Guard
function GuestRoute({ children }) {
  const token = localStorage.getItem('guestToken');
  const room = localStorage.getItem('guestRoom');
  
  console.log('🔑 GuestRoute - token:', token ? 'exists' : 'none');
  console.log('🔑 GuestRoute - room:', room ? 'exists' : 'none');
  
  if (!token || !room) {
    console.log('❌ No guest session, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Guest access granted!');
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Guest Routes - QR Code Entry */}
      <Route path="/guest/:propertyId/:roomNumber" element={<RoomEntry />} />
      
      {/* Guest Dashboard - Direct route without GuestLayout wrapper */}
      <Route 
        path="/guest/dashboard/:propertyId/:roomNumber" 
        element={
          <GuestRoute>
            <GuestDashboard />
          </GuestRoute>
        } 
      />
      
      {/* Guest Request */}
      <Route 
        path="/guest/request/:propertyId/:roomNumber" 
        element={
          <GuestRoute>
            <ServiceRequest />
          </GuestRoute>
        } 
      />
      
      {/* Guest Feedback */}
      <Route 
        path="/guest/feedback/:propertyId/:roomNumber" 
        element={
          <GuestRoute>
            <FeedbackForm />
          </GuestRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:propertyId/rooms" element={<Rooms />} />
        <Route path="requests" element={<Requests />} />
        <Route path="feedback" element={<Feedback />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;