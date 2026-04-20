import { apiRequest } from '../utils/api';

/**
 * Get all job posts with pagination & filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {number|null} params.businessId - Filter by business ID
 * @param {boolean|null} params.isApproved - Filter by approval status (true, false, null)
 * @param {Array<number>|string|null} params.professionIds - Comma separated or array of profession ids
 * @param {Array<number>|string|null} params.workingMethodIds - Comma separated or array of working method ids
 * @param {Array<number>|string|null} params.sectorIds - Comma separated or array of sector ids
 * @param {Array<number>|string|null} params.districtIds - Comma separated or array of district ids
 * @param {boolean|null} params.isForDisabled - Filter only disabled posts
 * @param {string} params.search - Search term
 * @param {boolean} params.onlySearchInTitle - If true, search only in title
 * @returns {Promise<Object>} - Response with job posts and pagination
 */
export const getAllJobPosts = async ({
  page = 1,
  limit = 10,
  lightweight = false,
  businessId = null,
  isApproved = null,
  professionIds = null,
  workingMethodIds = null,
  sectorIds = null,
  districtIds = null,
  isForDisabled = null,
  search = '',
  onlySearchInTitle = false,
  includeDeleted = false,
  includeExpired = false,
} = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (includeDeleted) {
      params.append('includeDeleted', 'true');
    }

    if (includeExpired) {
      params.append('includeExpired', 'true');
    }

    if (lightweight) {
      params.append('lightweight', 'true');
    }

    if (businessId !== null && businessId !== undefined) {
      params.append('businessId', String(businessId));
    }

    // Onay durumu
    if (isApproved !== null && isApproved !== undefined) {
      // Backend 'null' stringini özel olarak null kabul ediyor
      if (isApproved === 'null') {
        params.append('isApproved', 'null');
      } else {
        params.append('isApproved', String(isApproved));
      }
    }

    const appendIdList = (key, value) => {
      if (!value) return;
      // Allow both string and array forms
      const asString = Array.isArray(value) ? value.join(',') : String(value);
      if (asString.trim().length === 0) return;
      params.append(key, asString);
    };

    appendIdList('professionIds', professionIds);
    appendIdList('workingMethodIds', workingMethodIds);
    appendIdList('sectorIds', sectorIds);
    appendIdList('districtIds', districtIds);

    if (isForDisabled === true) {
      params.append('isForDisabled', 'true');
    }

    if (search && String(search).trim().length > 0) {
      params.append('search', String(search).trim());
    }

    if (onlySearchInTitle) {
      params.append('onlySearchInTitle', 'true');
    }

    const response = await apiRequest(`/admin/job-posts?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get job posts error:', error);
    throw error;
  }
};

/**
 * Get job post by ID
 * @param {number} id - Job post ID
 * @returns {Promise<Object>} - Job post data
 */
export const getJobPostById = async (id, { includeDeleted = false } = {}) => {
  try {
    const params = new URLSearchParams();
    if (includeDeleted) {
      params.append("includeDeleted", "true");
    }

    const url = params.toString()
      ? `/admin/job-posts/${id}?${params.toString()}`
      : `/admin/job-posts/${id}`;

    const response = await apiRequest(url);
    return response;
  } catch (error) {
    console.error('Get job post by id error:', error);
    throw error;
  }
};

/**
 * Approve job post
 * @param {number} id - Job post ID
 * @returns {Promise<Object>} - Response
 */
export const approveJobPost = async (id) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${id}/approve`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Approve job post error:', error);
    throw error;
  }
};

/**
 * Reject job post
 * @param {number} id - Job post ID
 * @returns {Promise<Object>} - Response
 */
export const rejectJobPost = async (id) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${id}/reject`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Reject job post error:', error);
    throw error;
  }
};

/**
 * Create job post
 * @param {Object} data - Job post data
 * @returns {Promise<Object>} - Response
 */
export const createJobPost = async (data) => {
  try {
    const response = await apiRequest('/admin/job-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Create job post error:', error);
    throw error;
  }
};

/**
 * Update job post
 * @param {number} id - Job post ID
 * @param {Object} data - Job post data
 * @returns {Promise<Object>} - Response
 */
export const updateJobPost = async (id, data) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Update job post error:', error);
    throw error;
  }
};

/**
 * Delete job post
 * @param {number} id - Job post ID
 * @returns {Promise<Object>} - Response
 */
export const deleteJobPost = async (id) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Delete job post error:', error);
    throw error;
  }
};

export const restoreJobPost = async (id) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${id}/restore`, {
      method: 'PATCH',
    });
    return response;
  } catch (error) {
    console.error('Restore job post error:', error);
    throw error;
  }
};

/**
 * Get all job post update requests
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string|null} params.status - Filter by status (pending, approved, rejected)
 * @returns {Promise<Object>} - Response with update requests and pagination
 */
export const getAllUpdateRequests = async ({ page = 1, limit = 10, status = null }) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status !== null) {
      params.append('status', status);
    }

    const response = await apiRequest(`/admin/job-posts/update-requests?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get update requests error:', error);
    throw error;
  }
};

/**
 * Get job post update requests by job post ID
 * @param {number} jobPostId - Job post ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} - Response with update requests and pagination
 */
export const getJobPostUpdateRequests = async (jobPostId, { page = 1, limit = 10 } = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiRequest(`/admin/job-posts/${jobPostId}/update-requests?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get job post update requests error:', error);
    throw error;
  }
};

/**
 * Get update request by ID
 * @param {number} id - Update request ID
 * @returns {Promise<Object>} - Update request data
 */
export const getUpdateRequestById = async (id) => {
  try {
    const response = await apiRequest(`/admin/job-posts/update-requests/${id}`);
    return response;
  } catch (error) {
    console.error('Get update request by id error:', error);
    throw error;
  }
};

/**
 * Get recommended users for a job post
 * @param {number} jobPostId - Job post ID
 * @returns {Promise<Object>} - Response with recommended users
 */
export const getJobPostRecommends = async (jobPostId) => {
  try {
    const response = await apiRequest(`/admin/job-posts/recommends?jobPostId=${jobPostId}`);
    return response;
  } catch (error) {
    console.error('Get job post recommends error:', error);
    throw error;
  }
};

/**
 * Get applications for a job post
 * @param {number} jobPostId - Job post ID
 * @returns {Promise<Object>} - Response with applications
 */
export const getJobPostApplications = async (
  jobPostId,
  { includeDeleted = false, page, limit } = {},
) => {
  try {
    const params = new URLSearchParams();
    if (includeDeleted) params.append("includeDeleted", "true");
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const url = params.toString()
      ? `/admin/job-posts/${jobPostId}/applications?${params.toString()}`
      : `/admin/job-posts/${jobPostId}/applications`;

    const response = await apiRequest(url);
    return response;
  } catch (error) {
    console.error('Get job post applications error:', error);
    throw error;
  }
};

/**
 * Approve update request
 * @param {number} updateRequestId - Update request ID
 * @returns {Promise<Object>} - Response
 */
export const approveUpdateRequest = async (updateRequestId) => {
  try {
    const response = await apiRequest(`/admin/job-posts/update-requests/${updateRequestId}/approve`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Approve update request error:', error);
    throw error;
  }
};

/**
 * Reject update request
 * @param {number} updateRequestId - Update request ID
 * @returns {Promise<Object>} - Response
 */
export const rejectUpdateRequest = async (updateRequestId) => {
  try {
    const response = await apiRequest(`/admin/job-posts/update-requests/${updateRequestId}/reject`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Reject update request error:', error);
    throw error;
  }
};

/**
 * Toggle job post visibility (show/hide)
 * @param {number} id - Job post ID
 * @returns {Promise<Object>} - Response
 */
export const toggleJobPostVisibility = async (id) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${id}/toggle-visibility`, {
      method: 'PATCH',
    });
    return response;
  } catch (error) {
    console.error('Toggle job post visibility error:', error);
    throw error;
  }
};

/**
 * Toggle job post active status
 * @param {number} id - Job post ID
 * @returns {Promise<Object>} - Response
 */
export const toggleJobPostActive = async (id) => {
  try {
    const response = await apiRequest(`/admin/job-posts/${id}/toggle-active`, {
      method: 'PATCH',
    });
    return response;
  } catch (error) {
    console.error('Toggle job post active error:', error);
    throw error;
  }
};

