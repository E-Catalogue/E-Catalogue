import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cashAccountApi, cashTransactionApi, financeLookupApi, operationalExpenseApi, payrollApi, recurringExpenseApi } from './finance.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { CashAccount, OperationalExpense, PayrollBaseSalary, RecurringExpense, SalesIncentive, ListParams } from './types';

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

export const useCashAccounts = (params: ListParams & { isActive?: string } = { page: 1, limit: 100 }, opts?: { enabled?: boolean }) =>
  useQuery({ queryKey: ['cash-accounts', params], queryFn: () => cashAccountApi.list(params), ...opts });

export const useCashAccountMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cash-accounts'] });
  return {
    create: useMutation({ mutationFn: (body: Partial<CashAccount>) => cashAccountApi.create(body), onSuccess: () => { toast('Akun kas ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<CashAccount> }) => cashAccountApi.update(v.id, v.body), onSuccess: () => { toast('Akun kas diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: cashAccountApi.remove, onSuccess: () => { toast('Akun kas dihapus'); inval(); } }),
  };
};

export const useCashDashboard = (params: { dateFrom?: string; dateTo?: string }) =>
  useQuery({ queryKey: ['cash-flow-dashboard', params], queryFn: () => cashTransactionApi.dashboard(params) });

export const useCashTransactions = (params: ListParams & { type?: string; sourceType?: string; cashAccountId?: string; dateFrom?: string; dateTo?: string }) =>
  useQuery({ queryKey: ['cash-transactions', params], queryFn: () => cashTransactionApi.list(params) });

export const useCashTransactionMutations = () => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
    qc.invalidateQueries({ queryKey: ['cash-accounts'] });
  };
  return {
    manualIn: useMutation({ mutationFn: cashTransactionApi.manualIn, onSuccess: () => { toast('Kas masuk dicatat'); inval(); } }),
    manualOut: useMutation({ mutationFn: cashTransactionApi.manualOut, onSuccess: () => { toast('Kas keluar dicatat'); inval(); } }),
    transfer: useMutation({ mutationFn: cashTransactionApi.transfer, onSuccess: () => { toast('Transfer kas berhasil'); inval(); } }),
    adjustment: useMutation({ mutationFn: cashTransactionApi.adjustment, onSuccess: () => { toast('Penyesuaian kas dicatat'); inval(); } }),
  };
};

export const useOperationalExpenses = (params: ListParams & { status?: string; type?: string; dateFrom?: string; dateTo?: string }) =>
  useQuery({ queryKey: ['operational-expenses', params], queryFn: () => operationalExpenseApi.list(params) });

export const useOperationalExpenseMutations = () => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['operational-expenses'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
  };
  return {
    create: useMutation({ mutationFn: (body: Partial<OperationalExpense>) => operationalExpenseApi.create(body), onSuccess: () => { toast('Beban operasional ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<OperationalExpense> }) => operationalExpenseApi.update(v.id, v.body), onSuccess: () => { toast('Beban operasional diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: operationalExpenseApi.remove, onSuccess: () => { toast('Beban operasional dihapus'); inval(); } }),
    pay: useMutation({ mutationFn: (v: { id: string; body: { cashAccountId: string; paidDate: string; description?: string } }) => operationalExpenseApi.pay(v.id, v.body), onSuccess: () => { toast('Beban operasional dibayar'); inval(); } }),
  };
};

export const useRecurringExpenses = (params: ListParams & { isActive?: string }) =>
  useQuery({ queryKey: ['recurring-expenses', params], queryFn: () => recurringExpenseApi.list(params) });

export const useRecurringExpenseMutations = () => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['recurring-expenses'] });
    qc.invalidateQueries({ queryKey: ['operational-expenses'] });
  };
  return {
    create: useMutation({ mutationFn: (body: Partial<RecurringExpense>) => recurringExpenseApi.create(body), onSuccess: () => { toast('Beban rutin ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<RecurringExpense> }) => recurringExpenseApi.update(v.id, v.body), onSuccess: () => { toast('Beban rutin diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: recurringExpenseApi.remove, onSuccess: () => { toast('Beban rutin dihapus'); inval(); } }),
    generate: useMutation({ mutationFn: recurringExpenseApi.generate, onSuccess: () => { toast('Beban rutin digenerate'); inval(); } }),
  };
};

export const usePayrollBaseSalaries = (params: ListParams & { userId?: string; isActive?: string }) =>
  useQuery({ queryKey: ['payroll-base-salaries', params], queryFn: () => payrollApi.baseSalaries.list(params) });

export const usePayrollBaseSalaryMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['payroll-base-salaries'] });
  return {
    create: useMutation({ mutationFn: (body: Partial<PayrollBaseSalary>) => payrollApi.baseSalaries.create(body), onSuccess: () => { toast('Gaji pokok ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<PayrollBaseSalary> }) => payrollApi.baseSalaries.update(v.id, v.body), onSuccess: () => { toast('Gaji pokok diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: payrollApi.baseSalaries.remove, onSuccess: () => { toast('Gaji pokok dihapus'); inval(); } }),
  };
};

export const useSalesIncentives = (params: ListParams & { salesId?: string; leadOrderId?: string; period?: string; status?: string }) =>
  useQuery({ queryKey: ['sales-incentives', params], queryFn: () => payrollApi.incentives.list(params) });

export const useSalesIncentiveMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['sales-incentives'] });
  return {
    create: useMutation({ mutationFn: (body: Partial<SalesIncentive>) => payrollApi.incentives.create(body), onSuccess: () => { toast('Insentif sales ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<SalesIncentive> }) => payrollApi.incentives.update(v.id, v.body), onSuccess: () => { toast('Insentif sales diperbarui'); inval(); } }),
    remove: useMutation({ mutationFn: payrollApi.incentives.remove, onSuccess: () => { toast('Insentif sales dihapus'); inval(); } }),
  };
};

export const usePayrollRuns = (params: ListParams & { period?: string; status?: string }) =>
  useQuery({ queryKey: ['payroll-runs', params], queryFn: () => payrollApi.runs.list(params) });

export const usePayrollRun = (id: string | null) =>
  useQuery({ queryKey: ['payroll-run', id], queryFn: () => payrollApi.runs.get(id as string), enabled: !!id });

export const usePayrollRunMutations = () => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['payroll-runs'] });
    qc.invalidateQueries({ queryKey: ['payroll-run'] });
    qc.invalidateQueries({ queryKey: ['sales-incentives'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
  };
  return {
    generate: useMutation({ mutationFn: payrollApi.runs.generate, onSuccess: () => { toast('Payroll digenerate'); inval(); } }),
    updateItem: useMutation({ mutationFn: (v: { id: string; itemId: string; body: { allowance: number; deduction: number } }) => payrollApi.runs.updateItem(v.id, v.itemId, v.body), onSuccess: () => { toast('Item payroll diperbarui'); inval(); } }),
    pay: useMutation({ mutationFn: (v: { id: string; body: { cashAccountId: string; paidDate: string; description?: string } }) => payrollApi.runs.pay(v.id, v.body), onSuccess: () => { toast('Payroll dibayar'); inval(); } }),
  };
};

export const useLookupCashAccounts = (params: { search?: string; type?: string; isActive?: string } = { isActive: 'true' }) =>
  useQuery({ queryKey: ['finance-lookups', 'cash-accounts', params], queryFn: () => financeLookupApi.cashAccounts(params) });

export const useLookupExpenseCategories = (params: { search?: string; isActive?: string } = { isActive: 'true' }) =>
  useQuery({ queryKey: ['finance-lookups', 'expense-categories', params], queryFn: () => financeLookupApi.expenseCategories(params) });

export const useLookupPayrollUsers = (params: { search?: string; isActive?: string; role?: string } = { isActive: 'true' }) =>
  useQuery({ queryKey: ['finance-lookups', 'payroll-users', params], queryFn: () => financeLookupApi.payrollUsers(params) });

export const useLookupSales = (params: { search?: string; isActive?: string } = { isActive: 'true' }) =>
  useQuery({ queryKey: ['finance-lookups', 'sales', params], queryFn: () => financeLookupApi.sales(params) });

export const useLookupDealOrders = (params: { search?: string; salesId?: string; period?: string; withoutIncentive?: string } = {}) =>
  useQuery({ queryKey: ['finance-lookups', 'deal-orders', params], queryFn: () => financeLookupApi.dealOrders(params) });

export const useLookupRecurringExpenses = (params: { search?: string; isActive?: string } = { isActive: 'true' }) =>
  useQuery({ queryKey: ['finance-lookups', 'recurring-expenses', params], queryFn: () => financeLookupApi.recurringExpenses(params) });

export const useLookupPayrollRuns = (params: { period?: string; status?: string } = {}) =>
  useQuery({ queryKey: ['finance-lookups', 'payroll-runs', params], queryFn: () => financeLookupApi.payrollRuns(params) });

export const useLookupUnits = (params: { search?: string; statusUnit?: string } = {}) =>
  useQuery({ queryKey: ['finance-lookups', 'units', params], queryFn: () => financeLookupApi.units(params) });

export const useLookupRekondisisPayable = (params: { search?: string; unitId?: string } = {}) =>
  useQuery({ queryKey: ['finance-lookups', 'rekondisis-payable', params], queryFn: () => financeLookupApi.rekondisisPayable(params) });

export const useLookupInvestors = (params: { search?: string; isActive?: string } = { isActive: 'true' }) =>
  useQuery({ queryKey: ['finance-lookups', 'investors', params], queryFn: () => financeLookupApi.investors(params) });
