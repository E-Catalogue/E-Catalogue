import { useState } from 'react';
import type { Product, CartItem, Promo } from '../schema';
import type { CreateOrderRequest, OrderType } from '../api/transaction.schema';

interface OrderCustomerInfo {
  ordererName: string;
  ordererPhone: string;
  type: OrderType;
  branchId: string;
  notes?: string;
  customerProfileId?: string;
}

export const useOrderCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);

  const formatRupiah = (price: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const calculateItemPrice = (productPrice: number, productType: string, options: any) => {
    let extraPrice = 0;
    
    if (productType === 'single') {
      extraPrice = Object.values(options).reduce((sum: number, opt: any) => sum + (opt?.price || 0), 0);
    } else if (productType === 'bundle') {
      Object.values(options).forEach((subItemOpts: any) => {
        extraPrice += Object.values(subItemOpts).reduce((sum: number, opt: any) => sum + (opt?.price || 0), 0);
      });
    }

    return productPrice + extraPrice;
  };

  const addToCart = (product: Product, selectedOptions: any, notes: string, quantity: number) => {
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product, 
      quantity, 
      selectedOptions, 
      notes,
      totalItemPrice: calculateItemPrice(product.price, product.type, selectedOptions),
    };
    setCart([...cart, newItem]);
  };

  const editCartItem = (cartItemId: string, selectedOptions: any, notes: string, quantity: number) => {
    setCart(cart.map(item => {
      if (item.id === cartItemId) {
        return {
          ...item, 
          quantity, 
          selectedOptions, 
          notes,
          totalItemPrice: calculateItemPrice(item.product.price, item.product.type, selectedOptions)
        };
      }
      return item;
    }));
  };

  const updateQuantity = (cartItemId: string, type: 'increment' | 'decrement') => {
    setCart(cart.map(item => {
      if (item.id === cartItemId) {
        const newQty = type === 'increment' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const removeCartItem = (cartItemId: string) => setCart(cart.filter(item => item.id !== cartItemId));
  
  const clearCart = () => { 
    setCart([]); 
    setAppliedPromo(null); 
  };

  const subTotal = cart.reduce((total, item) => total + (item.totalItemPrice * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') discountAmount = subTotal * (appliedPromo.value / 100);
    else discountAmount = appliedPromo.value;
  }
  
  const totalAfterDiscount = Math.max(0, subTotal - discountAmount);
  const tax = totalAfterDiscount * 0.10; 
  const serviceCharge = totalAfterDiscount * 0.05; 
  
  const grandTotal = totalAfterDiscount + tax + serviceCharge;

  // Kumpulkan optionValueIds dari opsi yang dipilih (mendukung single & bundle)
  const collectOptionValueIds = (item: CartItem): string[] => {
    if (item.product.type === 'bundle') {
      return Object.values(item.selectedOptions)
        .flatMap((sub: any) => Object.values(sub).map((opt: any) => opt?.id))
        .filter(Boolean);
    }
    return Object.values(item.selectedOptions)
      .map((opt: any) => opt?.id)
      .filter(Boolean);
  };

  // Bangun payload sesuai kontrak POST /sales/order
  const generateOrderPayload = (info: OrderCustomerInfo): CreateOrderRequest => ({
    ...(info.customerProfileId ? { customerProfileId: info.customerProfileId } : {}),
    ordererName: info.ordererName,
    ordererPhone: info.ordererPhone,
    branchId: info.branchId,
    type: info.type,
    ...(info.notes ? { notes: info.notes } : {}),
    discountAmount,
    items: cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      optionValueIds: collectOptionValueIds(item),
      ...(item.notes ? { notes: item.notes } : {}),
    })),
  });

  return {
    cart, addToCart, editCartItem, updateQuantity, removeCartItem, clearCart,
    subTotal, discountAmount, tax, serviceCharge, grandTotal, formatRupiah,
    paymentMethod, setPaymentMethod, appliedPromo, setAppliedPromo,
    generateOrderPayload
  };
};