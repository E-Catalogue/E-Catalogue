import { apiClient } from '@/core/api/client';
import type { BaseResponse } from '@/core/api/types';

// Profil customer/member dari backend
export interface CustomerProfile {
  id: string | null;
  fullName: string | null;
  phone: string | null;
}

export const customerApi = {
  // GET /sales/user/customer?phone=... — cek apakah nomor terdaftar sebagai member
  checkByPhone: async (phone: string): Promise<CustomerProfile> => {
    const response = await apiClient.get<BaseResponse<CustomerProfile>>('/sales/user/customer', {
      params: { phone },
    });
    return response.data.data;
  },
};
