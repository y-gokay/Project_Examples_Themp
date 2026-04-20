import { apiRequest } from '../utils/api';

/**
 * Get pending change requests
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} - Response with change requests and pagination
 */
export const getPendingChangeRequests = async ({ page = 1, limit = 10 }) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiRequest(`/admin/change-requests/pending?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get pending change requests error:', error);
    throw error;
  }
};

/**
 * Approve change request
 * @param {number} id - Change request ID
 * @returns {Promise<Object>} - Response
 */
export const approveChangeRequest = async (id) => {
  try {
    const response = await apiRequest(`/admin/change-requests/${id}/approve`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Approve change request error:', error);
    throw error;
  }
};

/**
 * Reject change request
 * @param {number} id - Change request ID
 * @returns {Promise<Object>} - Response
 */
export const rejectChangeRequest = async (id) => {
  try {
    const response = await apiRequest(`/admin/change-requests/${id}/reject`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Reject change request error:', error);
    throw error;
  }
};

/**
 * Get change request by ID
 * @param {number} id - Change request ID
 * @returns {Promise<Object>} - Change request data
 */
export const getChangeRequestById = async (id) => {
  try {
    const response = await apiRequest(`/admin/change-requests/${id}`);
    return response;
  } catch (error) {
    console.error('Get change request by id error:', error);
    throw error;
  }
};

/**
 * Get change requests by business ID
 * @param {number} businessId - Business ID
 * @returns {Promise<Object>} - Response with change requests
 */
export const getBusinessChangeRequests = async (businessId) => {
  try {
    const response = await apiRequest(`/admin/change-requests/business/${businessId}`);
    return response;
  } catch (error) {
    console.error('Get business change requests error:', error);
    throw error;
  }
};

