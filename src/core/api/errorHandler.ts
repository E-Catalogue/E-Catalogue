import axios, { AxiosError } from 'axios';
import type { GlobalErrorType } from '@/app/store/uiSlice';

export interface ClassifiedError {
  type: GlobalErrorType;
  title: string;
  message: string;
}

/**
 * Klasifikasi error infrastruktur untuk ditampilkan global (1 pintu).
 * Mengembalikan `null` untuk error bisnis 4xx — dibiarkan ditangani komponen pemanggil.
 */
export const classifyAxiosError = (error: unknown): ClassifiedError | null => {
  if (axios.isCancel(error)) return null;

  const err = error as AxiosError;
  const response = err.response;

  // Tidak ada response → timeout / jaringan / CORS / server mati
  if (!response) {
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message ?? '')) {
      return {
        type: 'timeout',
        title: 'Koneksi Lambat',
        message: 'Permintaan melebihi batas waktu. Periksa koneksi internet Anda dan coba lagi.',
      };
    }
    return {
      type: 'network',
      title: 'Tidak Ada Koneksi',
      message: 'Tidak dapat terhubung ke server. Pastikan internet aktif atau coba beberapa saat lagi.',
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
    };
  }

  // Gateway down / overload / maintenance
  if ([502, 503, 504].includes(status)) {
    return {
      type: 'maintenance',
      title: 'Server Sedang Sibuk',
      message: 'Server sedang dalam pemeliharaan atau overload. Mohon coba beberapa saat lagi.',
    };
  }

  // 5xx lain
  if (status >= 500) {
    return {
      type: 'server',
      title: 'Terjadi Kesalahan Server',
      message: 'Ada masalah pada server kami. Tim teknis sedang menanganinya.',
    };
  }

  // 4xx (400/401/403/404/409/422) → bukan urusan global, biar komponen yang handle
  return null;
};
