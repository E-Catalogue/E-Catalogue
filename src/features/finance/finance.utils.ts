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

import { toBusinessDate } from '@/core/utils/businessDate';

export const toIsoDate = (value: string) => (value ? `${value}T00:00:00.000Z` : '');
export const fromIsoDate = (value?: string | null) => toBusinessDate(value);

export const showName = (user?: { name?: string | null; username?: string | null }) =>
  user?.name || user?.username || '-';
