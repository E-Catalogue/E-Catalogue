import { z } from 'zod';

export interface Category {
  id: string;
  name: string;
}

export interface ProductOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface ProductOption {
  id: string;
  category: string;
  isRequired: boolean;
  choices: ProductOptionChoice[];
}

export interface BundleItem {
  id: string;
  productName: string;
  options: ProductOption[]; 
}

export interface ProductDetailInfo {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image: string;
  type: 'single' | 'bundle';
  description?: string;
  story?: string;
  details?: ProductDetailInfo[];
  options?: ProductOption[];
  bundleItems?: BundleItem[];
}

export interface Promo {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions: any;
  notes: string;
  totalItemPrice: number;
}

// CHECKOUT
export const customerInfoSchema = z.object({
  orderType: z.enum(['Dine In', 'Take Away']),
  customerName: z.string().min(2, { message: "Nama pemesan minimal 2 karakter" }),
  orderNumber: z.string().min(1, { message: "Nomor meja/antrean harus diisi" }),
  customerPhone: z.string().optional(),
});

export type CustomerInfoPayload = z.infer<typeof customerInfoSchema>;

export interface PaymentMethodCategory {
  id: string;
  name: string;
  methods: { id: string; name: string; icon: string }[];
}