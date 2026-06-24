import { apiClient } from '@/core/api/client';
import type { BaseResponse } from '@/core/api/types';
import type { CreatedOrder } from '@/features/order/api/transaction.schema';

export const trackingApi = {
  // GET /sales/order — ambil semua order untuk menu tracking
  getAll: async (): Promise<CreatedOrder[]> => {
    const response = await apiClient.get<BaseResponse<CreatedOrder[]>>('/sales/order');
    return response.data.data;
  },
};
