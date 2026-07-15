import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { apiClient, API_BASE_URL } from './client';
import { getAccessToken } from './token';
import { store } from '@/app/store';
import { queryClient } from '@/app/queryClient';
import { setAccessToken, clearCredentials } from '@/app/store/authSlice';
import { showToast } from '@/app/store/uiSlice';
import { classifyAxiosError } from './errorHandler';
import type { ApiResponse, ApiErrorBody } from './types';

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
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
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
    // `skipAuthRefresh` → request ini tidak boleh menjatuhkan sesi (lihat types.ts).
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.skipAuthRefresh &&
      !isAuthEndpoint(original.url)
    ) {
      const code = errorCode(error);
      // Sesi sudah berakhir (refresh tidak akan menolong) → langsung logout.
      if (SESSION_ENDED_CODES.has(code ?? '')) return forceLogout(error);
      // Hanya access token kedaluwarsa yang bisa dipulihkan via refresh.
      // (Kode tak dikenal/absen diperlakukan sebagai access token kedaluwarsa demi ketahanan.)
      if (code && code !== 'INVALID_ACCESS_TOKEN') return Promise.reject(error);

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const refreshUrl = `${API_BASE_URL}/tenant/auth/refresh`;

        // Pakai axios polos agar tidak kena interceptor; withCredentials wajib untuk kirim cookie refresh.
        const res = await axios.post<ApiResponse<{ accessToken: string }>>(
          refreshUrl,
          {},
          { withCredentials: true }
        );
        const data = res.data.data;
        // Endpoint refresh hanya mengembalikan accessToken — user & menu tidak berubah,
        // jadi cukup perbarui tokennya saja di store.
        store.dispatch(setAccessToken(data.accessToken));

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
