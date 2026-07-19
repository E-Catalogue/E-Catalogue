import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { apiClient, API_BASE_URL } from './client';
import { getAccessToken, getRefreshToken, setTokens } from './token';
import { store } from '@/app/store';
import { queryClient } from '@/app/queryClient';
import { setCredentials, clearCredentials } from '@/app/store/authSlice';
import { showToast } from '@/app/store/uiSlice';
import { classifyAxiosError } from './errorHandler';
import type { ApiResponse, ApiErrorBody } from './types';
import type { AuthPayload } from '@/features/auth/types';

const isAuthEndpoint = (url?: string) =>
  !!url && (url.includes('/auth/login') || url.includes('/auth/refresh'));

// Kode 401 yang menandakan sesi sudah berakhir — jangan coba refresh, langsung logout.
const SESSION_ENDED_CODES = new Set([
  'INVALID_REFRESH_TOKEN',
  'SESSION_REVOKED',
  'SESSION_EXPIRED',
  'USER_INACTIVE',
]);

const errorCode = (error: AxiosError) =>
  (error.response?.data as ApiErrorBody | undefined)?.error?.code;

// ---- Request: lampirkan bearer token ----
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Response: auto-refresh saat 401 (dengan antrean & rotation) ----
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const flushQueue = (error: unknown, token: string | null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token as string)));
  queue = [];
};

const forceLogout = (error: unknown) => {
  store.dispatch(clearCredentials());
  queryClient.clear(); // buang cache profil & data lain milik sesi lama
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

// Satu pintu: semua error response melewati handler ini.
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // A. Otorisasi (401) pada endpoint terproteksi.
    if (status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
      const code = errorCode(error);
      // Sesi sudah berakhir (refresh tidak akan menolong) → langsung logout.
      if (SESSION_ENDED_CODES.has(code ?? '')) return forceLogout(error);
      // Hanya access token kedaluwarsa yang bisa dipulihkan via refresh.
      // (Kode tak dikenal/absen diperlakukan sebagai access token kedaluwarsa demi ketahanan.)
      if (code && code !== 'INVALID_ACCESS_TOKEN') return Promise.reject(error);

      const refreshToken = getRefreshToken();
      if (!refreshToken) return forceLogout(error);

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        // Pakai axios polos agar tidak kena interceptor (hindari rekursi).
        const res = await axios.post<ApiResponse<AuthPayload>>(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const data = res.data.data;
        setTokens(data.accessToken, data.refreshToken);
        store.dispatch(setCredentials(data));
        flushQueue(null, data.accessToken);
        if (original.headers) original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch (e) {
        flushQueue(e, null);
        return forceLogout(e);
      } finally {
        isRefreshing = false;
      }
    }

    // B. Error infrastruktur (network/timeout/5xx/parsing) → tampilkan modal global.
    //    Error bisnis 4xx dikembalikan apa adanya untuk ditangani komponen/hook.
    const classified = classifyAxiosError(error);
    if (classified) store.dispatch(showToast(classified));

    return Promise.reject(error);
  },
);
