import { api, setToken } from "../../lib/api";
import { warn as logWarn } from "../../utils/logger";

/**
 * Auth Slice - Kimlik doğrulama ile ilgili state ve action'lar
 */
export const authSlice = (set, get) => ({
  // Kimlik Doğrulama State'i
  user: null,
  isAuthenticated: false,

  // ===== KİMLİK DOĞRULAMA ACTION'LARI =====
  login: async (email, password, userType = "user") => {
    set({ loading: true, error: null });

    try {
      // API endpoint: /auth/login/user veya /auth/login/business
      const endpoint =
        userType === "business" ? "/auth/login/business" : "/auth/login/user";
      const result = await api.post(endpoint, { email, password });

      if (result.success) {
        // Token'ı kaydet - API response formatına göre token'ı bul
        const token =
          result.token ||
          result.data?.token ||
          result.data?.tokens?.accessToken ||
          result.data?.accessToken;

        if (token) {
          setToken(token);
        } else {
          logWarn("Token not found in API response", result);
        }

        // User data formatını API response'una göre düzenle
        const userData = result.data || {};

        const user = {
          id: userData.id,
          name: userData.name || "",
          surname: userData.surname || "",
          email: userData.email,
          phone: userData.phoneNumber,
          phoneNumber: userData.phoneNumber,
          avatar: userData.profilePicture,
          profilePicture: userData.profilePicture,
          role: result.userType === "business" ? "employer" : "seeker",
          userType: result.userType || userType,
          // Business için ek alanlar
          ...(result.userType === "business" && {
            businessName: userData.businessName,
            businessEmail: userData.businessEmail,
          }),
        };

        set({
          user,
          isAuthenticated: true,
          loading: false,
        });
        return { success: true, user };
      }

      // Başarısız response - backend'den gelen hataları kullan
      const backendErrorMsg = result.errors?.length
        ? result.errors
            .map((e) => e.message || e.msg)
            .filter(Boolean)
            .join(", ")
        : null;
      const errorMessage =
        backendErrorMsg || result.error || result.message || "Giriş yapılamadı";
      set({ error: errorMessage, loading: false });
      return {
        success: false,
        error: errorMessage,
        errors: result.errors || [],
      };
    } catch (error) {
      const userFriendlyMessage =
        "Giriş yapılırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.";
      set({ error: userFriendlyMessage, loading: false });
      return { success: false, error: userFriendlyMessage, errors: [] };
    }
  },

  register: async (data, userType = "user") => {
    set({ loading: true, error: null });

    // API endpoint: /auth/register/user veya /auth/register/business
    const endpoint =
      userType === "business"
        ? "/auth/register/business"
        : "/auth/register/user";
    const result = await api.post(endpoint, data);

    if (result.success) {
      set({ loading: false });
      return { success: true };
    }

    // API'den gelen hataları döndür
    set({ error: result.error, loading: false });
    return {
      success: false,
      error: result.error,
      errors: result.errors || result.data?.errors || [],
    };
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore
    }
    setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  // Password Reset Actions
  forgotPassword: async (phoneNumber) => {
    set({ loading: true, error: null });
    const result = await api.post("/auth/forgot-password", { phoneNumber });

    if (result.success) {
      set({ loading: false });
      return { success: true, message: result.message };
    }

    const backendErrorMsg = result.errors?.length
      ? result.errors
          .map((e) => e.message || e.msg)
          .filter(Boolean)
          .join(", ")
      : null;
    set({ error: backendErrorMsg || result.error, loading: false });
    return {
      success: false,
      error: backendErrorMsg || result.error,
      errors: result.errors || [],
    };
  },

  verifyResetOtp: async (phoneNumber, otp) => {
    set({ loading: true, error: null });
    const result = await api.post("/auth/verify-reset-otp", {
      phoneNumber,
      otp,
    });

    if (result.success) {
      set({ loading: false });
      return {
        success: true,
        resetToken: result.resetToken || result.data?.resetToken,
      };
    }

    const backendErrorMsg2 = result.errors?.length
      ? result.errors
          .map((e) => e.message || e.msg)
          .filter(Boolean)
          .join(", ")
      : null;
    set({ error: backendErrorMsg2 || result.error, loading: false });
    return {
      success: false,
      error: backendErrorMsg2 || result.error,
      errors: result.errors || [],
    };
  },

  resetPassword: async (resetToken, newPassword) => {
    set({ loading: true, error: null });
    const result = await api.post("/auth/reset-password", {
      resetToken,
      newPassword,
    });

    if (result.success) {
      set({ loading: false });
      return { success: true, message: result.message };
    }

    const backendErrorMsg3 = result.errors?.length
      ? result.errors
          .map((e) => e.message || e.msg)
          .filter(Boolean)
          .join(", ")
      : null;
    set({ error: backendErrorMsg3 || result.error, loading: false });
    return {
      success: false,
      error: backendErrorMsg3 || result.error,
      errors: result.errors || [],
    };
  },

  // Business Password Reset Actions
  forgotPasswordBusiness: async (phoneNumber) => {
    set({ loading: true, error: null });
    const result = await api.post("/auth/forgot-password-ba", {
      phoneNumber,
    });

    if (result.success) {
      set({ loading: false });
      return { success: true, message: result.message };
    }

    const backendErrorMsg4 = result.errors?.length
      ? result.errors
          .map((e) => e.message || e.msg)
          .filter(Boolean)
          .join(", ")
      : null;
    set({ error: backendErrorMsg4 || result.error, loading: false });
    return {
      success: false,
      error: backendErrorMsg4 || result.error,
      errors: result.errors || [],
    };
  },

  verifyResetOtpBusiness: async (phoneNumber, otp) => {
    set({ loading: true, error: null });
    const result = await api.post("/auth/verify-reset-otp-ba", {
      phoneNumber,
      otp,
    });

    if (result.success) {
      set({ loading: false });
      return {
        success: true,
        resetToken: result.resetToken || result.data?.resetToken,
      };
    }

    const backendErrorMsg5 = result.errors?.length
      ? result.errors
          .map((e) => e.message || e.msg)
          .filter(Boolean)
          .join(", ")
      : null;
    set({ error: backendErrorMsg5 || result.error, loading: false });
    return {
      success: false,
      error: backendErrorMsg5 || result.error,
      errors: result.errors || [],
    };
  },

  resetPasswordBusiness: async (resetToken, newPassword) => {
    set({ loading: true, error: null });
    const result = await api.post("/auth/reset-password-ba", {
      resetToken,
      newPassword,
    });

    if (result.success) {
      set({ loading: false });
      return { success: true, message: result.message };
    }

    const backendErrorMsg6 = result.errors?.length
      ? result.errors
          .map((e) => e.message || e.msg)
          .filter(Boolean)
          .join(", ")
      : null;
    set({ error: backendErrorMsg6 || result.error, loading: false });
    return {
      success: false,
      error: backendErrorMsg6 || result.error,
      errors: result.errors || [],
    };
  },
});
