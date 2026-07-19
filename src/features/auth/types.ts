export interface AuthRole {
  id: string;
  name: string;
  code: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  role?: AuthRole | null;
  branch?: { id: string; name: string } | null;
}

export interface MenuPermission {
  id: string;
  name: string;
  code: string;
}

export interface ApiMenuItem {
  id: string;
  name: string;
  code: string;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number;
  permissions?: MenuPermission[];
}

export interface GroupMenu {
  id: string;
  name: string;
  code: string;
  icon?: string | null;
  sortOrder?: number;
  menus?: ApiMenuItem[];
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresAt?: string;
  user: AuthUser;
  permissionCodes: string[];
  groupMenus: GroupMenu[];
}

export interface MePayload {
  user: AuthUser;
  permissionCodes: string[];
  groupMenus: GroupMenu[];
}
