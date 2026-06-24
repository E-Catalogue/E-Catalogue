import type { OrderType } from '@/features/order/api/transaction.schema';

// Status order (value backend) + filter
export const ORDER_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

// Label sederhana untuk UI filter (value tetap pakai enum di atas)
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Dibayar',
  PROCESSING: 'Diproses',
  COMPLETED: 'Selesai',
  CANCELLED: 'Batal',
};

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  DINE_IN: 'Dine In',
  TAKEAWAY: 'Take Away',
  DELIVERY: 'Delivery',
};

// Warna badge per status (dipakai kartu & modal)
export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-semantic-warning/15 text-semantic-warning border-semantic-warning/30',
  PAID: 'bg-semantic-info/15 text-semantic-info border-semantic-info/30',
  PROCESSING: 'bg-[#86673A]/10 text-[#86673A] border-[#86673A]/30',
  COMPLETED: 'bg-semantic-success/15 text-semantic-success border-semantic-success/30',
  CANCELLED: 'bg-semantic-error/10 text-semantic-error border-semantic-error/30',
};
