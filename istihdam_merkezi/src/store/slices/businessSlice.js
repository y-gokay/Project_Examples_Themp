import { api, clearCacheForEndpoint, clearCache } from "../../lib/api";

/**
 * Business Slice - İşveren ile ilgili state ve action'lar
 */
export const businessSlice = (set, get) => ({
  // ===== İŞVEREN PROFİL ACTION'LARI =====
  getBusinessProfile: async (skipCache = false) => {
    set({ loading: true, error: null });
    const result = await api.get("/businesses/profile", {
      skipCache: skipCache,
    });

    if (result.success && result.data) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  submitBusinessChangeRequest: async (changeData) => {
    set({ loading: true, error: null });
    const result = await api.post("/businesses/change-requests", changeData);

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getBusinessChangeRequests: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/businesses/change-requests");

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getPendingBusinessChangeRequest: async (skipCache = false) => {
    set({ loading: true, error: null });
    const result = await api.get("/businesses/change-requests/pending", {
      skipCache: skipCache,
    });

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  cancelBusinessChangeRequest: async () => {
    set({ loading: true, error: null });
    const result = await api.delete("/businesses/change-requests");

    if (result.success) {
      set({ loading: false });
      return { success: true, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  addBusinessSector: async (sectorId) => {
    set({ loading: true, error: null });
    const result = await api.post("/businesses/sectors", { sectorId });

    if (result.success) {
      clearCacheForEndpoint("/businesses/profile", "GET");
      set({ loading: false });
      return { success: true, data: result.data, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  removeBusinessSector: async (sectorId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/businesses/sectors/${sectorId}`);

    if (result.success) {
      clearCacheForEndpoint("/businesses/profile", "GET");
      set({ loading: false });
      return { success: true, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getBusinessAccounts: async (skipCache = false) => {
    set({ loading: true, error: null });
    const result = await api.get("/businesses/accounts", {
      skipCache: skipCache,
    });

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  createBusinessAccount: async (accountData) => {
    set({ loading: true, error: null });
    const result = await api.post("/businesses/accounts", accountData);

    if (result.success) {
      clearCacheForEndpoint("/businesses/accounts", "GET");
      set({ loading: false });
      return { success: true, data: result.data, message: result.message };
    }

    set({ error: result.error, loading: false });
    return {
      success: false,
      error: result.error,
      errors: result.errors || [], // Backend'den gelen field-specific hatalar
    };
  },

  deleteBusinessAccount: async (accountId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/businesses/accounts/${accountId}`);

    if (result.success) {
      clearCacheForEndpoint("/businesses/accounts", "GET");
      set({ loading: false });
      return { success: true, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  transferOperatorRole: async (accountId) => {
    set({ loading: true, error: null });
    const result = await api.post(`/businesses/accounts/${accountId}`);

    if (result.success) {
      clearCacheForEndpoint("/businesses/accounts", "GET");
      set({ loading: false });
      return { success: true, message: result.message, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  changeBusinessPassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    const result = await api.put("/businesses/change-password", {
      currentPassword,
      newPassword,
    });

    if (result.success) {
      set({ loading: false });
      return { success: true, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== İŞVEREN İŞ İLANI ACTION'LARI =====
  getBusinessJobPosts: async (page = 1, limit = 10, skipCache = false) => {
    set({ loading: true, error: null });
    const result = await api.get(
      `/businesses/job-posts?page=${page}&limit=${limit}`,
      {
        skipCache: skipCache,
      }
    );

    if (result.success) {
      set({ loading: false });
      return {
        success: true,
        data: result.data.jobPosts || result.data || [],
        pagination: result.data.pagination,
      };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  createBusinessJobPost: async (jobPostData) => {
    set({ loading: true, error: null });
    const result = await api.post("/businesses/job-posts", jobPostData);

    if (result.success) {
      clearCache(); // Paginated endpoint
      set({ loading: false });
      return { success: true, data: result.data, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  updateBusinessJobPost: async (jobPostId, jobPostData) => {
    set({ loading: true, error: null });
    const result = await api.put(
      `/businesses/job-posts/${jobPostId}`,
      jobPostData
    );

    if (result.success) {
      clearCache(); // Paginated endpoint
      set({ loading: false });
      return { success: true, data: result.data, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteBusinessJobPost: async (jobPostId) => {
    set({ loading: true, error: null });
    // Not: API dokümantasyonuna göre /businesses/job-posts/:id kullanılıyor
    const result = await api.delete(`/businesses/job-posts/${jobPostId}`);

    if (result.success) {
      clearCache(); // Paginated endpoint
      set({ loading: false });
      return { success: true, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ID'ye göre tek bir iş ilanı getir
  getBusinessJobPost: async (jobPostId) => {
    set({ loading: true, error: null });
    const result = await api.get(`/businesses/job-posts/${jobPostId}`);

    if (result.success) {
      set({ loading: false });
      return {
        success: true,
        data: result.data.jobPost || result.data || null,
      };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  toggleJobPostVisibility: async (jobPostId, isShown) => {
    set({ loading: true, error: null });
    const result = await api.patch(
      `/businesses/job-posts/${jobPostId}/visibility`,
      {
        isShown,
      }
    );

    if (result.success) {
      clearCache(); // Paginated endpoint
      set({ loading: false });
      return { success: true, data: result.data, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  cancelJobPostUpdateRequest: async (jobPostId) => {
    set({ loading: true, error: null });
    const result = await api.post(
      `/businesses/job-posts/${jobPostId}/cancel-update`
    );

    if (result.success) {
      clearCache(); // Paginated endpoint
      set({ loading: false });
      return { success: true, message: result.message };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },
});
