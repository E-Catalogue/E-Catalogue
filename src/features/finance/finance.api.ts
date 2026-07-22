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

/** Header opsional `{ 'X-Branch-Id': branchId }` — wajib diisi caller untuk mutation Owner yang backend-nya
 * memanggil `requireBranchId()` (README §8). Lihat catatan per-fungsi di bawah untuk endpoint mana yang
 * benar-benar menegakkannya (dikonfirmasi dari kode `*.service.js` backend, bukan ditebak). */
type BranchHeaders = Record<string, string> | undefined;

function withIdempotency(headers: BranchHeaders, idempotencyKey?: string) {
  return idempotencyKey ? { ...headers, 'Idempotency-Key': idempotencyKey } : headers;
}

export const cashAccountApi = {
  list: (params: ListParams & { isActive?: string }, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<CashAccount[]>>('/cash-accounts', { params, headers }).then((r) => r.data),
  get: (id: string, headers?: BranchHeaders) => apiClient.get<ApiResponse<CashAccount>>(`/cash-accounts/${id}`, { headers }).then((r) => r.data.data),
  /** Backend `create()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang (422 `BRANCH_CONTEXT_REQUIRED` bila tidak). */
  create: (body: Partial<CashAccount>, headers?: BranchHeaders) => apiClient.post<ApiResponse<CashAccount>>('/cash-accounts', body, { headers }).then((r) => r.data),
  /** Backend `update()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang. */
  update: (id: string, body: Partial<CashAccount>, headers?: BranchHeaders) => apiClient.patch<ApiResponse<CashAccount>>(`/cash-accounts/${id}`, body, { headers }).then((r) => r.data),
  /** Backend `remove()` TIDAK memanggil `requireBranchId()` — branch diambil dari resource yang ditemukan, jadi Owner boleh tanpa header. Tetap dikirim bila tersedia untuk konsistensi. */
  remove: (id: string, headers?: BranchHeaders) => apiClient.delete<ApiResponse<unknown>>(`/cash-accounts/${id}`, { headers }).then((r) => r.data),
};

export const cashTransactionApi = {
  list: (params: ListParams & { type?: string; sourceType?: string; cashAccountId?: string; dateFrom?: string; dateTo?: string }, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<CashTransaction[]>>('/cash-transactions', { params, headers }).then((r) => r.data),
  dashboard: (params: { dateFrom?: string; dateTo?: string }, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<CashDashboard>>('/cash-flow/dashboard', { params, headers }).then((r) => r.data.data),
  /**
   * Backend `manualIn/manualOut/adjustment/transfer` memanggil `requireBranchId()` (Owner wajib pilih cabang)
   * DAN menerima header `Idempotency-Key` yang dipakai untuk membangun `postingKey` dedup (lihat
   * `cash-transaction.service.js` `manualPostingKey()`). CATATAN KONTRAK: berbeda dari investor-obligation/
   * capital, endpoint ini TIDAK memanggil `requireKey()` — key TIDAK wajib (fallback ke `randomUUID()` di
   * server bila kosong) dan backend TIDAK pernah melempar `IDEMPOTENCY_KEY_REQUIRED`/`IDEMPOTENCY_KEY_CONFLICT`
   * untuk endpoint ini walau README §14 menyebutnya. FE tetap mengirim key (best-effort dedup on retry) sesuai
   * lifecycle §14, tapi tidak perlu menangani REQUIRED/CONFLICT khusus dari endpoint ini.
   */
  manualIn: (body: Record<string, unknown>, headers?: BranchHeaders, idempotencyKey?: string) =>
    apiClient.post<ApiResponse<CashTransaction>>('/cash-transactions/manual-in', body, { headers: withIdempotency(headers, idempotencyKey) }).then((r) => r.data),
  manualOut: (body: Record<string, unknown>, headers?: BranchHeaders, idempotencyKey?: string) =>
    apiClient.post<ApiResponse<CashTransaction>>('/cash-transactions/manual-out', body, { headers: withIdempotency(headers, idempotencyKey) }).then((r) => r.data),
  transfer: (body: Record<string, unknown>, headers?: BranchHeaders, idempotencyKey?: string) =>
    apiClient.post<ApiResponse<{ transferGroupId: string; out: CashTransaction; in: CashTransaction }>>('/cash-transactions/transfer', body, { headers: withIdempotency(headers, idempotencyKey) }).then((r) => r.data),
  adjustment: (
    body: { cashAccountId: string; type: Extract<CashTransactionType, 'IN' | 'OUT'>; amount: number; transactionDate: string; description?: string; proofUrl?: string | null },
    headers?: BranchHeaders,
    idempotencyKey?: string,
  ) => apiClient.post<ApiResponse<CashTransaction>>('/cash-transactions/adjustment', body, { headers: withIdempotency(headers, idempotencyKey) }).then((r) => r.data),
  /**
   * Backend `interBranchTransfer()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang SUMBER
   * konkret (akun `fromCashAccountId` harus milik cabang itu, kalau tidak 409 `CROSS_BRANCH_RELATION`).
   * Kalau kedua akun ternyata satu cabang, backend tolak 422 `INTER_BRANCH_REQUIRED` — pakai `transfer()`
   * biasa untuk kasus itu. Body sama seperti `transfer`, response sama: `{transferGroupId, out, in}`.
   */
  interBranchTransfer: (
    body: { fromCashAccountId: string; toCashAccountId: string; amount: number; transactionDate: string; description?: string; proofUrl?: string | null },
    headers?: BranchHeaders,
    idempotencyKey?: string,
  ) => apiClient.post<ApiResponse<{ transferGroupId: string; out: CashTransaction; in: CashTransaction }>>('/cash-transactions/inter-branch-transfer', body, { headers: withIdempotency(headers, idempotencyKey) }).then((r) => r.data),
  /**
   * Backend `reverse()` HANYA menerima transaksi dengan `sourceType === 'MANUAL_ADJUSTMENT'`
   * (409 `SOURCE_REVERSAL_REQUIRED` untuk sumber lain — transaksi manual-in/out/transfer harus dibalik
   * dari modul asalnya, bukan endpoint ini). Tidak memakai `Idempotency-Key` (tidak dibaca backend);
   * aman diretry karena `409 CASH_TRANSACTION_ALREADY_REVERSED` mencegah reversal dobel.
   */
  reverse: (id: string, body: { transactionDate: string; description?: string | null }, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<CashTransaction>>(`/cash-transactions/${id}/reverse`, body, { headers }).then((r) => r.data),
};

/**
 * Bangun FormData multipart bila ada file `proof` (field name persis `upload.single("proof")` backend —
 * `operational-expense.route.js`). Backend set `proofUrl` sendiri dari file yang di-upload (lihat
 * `body()` helper di controller), jadi field `proofUrl` string TIDAK dikirim saat ada file. Tanpa file,
 * tetap kirim JSON biasa (backend terima `proofUrl` manual sebagai fallback).
 */
function expenseBody(body: Record<string, unknown>, proof?: File | null): Record<string, unknown> | FormData {
  if (!proof) return body;
  const form = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (key === 'proofUrl' || value === undefined || value === null) return;
    form.append(key, typeof value === 'boolean' ? String(value) : String(value));
  });
  form.append('proof', proof);
  return form;
}

export const operationalExpenseApi = {
  list: (params: ListParams & { status?: string; type?: string; dateFrom?: string; dateTo?: string }, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<OperationalExpense[]>>('/operational-expenses', { params, headers }).then((r) => r.data),
  get: (id: string, headers?: BranchHeaders) => apiClient.get<ApiResponse<OperationalExpense>>(`/operational-expenses/${id}`, { headers }).then((r) => r.data.data),
  /** Backend `create()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang. `proof` opsional (field multipart `proof`, lihat `expenseBody`). */
  create: (body: Partial<OperationalExpense>, headers?: BranchHeaders, proof?: File | null) =>
    apiClient.post<ApiResponse<OperationalExpense>>('/operational-expenses', expenseBody(body, proof), { headers }).then((r) => r.data),
  /** Backend `update()` TIDAK memanggil `requireBranchId()` — branch diambil dari resource existing. */
  update: (id: string, body: Partial<OperationalExpense>, headers?: BranchHeaders, proof?: File | null) =>
    apiClient.patch<ApiResponse<OperationalExpense>>(`/operational-expenses/${id}`, expenseBody(body, proof), { headers }).then((r) => r.data),
  /** Backend `remove()` TIDAK memanggil `requireBranchId()`. */
  remove: (id: string, headers?: BranchHeaders) => apiClient.delete<ApiResponse<unknown>>(`/operational-expenses/${id}`, { headers }).then((r) => r.data),
  /** Backend `pay()` TIDAK memanggil `requireBranchId()` — branch diambil dari `expense.branchId`, dan TIDAK menerima/memakai `Idempotency-Key` (dikonfirmasi: tidak ada di controller/service). `proof` opsional (bukti pembayaran). */
  pay: (id: string, body: { cashAccountId: string; paidDate: string; description?: string }, headers?: BranchHeaders, proof?: File | null) =>
    apiClient.post<ApiResponse<OperationalExpense>>(`/operational-expenses/${id}/pay`, expenseBody(body, proof), { headers }).then((r) => r.data),
};

export const recurringExpenseApi = {
  list: (params: ListParams & { isActive?: string }, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<RecurringExpense[]>>('/recurring-expenses', { params, headers }).then((r) => r.data),
  get: (id: string, headers?: BranchHeaders) => apiClient.get<ApiResponse<RecurringExpense>>(`/recurring-expenses/${id}`, { headers }).then((r) => r.data.data),
  /** Backend `create()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang. */
  create: (body: Partial<RecurringExpense>, headers?: BranchHeaders) => apiClient.post<ApiResponse<RecurringExpense>>('/recurring-expenses', body, { headers }).then((r) => r.data),
  /** Backend `update()` TIDAK memanggil `requireBranchId()`. */
  update: (id: string, body: Partial<RecurringExpense>, headers?: BranchHeaders) => apiClient.patch<ApiResponse<RecurringExpense>>(`/recurring-expenses/${id}`, body, { headers }).then((r) => r.data),
  /** Backend `remove()` TIDAK memanggil `requireBranchId()`. */
  remove: (id: string, headers?: BranchHeaders) => apiClient.delete<ApiResponse<unknown>>(`/recurring-expenses/${id}`, { headers }).then((r) => r.data),
  /** Backend `generate()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang (endpoint ini membuat entri `operational-expense` baru untuk cabang tsb). */
  generate: (body: { period: string; items?: Array<{ recurringExpenseId: string; amount: number }> }, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<OperationalExpense[]>>('/recurring-expenses/generate', body, { headers }).then((r) => r.data),
};

export const payrollApi = {
  baseSalaries: {
    list: (params: ListParams & { userId?: string; isActive?: string }, headers?: BranchHeaders) =>
      apiClient.get<ApiResponse<PayrollBaseSalary[]>>('/payroll/base-salaries', { params, headers }).then((r) => r.data),
    /** Backend `create()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang. */
    create: (body: Partial<PayrollBaseSalary>, headers?: BranchHeaders) => apiClient.post<ApiResponse<PayrollBaseSalary>>('/payroll/base-salaries', body, { headers }).then((r) => r.data),
    /** Backend `update()` TIDAK memanggil `requireBranchId()`. */
    update: (id: string, body: Partial<PayrollBaseSalary>, headers?: BranchHeaders) => apiClient.patch<ApiResponse<PayrollBaseSalary>>(`/payroll/base-salaries/${id}`, body, { headers }).then((r) => r.data),
    /** Backend `remove()` TIDAK memanggil `requireBranchId()`. */
    remove: (id: string, headers?: BranchHeaders) => apiClient.delete<ApiResponse<unknown>>(`/payroll/base-salaries/${id}`, { headers }).then((r) => r.data),
  },
  incentives: {
    list: (params: ListParams & { salesId?: string; leadOrderId?: string; period?: string; status?: string }, headers?: BranchHeaders) =>
      apiClient.get<ApiResponse<SalesIncentive[]>>('/payroll/sales-incentives', { params, headers }).then((r) => r.data),
    /** Backend `create()` selalu melempar 410 `SALES_INCENTIVE_CREATE_DEPRECATED` — dipertahankan hanya karena sudah dipakai UI existing, headers diteruskan untuk konsistensi saja. */
    create: (body: Partial<SalesIncentive>, headers?: BranchHeaders) => apiClient.post<ApiResponse<SalesIncentive>>('/payroll/sales-incentives', body, { headers }).then((r) => r.data),
    /** Backend `update()` TIDAK memanggil `requireBranchId()`. */
    update: (id: string, body: Partial<SalesIncentive>, headers?: BranchHeaders) => apiClient.patch<ApiResponse<SalesIncentive>>(`/payroll/sales-incentives/${id}`, body, { headers }).then((r) => r.data),
    /** Backend `remove()` TIDAK memanggil `requireBranchId()`. */
    remove: (id: string, headers?: BranchHeaders) => apiClient.delete<ApiResponse<unknown>>(`/payroll/sales-incentives/${id}`, { headers }).then((r) => r.data),
  },
  runs: {
    list: (params: ListParams & { period?: string; status?: string }, headers?: BranchHeaders) =>
      apiClient.get<ApiResponse<PayrollRun[]>>('/payroll/runs', { params, headers }).then((r) => r.data),
    get: (id: string, headers?: BranchHeaders) => apiClient.get<ApiResponse<PayrollRun>>(`/payroll/runs/${id}`, { headers }).then((r) => r.data.data),
    /** Backend `generate()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang. */
    generate: (body: { period: string }, headers?: BranchHeaders) => apiClient.post<ApiResponse<PayrollRun>>('/payroll/runs/generate', body, { headers }).then((r) => r.data),
    /** Backend `updateItem()` TIDAK memanggil `requireBranchId()`. */
    updateItem: (id: string, itemId: string, body: { allowance: number; deduction: number }, headers?: BranchHeaders) =>
      apiClient.patch<ApiResponse<PayrollRun>>(`/payroll/runs/${id}/items/${itemId}`, body, { headers }).then((r) => r.data),
    /** Backend `pay()` TIDAK memanggil `requireBranchId()` — branch diambil dari `run.branchId`, dan TIDAK menerima/memakai `Idempotency-Key`. */
    pay: (id: string, body: { cashAccountId: string; paidDate: string; description?: string }, headers?: BranchHeaders) =>
      apiClient.post<ApiResponse<PayrollRun>>(`/payroll/runs/${id}/pay`, body, { headers }).then((r) => r.data),
  },
};
