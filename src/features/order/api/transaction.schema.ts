import { z } from 'zod';

// Tipe order yang didukung backend
export const ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as const;
export const OrderTypeSchema = z.enum(ORDER_TYPES);
export type OrderType = z.infer<typeof OrderTypeSchema>;

// ===== Request: POST /sales/order =====
export const CreateOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  optionValueIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const CreateOrderRequestSchema = z.object({
  customerProfileId: z.string().optional(), // hilangkan field jika tidak dipakai
  ordererName: z.string().min(1),
  ordererPhone: z.string().min(1),
  branchId: z.string().min(1),
  type: OrderTypeSchema,
  notes: z.string().optional(),
  discountAmount: z.number().min(0).default(0),
  items: z.array(CreateOrderItemSchema).min(1),
});

export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

// ===== Response: data order yang sudah dibuat (field utama yang dipakai UI) =====
export interface CreatedOrder {
  id: string;
  orderNo: string;
  queueNo: string;
  customerProfileId: string | null;
  ordererName: string;
  ordererPhone: string;
  branchId: string;
  type: OrderType;
  status: string;
  notes: string | null;
  subtotal: number;
  discountAmount: number;
  serviceCharge: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ===== Detail order (GET /sales/order/{id}) — termasuk item & opsi terpilih =====
export interface OrderItemSelectedOption {
  id: string;
  optionKey: string;
  value: string;
  price: number;
}

export interface OrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  basePrice: number;
  optionPrice: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
  selectedOptions: OrderItemSelectedOption[];
}

// Detail order memperluas CreatedOrder dengan daftar item (totalAmount/dll dari server)
export interface OrderDetail extends CreatedOrder {
  items: OrderDetailItem[];
}
