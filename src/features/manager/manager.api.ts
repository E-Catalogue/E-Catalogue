import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { ManagerTargetUnitSummary, ManagerUnit, ManagerUnitStatus } from './manager.types';

export const managerApi = {
  stock: async (params?: { page?: number; limit?: number; search?: string; statusUnit?: ManagerUnitStatus }) => {
    const response = await apiClient.get<ApiResponse<ManagerUnit[]>>('/manager/stock', { params });
    return response.data;
  },
  stockDetail: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ManagerUnit>>(`/manager/stock/${id}`);
    return response.data;
  },
  targetUnit: async (period?: string) => {
    const response = await apiClient.get<ApiResponse<ManagerTargetUnitSummary | null>>('/manager/target-unit', { params: period ? { period } : undefined });
    return response.data;
  },
};
