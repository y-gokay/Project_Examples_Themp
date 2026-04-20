import { apiRequest } from '../utils/api';

/**
 * Get all FAQs
 * @returns {Promise<Object>} - Response with FAQs
 */
export const getAllFAQs = async () => {
  try {
    const response = await apiRequest('/faqs');
    return response;
  } catch (error) {
    console.error('Get all FAQs error:', error);
    throw error;
  }
};

/**
 * Create FAQ
 * @param {Object} data - FAQ data
 * @param {string} data.question - Question
 * @param {string} data.answer - Answer
 * @returns {Promise<Object>} - Response
 */
export const createFAQ = async (data) => {
  try {
    const response = await apiRequest('/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Create FAQ error:', error);
    throw error;
  }
};

/**
 * Delete FAQ
 * @param {number} id - FAQ ID
 * @returns {Promise<Object>} - Response
 */
export const deleteFAQ = async (id) => {
  try {
    const response = await apiRequest(`/faqs/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Delete FAQ error:', error);
    throw error;
  }
};

