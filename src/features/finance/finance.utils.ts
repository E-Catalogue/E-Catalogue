import type { AxiosError } from 'axios';
import type { ApiErrorBody } from '@/core/api/types';

export const resolveApiError = (err: unknown) => {
  const ax = err as AxiosError<ApiErrorBody & { code?: string }>;
  const body = ax.response?.data;
  return {
    code: body?.error?.code || body?.code || null,
    message: body?.message || 'Terjadi kesalahan',
    details: body?.error?.details ?? null,
  };
};

export const toIsoDate = (value: string) => (value ? new Date(value).toISOString() : '');
export const fromIsoDate = (value?: string | null) => (value ? value.slice(0, 10) : '');

export const showName = (user?: { name?: string | null; username?: string | null }) =>
  user?.name || user?.username || '-';
