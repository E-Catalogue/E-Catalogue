import type { CartItem } from '../schema';
import type { OrderDetail } from '../api/transaction.schema';

// Ubah item OrderDetail (server) -> bentuk CartItem agar bisa dipakai ulang oleh
// PaymentView & ThermalReceipt (yang menerima daftar cart).
export const orderDetailToCart = (order: OrderDetail): CartItem[] =>
  order.items.map(it => ({
    id: it.id,
    quantity: it.quantity,
    notes: it.notes ?? '',
    totalItemPrice: it.unitPrice,
    product: {
      id: it.productId,
      name: it.productName,
      price: it.basePrice,
      type: 'single' as const,
      image: '',
      categoryId: '',
    },
    selectedOptions: Object.fromEntries(
      it.selectedOptions.map(o => [o.id, { id: o.id, name: o.value, price: o.price }])
    ),
  }));
