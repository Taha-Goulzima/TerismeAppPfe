import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to verify token with backend
  const verifyTokenWithBackend = async (token) => {
    try {
      const response = await api.get('/user/validate-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Function to check authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setUser(null);
      return false;
    }

    try {
      // Verify token with backend
      const response = await api.get('/user/validate-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.valid) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        return false;
      }

      // Update user data with the latest from server
      const userData = response.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await api.post('/user/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    return await verifyTokenWithBackend(token);
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const updateUserData = async () => {
    try {
      const token = getToken();
      if (!token || !user?._id) return;

      const response = await api.get(`/user/${user._id}`);
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    isAuthenticated,
    getToken,
    updateUserData
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};