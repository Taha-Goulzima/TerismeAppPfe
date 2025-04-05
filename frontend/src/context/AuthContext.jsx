import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to verify and decode token
  const verifyToken = (token) => {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      if (decodedToken.exp * 1000 > Date.now()) {
        return decodedToken;
      }
      return null;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  };

  // Function to check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setUser(null);
      return false;
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
    setLoading(false);
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
        return response;
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

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
    
    return true;
  };

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return null;
    }
    
    return token;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    getToken,
    api
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