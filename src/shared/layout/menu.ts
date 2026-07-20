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
  HandCoins,
  BookOpen,
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
  // SALES_TARGET/REVENUE_TARGET (dua menu terpisah) sudah deprecated permanen di backend
  // (prisma/seed.js deprecatedMenuCodes) — diganti satu resource BranchTarget yang menyimpan
  // unitTarget+revenueTarget sekaligus, menu tunggal "Target Cabang & Sales" (code BRANCH_TARGET).
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
  // Kewajiban Investor: backend TIDAK punya baris menu terpisah — permission
  // INVESTOR_OBLIGATION_READ/GENERATE/PAY/REVERSE (prisma/seed.js) dibundel di bawah
  // menu "Investor" (code INVESTOR, path /master/investor) yang sama. Karena itu item
  // ini sengaja TANPA `code` (kalau diberi code: 'INVESTOR', akan menimpa mapping
  // PATH_BY_CODE untuk halaman Investor CRUD). Halaman ini dijangkau lewat tautan di
  // InvestorPage dan lewat sidebar statis (fallback saat groupMenus dari /auth/me kosong).
  { path: '/master/investor-obligation', label: 'Kewajiban Investor', icon: HandCoins, group: 'master' },
  { path: '/access-control/roles', label: 'Role', icon: ShieldCheck, group: 'akses', code: 'ROLE' },
  { path: '/access-control/users', label: 'User', icon: UserCog, group: 'akses', code: 'USER' },
  { path: '/access-control/menus', label: 'Menu & Permission', icon: SquareMenu, group: 'akses', code: 'MENU' },
  { path: '/dashboard-cashflow', label: 'Dashboard Cashflow', icon: Wallet, group: 'lainnya', code: 'DASBOARD_CASHFLOW' },
  { path: '/cashflow', label: 'Cash Flow', icon: ArrowLeftRight, group: 'lainnya', code: 'CASHFLOW' },
  { path: '/laporan-cashflow', label: 'Laporan Cashflow', icon: BarChart3, group: 'lainnya', code: 'LAPORAN_CASHFLOW' },
  { path: '/pembukuan', label: 'Pembukuan Cabang', icon: BookOpen, group: 'lainnya', code: 'BOOK' },
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
  DASBOARD_CASHFLOW: '/dashboard-cashflow',
  DASHBOARD_CASHFLOW: '/dashboard-cashflow',
  UNIT: '/inventory',
  LEAD: '/crm',
  LEAD_ORDER: '/penjualan',
  LEAD_PAYMENT: '/pembayaran',
  // CMS v2 (per-section) — kode menu backend → route FE
  CMS_SITE_SETTING: '/cms/site-settings',
  CMS_HOMEPAGE: '/cms/homepage',
  CMS_ABOUT: '/cms/about',
  CMS_KATALOG: '/cms/katalog',
  CMS_TESTIMONI: '/cms/testimoni',
  CMS_KONTAK: '/cms/kontak',
  CMS_SIMULASI: '/cms/simulasi',
  // Alias kode lama / variasi penamaan agar tetap ter-resolve
  CMS_BANNER: '/cms/homepage',
  CMS_PROFIL: '/cms/about',
  CMS_CONTACT: '/cms/kontak',
  CMS_CREDIT_SIM: '/cms/simulasi',
  CREDIT_SIM: '/cms/simulasi',
  SITE_SETTING: '/cms/site-settings',
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
