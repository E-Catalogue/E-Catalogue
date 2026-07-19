import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { Role, AccessUser, MenuGroup, MenuItem, Permission, ListParams } from './types';

// ---- Roles ----
export const roleApi = {
  list: (params: ListParams) => apiClient.get<ApiResponse<Role[]>>('/roles', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<Role>>(`/roles/${id}`).then((r) => r.data.data),
  create: (body: Partial<Role>) => apiClient.post<ApiResponse<Role>>('/roles', body).then((r) => r.data.data),
  update: (id: string, body: Partial<Role>) => apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/roles/${id}`).then((r) => r.data),
  setPermissions: (id: string, permissionIds: string[]) => apiClient.put<ApiResponse<Role>>(`/roles/${id}/permissions`, { permissionIds }).then((r) => r.data.data),
};

// ---- Users ----
export const userApi = {
  list: (params: ListParams) => apiClient.get<ApiResponse<AccessUser[]>>('/users', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<AccessUser>>(`/users/${id}`).then((r) => r.data.data),
  create: (body: Record<string, unknown>) => apiClient.post<ApiResponse<AccessUser>>('/users', body).then((r) => r.data.data),
  update: (id: string, body: Record<string, unknown>) => apiClient.patch<ApiResponse<AccessUser>>(`/users/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/users/${id}`).then((r) => r.data),
  setRole: (id: string, roleId: string) => apiClient.put<ApiResponse<AccessUser>>(`/users/${id}/role`, { roleId }).then((r) => r.data.data),
  setBranch: (id: string, branchId: string) => apiClient.put<ApiResponse<AccessUser>>(`/users/${id}/branch`, { branchId }).then((r) => r.data.data),
};

// ---- Menus / Groups / Permissions ----
export const menuApi = {
  listGroups: (params: ListParams) => apiClient.get<ApiResponse<MenuGroup[]>>('/menus/groups', { params }).then((r) => r.data),
  getGroup: (id: string) => apiClient.get<ApiResponse<MenuGroup>>(`/menus/groups/${id}`).then((r) => r.data.data),
  createGroup: (body: Partial<MenuGroup>) => apiClient.post<ApiResponse<MenuGroup>>('/menus/groups', body).then((r) => r.data.data),
  updateGroup: (id: string, body: Partial<MenuGroup>) => apiClient.patch<ApiResponse<MenuGroup>>(`/menus/groups/${id}`, body).then((r) => r.data.data),
  removeGroup: (id: string) => apiClient.delete(`/menus/groups/${id}`).then((r) => r.data),

  createMenu: (groupId: string, body: Partial<MenuItem>) => apiClient.post<ApiResponse<MenuItem>>(`/menus/groups/${groupId}/items`, body).then((r) => r.data.data),
  getMenu: (id: string) => apiClient.get<ApiResponse<MenuItem>>(`/menus/${id}`).then((r) => r.data.data),
  updateMenu: (id: string, body: Partial<MenuItem>) => apiClient.patch<ApiResponse<MenuItem>>(`/menus/${id}`, body).then((r) => r.data.data),
  removeMenu: (id: string) => apiClient.delete(`/menus/${id}`).then((r) => r.data),

  createPermission: (menuId: string, body: Partial<Permission>) => apiClient.post<ApiResponse<Permission>>(`/menus/${menuId}/permissions`, body).then((r) => r.data.data),
  updatePermission: (menuId: string, permId: string, body: Partial<Permission>) => apiClient.patch<ApiResponse<Permission>>(`/menus/${menuId}/permissions/${permId}`, body).then((r) => r.data.data),
  removePermission: (menuId: string, permId: string) => apiClient.delete(`/menus/${menuId}/permissions/${permId}`).then((r) => r.data),
};

// Kumpulkan semua permission (flatten dari group → menu → permissions).
export const fetchAllPermissions = async (): Promise<Permission[]> => {
  const res = await menuApi.listGroups({ page: 1, limit: 100 });
  const perms: Permission[] = [];
  (res.data ?? []).forEach((g) => g.menus?.forEach((m) => m.permissions?.forEach((p) => perms.push(p))));
  return perms;
};
