import type { ApiMenuItem } from '@/features/auth/types';

/**
 * Menu Tenant Web — **salinan persis** dari response `GET /tenant/auth/me/menu`
 * (code, path, dan nama ikon lucide sama seperti yang dikirim seeder).
 *
 * Dipakai sebagai **fallback** selama endpoint itu belum tersedia. Begitu API jalan,
 * `state.auth.groupMenus` terisi dari server dan menu ini otomatis tidak dipakai
 * (lihat `resolveMenus` di `menu.ts`) — tidak ada yang perlu dihapus.
 *
 * `id` di sini memakai code (bukan UUID) karena hanya dipakai sebagai key React.
 */

const group = (code: string, name: string, icon: string, children: ApiMenuItem[]): ApiMenuItem => ({
  id: code,
  code,
  name,
  type: 'MENU_GROUP',
  path: null,
  icon,
  children,
});

const item = (code: string, name: string, path: string, icon: string): ApiMenuItem => ({
  id: code,
  code,
  name,
  type: 'MENU',
  path,
  icon,
  children: [],
});

export const TENANT_MENU: ApiMenuItem[] = [
  item('tenant.dashboard', 'Dashboard', '/', 'layout-dashboard'),

  group('tenant.customer_management', 'Customer', 'contact-round', [
    item('customer.customer', 'Customers', '/customers', 'contact-round'),
  ]),

  group('tenant.catalogue', 'Catalogue', 'book-open', [
    item('catalogue.product', 'Products', '/catalogue/products', 'package-search'),
    item('catalogue.category', 'Categories', '/catalogue/categories', 'tags'),
    item('catalogue.brand', 'Brands', '/catalogue/brands', 'badge-check'),
    item('catalogue.price_list', 'Price Lists', '/catalogue/price-lists', 'badge-dollar-sign'),
  ]),

  group('tenant.inventory', 'Inventory', 'warehouse', [
    item('inventory.stock', 'Stock', '/inventory/stocks', 'boxes'),
    item('inventory.serialized_stock', 'Serialized Stock', '/inventory/serialized-stocks', 'scan-barcode'),
    item('inventory.location', 'Locations', '/inventory/locations', 'map-pin'),
    item('inventory.movement', 'Movements', '/inventory/movements', 'arrow-left-right'),
    item('inventory.transfer', 'Transfers', '/inventory/transfers', 'truck'),
    item('inventory.adjustment', 'Adjustments', '/inventory/adjustments', 'sliders-horizontal'),
    item('inventory.stock_count', 'Stock Counts', '/inventory/stock-counts', 'clipboard-check'),
    item('inventory.report', 'Reports', '/inventory/reports', 'chart-no-axes-combined'),
  ]),

  group('tenant.purchasing', 'Purchasing', 'shopping-cart', [
    item('purchasing.supplier', 'Suppliers', '/purchasing/suppliers', 'factory'),
    item('purchasing.purchase_request', 'Purchase Requests', '/purchasing/purchase-requests', 'notebook-pen'),
    item('purchasing.purchase_order', 'Purchase Orders', '/purchasing/purchase-orders', 'shopping-bag'),
    item('purchasing.goods_receipt', 'Goods Receipts', '/purchasing/goods-receipts', 'package-check'),
    item('purchasing.purchase_invoice', 'Purchase Invoices', '/purchasing/purchase-invoices', 'receipt-text'),
    item('purchasing.purchase_return', 'Purchase Returns', '/purchasing/purchase-returns', 'package-x'),
    item('purchasing.report', 'Reports', '/purchasing/reports', 'chart-no-axes-combined'),
  ]),

  group('tenant.sales', 'Sales', 'hand-coins', [
    item('sales.lead', 'Leads', '/sales/leads', 'user-round-search'),
    item('sales.quotation', 'Quotations', '/sales/quotations', 'file-text'),
    item('sales.order', 'Sales Orders', '/sales/orders', 'clipboard-list'),
    item('sales.invoice', 'Sales Invoices', '/sales/invoices', 'receipt'),
    item('sales.return', 'Sales Returns', '/sales/returns', 'undo-2'),
    item('sales.report', 'Reports', '/sales/reports', 'chart-no-axes-combined'),
  ]),

  group('tenant.showroom', 'Showroom', 'car-front', [
    item('showroom.vehicle_unit', 'Vehicle Units', '/showroom/vehicle-units', 'car-front'),
    item('showroom.test_drive', 'Test Drives', '/showroom/test-drives', 'calendar-clock'),
    item('showroom.reservation', 'Reservations', '/showroom/reservations', 'calendar-check'),
    item('showroom.delivery', 'Deliveries', '/showroom/deliveries', 'truck'),
    item('showroom.trade_in', 'Trade-ins', '/showroom/trade-ins', 'repeat-2'),
    item('showroom.leasing', 'Leasing', '/showroom/leasing', 'landmark'),
  ]),

  group('tenant.finance', 'Finance', 'landmark', [
    item('finance.account', 'Chart of Accounts', '/finance/accounts', 'book-open-check'),
    item('finance.fiscal_period', 'Fiscal Periods', '/finance/fiscal-periods', 'calendar-range'),
    item('finance.journal', 'Journals', '/finance/journals', 'book-copy'),
    item('finance.receivable', 'Receivables', '/finance/receivables', 'circle-dollar-sign'),
    item('finance.payable', 'Payables', '/finance/payables', 'hand-coins'),
    item('finance.cash_bank', 'Cash & Bank', '/finance/cash-bank', 'landmark'),
    item('finance.payment', 'Payments', '/finance/payments', 'wallet-cards'),
    item('finance.expense', 'Expenses', '/finance/expenses', 'receipt'),
    item('finance.report', 'Reports', '/finance/reports', 'chart-no-axes-combined'),
  ]),

  group('tenant.settings', 'Settings', 'settings', [
    item('tenant.profile', 'General', '/settings/general', 'building-2'),
    item('tenant.user', 'User Tenant', '/settings/users', 'users'),
    item('tenant.role', 'Role Tenant', '/settings/roles', 'key-round'),
    item('tenant.numbering', 'Numbering', '/settings/numbering', 'binary'),
    item('tenant.approval', 'Approvals', '/settings/approvals', 'badge-check'),
    item('tenant.module_settings', 'Module Settings', '/settings/modules', 'sliders-horizontal'),
  ]),
];
