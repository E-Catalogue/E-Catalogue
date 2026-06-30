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
  ShieldCheck,
  UserCog,
  SquareMenu,
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
  { path: '/pembayaran', label: 'Pembayaran', icon: Wallet, group: 'operasional', code: 'PEMBAYARAN' },
  { path: '/pengeluaran', label: 'Pengeluaran', icon: TrendingDown, group: 'operasional', code: 'PENGELUARAN' },
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
  { path: '/cashflow', label: 'Cash Flow', icon: ArrowLeftRight, group: 'lainnya', code: 'CASHFLOW' },
  { path: '/laporan', label: 'Laporan', icon: BarChart3, group: 'lainnya', code: 'LAPORAN' },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings, group: 'lainnya', code: 'PENGATURAN' },
];

/** Peta kode menu backend → route frontend nyata (agar menu dinamis tidak 404). */
export const PATH_BY_CODE: Record<string, string> = {
  ...MENU_ITEMS.reduce((acc, m) => (m.code ? { ...acc, [m.code]: m.path } : acc), {} as Record<string, string>),
  // Alias kode backend yang berbeda dari kode static menu
  UNIT: '/inventory',
  LEAD: '/crm',
  LEAD_ORDER: '/penjualan',
  LEAD_PAYMENT: '/pembayaran',
};

/** Set seluruh path frontend yang valid. */
export const VALID_PATHS = new Set(MENU_ITEMS.map((m) => m.path));
