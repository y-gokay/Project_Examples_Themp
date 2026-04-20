import { apiRequest } from "../utils/api";

export const getAllBusinesses = async ({
  page = 1,
  limit = 10,
  isApproved = null,
  includeDeleted = false,
}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Always include isApproved parameter, even if null
    if (isApproved === null) {
      params.append("isApproved", "null");
    } else {
      params.append("isApproved", isApproved.toString());
    }

    if (includeDeleted) {
      params.append("includeDeleted", "true");
    }

    const response = await apiRequest(`/admin/businesses?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Get businesses error:", error);
    throw error;
  }
};

export const getBusinessById = async (id) => {
  try {
    const response = await apiRequest(`/admin/businesses/${id}`);
    return response;
  } catch (error) {
    console.error("Get business by id error:", error);
    throw error;
  }
};

export const approveBusiness = async (id) => {
  try {
    const response = await apiRequest(`/admin/businesses/${id}/approve`, {
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Approve business error:", error);
    throw error;
  }
};

export const rejectBusiness = async (id) => {
  try {
    const response = await apiRequest(`/admin/businesses/${id}/reject`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Reject business error:", error);
    throw error;
  }
};

/**
 * Get business job posts
 * @param {number} businessId - Business ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} - Response with job posts and pagination
 */
export const getBusinessJobPosts = async (
  businessId,
  { page = 1, limit = 10 }
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiRequest(
      `/admin/businesses/${businessId}/job-posts?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Get business job posts error:", error);
    throw error;
  }
};

/**
 * Create business
 * @param {Object} data - Business data
 * @returns {Promise<Object>} - Response
 */
export const createBusiness = async (data) => {
  try {
    const response = await apiRequest("/admin/businesses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("Create business error:", error);
    throw error;
  }
};

/**
 * Update business
 * @param {number} id - Business ID
 * @param {Object} data - Business data
 * @returns {Promise<Object>} - Response
 */
export const updateBusiness = async (id, data) => {
  try {
    const response = await apiRequest(`/admin/businesses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("Update business error:", error);
    throw error;
  }
};

export const deleteBusiness = async (id) => {
  try {
    const response = await apiRequest(`/admin/businesses/${id}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Delete business error:", error);
    throw error;
  }
};

export const restoreBusiness = async (id) => {
  try {
    const response = await apiRequest(`/admin/businesses/${id}/restore`, {
      method: "PATCH",
    });
    return response;
  } catch (error) {
    console.error("Restore business error:", error);
    throw error;
  }
};

/**
 * Get business accounts
 * @param {number} businessId - Business ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} - Response with accounts and pagination
 */
export const getBusinessAccounts = async (
  businessId,
  { page = 1, limit = 10, showDeleted = false }
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      showDeleted: showDeleted ? "true" : "false",
    });

    const response = await apiRequest(
      `/admin/businesses/${businessId}/accounts?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Get business accounts error:", error);
    throw error;
  }
};

export const restoreBusinessAccount = async (businessId, accountId) => {
  try {
    const response = await apiRequest(
      `/admin/businesses/${businessId}/accounts/${accountId}/restore`,
      {
        method: "PATCH",
      }
    );
    return response;
  } catch (error) {
    console.error("Restore business account error:", error);
    throw error;
  }
};

/**
 * Create business account
 * @param {number} businessId - Business ID
 * @param {Object} data - Account data
 * @returns {Promise<Object>} - Response
 */
export const createBusinessAccount = async (businessId, data) => {
  try {
    const response = await apiRequest(
      `/admin/businesses/${businessId}/accounts`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error("Create business account error:", error);
    throw error;
  }
};

/**
 * Update business account (admin)
 * PUT /auth/admin/business-accounts/:id
 * @param {number} accountId - Account ID
 * @param {Object} data - Updateable: name, surname, phoneNumber, email, roleId, tc, password (password boşsa gönderilmez)
 * @returns {Promise<Object>} - Response
 */
export const updateBusinessAccount = async (accountId, data) => {
  try {
    const body = { ...data };
    if (!body.password || String(body.password).trim() === "") {
      delete body.password;
    }
    const response = await apiRequest(
      `/auth/admin/business-accounts/${accountId}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
    return response;
  } catch (error) {
    console.error("Update business account error:", error);
    throw error;
  }
};

/**
 * Delete business account
 * @param {number} businessId - Business ID
 * @param {number} accountId - Account ID
 * @returns {Promise<Object>} - Response
 */
export const deleteBusinessAccount = async (businessId, accountId) => {
  try {
    const response = await apiRequest(
      `/admin/businesses/${businessId}/accounts/${accountId}`,
      {
        method: "DELETE",
      }
    );
    return response;
  } catch (error) {
    console.error("Delete business account error:", error);
    throw error;
  }
};

/**
 * Get business applications
 * @param {number} businessId - Business ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status (pending, accepted, rejected)
 * @returns {Promise<Object>} - Response with applications and pagination
 */
export const getBusinessApplications = async (
  businessId,
  { page = 1, limit = 10, status = null }
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    const response = await apiRequest(
      `/admin/businesses/${businessId}/applications?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Get business applications error:", error);
    throw error;
  }
};
