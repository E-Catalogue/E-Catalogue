import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { ApiMenuItem } from '@/features/auth/types';

export interface TenantLoginRequest {
  tenantSlug: string;
  email: string;
  password?: string;
}

export interface TenantLoginResponse {
  accessToken: string;
  mustChangePassword?: boolean;
}

export interface TenantUserSession {
  userId: string;
  sessionId: string;
  tenantId: string;
  tenantSlug: string;
  tenantUserId: string;
  permissions: string[];
}

export interface TenantChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export const tenantAuthApi = {
  login: async (data: TenantLoginRequest) => {
    const res = await apiClient.post<ApiResponse<TenantLoginResponse>>('/tenant/auth/login', data);
    return res.data.data;
  },
  
  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/tenant/auth/logout');
    return res.data.data;
  },
  
  changePassword: async (data: TenantChangePasswordRequest) => {
    const res = await apiClient.post<ApiResponse<null>>('/tenant/auth/change-password', data);
    return res.data.data;
  },
  
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<TenantUserSession>>('/tenant/auth/me');
    return res.data.data;
  },
  
  /**
   * Menu sidebar. Ditandai `skipAuthRefresh` karena endpoint ini bisa belum tersedia:
   * 401/404 dari sini tidak boleh memicu refresh + logout. Pemanggil menangani
   * kegagalannya dan UI jatuh ke menu statis (lihat `resolveMenus`).
   */
  getMenu: async () => {
    const res = await apiClient.get<ApiResponse<ApiMenuItem[]>>('/tenant/auth/me/menu', {
      skipAuthRefresh: true,
    });
    return res.data.data;
  },
};
