import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Wrench,
  BadgeCheck,
  Users,
  KeyRound,
  ReceiptText,
  Wallet,
  TrendingDown,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Tag,
  Building2,
  Landmark,
  Megaphone,
  ClipboardCheck,
  Tags,
  CreditCard,
  FileText,
  Package,
  PiggyBank,
  Banknote,
  ShieldCheck,
  UserCog,
  SquareMenu,
  Target,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  group: 'main' | 'operasional' | 'master' | 'akses' | 'lainnya';
  /** Kode menu backend (untuk memetakan groupMenus dari /auth/me ke route nyata). */
  code?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main', code: 'DASHBOARD' },
  { path: '/inventory', label: 'Inventori', icon: Car, group: 'operasional', code: 'INVENTORI' },
  { path: '/pembelian', label: 'Pembelian Unit', icon: ShoppingCart, group: 'operasional', code: 'PEMBELIAN' },
  { path: '/rekondisi', label: 'Rekondisi', icon: Wrench, group: 'operasional', code: 'REKONDISI' },
  { path: '/ready-stock', label: 'Ready Stock', icon: BadgeCheck, group: 'operasional', code: 'READY_STOCK' },
  { path: '/crm', label: 'CRM / Lead', icon: Users, group: 'operasional', code: 'CRM' },
  { path: '/test-drive', label: 'Test Drive', icon: KeyRound, group: 'operasional', code: 'TEST_DRIVE' },
  { path: '/penjualan', label: 'Penjualan', icon: ReceiptText, group: 'operasional', code: 'PENJUALAN' },
  { path: '/target-penjualan', label: 'Target Penjualan', icon: Target, group: 'operasional', code: 'SALES_TARGET' },
  { path: '/target-pendapatan', label: 'Target Pendapatan', icon: DollarSign, group: 'operasional', code: 'REVENUE_TARGET' },
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

/** Peta kode menu backend → route frontend nyata (agar menu dinamis tidak 404). */
export const PATH_BY_CODE: Record<string, string> = {
  ...MENU_ITEMS.reduce((acc, m) => (m.code ? { ...acc, [m.code]: m.path } : acc), {} as Record<string, string>),
  // Alias kode backend yang berbeda dari kode static menu
  LAPORAN: '/laporan-cashflow',
  LAPORAN_CASHFLOW: '/laporan-cashflow',
  CASHFLOW_REPORT: '/laporan-cashflow',
  FINANCE_REPORT: '/laporan-cashflow',
  SALES_TARGET: '/target-penjualan',
  REVENUE_TARGET: '/target-pendapatan',
  TARGET_PENJUALAN: '/target-penjualan',
  DASBOARD_CASHFLOW: '/dashboard-cashflow',
  DASHBOARD_CASHFLOW: '/dashboard-cashflow',
  UNIT: '/inventory',
  LEAD: '/crm',
  LEAD_ORDER: '/penjualan',
  LEAD_PAYMENT: '/pembayaran',
  CMS_KATALOG: '/cms/katalog',
  CMS_BANNER: '/cms/banner',
  CMS_TESTIMONI: '/cms/testimoni',
  CMS_KONTAK: '/cms/kontak',
  CMS_PROFIL: '/cms/profil',
  CREDIT_SIM: '/cms/credit-sim',
  SITE_SETTING: '/cms/site-setting',
};

export const VALID_PATHS = new Set([
  ...MENU_ITEMS.map((m) => m.path),
  ...Object.values(PATH_BY_CODE)
]);

export const resolveFrontendPath = (m: { path?: string | null; code?: string }): string | null => {
  if (m.code && PATH_BY_CODE[m.code]) return PATH_BY_CODE[m.code];
  if (m.path && VALID_PATHS.has(m.path)) return m.path;
  // Fallback: If it starts with / let it pass, assuming backend is correct
  if (m.path?.startsWith('/')) return m.path;
  return null;
};

export const isPathActive = (pathname: string, itemPath: string): boolean => {
  if (itemPath === '/') return pathname === '/';
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
};
