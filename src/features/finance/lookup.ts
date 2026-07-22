import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';

type Headers = Record<string, string> | undefined;

/**
 * `.prd/update_module_owned_lookup_20260721.md` — SETIAP module memakai endpoint lookup MILIKNYA
 * SENDIRI (bukan `/finance/lookups/*` global yang sudah dihapus, bukan CRUD module sumber). Semua
 * lookup akun kas mengembalikan bentuk yang sama (`CashAccountOption`), jadi fungsi fetch di-share,
 * TAPI query key tetap di-namespace per module supaya cache tidak campur antar-module/antar-cabang
 * (PRD §7.2). User cukup punya permission module pemakai — server memakai `authorizeAny`.
 */
export interface CashAccountOption {
  id: string;
  branchId?: string;
  name: string;
  code: string;
  type: string;
  defaultPayment: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
  code?: string | null;
}

export interface RecurringTemplateOption {
  id: string;
  branchId?: string;
  name: string;
  kategoriPengeluaranId: string;
  defaultAmount: number;
  kategoriPengeluaran?: { name: string; code?: string | null } | null;
}

const fetchCashAccounts = (url: string, headers?: Headers) =>
  apiClient.get<ApiResponse<CashAccountOption[]>>(url, { headers }).then((r) => r.data.data ?? []);

const fetchCategories = (url: string, headers?: Headers) =>
  apiClient.get<ApiResponse<CategoryOption[]>>(url, { headers }).then((r) => r.data.data ?? []);

/** Opsi umum: `enabled` supaya lookup pembayaran hanya dimuat saat dialognya dibuka (PRD §7.3). */
type LookupOpts = { headers?: Headers; enabled?: boolean };

// ── Cash accounts — satu hook per module (PRD §4.9/§4.12–4.19) ──────────────────
export const useRekondisiCashAccounts = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'rekondisi', 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts('/rekondisis/lookups/cash-accounts', headers), enabled });

export const useCashTransactionCashAccounts = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'cash-transaction', 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts('/cash-transactions/lookups/cash-accounts', headers), enabled });

export const useBookCashAccounts = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'book', 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts('/books/lookups/cash-accounts', headers), enabled });

export const useOperationalExpenseCashAccounts = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'operational-expense', 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts('/operational-expenses/lookups/cash-accounts', headers), enabled });

export const usePayrollCashAccounts = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'payroll', 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts('/payroll/lookups/cash-accounts', headers), enabled });

export const useLeadOrderCashAccounts = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'lead-order', 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts('/lead-orders/lookups/cash-accounts', headers), enabled });

export const useInvestorObligationCashAccounts = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'investor-obligation', 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts('/investor-obligations/lookups/cash-accounts', headers), enabled });

export const useInvestorCapitalCashAccounts = (investorId: string | null, branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'investor-capital', investorId, 'cash-accounts', branchKey], queryFn: () => fetchCashAccounts(`/investors/${investorId}/lookups/cash-accounts`, headers), enabled: enabled && !!investorId });

// ── Expense categories (operational + recurring expense) ────────────────────────
export const useOperationalExpenseCategories = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'operational-expense', 'expense-categories', branchKey], queryFn: () => fetchCategories('/operational-expenses/lookups/expense-categories', headers), enabled });

export const useRecurringExpenseCategories = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'recurring-expense', 'expense-categories', branchKey], queryFn: () => fetchCategories('/recurring-expenses/lookups/expense-categories', headers), enabled });

// ── Payroll lookups (4 endpoint terpisah, PRD §4.17) ────────────────────────────
export interface PayrollUserOption { id: string; branchId?: string; name: string; username: string; role?: { code?: string; name?: string } | null }
export interface PayrollSalesOption { id: string; branchId?: string; name: string; username: string }
export interface PayrollDealOrderOption { id: string; branchId?: string; nomorOrder: string; salesId?: string; hargaFinal: number; dealAt?: string | null; lead?: { nama?: string } | null; sales?: { name?: string } | null }

export const usePayrollUserLookup = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'payroll', 'users', branchKey], queryFn: () => apiClient.get<ApiResponse<PayrollUserOption[]>>('/payroll/lookups/users', { headers }).then((r) => r.data.data ?? []), enabled });

export const usePayrollSalesLookup = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'payroll', 'sales', branchKey], queryFn: () => apiClient.get<ApiResponse<PayrollSalesOption[]>>('/payroll/lookups/sales', { headers }).then((r) => r.data.data ?? []), enabled });

export const usePayrollDealOrderLookup = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({ queryKey: ['lookup', 'payroll', 'deal-orders', branchKey], queryFn: () => apiClient.get<ApiResponse<PayrollDealOrderOption[]>>('/payroll/lookups/deal-orders', { headers }).then((r) => r.data.data ?? []), enabled });

// ── Recurring expense templates (untuk generate pengeluaran rutin, PRD §4.16) ───
export const useRecurringExpenseTemplates = (branchKey: string, { headers, enabled = true }: LookupOpts = {}) =>
  useQuery({
    queryKey: ['lookup', 'recurring-expense', 'templates', branchKey],
    queryFn: () => apiClient.get<ApiResponse<RecurringTemplateOption[]>>('/recurring-expenses/lookups/templates', { headers }).then((r) => r.data.data ?? []),
    enabled,
  });
