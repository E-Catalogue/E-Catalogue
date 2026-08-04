import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { ClosingFilters, ClosingMetric, ClosingOrder, ClosingReport, ExpenseDetailRow, ExpenseFilters, ExpenseReport } from './report.types';

type Headers = Record<string, string> | undefined;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}

function filenameOf(disposition: string | undefined, fallback: string) {
  return disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? fallback;
}

export const reportApi = {
  closing: (params: ClosingFilters, headers?: Headers) => apiClient.get<ApiResponse<ClosingReport>>('/reports/closing', { params, headers }).then((r) => r.data.data),
  closingOrders: (params: ClosingFilters & { metric: ClosingMetric; page?: number; limit?: number }, headers?: Headers) => apiClient.get<ApiResponse<ClosingOrder[]>>('/reports/closing/orders', { params, headers }).then((r) => r.data),
  exportClosing: async (params: ClosingFilters, headers?: Headers) => {
    const response = await apiClient.get<Blob>('/reports/closing/export', { params, headers, responseType: 'blob', timeout: 60_000 });
    download(response.data, filenameOf(response.headers['content-disposition'], 'laporan-closing.xlsx'));
  },
  expenses: (params: ExpenseFilters, headers?: Headers) => apiClient.get<ApiResponse<ExpenseReport>>('/reports/expenses', { params, headers }).then((r) => r.data.data),
  expenseDetails: (params: ExpenseFilters & { page?: number; limit?: number }, headers?: Headers) => apiClient.get<ApiResponse<ExpenseDetailRow[]>>('/reports/expenses/details', { params, headers }).then((r) => r.data),
  exportExpenses: async (params: ExpenseFilters, headers?: Headers) => {
    const response = await apiClient.get<Blob>('/reports/expenses/export', { params, headers, responseType: 'blob', timeout: 60_000 });
    download(response.data, filenameOf(response.headers['content-disposition'], 'laporan-pengeluaran.xlsx'));
  },
};
