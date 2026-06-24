import axios from 'axios';
import { apiClient } from './client';
import { store } from '@/app/store';
import { clearCredentials, setCredentials } from '@/app/store/authSlice';
import { showGlobalError } from '@/app/store/uiSlice';
import type { BaseResponse } from './types';
import { TOKEN_ERROR_CODE } from './types';
import { classifyAxiosError } from './errorHandler';
import type { LoginResponseData } from '@/features/auth/schema';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Flag untuk mencegah loop saat refresh token sedang berjalan
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void, reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const errorCode: string | undefined = error.response?.data?.errorCode;

    // --- A. Masalah Token / Otorisasi (401) ---
    if (status === 401 && !originalRequest._retry) {
      // Jika error 401 terjadi saat login (kredensial salah), jangan refresh token
      if (originalRequest.url?.includes('/auth/login')) {
         return Promise.reject(error);
      }

      // INVALID_TOKEN (atau kode token lain yang tidak bisa di-refresh):
      // bersihkan sesi, tampilkan modal, dan paksa kembali ke halaman login.
      if (errorCode && errorCode !== TOKEN_ERROR_CODE.EXPIRED) {
        store.dispatch(clearCredentials());
        store.dispatch(showGlobalError({
          title: 'Sesi Tidak Valid',
          message: 'Sesi login Anda tidak valid. Demi keamanan, silakan masuk kembali ke sistem kasir.',
          type: 'auth'
        }));
        return Promise.reject(error);
      }

      const refreshToken = store.getState().auth.refreshToken;

      // Jika tidak punya refresh token, langsung logout
      if (!refreshToken) {
         store.dispatch(clearCredentials());
         store.dispatch(showGlobalError({
           title: 'Sesi Kedaluwarsa',
           message: 'Sesi login Anda telah habis. Demi keamanan, silakan masuk kembali ke sistem kasir.',
           type: 'auth'
         }));
         return Promise.reject(error);
      }

      // TOKEN_EXPIRED -> coba refresh token

      if (isRefreshing) {
        // Jika sedang refresh, masukkan request ke antrean
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Lakukan panggilan manual (tanpa apiClient) untuk refresh token
        // agar tidak memicu interceptor secara berulang. Menggunakan URL dari env.
        const { data } = await axios.post<BaseResponse<LoginResponseData>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'x-platform': 'POS_TERMINAL' } }
        );

        const newAccessToken = data.data.accessToken;

        // Simpan token baru ke Redux & LocalStorage
        store.dispatch(setCredentials(data.data));

        // Jalankan ulang semua request yang mengantre dengan token baru
        processQueue(null, newAccessToken);
        
        // Jalankan ulang request yang memicu 401 ini
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Jika refresh token juga gagal (mungkin refresh token juga expired)
        processQueue(refreshError, null);
        store.dispatch(clearCredentials());
        
        store.dispatch(showGlobalError({
           title: 'Akses Ditolak',
           message: 'Sesi keamanan Anda tidak valid atau telah berakhir. Anda harus masuk kembali.',
           type: 'auth'
        }));
        
        // Force redirect (jaga-jaga jika router gagal menangkap event)
        if (typeof window !== 'undefined') window.location.href = '/';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- B. Klasifikasi error infrastruktur (1 pintu) ---
    // Timeout, koneksi putus/CORS, response non-JSON (HTML gateway), 5xx, & maintenance
    // ditangani terpusat lewat classifier. Error bisnis 4xx dikembalikan ke komponen.
    const globalError = classifyAxiosError(error);
    if (globalError) {
      store.dispatch(showGlobalError(globalError));
    }

    return Promise.reject(error);
  }
);