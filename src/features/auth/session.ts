import type { TenantUserSession } from '@/features/tenant/api/tenant-auth.api';
import type { ApiMenuItem, MePayload } from './types';

/**
 * Petakan `/tenant/auth/me` + `/tenant/auth/me/menu` menjadi payload sesi.
 * Dipakai bersama oleh LoginPage (setelah login) dan AuthBootstrap (saat reload),
 * supaya kedua jalur menghasilkan state yang identik.
 *
 * Catatan: `/me` tenant hanya mengembalikan konteks sesi (lihat PRD) — tidak ada
 * nama/email user. Identitas tampil diisi dari slug tenant sampai endpoint profil
 * user tersedia.
 */
export const buildSession = (me: TenantUserSession, menus: ApiMenuItem[]): MePayload => ({
  user: {
    id: me.userId,
    // Belum ada nama/email di /me tenant; pakai slug sebagai identitas sementara.
    name: me.tenantSlug,
    email: '',
    username: me.tenantSlug,
    isActive: true,
    role: null,
  },
  // Permission efektif membership tenant aktif (lihat update_tenant_auth PRD).
  permissionCodes: me.permissions ?? [],
  groupMenus: menus ?? [],
});
