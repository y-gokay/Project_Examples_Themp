import { apiRequest } from '../utils/api';

/**
 * Get nationalities lookup
 * @returns {Promise<Object>} - Response with nationalities
 */
export const getNationalities = async () => {
  try {
    const response = await apiRequest('/lookups/nationalities');
    return response;
  } catch (error) {
    console.error('Get nationalities error:', error);
    throw error;
  }
};

/**
 * Get professions lookup
 * @returns {Promise<Object>} - Response with professions
 */
export const getProfessions = async () => {
  try {
    const response = await apiRequest('/lookups/professions');
    return response;
  } catch (error) {
    console.error('Get professions error:', error);
    throw error;
  }
};

/**
 * Get working methods lookup
 * @returns {Promise<Object>} - Response with working methods
 */
export const getWorkingMethods = async () => {
  try {
    const response = await apiRequest('/lookups/working-methods');
    return response;
  } catch (error) {
    console.error('Get working methods error:', error);
    throw error;
  }
};

/**
 * Get cities lookup
 * @returns {Promise<Object>} - Response with cities
 */
export const getCities = async () => {
  try {
    const response = await apiRequest('/lookups/cities');
    return response;
  } catch (error) {
    console.error('Get cities error:', error);
    throw error;
  }
};

/**
 * Get neighbourhoods by district
 * @param {number} districtId - District ID
 * @returns {Promise<Object>} - Response with neighbourhoods
 */
export const getNeighbourhoodsByDistrict = async (districtId) => {
  try {
    const response = await apiRequest(`/lookups/neighbourhoods/${districtId}`);
    return response;
  } catch (error) {
    console.error('Get neighbourhoods by district error:', error);
    throw error;
  }
};

/**
 * Get districts by city
 * @param {number} cityId - City ID
 * @returns {Promise<Object>} - Response with districts
 */
export const getDistrictsByCity = async (cityId) => {
  try {
    const response = await apiRequest(`/lookups/districts/${cityId}`);
    return response;
  } catch (error) {
    console.error('Get districts by city error:', error);
    throw error;
  }
};

/**
 * Get universities lookup
 * @returns {Promise<Object>} - Response with universities
 */
export const getUniversities = async () => {
  try {
    const response = await apiRequest('/lookups/universities');
    return response;
  } catch (error) {
    console.error('Get universities error:', error);
    throw error;
  }
};

/**
 * Get faculties by university
 * @param {number} universityId
 * @returns {Promise<Object>}
 */
export const getFacultiesByUniversity = async (universityId) => {
  try {
    const response = await apiRequest(`/lookups/faculties/university/${universityId}`);
    return response;
  } catch (error) {
    console.error('Get faculties error:', error);
    throw error;
  }
};

/**
 * Get departments by faculty
 * @param {number} facultyId
 * @returns {Promise<Object>}
 */
export const getDepartmentsByFaculty = async (facultyId) => {
  try {
    const response = await apiRequest(`/lookups/departments/faculty/${facultyId}`);
    return response;
  } catch (error) {
    console.error('Get departments error:', error);
    throw error;
  }
};

/**
 * Get schools by city
 * @param {number} cityId
 * @param {string} [type] - optional school type filter
 * @returns {Promise<Object>}
 */
export const getSchoolsByCity = async (cityId, type) => {
  try {
    const params = type ? `?type=${type}` : '';
    const response = await apiRequest(`/lookups/schools/city/${cityId}${params}`);
    return response;
  } catch (error) {
    console.error('Get schools error:', error);
    throw error;
  }
};

/**
 * Get education types lookup
 * @returns {Promise<Object>} - Response with education types
 */
export const getEducationTypes = async () => {
  try {
    const response = await apiRequest('/lookups/education-types');
    return response;
  } catch (error) {
    console.error('Get education types error:', error);
    throw error;
  }
};

/**
 * Get applicant rights lookup
 * @returns {Promise<Object>} - Response with applicant rights
 */
export const getApplicantRights = async () => {
  try {
    const response = await apiRequest('/lookups/applicant-rights');
    return response;
  } catch (error) {
    console.error('Get applicant rights error:', error);
    throw error;
  }
};

/**
 * Get driving license types lookup
 * @returns {Promise<Object>} - Response with driving license types
 */
export const getDrivingLicenseTypes = async () => {
  try {
    const response = await apiRequest('/lookups/driving-license-types');
    return response;
  } catch (error) {
    console.error('Get driving license types error:', error);
    throw error;
  }
};

/**
 * Get work days lookup
 * @returns {Promise<Object>} - Response with work days
 */
export const getWorkDays = async () => {
  try {
    const response = await apiRequest('/lookups/days');
    return response;
  } catch (error) {
    console.error('Get work days error:', error);
    throw error;
  }
};

/**
 * Get working experiences lookup
 * @returns {Promise<Object>} - Response with working experiences
 */
export const getWorkingExperiences = async () => {
  try {
    const response = await apiRequest('/lookups/working-experiences');
    return response;
  } catch (error) {
    console.error('Get working experiences error:', error);
    throw error;
  }
};

/**
 * Get sectors lookup
 * @returns {Promise<Object>} - Response with sectors
 */
export const getSectors = async () => {
  try {
    const response = await apiRequest('/lookups/sectors');
    return response;
  } catch (error) {
    console.error('Get sectors error:', error);
    throw error;
  }
};

/**
 * Get languages lookup
 * @returns {Promise<Object>} - Response with languages
 */
export const getLanguages = async () => {
  try {
    const response = await apiRequest('/lookups/languages');
    return response;
  } catch (error) {
    console.error('Get languages error:', error);
    throw error;
  }
};

/**
 * Get business roles lookup
 * @returns {Promise<Object>} - Response with business roles
 */
export const getBusinessRoles = async () => {
  try {
    const response = await apiRequest('/lookups/business-roles');
    return response;
  } catch (error) {
    console.error('Get business roles error:', error);
    throw error;
  }
};

/**
 * Search professions with query parameter and pagination
 * @param {string} search - Search term
 * @param {number} limit - Items per page (default 30)
 * @param {number} page - Page number (default 1)
 * @returns {Promise<Object>} - Response with professions { success, data, pagination }
 */
export const searchProfessions = async (search = '', limit = 30, page = 1) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    params.append('page', String(page));
    if (search && String(search).trim()) {
      params.append('search', String(search).trim());
    }
    const response = await apiRequest(`/lookups/professions?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Search professions error:', error);
    throw error;
  }
};

