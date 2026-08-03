import { useQuery } from '@tanstack/react-query';
import { reportApi } from './report.api';
import type { ClosingFilters, ClosingMetric, ExpenseFilters } from './report.types';

type Headers = Record<string, string> | undefined;

export const useClosingReport = (branchKey: string, params: ClosingFilters, headers?: Headers, enabled = true) => useQuery({
  queryKey: ['closing-report', branchKey, params],
  queryFn: () => reportApi.closing(params, headers),
  enabled,
});

export const useClosingOrders = (branchKey: string, params: ClosingFilters & { metric: ClosingMetric; page: number; limit: number }, headers?: Headers, enabled = true) => useQuery({
  queryKey: ['closing-report-orders', branchKey, params],
  queryFn: () => reportApi.closingOrders(params, headers),
  enabled,
});

export const useExpenseReport = (branchKey: string, params: ExpenseFilters, headers?: Headers) => useQuery({
  queryKey: ['expense-report', branchKey, params],
  queryFn: () => reportApi.expenses(params, headers),
});

export const useExpenseDetails = (branchKey: string, params: ExpenseFilters & { page: number; limit: number }, headers?: Headers) => useQuery({
  queryKey: ['expense-report-details', branchKey, params],
  queryFn: () => reportApi.expenseDetails(params, headers),
});
