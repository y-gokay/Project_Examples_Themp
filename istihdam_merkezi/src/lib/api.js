/**
 * API Client - Merkezi HTTP İstek Yönetimi
 *
 * Bu dosya, uygulamanın tüm API çağrılarını yönetir.
 *
 * Özellikler:
 * - Otomatik token yönetimi (her istekte token header'a eklenir)
 * - 401 hatalarında otomatik logout
 * - FormData desteği (dosya yükleme için)
 * - Standart hata yönetimi
 * - Request deduplication (aynı istek aynı anda birden fazla kez atılmaz)
 * - Request caching (kısa süreli cache ile duplicate çağrıları önler)
 *
 * @module lib/api
 */

import { error as logError } from "../utils/logger";

// API Base URL - Environment variable'dan alınır, yoksa default kullanılır
const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.atakumistihdam.gov.tr/v1";

/**
 * Request deduplication için pending request'leri tutar
 * Aynı endpoint + method + body kombinasyonu için sadece bir request tutulur
 */
const pendingRequests = new Map();

/**
 * Request cache - Kısa süreli cache (5 saniye)
 * GET request'leri için cache mekanizması
 */
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 saniye

/**
 * Request key oluşturur (deduplication için)
 */
const getRequestKey = (endpoint, method, body) => {
  const bodyStr = body
    ? body instanceof FormData
      ? "formdata"
      : JSON.stringify(body)
    : "";
  return `${method}:${endpoint}:${bodyStr}`;
};

/**
 * Cache key oluşturur
 */
const getCacheKey = (endpoint, method) => {
  // Sadece GET request'leri cache'lenir
  if (method !== "GET") return null;
  return `${method}:${endpoint}`;
};

/**
 * Token yönetimi fonksiyonları
 * Token localStorage'da saklanır ve her API çağrısında kullanılır
 */

/**
 * localStorage'dan token'ı alır
 * @returns {string|null} Token string'i veya null
 */
const getToken = () => localStorage.getItem("atim_auth_token");

/**
 * Token'ı localStorage'a kaydeder veya siler
 * @param {string|null} token - Kaydedilecek token veya null (silme için)
 */
const setToken = (token) => {
  if (token) localStorage.setItem("atim_auth_token", token);
  else localStorage.removeItem("atim_auth_token");
};

/**
 * JWT token'ın süresinin dolup dolmadığını kontrol eder.
 * Token payload'undaki `exp` alanı (saniye cinsinden) ile karşılaştırır.
 * @param {string|null} token - Kontrol edilecek JWT token
 * @returns {boolean} Token süresi dolmuşsa true
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Store referansı için - Circular dependency'yi önlemek için lazy import
 * Store instance'ı appStore.js'den set edilir
 */
let storeInstance = null;

/**
 * Store instance'ını set eder
 * @param {Object} store - Zustand store instance'ı
 */
const setStoreInstance = (store) => {
  storeInstance = store;
};

/**
 * Basit fetch wrapper - Tüm HTTP istekleri bu fonksiyon üzerinden yapılır
 *
 * @param {string} endpoint - API endpoint (örn: '/users', '/jobs')
 * @param {Object} options - Fetch options (method, body, headers, vb.)
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object|FormData} options.body - Request body
 * @param {Object} options.headers - Custom headers
 * @param {boolean} options.skipDeduplication - Request deduplication'ı atla (default: false)
 * @param {boolean} options.skipCache - Cache'i atla (default: false)
 * @returns {Promise<Object>} API response { success: boolean, data?: any, error?: string }
 *
 * @example
 * // GET request
 * const result = await apiRequest('/users');
 *
 * @example
 * // POST request
 * const result = await apiRequest('/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * });
 *
 * @example
 * // File upload (FormData)
 * const formData = new FormData();
 * formData.append('file', file);
 * const result = await apiRequest('/upload', {
 *   method: 'POST',
 *   body: formData
 * });
 */
async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    skipDeduplication = false,
    skipCache = false,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  // Request key oluştur (deduplication için)
  const requestKey = getRequestKey(endpoint, method, body);

  // Cache key oluştur
  const cacheKey = getCacheKey(endpoint, method);

  // Cache kontrolü (sadece GET request'leri için)
  if (!skipCache && cacheKey) {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  // Deduplication kontrolü
  if (!skipDeduplication && pendingRequests.has(requestKey)) {
    // Aynı request zaten devam ediyor, onu bekle
    return pendingRequests.get(requestKey);
  }

  // FormData ise Content-Type'ı ayarlama (browser otomatik ayarlar)
  const isFormData = body instanceof FormData;
  // DELETE ve GET isteklerinde body yoksa Content-Type header'ı gönderme
  const hasBody = body && method !== "GET" && method !== "DELETE";

  const config = {
    method,
    headers: {
      ...(hasBody && !isFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  // FormData ise body'yi olduğu gibi gönder, değilse JSON stringify yap
  // DELETE ve GET isteklerinde body gönderme
  if (hasBody) {
    if (!isFormData && body && typeof body === "object") {
      config.body = JSON.stringify(body);
    } else if (body) {
      config.body = body;
    }
  }

  // Request promise'ını oluştur
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Şifre sıfırlama / OTP gibi public auth endpoint'lerinde
          // 401 alsak bile global logout & redirect yapmayalım,
          // sadece hatayı ekrana yansıtacağız.
          const isPublicAuthEndpoint =
            endpoint.startsWith("/auth/forgot-password") ||
            endpoint.startsWith("/auth/verify-reset-otp") ||
            endpoint.startsWith("/auth/reset-password") ||
            endpoint.startsWith("/auth/forgot-password-ba") ||
            endpoint.startsWith("/auth/verify-reset-otp-ba") ||
            endpoint.startsWith("/auth/reset-password-ba");

          if (!isPublicAuthEndpoint) {
            setToken(null);
            if (storeInstance) {
              const state = storeInstance.getState();
              if (state.isAuthenticated) {
                storeInstance.setState({
                  user: null,
                  isAuthenticated: false,
                });
              }
            }
          }
        }
        // API'den gelen hata mesajını kontrol et
        const errorMessage =
          data.message ||
          data.error?.message ||
          data.error ||
          `Bir hata oluştu (${response.status})`;
        // Hata durumunda errors array'ini de döndür
        const errorResult = {
          success: false,
          error: errorMessage,
          errors: data.errors || [],
        };

        // Pending request'i temizle
        if (!skipDeduplication) {
          pendingRequests.delete(requestKey);
        }

        return errorResult;
      }

      // API response formatı: { success, message, token, userType, data } veya { data: {...} }
      // Eğer response'un kendisi success: true içeriyorsa, direkt döndür
      let result;
      if (data.success !== undefined) {
        // Token'ı farklı formatlardan çıkar
        const token =
          data.token ||
          data.data?.token ||
          data.data?.tokens?.accessToken ||
          data.data?.accessToken ||
          data.tokens?.accessToken;

        result = {
          success: data.success,
          data: data.data || data,
          token: token,
          message: data.message,
          userType: data.userType,
          errors: data.errors, // Şifre değiştirme gibi işlemlerde field-specific hatalar
        };
      } else {
        // Eski format için fallback
        const token =
          data.token ||
          data.data?.token ||
          data.data?.tokens?.accessToken ||
          data.data?.accessToken ||
          data.tokens?.accessToken;

        result = {
          success: true,
          data: data.data || data,
          token: token,
          message: data.message,
        };
      }

      // Cache'e kaydet (sadece GET request'leri için)
      if (!skipCache && cacheKey && result.success) {
        requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      // Pending request'i temizle
      if (!skipDeduplication) {
        pendingRequests.delete(requestKey);
      }

      return result;
    } catch (error) {
      // Geliştirici için detaylı hata log'u
      logError("API request error:", error);

      // Kullanıcıya gösterilecek genel hata mesajı (Türkçe ve anlaşılır)
      const userFriendlyMessage =
        "Şu anda işleminizi gerçekleştiremiyoruz. Lütfen daha sonra tekrar deneyin.";

      const errorResult = {
        success: false,
        error: userFriendlyMessage,
        errors: [],
      };

      // Pending request'i temizle
      if (!skipDeduplication) {
        pendingRequests.delete(requestKey);
      }

      return errorResult;
    }
  })();

  // Pending request'i kaydet
  if (!skipDeduplication) {
    pendingRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
}

/**
 * Cache'i temizle
 */
export const clearCache = () => {
  requestCache.clear();
};

/**
 * Belirli bir endpoint için cache'i temizle
 */
export const clearCacheForEndpoint = (endpoint, method = "GET") => {
  const cacheKey = getCacheKey(endpoint, method);
  if (cacheKey) {
    requestCache.delete(cacheKey);
  }
};

import { createMockApi } from "../mocks/index.js";

// HTTP metodları
export const api =
  import.meta.env.VITE_USE_MOCK === "true"
    ? createMockApi()
    : {
        get: (endpoint, options = {}) =>
          apiRequest(endpoint, { ...options, method: "GET" }),
        post: (endpoint, body, options = {}) =>
          apiRequest(endpoint, { ...options, method: "POST", body }),
        put: (endpoint, body, options = {}) =>
          apiRequest(endpoint, { ...options, method: "PUT", body }),
        patch: (endpoint, body, options = {}) =>
          apiRequest(endpoint, { ...options, method: "PATCH", body }),
        delete: (endpoint, options = {}) =>
          apiRequest(endpoint, { ...options, method: "DELETE" }),
      };

// Token yönetimi export
export { API_BASE_URL, getToken, setToken, setStoreInstance, isTokenExpired };
