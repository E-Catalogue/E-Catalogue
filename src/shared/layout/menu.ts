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
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  group: 'main' | 'operasional' | 'lainnya';
}

export const MENU_ITEMS: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { path: '/inventory', label: 'Inventory / Stok', icon: Car, group: 'operasional' },
  { path: '/pembelian', label: 'Pembelian Unit', icon: ShoppingCart, group: 'operasional' },
  { path: '/rekondisi', label: 'Rekondisi', icon: Wrench, group: 'operasional' },
  { path: '/ready-stock', label: 'Ready Stock', icon: BadgeCheck, group: 'operasional' },
  { path: '/crm', label: 'CRM / Lead', icon: Users, group: 'operasional' },
  { path: '/test-drive', label: 'Test Drive', icon: KeyRound, group: 'operasional' },
  { path: '/penjualan', label: 'Penjualan', icon: ReceiptText, group: 'operasional' },
  { path: '/pembayaran', label: 'Pembayaran', icon: Wallet, group: 'operasional' },
  { path: '/laporan', label: 'Laporan', icon: BarChart3, group: 'lainnya' },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings, group: 'lainnya' },
];
