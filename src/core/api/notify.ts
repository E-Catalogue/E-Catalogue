import axios, { type AxiosError } from 'axios';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { classifyAxiosError } from './errorHandler';
import type { ApiErrorBody } from './types';

/**
 * Tampilkan error mutation/aksi lewat modal global (1 pintu).
 * Error infrastruktur sudah ditangani interceptor, jadi di sini hanya error bisnis (4xx).
 */
export const notifyApiError = (err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') => {
  if (axios.isCancel(err)) return;
  if (classifyAxiosError(err)) return; // infra → sudah dimunculkan interceptor
  const ax = err as AxiosError<ApiErrorBody>;
  store.dispatch(showToast({ type: 'general', variant: 'error', title: 'Gagal', message: ax.response?.data?.message ?? fallback }));
};
