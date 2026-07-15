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

/** Grup menu (punya `children`) vs menu biasa (punya `path`). Lihat PRD `GET /me/menu`. */
export type MenuType = 'MENU_GROUP' | 'MENU';

export interface ApiMenuItem {
  id: string;
  name: string;
  code: string;
  type: MenuType;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number;
  children?: ApiMenuItem[];
  permissions?: MenuPermission[];
}

/**
 * Item level teratas dari `/me/menu` — bisa berupa MENU_GROUP (berisi `children`)
 * maupun MENU tunggal (mis. Dashboard) yang langsung punya `path`.
 */
export type GroupMenu = ApiMenuItem;

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
