import { apiClient } from '@/core/api/client';
import type { LoginRequest, LoginResponseData } from '../schema';
import type { BaseResponse } from '@/core/api/types';
import { store } from '@/app/store'; // Untuk mengambil token

export const authApi = {
  login: async (payload: LoginRequest): Promise<BaseResponse<LoginResponseData>> => {
    const response = await apiClient.post<BaseResponse<LoginResponseData>>('/auth/login', payload);
    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
         // Kirim sinyal logout ke server agar token di-blacklist (best practice)
         await apiClient.post('/auth/logout', { refreshToken, deviceInfo: 'Web Browser POS' });
      }
    } catch (error) {
      console.error('Pemberitahuan logout ke server gagal (bisa diabaikan secara lokal)', error);
    }
  }
};