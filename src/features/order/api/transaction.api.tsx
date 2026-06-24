import { apiClient } from '@/core/api/client';
import type { BaseResponse } from '@/core/api/types';
import type { CreateOrderRequest, CreatedOrder, OrderDetail } from './transaction.schema';

export const transactionApi = {
  // POST /sales/order — buat order/transaksi baru
  createOrder: async (payload: CreateOrderRequest): Promise<CreatedOrder> => {
    const response = await apiClient.post<BaseResponse<CreatedOrder>>('/sales/order', payload);
    return response.data.data;
  },

  // GET /sales/order/{orderId} — ambil detail order (total final & payment dari server)
  getDetail: async (orderId: string): Promise<OrderDetail> => {
    const response = await apiClient.get<BaseResponse<OrderDetail>>(`/sales/order/${orderId}`);
    return response.data.data;
  },

  // PATCH /sales/order/{orderId}/cancel — batalkan order (hanya status PENDING)
  cancelOrder: async (orderId: string, notes?: string): Promise<CreatedOrder> => {
    const response = await apiClient.patch<BaseResponse<CreatedOrder>>(`/sales/order/${orderId}/cancel`, { notes });
    return response.data.data;
  },
};
