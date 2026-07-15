import 'axios';

// Tipe response standar backend master-app.

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: {
    code: string;
    details: unknown;
  };
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Jangan jalankan auto-refresh + force-logout bila request ini balas 401.
     *
     * Dipakai untuk request yang **tidak boleh menjatuhkan sesi**, mis. `/auth/me/menu`
     * (endpointnya bisa belum ada / belum di-seed). Tanpa ini, satu 401 dari menu akan
     * memicu refresh tepat setelah login — padahal token baru saja terbit — lalu
     * memaksa logout.
     */
    skipAuthRefresh?: boolean;
  }
}
