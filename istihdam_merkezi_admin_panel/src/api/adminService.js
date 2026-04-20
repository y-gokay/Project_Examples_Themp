import { apiRequest } from '../utils/api';

/**
 * Get all admins with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term (optional)
 * @returns {Promise<Object>} - Response with admins and pagination
 */
export const getAllAdmins = async ({ page = 1, limit = 10, search = '' }) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await apiRequest(`/supervisor/admins?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get all admins error:', error);
    throw error;
  }
};

/**
 * Get admin by ID
 * @param {number} id - Admin ID
 * @returns {Promise<Object>} - Admin data
 */
export const getAdminById = async (id) => {
  try {
    const response = await apiRequest(`/supervisor/admins/${id}`);
    return response;
  } catch (error) {
    console.error('Get admin by id error:', error);
    throw error;
  }
};

/**
 * Create admin
 * @param {Object} data - Admin data
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @param {string} data.name - Name
 * @param {string} data.surname - Surname
 * @param {string} data.email - Email
 * @param {string} data.phoneNumber - Phone number
 * @returns {Promise<Object>} - Response
 */
export const createAdmin = async (data) => {
  try {
    const response = await apiRequest('/supervisor/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Create admin error:', error);
    throw error;
  }
};

/**
 * Update admin
 * @param {number} id - Admin ID
 * @param {Object} data - Admin data
 * @param {string} data.name - Name
 * @param {string} data.surname - Surname
 * @param {string} data.email - Email
 * @returns {Promise<Object>} - Response
 */
export const updateAdmin = async (id, data) => {
  try {
    const response = await apiRequest(`/supervisor/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Update admin error:', error);
    throw error;
  }
};

/**
 * Delete admin
 * @param {number} id - Admin ID
 * @returns {Promise<Object>} - Response
 */
export const deleteAdmin = async (id) => {
  try {
    const response = await apiRequest(`/supervisor/admins/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Delete admin error:', error);
    throw error;
  }
};

/**
 * Reset admin password
 * @param {number} id - Admin ID
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Response
 */
export const resetAdminPassword = async (id, newPassword) => {
  try {
    const response = await apiRequest(`/supervisor/admins/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
    return response;
  } catch (error) {
    console.error('Reset admin password error:', error);
    throw error;
  }
};

/**
 * Get admin activity logs
 * @param {number} id - Admin ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} - Response with admin and logs data
 */
export const getAdminActivity = async (id, { page = 1, limit = 50 } = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest(`/admin/logs/${id}?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Get admin activity error:', error);
    throw error;
  }
};

