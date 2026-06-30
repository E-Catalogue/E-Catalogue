import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  CashAccount,
  CashDashboard,
  CashTransaction,
  CashTransactionType,
  OperationalExpense,
  PayrollBaseSalary,
  PayrollRun,
  RecurringExpense,
  SalesIncentive,
  ListParams,
} from './types';

export const cashAccountApi = {
  list: (params: ListParams & { isActive?: string }) => apiClient.get<ApiResponse<CashAccount[]>>('/cash-accounts', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<CashAccount>>(`/cash-accounts/${id}`).then((r) => r.data.data),
  create: (body: Partial<CashAccount>) => apiClient.post<ApiResponse<CashAccount>>('/cash-accounts', body).then((r) => r.data),
  update: (id: string, body: Partial<CashAccount>) => apiClient.patch<ApiResponse<CashAccount>>(`/cash-accounts/${id}`, body).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/cash-accounts/${id}`).then((r) => r.data),
};

export const cashTransactionApi = {
  list: (params: ListParams & { type?: string; sourceType?: string; cashAccountId?: string; dateFrom?: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<CashTransaction[]>>('/cash-transactions', { params }).then((r) => r.data),
  dashboard: (params: { dateFrom?: string; dateTo?: string }) => apiClient.get<ApiResponse<CashDashboard>>('/cash-flow/dashboard', { params }).then((r) => r.data.data),
  manualIn: (body: Record<string, unknown>) => apiClient.post<ApiResponse<CashTransaction>>('/cash-transactions/manual-in', body).then((r) => r.data),
  manualOut: (body: Record<string, unknown>) => apiClient.post<ApiResponse<CashTransaction>>('/cash-transactions/manual-out', body).then((r) => r.data),
  transfer: (body: Record<string, unknown>) => apiClient.post<ApiResponse<{ transferGroupId: string; out: CashTransaction; in: CashTransaction }>>('/cash-transactions/transfer', body).then((r) => r.data),
  adjustment: (body: { cashAccountId: string; type: Extract<CashTransactionType, 'IN' | 'OUT'>; amount: number; transactionDate: string; description?: string; proofUrl?: string | null }) =>
    apiClient.post<ApiResponse<CashTransaction>>('/cash-transactions/adjustment', body).then((r) => r.data),
};

export const operationalExpenseApi = {
  list: (params: ListParams & { status?: string; type?: string; dateFrom?: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<OperationalExpense[]>>('/operational-expenses', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<OperationalExpense>>(`/operational-expenses/${id}`).then((r) => r.data.data),
  create: (body: Partial<OperationalExpense>) => apiClient.post<ApiResponse<OperationalExpense>>('/operational-expenses', body).then((r) => r.data),
  update: (id: string, body: Partial<OperationalExpense>) => apiClient.patch<ApiResponse<OperationalExpense>>(`/operational-expenses/${id}`, body).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/operational-expenses/${id}`).then((r) => r.data),
  pay: (id: string, body: { cashAccountId: string; paidDate: string; description?: string }) =>
    apiClient.post<ApiResponse<OperationalExpense>>(`/operational-expenses/${id}/pay`, body).then((r) => r.data),
};

export const recurringExpenseApi = {
  list: (params: ListParams & { isActive?: string }) => apiClient.get<ApiResponse<RecurringExpense[]>>('/recurring-expenses', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<RecurringExpense>>(`/recurring-expenses/${id}`).then((r) => r.data.data),
  create: (body: Partial<RecurringExpense>) => apiClient.post<ApiResponse<RecurringExpense>>('/recurring-expenses', body).then((r) => r.data),
  update: (id: string, body: Partial<RecurringExpense>) => apiClient.patch<ApiResponse<RecurringExpense>>(`/recurring-expenses/${id}`, body).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/recurring-expenses/${id}`).then((r) => r.data),
  generate: (body: { period: string; items?: Array<{ recurringExpenseId: string; amount: number }> }) =>
    apiClient.post<ApiResponse<OperationalExpense[]>>('/recurring-expenses/generate', body).then((r) => r.data),
};

export const payrollApi = {
  baseSalaries: {
    list: (params: ListParams & { userId?: string; isActive?: string }) => apiClient.get<ApiResponse<PayrollBaseSalary[]>>('/payroll/base-salaries', { params }).then((r) => r.data),
    create: (body: Partial<PayrollBaseSalary>) => apiClient.post<ApiResponse<PayrollBaseSalary>>('/payroll/base-salaries', body).then((r) => r.data),
    update: (id: string, body: Partial<PayrollBaseSalary>) => apiClient.patch<ApiResponse<PayrollBaseSalary>>(`/payroll/base-salaries/${id}`, body).then((r) => r.data),
    remove: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/payroll/base-salaries/${id}`).then((r) => r.data),
  },
  incentives: {
    list: (params: ListParams & { salesId?: string; leadOrderId?: string; period?: string; status?: string }) => apiClient.get<ApiResponse<SalesIncentive[]>>('/payroll/sales-incentives', { params }).then((r) => r.data),
    create: (body: Partial<SalesIncentive>) => apiClient.post<ApiResponse<SalesIncentive>>('/payroll/sales-incentives', body).then((r) => r.data),
    update: (id: string, body: Partial<SalesIncentive>) => apiClient.patch<ApiResponse<SalesIncentive>>(`/payroll/sales-incentives/${id}`, body).then((r) => r.data),
    remove: (id: string) => apiClient.delete<ApiResponse<unknown>>(`/payroll/sales-incentives/${id}`).then((r) => r.data),
  },
  runs: {
    list: (params: ListParams & { period?: string; status?: string }) => apiClient.get<ApiResponse<PayrollRun[]>>('/payroll/runs', { params }).then((r) => r.data),
    get: (id: string) => apiClient.get<ApiResponse<PayrollRun>>(`/payroll/runs/${id}`).then((r) => r.data.data),
    generate: (body: { period: string }) => apiClient.post<ApiResponse<PayrollRun>>('/payroll/runs/generate', body).then((r) => r.data),
    updateItem: (id: string, itemId: string, body: { allowance: number; deduction: number }) =>
      apiClient.patch<ApiResponse<PayrollRun>>(`/payroll/runs/${id}/items/${itemId}`, body).then((r) => r.data),
    pay: (id: string, body: { cashAccountId: string; paidDate: string; description?: string }) =>
      apiClient.post<ApiResponse<PayrollRun>>(`/payroll/runs/${id}/pay`, body).then((r) => r.data),
  },
};
