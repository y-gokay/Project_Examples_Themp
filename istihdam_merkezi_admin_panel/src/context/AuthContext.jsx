import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, logout as logoutApi } from '../api/authService';
import { getAuthToken, setAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Try to restore user data from localStorage
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('adminUser');
        }
      } else {
        // Token exists but no user data, consider user authenticated
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await adminLogin(username, password);
      
      // Store user data including isSuperAdmin
      const userData = response.data || {};
      const user = {
        username: userData.username || username,
        name: userData.name,
        surname: userData.surname,
        id: userData.id,
        isSuperAdmin: userData.isSuperAdmin || false,
      };
      setUser(user);
      setIsAuthenticated(true);
      // Save user data to localStorage
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      return { success: true, data: response };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return { 
        success: false, 
        error: error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem('adminUser');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

