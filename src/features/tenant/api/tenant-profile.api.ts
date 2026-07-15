import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';

export interface TenantProfile {
  id: string;
  slug: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantProfileRequest {
  name: string;
}

export const tenantProfileApi = {
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<TenantProfile>>('/tenant/profile');
    return res.data.data;
  },

  updateProfile: async (data: UpdateTenantProfileRequest) => {
    const res = await apiClient.patch<ApiResponse<TenantProfile>>('/tenant/profile', data);
    return res.data.data;
  },
};
