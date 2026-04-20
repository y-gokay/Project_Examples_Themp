import { apiRequest, getAuthToken } from '../utils/api';
import API_BASE_URL from '../utils/api';

/**
 * Get all users with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {Object} params.filters - Filter object
 * @param {string} params.filters.search - Search term (name, surname, tc, tel, email)
 * @param {boolean} params.filters.isApproved - Approval status
 * @param {string} params.filters.gender - Gender (male, female, null)
 * @param {number} params.filters.nationalityId - Nationality ID
 * @param {boolean} params.filters.workingStatus - Working status
 * @param {number} params.filters.districtId - District ID
 * @param {number} params.filters.age - Age
 * @param {number} params.filters.ageMin - Minimum age
 * @param {number} params.filters.ageMax - Maximum age
 * @returns {Promise<Object>} - Response with users and pagination
 */
export const getAllUsers = async ({ page = 1, limit = 10, filters = {}, includeDeleted = false }) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (includeDeleted) {
      params.append('includeDeleted', 'true');
    }

    const response = await apiRequest(`/admin/users?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
    return response;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} - User data
 */
export const getUserById = async (id) => {
  try {
    const response = await apiRequest(`/admin/users/${id}`);
    return response;
  } catch (error) {
    console.error('Get user by id error:', error);
    throw error;
  }
};

/**
 * Send email to user
 * @param {number} id - User ID
 * @param {Object} data - Email data
 * @param {string} data.subject - Email subject
 * @param {string} data.body - Email body
 * @returns {Promise<Object>} - Response
 */
export const sendEmailToUser = async (id, data) => {
  try {
    const response = await apiRequest(`/admin/users/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Send email to user error:', error);
    throw error;
  }
};

/**
 * Get user applications
 * @param {number} id - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Status filter (pending, accepted, rejected, employed)
 * @returns {Promise<Object>} - Response with applications and pagination
 */
export const getUserApplications = async (id, { page = 1, limit = 10, status = null } = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await apiRequest(`/admin/users/${id}/applications?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get user applications error:', error);
    throw error;
  }
};

/**
 * Get user job recommendations
 * @param {number} id - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Items per page (default: 10)
 * @param {number} params.minScore - Minimum score (default: 50)
 * @returns {Promise<Object>} - Response with job recommendations
 */
export const getUserJobRecommendations = async (id, { limit = 10, minScore = 0 } = {}) => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      minScore: minScore.toString(),
    });

    const response = await apiRequest(`/admin/users/${id}/job-recommendations?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get user job recommendations error:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

export const restoreUser = async (id) => {
  try {
    const response = await apiRequest(`/admin/users/${id}/restore`, {
      method: 'PATCH',
    });
    return response;
  } catch (error) {
    console.error('Restore user error:', error);
    throw error;
  }
};

/**
 * Admin update user profile
 * @param {number} id - User ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} - Updated user data
 */
export const adminUpdateUser = async (id, data) => {
  try {
    const response = await apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Admin update user error:', error);
    throw error;
  }
};

// ─── Admin Sub-entity CRUD ───

const adminSubEntityRequest = async (userId, path, method = 'POST', data = null) => {
  const options = { method };
  if (data) options.body = JSON.stringify(data);
  return apiRequest(`/admin/users/${userId}/${path}`, options);
};

export const adminAddWorkExperience = (userId, data) => adminSubEntityRequest(userId, 'work-experiences', 'POST', data);
export const adminDeleteWorkExperience = (userId, expId) => adminSubEntityRequest(userId, `work-experiences/${expId}`, 'DELETE');

export const adminAddEducation = (userId, data) => adminSubEntityRequest(userId, 'educations', 'POST', data);
export const adminDeleteEducation = (userId, eduId) => adminSubEntityRequest(userId, `educations/${eduId}`, 'DELETE');

export const adminAddLanguage = (userId, data) => adminSubEntityRequest(userId, 'languages', 'POST', data);
export const adminDeleteLanguage = (userId, langId) => adminSubEntityRequest(userId, `languages/${langId}`, 'DELETE');

export const adminAddDrivingLicense = (userId, data) => adminSubEntityRequest(userId, 'driving-licenses', 'POST', data);
export const adminDeleteDrivingLicense = (userId, licId) => adminSubEntityRequest(userId, `driving-licenses/${licId}`, 'DELETE');

export const adminAddProfession = (userId, data) => adminSubEntityRequest(userId, 'professions', 'POST', data);
export const adminDeleteProfession = (userId, profId) => adminSubEntityRequest(userId, `professions/${profId}`, 'DELETE');

export const adminAddSector = (userId, data) => adminSubEntityRequest(userId, 'sectors', 'POST', data);
export const adminDeleteSector = (userId, secId) => adminSubEntityRequest(userId, `sectors/${secId}`, 'DELETE');

// Profile picture upload (multipart/form-data)
export const adminUploadProfilePicture = async (userId, file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/profile-picture`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Profil fotoğrafı yüklenemedi');
  return data;
};

export const adminDeleteProfilePicture = (userId) => adminSubEntityRequest(userId, 'profile-picture', 'DELETE');

export const adminDownloadCvPdf = async (userId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/cv/pdf`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'CV oluşturulamadı');
  }
  return response.blob();
};

