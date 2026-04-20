import { api } from "../../lib/api";

/**
 * Other Slice - CV, Bildirim, Randevu, Kayıtlı Arama, İletişim action'ları
 */
export const otherSlice = (set, get) => ({
  // ===== CV ACTION'LARI =====
  uploadCV: async (file, name) => {
    set({ loading: true, error: null });
    const formData = new FormData();
    formData.append("file", file);
    if (name) formData.append("name", name);

    const result = await api.post("/cvs", formData);

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getCVs: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/cvs");

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteCV: async (cvId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/cvs/${cvId}`);

    if (result.success) {
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== BİLDİRİM ACTION'LARI =====
  getNotifications: async (onlyUnread = null) => {
    set({ loading: true, error: null });
    let endpoint = "/notifications";
    if (onlyUnread !== null && onlyUnread !== undefined) {
      endpoint += `?onlyUnread=${onlyUnread.toString().toLowerCase()}`;
    }
    const result = await api.get(endpoint);

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  markNotificationAsRead: async (notificationId) => {
    set({ loading: true, error: null });
    const result = await api.patch(`/notifications/${notificationId}/read`);

    if (result.success) {
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== İLETİŞİM ACTION'LARI =====
  submitContactForm: async (contactData) => {
    set({ loading: true, error: null });
    const result = await api.post("/contacts", contactData);

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return {
      success: false,
      error: result.error,
      errors: result.errors || result.data?.errors || [],
    };
  },

  // ===== SSS ACTION'LARI =====
  getFAQs: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/faqs");

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== RANDEVU ACTION'LARI =====
  getAppointments: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/appointments");

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  // ===== KAYITLI ARAMA ACTION'LARI =====
  saveSearch: async (searchParams) => {
    set({ loading: true, error: null });
    const result = await api.post("/saved-searches", searchParams);

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  getSavedSearches: async () => {
    set({ loading: true, error: null });
    const result = await api.get("/saved-searches");

    if (result.success) {
      set({ loading: false });
      return { success: true, data: result.data };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },

  deleteSavedSearch: async (searchId) => {
    set({ loading: true, error: null });
    const result = await api.delete(`/saved-searches/${searchId}`);

    if (result.success) {
      set({ loading: false });
      return { success: true };
    }

    set({ error: result.error, loading: false });
    return { success: false, error: result.error, errors: result.errors || [] };
  },
});


