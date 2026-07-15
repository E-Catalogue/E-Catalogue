import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';

export interface TenantUserItem {
  id: string; // membership-uuid
  status: string;
  joinedAt: string;
  user: {
    id: string; // user-uuid
    email: string;
    name: string;
    status: string;
    mustChangePassword: true;
  };
  roleLinks: Array<{
    tenantRole: {
      id: string; // role-uuid
      code: string;
      name: string;
    };
  }>;
}

export interface CreateTenantUserRequest {
  email: string;
  name: string;
  temporaryPassword?: string;
  roleIds: string[];
}

export interface UpdateTenantUserRequest {
  status?: string;
  roleIds?: string[];
}

export const tenantUsersApi = {
  getUsers: async () => {
    const res = await apiClient.get<ApiResponse<TenantUserItem[]>>('/tenant/users');
    return res.data.data;
  },

  createUser: async (data: CreateTenantUserRequest) => {
    const res = await apiClient.post<ApiResponse<TenantUserItem>>('/tenant/users', data);
    return res.data.data;
  },

  updateUser: async (id: string, data: UpdateTenantUserRequest) => {
    const res = await apiClient.patch<ApiResponse<TenantUserItem>>(`/tenant/users/${id}`, data);
    return res.data.data;
  },

  deleteUser: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/tenant/users/${id}`);
    return res.data.data;
  },
};
