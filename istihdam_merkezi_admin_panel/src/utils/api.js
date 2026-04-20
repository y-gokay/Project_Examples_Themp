import { getMockApiRequest } from '../mocks/index.js';

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

const _mockApiRequest = import.meta.env.VITE_USE_MOCK === 'true' ? getMockApiRequest() : null;

// Base fetch function with authentication
export const apiRequest = async (endpoint, options = {}) => {
  if (_mockApiRequest) return _mockApiRequest(endpoint, options);
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const err = new Error(typeof data === 'object' ? (data.message || `HTTP error! status: ${response.status}`) : (data || `HTTP error! status: ${response.status}`));
      err.responseData = typeof data === 'object' ? data : null;
      throw err;
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default API_BASE_URL;

