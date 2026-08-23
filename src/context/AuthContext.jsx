import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Auth init - token:', token ? 'exists' : 'none');
      console.log('🔍 Auth init - storedUser:', storedUser ? 'exists' : 'none');
      
      // Only set user if both token and user exist
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('✅ Setting user from localStorage:', userData);
          setUser(userData);
        } catch (error) {
          console.error('❌ Auth init error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        // Clear any invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('⚠️ No valid session found');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await authService.login(email, password);
      console.log('✅ Login response:', response);
      
      const { token, user } = response;
      
      if (!token || !user) {
        console.error('❌ Invalid login response');
        return { success: false, error: 'Invalid response from server' };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('✅ Login successful! User role:', user.role);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      const response = await authService.register(userData);
      console.log('✅ Register response:', response);
      
      const { token, user } = response;
      
      if (!token || !user) {
        console.error('❌ Invalid register response');
        return { success: false, error: 'Invalid response from server' };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('✅ Registration successful! User role:', user.role);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestToken');
    localStorage.removeItem('guestRoom');
    setUser(null);
    console.log('👋 User logged out');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'property_admin' || user?.role === 'super_admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};