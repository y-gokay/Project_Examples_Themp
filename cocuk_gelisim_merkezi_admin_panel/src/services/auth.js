// Authentication utilities
import { tryMockApiResponse } from "../mocks/adminMock";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || window.location.origin;

export function getToken() {
  return localStorage.getItem("adminToken");
}

export function setToken(token) {
  localStorage.setItem("adminToken", token);
}

export function removeToken() {
  localStorage.removeItem("adminToken");
}

export function getAdminInfo() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

export function isSuperAdmin() {
  const adminInfo = getAdminInfo();
  return adminInfo && adminInfo.role === "super";
}

export function isAuthenticated() {
  return getToken() !== null;
}

export function redirectToLogin() {
  window.location.href = "/";
}

export function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function apiCall(url, options = {}) {
  const useMock = import.meta.env.VITE_USE_MOCK === "true";
  const method = options.method || "GET";
  const bodyText =
    typeof options.body === "string"
      ? options.body
      : options.body != null
        ? JSON.stringify(options.body)
        : "";

  if (useMock) {
    const mock = tryMockApiResponse(url, method, bodyText);
    if (mock !== undefined) {
      return mock;
    }
  }

  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    redirectToLogin();
    throw new Error("Yetkisiz");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Bir hata oluştu");
  }

  return data;
}

// FormData için özel header'lar
export function getAuthHeadersForFormData() {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Fotoğraf URL'lerini backend'den almak için helper fonksiyon
export function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  // Eğer zaten tam URL ise (http:// veya https:// ile başlıyorsa), olduğu gibi döndür
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }
  // Relative path ise backend URL'i ile birleştir
  return `${API_BASE_URL}${photoPath}`;
}

export const getUser = getAdminInfo;
export const logout = removeToken;
