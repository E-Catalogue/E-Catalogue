import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleApi, userApi, menuApi, fetchAllPermissions } from './access.api';
import type { ListParams } from './types';

// ---------- Roles ----------
export const useRoles = (params: ListParams) =>
  useQuery({ queryKey: ['roles', params], queryFn: () => roleApi.list(params) });

export const useAllPermissions = (enabled = true) =>
  useQuery({ queryKey: ['permissions', 'all'], queryFn: fetchAllPermissions, enabled });

export const useRoleMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['roles'] });
  return {
    create: useMutation({ mutationFn: roleApi.create, onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => roleApi.update(v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: roleApi.remove, onSuccess: inval }),
    setPermissions: useMutation({ mutationFn: (v: { id: string; permissionIds: string[] }) => roleApi.setPermissions(v.id, v.permissionIds), onSuccess: inval }),
  };
};

// ---------- Users ----------
export const useUsers = (params: ListParams) =>
  useQuery({ queryKey: ['users', params], queryFn: () => userApi.list(params) });

export const useUserMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['users'] });
  return {
    create: useMutation({ mutationFn: userApi.create, onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => userApi.update(v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: userApi.remove, onSuccess: inval }),
    setRole: useMutation({ mutationFn: (v: { id: string; roleId: string }) => userApi.setRole(v.id, v.roleId), onSuccess: inval }),
    setBranch: useMutation({ mutationFn: (v: { id: string; branchId: string }) => userApi.setBranch(v.id, v.branchId), onSuccess: inval }),
  };
};

// ---------- Menus ----------
export const useMenuGroups = (params: ListParams) =>
  useQuery({ queryKey: ['menuGroups', params], queryFn: () => menuApi.listGroups(params) });

export const useMenuMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['menuGroups'] });
  return {
    createGroup: useMutation({ mutationFn: menuApi.createGroup, onSuccess: inval }),
    updateGroup: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => menuApi.updateGroup(v.id, v.body), onSuccess: inval }),
    removeGroup: useMutation({ mutationFn: menuApi.removeGroup, onSuccess: inval }),
    createMenu: useMutation({ mutationFn: (v: { groupId: string; body: Record<string, unknown> }) => menuApi.createMenu(v.groupId, v.body), onSuccess: inval }),
    updateMenu: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) => menuApi.updateMenu(v.id, v.body), onSuccess: inval }),
    removeMenu: useMutation({ mutationFn: menuApi.removeMenu, onSuccess: inval }),
    createPermission: useMutation({ mutationFn: (v: { menuId: string; body: Record<string, unknown> }) => menuApi.createPermission(v.menuId, v.body), onSuccess: inval }),
    updatePermission: useMutation({ mutationFn: (v: { menuId: string; permId: string; body: Record<string, unknown> }) => menuApi.updatePermission(v.menuId, v.permId, v.body), onSuccess: inval }),
    removePermission: useMutation({ mutationFn: (v: { menuId: string; permId: string }) => menuApi.removePermission(v.menuId, v.permId), onSuccess: inval }),
  };
};
