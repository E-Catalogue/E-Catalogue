import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { MenuPermissionItem } from '@/features/tenant/api/permission.types';

export interface TenantRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  grantsAllPermissions: boolean;
  isActive: boolean;
  permissions: MenuPermissionItem[];
  _count?: {
    userLinks: number;
  };
}

export interface CreateTenantRoleRequest {
  code: string;
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateTenantRoleRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  permissionIds?: string[];
}

export const tenantRolesApi = {
  getRoles: async () => {
    const res = await apiClient.get<ApiResponse<TenantRole[]>>('/tenant/roles');
    return res.data.data;
  },

  createRole: async (data: CreateTenantRoleRequest) => {
    const res = await apiClient.post<ApiResponse<TenantRole>>('/tenant/roles', data);
    return res.data.data;
  },

  updateRole: async (id: string, data: UpdateTenantRoleRequest) => {
    const res = await apiClient.patch<ApiResponse<TenantRole>>(`/tenant/roles/${id}`, data);
    return res.data.data;
  },

  deleteRole: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/tenant/roles/${id}`);
    return res.data.data;
  },
};
