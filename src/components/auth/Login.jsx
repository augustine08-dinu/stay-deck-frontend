import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Clear any existing guest session when login page loads
  useEffect(() => {
    // Clear guest session if any
    localStorage.removeItem('guestToken');
    localStorage.removeItem('guestRoom');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await login(formData.email, formData.password);
    
    console.log('Login result:', result);
    
    if (result.success) {
      toast.success('Welcome back!');
      
      console.log('User role:', result.user.role);
      
      if (result.user.role === 'property_admin' || result.user.role === 'super_admin') {
        console.log('Redirecting to admin dashboard...');
        navigate('/admin', { replace: true });
      } else {
        console.log('Redirecting to guest dashboard...');
        navigate('/guest/dashboard', { replace: true });
      }
    } else {
      setErrors({ general: result.error });
      toast.error(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">StayDeck</div>
          <p className="text-gray-600">Sign in to your admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@hotel.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>
          <Link to="/register" className="ml-1 text-blue-600 hover:text-blue-800 font-medium">
            Create one now
          </Link>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-500 text-center">
          <p>🔐 Each user gets their own private admin dashboard</p>
          <p className="mt-1">Manage your properties, rooms, and guest requests</p>
        </div>
      </div>
    </div>
  );
}