import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  BookLedgerRow,
  BookPeriod,
  BookPeriodConsolidated,
  CashSummary,
  ProfitSummary,
  RetriedTaxSettlement,
  TaxReadiness,
  TaxSetting,
} from './book.types';

type BranchHeaders = Record<string, string> | undefined;

export const bookApi = {
  /** `GET /books/periods` — selalu array flat (tidak ada mode consolidated), TIDAK validasi format `period`. */
  periods: (params: { period?: string } = {}, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<BookPeriod[]>>('/books/periods', { params, headers }).then((r) => r.data.data),
  /**
   * `GET /books/periods/:period` — 422 `INVALID_BOOK_PERIOD` bila format bukan YYYY-MM. Mode single/non-Owner:
   * 404 `BOOK_PERIOD_NOT_FOUND` bila belum pernah ditutup. Mode Owner "semua cabang": TIDAK PERNAH 404,
   * balas `{consolidated, breakdown}` (nol/kosong bila belum ada snapshot).
   */
  period: (period: string, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<BookPeriod | BookPeriodConsolidated>>(`/books/periods/${period}`, { headers }).then((r) => r.data.data),
  /** `GET /books/ledger` — `period` default bulan berjalan bila kosong. Meta paginasi HANYA `{page,limit,total,totalPages}`. */
  ledger: (params: { period?: string; page?: number; limit?: number; cashAccountId?: string } = {}, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<BookLedgerRow[]>>('/books/ledger', { params, headers }).then((r) => r.data),
  /** `GET /books/cash-summary` — live (bukan snapshot tersimpan), `period` default bulan berjalan. */
  cashSummary: (params: { period?: string } = {}, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<CashSummary>>('/books/cash-summary', { params, headers }).then((r) => r.data.data),
  /** `GET /books/profit-summary` — live, konsolidasi mengecualikan transfer internal (lihat catatan tipe). */
  profitSummary: (params: { period?: string } = {}, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<ProfitSummary>>('/books/profit-summary', { params, headers }).then((r) => r.data.data),
  /** `GET /books/tax-settings` — daftar readiness per cabang (satu cabang utk scope single, semua utk Owner). */
  taxSettings: (headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<TaxReadiness[]>>('/books/tax-settings', { headers }).then((r) => r.data.data),
  /** `PUT /books/tax-settings` memanggil `requireBranchId()` — Owner WAJIB pilih cabang. Upsert. */
  updateTaxSetting: (body: { taxRatePercent: number; sourceCashAccountId: string; reserveCashAccountId: string }, headers?: BranchHeaders) =>
    apiClient.put<ApiResponse<TaxSetting>>('/books/tax-settings', body, { headers }).then((r) => r.data),
  /**
   * `POST /books/tax-reserve/retry` memanggil `requireBranchId()` — Owner WAJIB pilih cabang. Selalu 200;
   * hasil per-item ada di `taxReserveStatus` tiap baris (kegagalan saldo kurang tidak melempar HTTP error).
   */
  retryTaxReserve: (headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<RetriedTaxSettlement[]>>('/books/tax-reserve/retry', {}, { headers }).then((r) => r.data),
  /**
   * `POST /books/periods/:period/close` memanggil `requireBranchId()` — Owner WAJIB pilih cabang KONKRET
   * (aksi per-cabang, tidak ada mode "semua cabang"). 409 `BOOK_PERIOD_NOT_FINISHED` bila periode
   * berjalan/masa depan, 409 `BOOK_PERIOD_ALREADY_CLOSED` bila sudah ditutup. IRREVERSIBLE — tidak ada
   * endpoint buka-kembali di backend manapun.
   */
  closePeriod: (period: string, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<BookPeriod>>(`/books/periods/${period}/close`, {}, { headers }).then((r) => r.data),
};
