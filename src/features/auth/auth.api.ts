import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { AuthPayload, MePayload } from './types';

export const authApi = {
  login: async (identifier: string, password: string): Promise<AuthPayload> => {
    const res = await apiClient.post<ApiResponse<AuthPayload>>('/auth/login', { identifier, password });
    return res.data.data;
  },

  me: async (): Promise<MePayload> => {
    const res = await apiClient.get<ApiResponse<MePayload>>('/auth/me');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post('/auth/logout-all');
  },
};
