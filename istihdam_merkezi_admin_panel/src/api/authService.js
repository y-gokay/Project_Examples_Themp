import { apiRequest, setAuthToken } from '../utils/api';

/**
 * Admin login
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<Object>} - Response with token and user data
 */
export const adminLogin = async (username, password) => {
  try {
    const response = await apiRequest('/auth/login/admin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Store token if received
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout
 * @returns {Promise<Object>} - Response
 */
export const logout = async () => {
  try {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    });

    // Remove token from localStorage
    setAuthToken(null);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, remove token locally
    setAuthToken(null);
    throw error;
  }
};

