import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cashAccountApi, cashTransactionApi, financeLookupApi, operationalExpenseApi, payrollApi, recurringExpenseApi } from './finance.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { notifyApiError } from '@/core/api/notify';
import type { CashAccount, OperationalExpense, PayrollBaseSalary, RecurringExpense, SalesIncentive, ListParams } from './types';

type BranchHeaders = Record<string, string> | undefined;

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

// ── Cash Account ─────────────────────────────────────────────────────────────
// Query key menyertakan `branchKey` (README §8) supaya cache Cabang A tidak bocor ke Cabang B
// ketika Owner memindahkan selector.

export const useCashAccounts = (branchKey: string, params: ListParams & { isActive?: string } = { page: 1, limit: 100 }, headers?: BranchHeaders, opts?: { enabled?: boolean }) =>
  useQuery({ queryKey: ['cash-accounts', branchKey, params], queryFn: () => cashAccountApi.list(params, headers), ...opts });

export const useCashAccountMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cash-accounts'] });
  return {
    create: useMutation({
      mutationFn: ({ body, headers }: { body: Partial<CashAccount>; headers?: BranchHeaders }) => cashAccountApi.create(body, headers),
      onSuccess: () => { toast('Akun kas ditambahkan'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, body, headers }: { id: string; body: Partial<CashAccount>; headers?: BranchHeaders }) => cashAccountApi.update(id, body, headers),
      onSuccess: () => { toast('Akun kas diperbarui'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    remove: useMutation({
      mutationFn: ({ id, headers }: { id: string; headers?: BranchHeaders }) => cashAccountApi.remove(id, headers),
      onSuccess: () => { toast('Akun kas dihapus'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
};

// ── Cash Flow dashboard & ledger ────────────────────────────────────────────

export const useCashDashboard = (branchKey: string, params: { dateFrom?: string; dateTo?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['cash-flow-dashboard', branchKey, params], queryFn: () => cashTransactionApi.dashboard(params, headers) });

export const useCashTransactions = (branchKey: string, params: ListParams & { type?: string; sourceType?: string; cashAccountId?: string; dateFrom?: string; dateTo?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['cash-transactions', branchKey, params], queryFn: () => cashTransactionApi.list(params, headers) });

/**
 * Mutation finansial README §14: manual-in/manual-out/transfer/adjustment menerima `Idempotency-Key`
 * (dipakai backend untuk dedup `postingKey`, TAPI tidak ditegakkan wajib — lihat catatan di finance.api.ts).
 * Tetap dikirim mengikuti lifecycle §14 (generate saat form dibuka, regenerate saat field berubah, JANGAN
 * regenerate setelah bare timeout).
 */
export const useCashTransactionMutations = () => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
    qc.invalidateQueries({ queryKey: ['cash-accounts'] });
  };
  type TxArgs = { body: Record<string, unknown>; headers?: BranchHeaders; idempotencyKey?: string };
  return {
    manualIn: useMutation({
      mutationFn: ({ body, headers, idempotencyKey }: TxArgs) => cashTransactionApi.manualIn(body, headers, idempotencyKey),
      onSuccess: () => { toast('Kas masuk dicatat'); inval(); },
    }),
    manualOut: useMutation({
      mutationFn: ({ body, headers, idempotencyKey }: TxArgs) => cashTransactionApi.manualOut(body, headers, idempotencyKey),
      onSuccess: () => { toast('Kas keluar dicatat'); inval(); },
    }),
    transfer: useMutation({
      mutationFn: ({ body, headers, idempotencyKey }: TxArgs) => cashTransactionApi.transfer(body, headers, idempotencyKey),
      onSuccess: () => { toast('Transfer kas berhasil'); inval(); },
    }),
    adjustment: useMutation({
      mutationFn: ({ body, headers, idempotencyKey }: { body: { cashAccountId: string; type: 'IN' | 'OUT'; amount: number; transactionDate: string; description?: string; proofUrl?: string | null }; headers?: BranchHeaders; idempotencyKey?: string }) =>
        cashTransactionApi.adjustment(body, headers, idempotencyKey),
      onSuccess: () => { toast('Penyesuaian kas dicatat'); inval(); },
    }),
    interBranchTransfer: useMutation({
      mutationFn: ({ body, headers, idempotencyKey }: { body: { fromCashAccountId: string; toCashAccountId: string; amount: number; transactionDate: string; description?: string; proofUrl?: string | null }; headers?: BranchHeaders; idempotencyKey?: string }) =>
        cashTransactionApi.interBranchTransfer(body, headers, idempotencyKey),
      onSuccess: () => { toast('Transfer antar cabang berhasil'); inval(); },
    }),
    reverse: useMutation({
      mutationFn: ({ id, body, headers }: { id: string; body: { transactionDate: string; description?: string | null }; headers?: BranchHeaders }) =>
        cashTransactionApi.reverse(id, body, headers),
      onSuccess: () => { toast('Transaksi kas dibalik'); inval(); },
    }),
  };
};

// ── Operational Expense ─────────────────────────────────────────────────────

export const useOperationalExpenses = (branchKey: string, params: ListParams & { status?: string; type?: string; dateFrom?: string; dateTo?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['operational-expenses', branchKey, params], queryFn: () => operationalExpenseApi.list(params, headers) });

export const useOperationalExpenseMutations = () => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['operational-expenses'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
  };
  return {
    create: useMutation({
      mutationFn: ({ body, headers, proof }: { body: Partial<OperationalExpense>; headers?: BranchHeaders; proof?: File | null }) => operationalExpenseApi.create(body, headers, proof),
      onSuccess: () => { toast('Beban operasional ditambahkan'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, body, headers, proof }: { id: string; body: Partial<OperationalExpense>; headers?: BranchHeaders; proof?: File | null }) => operationalExpenseApi.update(id, body, headers, proof),
      onSuccess: () => { toast('Beban operasional diperbarui'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    remove: useMutation({
      mutationFn: ({ id, headers }: { id: string; headers?: BranchHeaders }) => operationalExpenseApi.remove(id, headers),
      onSuccess: () => { toast('Beban operasional dihapus'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    pay: useMutation({
      mutationFn: ({ id, body, headers, proof }: { id: string; body: { cashAccountId: string; paidDate: string; description?: string }; headers?: BranchHeaders; proof?: File | null }) => operationalExpenseApi.pay(id, body, headers, proof),
      onSuccess: () => { toast('Beban operasional dibayar'); inval(); },
    }),
  };
};

// ── Recurring Expense ────────────────────────────────────────────────────────

export const useRecurringExpenses = (branchKey: string, params: ListParams & { isActive?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['recurring-expenses', branchKey, params], queryFn: () => recurringExpenseApi.list(params, headers) });

export const useRecurringExpenseMutations = () => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['recurring-expenses'] });
    qc.invalidateQueries({ queryKey: ['operational-expenses'] });
  };
  return {
    create: useMutation({
      mutationFn: ({ body, headers }: { body: Partial<RecurringExpense>; headers?: BranchHeaders }) => recurringExpenseApi.create(body, headers),
      onSuccess: () => { toast('Beban rutin ditambahkan'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, body, headers }: { id: string; body: Partial<RecurringExpense>; headers?: BranchHeaders }) => recurringExpenseApi.update(id, body, headers),
      onSuccess: () => { toast('Beban rutin diperbarui'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    remove: useMutation({
      mutationFn: ({ id, headers }: { id: string; headers?: BranchHeaders }) => recurringExpenseApi.remove(id, headers),
      onSuccess: () => { toast('Beban rutin dihapus'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    generate: useMutation({
      mutationFn: ({ body, headers }: { body: { period: string; items?: Array<{ recurringExpenseId: string; amount: number }> }; headers?: BranchHeaders }) => recurringExpenseApi.generate(body, headers),
      onSuccess: () => { toast('Beban rutin digenerate'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
};

// ── Payroll: base salary ─────────────────────────────────────────────────────

export const usePayrollBaseSalaries = (branchKey: string, params: ListParams & { userId?: string; isActive?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['payroll-base-salaries', branchKey, params], queryFn: () => payrollApi.baseSalaries.list(params, headers) });

export const usePayrollBaseSalaryMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['payroll-base-salaries'] });
  return {
    create: useMutation({
      mutationFn: ({ body, headers }: { body: Partial<PayrollBaseSalary>; headers?: BranchHeaders }) => payrollApi.baseSalaries.create(body, headers),
      onSuccess: () => { toast('Gaji pokok ditambahkan'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, body, headers }: { id: string; body: Partial<PayrollBaseSalary>; headers?: BranchHeaders }) => payrollApi.baseSalaries.update(id, body, headers),
      onSuccess: () => { toast('Gaji pokok diperbarui'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    remove: useMutation({
      mutationFn: ({ id, headers }: { id: string; headers?: BranchHeaders }) => payrollApi.baseSalaries.remove(id, headers),
      onSuccess: () => { toast('Gaji pokok dihapus'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
};

// ── Payroll: sales incentive ──────────────────────────────────────────────────

export const useSalesIncentives = (branchKey: string, params: ListParams & { salesId?: string; leadOrderId?: string; period?: string; status?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['sales-incentives', branchKey, params], queryFn: () => payrollApi.incentives.list(params, headers) });

export const useSalesIncentiveMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['sales-incentives'] });
  return {
    create: useMutation({
      mutationFn: ({ body, headers }: { body: Partial<SalesIncentive>; headers?: BranchHeaders }) => payrollApi.incentives.create(body, headers),
      onSuccess: () => { toast('Insentif sales ditambahkan'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, body, headers }: { id: string; body: Partial<SalesIncentive>; headers?: BranchHeaders }) => payrollApi.incentives.update(id, body, headers),
      onSuccess: () => { toast('Insentif sales diperbarui'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    remove: useMutation({
      mutationFn: ({ id, headers }: { id: string; headers?: BranchHeaders }) => payrollApi.incentives.remove(id, headers),
      onSuccess: () => { toast('Insentif sales dihapus'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
};

// ── Payroll runs ──────────────────────────────────────────────────────────────

export const usePayrollRuns = (branchKey: string, params: ListParams & { period?: string; status?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['payroll-runs', branchKey, params], queryFn: () => payrollApi.runs.list(params, headers) });

export const usePayrollRun = (branchKey: string, id: string | null, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['payroll-run', branchKey, id], queryFn: () => payrollApi.runs.get(id as string, headers), enabled: !!id });

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
    generate: useMutation({
      mutationFn: ({ body, headers }: { body: { period: string }; headers?: BranchHeaders }) => payrollApi.runs.generate(body, headers),
      onSuccess: () => { toast('Payroll digenerate'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    updateItem: useMutation({
      mutationFn: ({ id, itemId, body, headers }: { id: string; itemId: string; body: { allowance: number; deduction: number }; headers?: BranchHeaders }) => payrollApi.runs.updateItem(id, itemId, body, headers),
      onSuccess: () => { toast('Item payroll diperbarui'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    pay: useMutation({
      mutationFn: ({ id, body, headers }: { id: string; body: { cashAccountId: string; paidDate: string; description?: string }; headers?: BranchHeaders }) => payrollApi.runs.pay(id, body, headers),
      onSuccess: () => { toast('Payroll dibayar'); inval(); },
    }),
  };
};

// ── Lookups (README §9) ───────────────────────────────────────────────────────
// CATATAN: backend `finance/lookups/*` belum benar-benar memfilter per branch (lihat finance.api.ts) —
// `branchKey`/`headers` tetap dijadikan bagian query key & dikirim untuk konsistensi dan forward-compat.

export const useLookupCashAccounts = (branchKey: string, params: { search?: string; type?: string; isActive?: string } = { isActive: 'true' }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'cash-accounts', branchKey, params], queryFn: () => financeLookupApi.cashAccounts(params, headers) });

export const useLookupExpenseCategories = (branchKey: string, params: { search?: string; isActive?: string } = { isActive: 'true' }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'expense-categories', branchKey, params], queryFn: () => financeLookupApi.expenseCategories(params, headers) });

export const useLookupPayrollUsers = (branchKey: string, params: { search?: string; isActive?: string; role?: string } = { isActive: 'true' }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'payroll-users', branchKey, params], queryFn: () => financeLookupApi.payrollUsers(params, headers) });

export const useLookupSales = (branchKey: string, params: { search?: string; isActive?: string } = { isActive: 'true' }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'sales', branchKey, params], queryFn: () => financeLookupApi.sales(params, headers) });

export const useLookupDealOrders = (branchKey: string, params: { search?: string; salesId?: string; period?: string; withoutIncentive?: string } = {}, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'deal-orders', branchKey, params], queryFn: () => financeLookupApi.dealOrders(params, headers) });

export const useLookupRecurringExpenses = (branchKey: string, params: { search?: string; isActive?: string } = { isActive: 'true' }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'recurring-expenses', branchKey, params], queryFn: () => financeLookupApi.recurringExpenses(params, headers) });

export const useLookupPayrollRuns = (branchKey: string, params: { period?: string; status?: string } = {}, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'payroll-runs', branchKey, params], queryFn: () => financeLookupApi.payrollRuns(params, headers) });

export const useLookupUnits = (branchKey: string, params: { search?: string; statusUnit?: string } = {}, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'units', branchKey, params], queryFn: () => financeLookupApi.units(params, headers) });

export const useLookupRekondisisPayable = (branchKey: string, params: { search?: string; unitId?: string } = {}, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'rekondisis-payable', branchKey, params], queryFn: () => financeLookupApi.rekondisisPayable(params, headers) });

export const useLookupInvestors = (branchKey: string, params: { search?: string; isActive?: string } = { isActive: 'true' }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['finance-lookups', 'investors', branchKey, params], queryFn: () => financeLookupApi.investors(params, headers) });
