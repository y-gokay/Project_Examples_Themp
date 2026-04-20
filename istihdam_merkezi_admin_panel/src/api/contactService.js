import { apiRequest } from '../utils/api';

/**
 * Get all contacts with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string|null} params.status - Filter by status (pending, answered)
 * @returns {Promise<Object>} - Response with contacts and pagination
 */
export const getAllContacts = async ({ page = 1, limit = 20, status = null }) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status !== null) {
      params.append('status', status);
    }

    const response = await apiRequest(`/contacts?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get all contacts error:', error);
    throw error;
  }
};

/**
 * Get contact by ID
 * @param {number} id - Contact ID
 * @returns {Promise<Object>} - Contact data
 */
export const getContactById = async (id) => {
  try {
    const response = await apiRequest(`/contacts/${id}`);
    return response;
  } catch (error) {
    console.error('Get contact by id error:', error);
    throw error;
  }
};

/**
 * Answer contact
 * @param {number} id - Contact ID
 * @param {string} answer - Answer text
 * @returns {Promise<Object>} - Response
 */
export const answerContact = async (id, answer) => {
  try {
    const response = await apiRequest(`/contacts/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
    return response;
  } catch (error) {
    console.error('Answer contact error:', error);
    throw error;
  }
};

/**
 * Delete contact
 * @param {number} id - Contact ID
 * @returns {Promise<Object>} - Response
 */
export const deleteContact = async (id) => {
  try {
    const response = await apiRequest(`/contacts/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Delete contact error:', error);
    throw error;
  }
};

