import { useQuery } from '@tanstack/react-query';
import { crmAnalyticsApi } from './crmAnalytics.api';
import type { CrmAnalyticsFilterParams, VisitorLogsParams } from './crmAnalytics.types';

export function useCrmAnalyticsOverview(params?: CrmAnalyticsFilterParams) {
  return useQuery({
    queryKey: ['crm-analytics-overview', params],
    queryFn: () => crmAnalyticsApi.getOverview(params),
  });
}

export function useCrmAnalyticsTrafficChart(params?: CrmAnalyticsFilterParams) {
  return useQuery({
    queryKey: ['crm-analytics-traffic-chart', params],
    queryFn: () => crmAnalyticsApi.getTrafficChart(params),
  });
}

export function useCrmAnalyticsTopUnits(params?: CrmAnalyticsFilterParams & { limit?: number }) {
  return useQuery({
    queryKey: ['crm-analytics-top-units', params],
    queryFn: () => crmAnalyticsApi.getTopUnits(params),
  });
}

export function useCrmAnalyticsLogs(params?: VisitorLogsParams) {
  return useQuery({
    queryKey: ['crm-analytics-logs', params],
    queryFn: () => crmAnalyticsApi.getLogs(params),
  });
}
