import type { ApiMenuItem } from '@/features/auth/types';
import { TENANT_MENU } from './tenantMenu';

/**
 * Helper bentuk menu dari `GET /auth/me/menu`.
 * Struktur (lihat PRD): item level-atas bisa `MENU_GROUP` (punya `children`)
 * atau `MENU` tunggal (langsung punya `path`, mis. Dashboard).
 */

export const childrenOf = (item: ApiMenuItem): ApiMenuItem[] => item.children ?? [];

/** Grup = bertipe MENU_GROUP, atau punya anak (jaga-jaga bila `type` tidak dikirim). */
export const isGroup = (item: ApiMenuItem): boolean =>
  item.type === 'MENU_GROUP' || childrenOf(item).length > 0;

/** Semua menu yang bisa dituju (leaf), diratakan dari grup maupun menu tunggal. */
export const flattenMenus = (menus: ApiMenuItem[]): ApiMenuItem[] =>
  menus.flatMap((m) => (isGroup(m) ? childrenOf(m) : [m]));

export interface MenuWithGroup {
  item: ApiMenuItem;
  group?: string;
}

/** Menu leaf + nama grup induknya — untuk konteks di command palette. */
export const flattenWithGroup = (menus: ApiMenuItem[]): MenuWithGroup[] =>
  menus.flatMap<MenuWithGroup>((m) =>
    isGroup(m)
      ? childrenOf(m).map((child) => ({ item: child, group: m.name }))
      : [{ item: m }],
  );

/**
 * Menu efektif: pakai menu dari API bila sudah ada, selain itu fallback ke menu
 * statis `.menu` (berguna selama endpoint `/tenant/auth/me/menu` masih dikerjakan).
 */
export const resolveMenus = (apiMenus: ApiMenuItem[]): ApiMenuItem[] =>
  apiMenus.length > 0 ? apiMenus : TENANT_MENU;
