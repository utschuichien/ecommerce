import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../features/auth/stores/useAuthStore';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function formatVND(amount: number | bigint): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function extractErrorMessage(
  err: any,
  fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.',
): string {
  if (err?.response?.data?.error?.message) {
    const msg = err.response.data.error.message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  if (err?.response?.data?.message) {
    const msg = err.response.data.message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  if (
    Array.isArray(err?.response?.data?.error?.details) &&
    err.response.data.error.details.length > 0
  ) {
    return err.response.data.error.details.join(', ');
  }
  if (typeof err?.response?.data === 'string' && err.response.data.length < 200) {
    return err.response.data;
  }
  if (err?.message && !err.message.includes('status code')) {
    return err.message;
  }
  return fallback;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Gửi kèm cookie httpOnly (refresh_token)
});

// Request Interceptor: Gắn Bearer Token từ Zustand store
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config; 
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Tự động refresh token khi nhận mã 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');
    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken =
          refreshResponse.data?.data?.accessToken ||
          refreshResponse.data?.accessToken;

        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }

        throw new Error('Không nhận được token mới');
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
