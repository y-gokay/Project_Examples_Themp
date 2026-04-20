import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

if (import.meta.env.VITE_USE_MOCK === 'true') {
  const { setupMockAdapter } = await import('@/mocks/index');
  setupMockAdapter(api);
}

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      const { logout, token } = useAppStore.getState();
      if (token) {
        toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
        logout();
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown, fallback = 'Bir hata oluştu.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
