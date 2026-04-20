import { apiRequest } from '../utils/api';

/**
 * Get all applications with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status (pending, accepted, rejected, employed)
 * @param {number} params.userId - Filter by user ID
 * @param {number} params.businessId - Filter by business ID
 * @returns {Promise<Object>} - Response with applications grouped by job post and pagination
 */
export const getAllApplications = async ({
  page = 1,
  limit = 10,
  status = null,
  userId = null,
  businessId = null,
}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }
    if (userId) {
      params.append('userId', userId.toString());
    }
    if (businessId) {
      params.append('businessId', businessId.toString());
    }

    const response = await apiRequest(`/admin/applications?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get applications error:', error);
    throw error;
  }
};

/**
 * Get application by ID
 * @param {number} id - Application ID
 * @returns {Promise<Object>} - Application data
 */
export const getApplicationById = async (id) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}`);
    return response;
  } catch (error) {
    console.error('Get application by id error:', error);
    throw error;
  }
};

/**
 * Accept application
 * @param {number} id - Application ID
 * @returns {Promise<Object>} - Response
 */
export const acceptApplication = async (id) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/accept`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Accept application error:', error);
    throw error;
  }
};

/**
 * Send accept SMS for an already accepted application
 * @param {number} id - Application ID
 * @returns {Promise<Object>} - Response
 */
export const sendAcceptSmsForApplication = async (id) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/send-accept-sms`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Send accept SMS error:', error);
    throw error;
  }
};

/**
 * Reject application
 * @param {number} id - Application ID
 * @param {string} rejectReason - Rejection reason
 * @returns {Promise<Object>} - Response
 */
export const rejectApplication = async (id, rejectReason) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectReason }),
    });
    return response;
  } catch (error) {
    console.error('Reject application error:', error);
    throw error;
  }
};

/**
 * Employ user (accept application and mark as employed)
 * @param {number} id - Application ID
 * @returns {Promise<Object>} - Response
 */
export const employUser = async (id) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/employe`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Employ user error:', error);
    throw error;
  }
};

/**
 * Soft delete application
 * @param {number} id - Application ID
 * @returns {Promise<Object>} - Response
 */
export const deleteApplication = async (id) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Delete application error:', error);
    throw error;
  }
};

/**
 * Create application for a specific user to a job post (admin action)
 * @param {number} jobPostId - Job post ID
 * @param {{ userId: number, coverLetter?: string }} data - Application data
 * @returns {Promise<Object>} - Response
 */
export const createApplicationForUser = async (jobPostId, { userId, coverLetter }) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${jobPostId}/applications`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        coverLetter,
      }),
    });
    return response;
  } catch (error) {
    console.error('Create application for user error:', error);
    throw error;
  }
};

