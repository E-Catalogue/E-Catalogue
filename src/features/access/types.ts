export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface RolePermissionLink {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission & { menuId: string; menu: { id: string; name: string; code: string; path?: string | null } };
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  /** Hanya terisi di response detail (GET/POST/PATCH satu role) — bukan flat `permissions`. */
  rolePermissions?: RolePermissionLink[];
}

export interface AccessUser {
  id: string;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  role?: { id: string; name: string; code: string } | null;
  branch?: { id: string; nama?: string; name?: string } | null;
}

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  permissions?: Permission[];
}

export interface MenuGroup {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  menus?: MenuItem[];
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean | string;
}
