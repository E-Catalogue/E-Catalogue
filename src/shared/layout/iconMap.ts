import {
  LayoutDashboard, Car, ShoppingCart, Wrench, BadgeCheck, Users, KeyRound,
  ReceiptText, Wallet, TrendingDown, ArrowLeftRight, BarChart3, Settings,
  Tag, Building2, Database, ShieldCheck, SquareMenu, Folder, UserCog, PiggyBank,
  Warehouse, LayoutGrid, BookOpen, Image, Quote, Phone,
  type LucideIcon,
} from 'lucide-react';

const BY_KEY: Record<string, LucideIcon> = {
  // by icon string
  database: Database, folder: Folder, user: Users, users: Users, settings: Settings,
  shield: ShieldCheck, menu: SquareMenu, car: Car, tag: Tag, building: Building2,
  wallet: Wallet, wrench: Wrench, chart: BarChart3, warehouse: Warehouse,
  // by path/code — menu items
  ROLE: ShieldCheck, MENU: SquareMenu, USER: UserCog,
  DASHBOARD: LayoutDashboard, INVENTORY: Car, INVENTORI: Car, PEMBELIAN: ShoppingCart,
  REKONDISI: Wrench, READY_STOCK: BadgeCheck, CRM: Users, TEST_DRIVE: KeyRound,
  PENJUALAN: ReceiptText, PEMBAYARAN: Wallet, PENGELUARAN: TrendingDown,
  CASHFLOW: ArrowLeftRight, LAPORAN: BarChart3, LAPORAN_CASHFLOW: BarChart3, CASHFLOW_REPORT: BarChart3, PENGATURAN: Settings,
  MEREK: Tag, VENDOR: Wrench, BRANCH: Building2, INVESTOR: PiggyBank,
  // Group icons (backend groupCode)
  ACCESS_CONTROL: ShieldCheck, MASTER_DATA: Database,
  INVENTORY_OPERATIONAL: Warehouse, CRM_SALES: Users,
  // CRM & Sales per-menu codes
  LEAD: Users, LEAD_ORDER: ReceiptText, LEAD_PAYMENT: Wallet, UNIT: Car,
  // CMS
  CMS: LayoutGrid, CMS_KATALOG: BookOpen,
  CMS_BANNER: Image, CMS_TESTIMONI: Quote, CMS_KONTAK: Phone, CMS_PROFIL: Building2,
};

export const resolveIcon = (opts: { icon?: string | null; code?: string; path?: string | null }): LucideIcon => {
  const { icon, code, path } = opts;
  if (icon && BY_KEY[icon.toLowerCase()]) return BY_KEY[icon.toLowerCase()];
  if (code && BY_KEY[code.toUpperCase()]) return BY_KEY[code.toUpperCase()];
  if (path) {
    if (path.includes('role')) return ShieldCheck;
    if (path.includes('menu')) return SquareMenu;
    if (path.includes('user')) return UserCog;
  }
  return Folder;
};
