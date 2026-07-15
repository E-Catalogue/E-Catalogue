import axios, { AxiosError } from 'axios';
import type { GlobalErrorType, ToastVariant } from '@/app/store/uiSlice';
import type { ApiErrorBody } from './types';

export interface ClassifiedError {
  type: GlobalErrorType;
  title: string;
  message: string;
  variant?: ToastVariant;
}

/**
 * Klasifikasi error infrastruktur untuk ditampilkan global (1 pintu).
 * Mengembalikan `null` untuk error bisnis 4xx — dibiarkan ditangani komponen pemanggil.
 */
export const classifyAxiosError = (error: unknown): ClassifiedError | null => {
  if (axios.isCancel(error)) return null;

  const err = error as AxiosError<ApiErrorBody>;
  const response = err.response;

  // Tidak ada response → timeout / jaringan / CORS / server mati
  if (!response) {
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message ?? '')) {
      return {
        type: 'timeout',
        title: 'Koneksi Lambat',
        message: 'Permintaan melebihi batas waktu. Periksa koneksi internet Anda dan coba lagi.',
        variant: 'error',
      };
    }
    return {
      type: 'network',
      title: 'Tidak Ada Koneksi',
      message: 'Tidak dapat terhubung ke server. Pastikan internet aktif atau coba beberapa saat lagi.',
      variant: 'error',
    };
  }

  const status = response.status;
  const contentType = String(response.headers?.['content-type'] ?? '');

  // Response bukan JSON (mis. halaman error gateway berupa HTML)
  if (contentType && !contentType.includes('application/json')) {
    return {
      type: 'parsing',
      title: 'Respons Tidak Valid',
      message: 'Server mengirim respons yang tidak dapat diproses. Silakan coba lagi nanti.',
      variant: 'error',
    };
  }

  // Gateway down / overload / maintenance
  if ([502, 503, 504].includes(status)) {
    return {
      type: 'maintenance',
      title: 'Server Sedang Sibuk',
      message: 'Server sedang dalam pemeliharaan atau overload. Mohon coba beberapa saat lagi.',
      variant: 'error',
    };
  }

  // 5xx lain
  if (status >= 500) {
    return {
      type: 'server',
      title: 'Terjadi Kesalahan Server',
      message: 'Ada masalah pada server kami. Tim teknis sedang menanganinya.',
      variant: 'error',
    };
  }

  // Akses Ditolak (403)
  if (status === 403) {
    return {
      type: 'general',
      title: 'Akses Ditolak',
      message: 'Anda tidak memiliki izin untuk melakukan tindakan ini atau mengakses resource tersebut.',
      variant: 'error',
    };
  }

  // Tidak Ditemukan (404)
  if (status === 404) {
    return {
      type: 'general',
      title: 'Tidak Ditemukan',
      message: 'Data atau halaman yang Anda cari tidak ditemukan.',
      variant: 'error',
    };
  }

  // Terlalu Banyak Permintaan (429)
  if (status === 429) {
    return {
      type: 'general',
      title: 'Terlalu Banyak Permintaan',
      message: 'Anda terlalu sering melakukan aksi ini. Mohon tunggu beberapa saat sebelum mencoba lagi.',
      variant: 'error',
    };
  }

  // 400, 401, 409, 422 umumnya ditangani oleh komponen (form validation, dsb).
  // 401 sudah dihandle terpisah oleh interceptor (refresh token / logout).
  if ([400, 401, 409, 422].includes(status)) {
    return null;
  }

  // Fallback untuk status error lain yang belum terpetakan
  return {
    type: 'general',
    title: 'Terjadi Kesalahan',
    message: err.response?.data?.message || err.message || 'Kesalahan sistem yang tidak terduga.',
    variant: 'error',
  };
};
