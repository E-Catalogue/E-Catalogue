import axios, { type AxiosError } from 'axios';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { classifyAxiosError } from './errorHandler';
import type { ApiErrorBody } from './types';

/**
 * Pesan ramah untuk error branch-context — pesan backend ("Header X-Branch-Id wajib diisi...")
 * terlalu teknis. Arahkan user ke switcher cabang di header (satu-satunya tempat pemilihan cabang).
 */
const BRANCH_ERROR_MESSAGE: Record<string, { title: string; message: string }> = {
  BRANCH_CONTEXT_REQUIRED: {
    title: 'Pilih Cabang Dulu',
    message: 'Pilih cabang aktif lewat tombol cabang di pojok kanan atas (header) sebelum menyimpan atau mengubah data.',
  },
  BRANCH_SCOPE_FORBIDDEN: {
    title: 'Cabang Tidak Sesuai',
    message: 'Anda tidak memiliki akses ke cabang tersebut. Pilih cabang lain di header.',
  },
  BRANCH_NOT_FOUND: {
    title: 'Cabang Tidak Ditemukan',
    message: 'Cabang yang dipilih tidak lagi tersedia. Pilih ulang cabang aktif di header.',
  },
  BRANCH_NOT_ASSIGNED: {
    title: 'Belum Ada Cabang',
    message: 'Akun Anda belum ditautkan ke cabang mana pun. Hubungi admin.',
  },
  CROSS_BRANCH_RELATION: {
    title: 'Relasi Beda Cabang',
    message: 'Ada data terpilih dari cabang lain. Muat ulang form lalu pilih ulang sesuai cabang aktif.',
  },
};

/**
 * Tampilkan error mutation/aksi lewat modal global (1 pintu).
 * Error infrastruktur sudah ditangani interceptor, jadi di sini hanya error bisnis (4xx).
 */
export const notifyApiError = (err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') => {
  if (axios.isCancel(err)) return;
  if (classifyAxiosError(err)) return; // infra → sudah dimunculkan interceptor
  const ax = err as AxiosError<ApiErrorBody>;
  const code = ax.response?.data?.error?.code;
  const branchFriendly = code ? BRANCH_ERROR_MESSAGE[code] : undefined;
  if (branchFriendly) {
    store.dispatch(showToast({ type: 'general', variant: 'error', ...branchFriendly }));
    return;
  }
  store.dispatch(showToast({ type: 'general', variant: 'error', title: 'Gagal', message: ax.response?.data?.message ?? fallback }));
};
