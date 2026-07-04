import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { DashboardOverview, DashboardPeriodType } from './dashboard.types';

export const dashboardApi = {
  overview: (params: { tipePeriode: DashboardPeriodType; period: string }) =>
    apiClient.get<ApiResponse<DashboardOverview>>('/dashboard', { params }).then((r) => r.data.data),
};
