import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { propertyService } from '../../services/propertyService';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated]);

  const fetchProperties = async () => {
    try {
      const data = await propertyService.getAll();
      setProperties(data);
      if (data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/login';
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'property_admin' && user?.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Properties', href: '/admin/properties', icon: '🏢' },
    { name: 'Requests', href: '/admin/requests', icon: '📋' },
    { name: 'Feedback', href: '/admin/feedback', icon: '⭐' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar with Logout */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 lg:ml-64">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="ml-3 text-xl font-bold text-blue-600">StayDeck</span>
          </div>
          
          <div className="flex items-center space-x-4 ml-auto">
            <span className="text-sm text-gray-600 hidden md:block">
              Welcome, <span className="font-medium">{user?.full_name}</span>
            </span>
            
            {/* Logout Button in Navbar */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/admin" className="text-2xl font-bold text-blue-600">
              StayDeck
            </Link>
            <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
          </div>

          {/* Property Selector */}
          <div className="p-4 border-b">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Property</label>
            <select
              value={selectedProperty || ''}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.name}</option>
              ))}
              {properties.length === 0 && (
                <option value="">No properties</option>
              )}
            </select>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout in Sidebar */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            
            {/* Sidebar Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center space-x-2 text-sm text-red-600 hover:text-red-800 font-medium py-2.5 px-4 rounded-lg border border-red-200 hover:bg-red-50 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content with top padding for navbar */}
      <div className="lg:ml-64 min-h-screen pt-16">
        <div className="p-4 lg:p-8">
          <Outlet context={{ selectedProperty, properties, refreshProperties: fetchProperties }} />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}