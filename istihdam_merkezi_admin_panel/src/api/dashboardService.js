import { apiRequest } from '../utils/api';

/**
 * Get basic dashboard statistics
 * @returns {Promise<Object>} - Basic dashboard stats data
 */
export const getBasicStats = async () => {
  try {
    const response = await apiRequest('/admin/dashboard/stats/basic');
    return response;
  } catch (error) {
    console.error('Get basic stats error:', error);
    throw error;
  }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} - User stats data
 */
export const getUserStats = async () => {
  try {
    const response = await apiRequest('/admin/dashboard/stats/users');
    return response;
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

/**
 * Get job post statistics
 * @returns {Promise<Object>} - Job post stats data
 */
export const getJobPostStats = async () => {
  try {
    const response = await apiRequest('/admin/dashboard/stats/job-posts');
    return response;
  } catch (error) {
    console.error('Get job post stats error:', error);
    throw error;
  }
};

/**
 * Get time-based statistics
 * @param {string} period - Period: 'day', 'week', or 'month'
 * @returns {Promise<Object>} - Time-based stats data
 */
export const getTimeBasedStats = async (period = 'day') => {
  try {
    const response = await apiRequest(`/admin/dashboard/stats/time-based?period=${period}`);
    return response;
  } catch (error) {
    console.error('Get time-based stats error:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const getDashboardStats = getBasicStats;

