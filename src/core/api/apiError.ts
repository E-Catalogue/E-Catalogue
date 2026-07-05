import type { AxiosError } from 'axios';
import type { ApiErrorBody } from './types';

/** Ambil `error.code` untuk branching (PRD §1.5 — branching pakai code, tampilan pakai message). */
export const getApiErrorCode = (err: unknown): string | undefined =>
  (err as AxiosError<ApiErrorBody>)?.response?.data?.error?.code;

/** Ambil `message` siap tampil (bahasa Indonesia dari server). */
export const getApiErrorMessage = (err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.'): string =>
  (err as AxiosError<ApiErrorBody>)?.response?.data?.message ?? fallback;

/** Map error validasi `{ field: message }` dari `error.details` (VALIDATION_ERROR). */
export const getFieldErrors = (err: unknown): Record<string, string> => {
  const details = (err as AxiosError<ApiErrorBody>)?.response?.data?.error?.details;
  const map: Record<string, string> = {};
  if (Array.isArray(details)) {
    for (const d of details as { field?: string; message?: string }[]) {
      if (d?.field) map[d.field] = d.message ?? 'Tidak valid';
    }
  }
  return map;
};
