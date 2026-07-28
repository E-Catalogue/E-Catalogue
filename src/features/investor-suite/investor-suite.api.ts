import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { InvestorFundingRow, InvestorPaymentRow } from './investor-suite.types';

export const investorSuiteApi = {
  listFundings: async (params?: Record<string, unknown>) => {
    const res = await apiClient.get<ApiResponse<InvestorFundingRow[]>>('/investor-fundings', { params });
    return res.data;
  },
  listPayments: async (params?: Record<string, unknown>) => {
    const res = await apiClient.get<ApiResponse<InvestorPaymentRow[]>>('/investor-obligations/payments', { params });
    return res.data;
  },
};
