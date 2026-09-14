import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  CrmAnalyticsOverview,
  TrafficTrendPoint,
  TopUnitItem,
  VisitorLogRow,
  VisitorLogsResponse,
  CrmAnalyticsFilterParams,
  VisitorLogsParams,
} from './crmAnalytics.types';

export const crmAnalyticsApi = {
  getOverview: (params?: CrmAnalyticsFilterParams) =>
    apiClient
      .get<ApiResponse<CrmAnalyticsOverview>>('/crm-analytics/overview', { params })
      .then((r) => r.data.data),

  getTrafficChart: (params?: CrmAnalyticsFilterParams) =>
    apiClient
      .get<ApiResponse<TrafficTrendPoint[]>>('/crm-analytics/traffic-chart', { params })
      .then((r) => r.data.data),

  getTopUnits: (params?: CrmAnalyticsFilterParams & { limit?: number }) =>
    apiClient
      .get<ApiResponse<TopUnitItem[]>>('/crm-analytics/top-units', { params })
      .then((r) => r.data.data),

  getLogs: (params?: VisitorLogsParams) =>
    apiClient
      .get<ApiResponse<VisitorLogRow[]>>('/crm-analytics/logs', { params })
      .then((r) => ({
        data: r.data.data ?? [],
        meta: r.data.meta ?? { page: 1, limit: 15, total: 0, totalPages: 1 },
      } as VisitorLogsResponse)),
};
