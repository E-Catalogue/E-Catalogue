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

<<<<<<< Updated upstream
/** Menu leaf + nama grup induknya — untuk konteks di command palette. */
export const flattenWithGroup = (menus: ApiMenuItem[]): MenuWithGroup[] =>
  menus.flatMap<MenuWithGroup>((m) =>
    isGroup(m)
      ? childrenOf(m).map((child) => ({ item: child, group: m.name }))
      : [{ item: m }],
  );
=======
export const MENU_ITEMS: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main', code: 'DASHBOARD' },
  { path: '/inventory', label: 'Inventori', icon: Car, group: 'operasional', code: 'INVENTORI' },
  { path: '/pembelian', label: 'Pembelian Unit', icon: ShoppingCart, group: 'operasional', code: 'PEMBELIAN' },
  { path: '/rekondisi', label: 'Rekondisi', icon: Wrench, group: 'operasional', code: 'REKONDISI' },
  { path: '/ready-stock', label: 'Ready Stock', icon: BadgeCheck, group: 'operasional', code: 'READY_STOCK' },
  { path: '/crm', label: 'CRM / Lead', icon: Users, group: 'operasional', code: 'CRM' },
  { path: '/test-drive', label: 'Test Drive', icon: KeyRound, group: 'operasional', code: 'TEST_DRIVE' },
  { path: '/penjualan', label: 'Penjualan', icon: ReceiptText, group: 'operasional', code: 'PENJUALAN' },
  { path: '/targets', label: 'Target Cabang & Sales', icon: Target, group: 'operasional', code: 'BRANCH_TARGET' },
  { path: '/pembayaran', label: 'Pembayaran', icon: Wallet, group: 'operasional', code: 'PEMBAYARAN' },
  { path: '/pengeluaran', label: 'Pengeluaran', icon: TrendingDown, group: 'operasional', code: 'PENGELUARAN' },
  { path: '/payroll', label: 'Payroll', icon: Banknote, group: 'operasional', code: 'PAYROLL' },
  { path: '/merek', label: 'Merek & Tipe', icon: Tag, group: 'master', code: 'MEREK' },
  { path: '/vendor', label: 'Vendor', icon: Wrench, group: 'master', code: 'VENDOR' },
  { path: '/branch', label: 'Cabang', icon: Building2, group: 'master', code: 'BRANCH' },
  { path: '/master/leasing', label: 'Leasing', icon: Landmark, group: 'master', code: 'LEASING' },
  { path: '/master/sumber-lead', label: 'Sumber Lead', icon: Megaphone, group: 'master', code: 'SUMBER_LEAD' },
  { path: '/master/pengecekan', label: 'Pengecekan', icon: ClipboardCheck, group: 'master', code: 'PENGECEKAN' },
  { path: '/master/kategori-pengeluaran', label: 'Kategori Pengeluaran', icon: Tags, group: 'master', code: 'KATEGORI_PENGELUARAN' },
  { path: '/master/metode-pembayaran', label: 'Metode Pembayaran', icon: CreditCard, group: 'master', code: 'METODE_PEMBAYARAN' },
  { path: '/master/dokumen', label: 'Dokumen', icon: FileText, group: 'master', code: 'DOKUMEN' },
  { path: '/master/perlengkapan', label: 'Perlengkapan', icon: Package, group: 'master', code: 'PERLENGKAPAN' },
  { path: '/master/investor', label: 'Investor', icon: PiggyBank, group: 'master', code: 'INVESTOR' },
  { path: '/access-control/roles', label: 'Role', icon: ShieldCheck, group: 'akses', code: 'ROLE' },
  { path: '/access-control/users', label: 'User', icon: UserCog, group: 'akses', code: 'USER' },
  { path: '/access-control/menus', label: 'Menu & Permission', icon: SquareMenu, group: 'akses', code: 'MENU' },
  { path: '/dashboard-cashflow', label: 'Dashboard Cashflow', icon: Wallet, group: 'lainnya', code: 'DASBOARD_CASHFLOW' },
  { path: '/cashflow', label: 'Cash Flow', icon: ArrowLeftRight, group: 'lainnya', code: 'CASHFLOW' },
  { path: '/laporan-cashflow', label: 'Laporan Cashflow', icon: BarChart3, group: 'lainnya', code: 'LAPORAN_CASHFLOW' },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings, group: 'lainnya', code: 'PENGATURAN' },
];
>>>>>>> Stashed changes

/**
 * Menu efektif: pakai menu dari API bila sudah ada, selain itu fallback ke menu
 * statis `.menu` (berguna selama endpoint `/tenant/auth/me/menu` masih dikerjakan).
 */
export const resolveMenus = (apiMenus: ApiMenuItem[]): ApiMenuItem[] =>
  apiMenus.length > 0 ? apiMenus : TENANT_MENU;
