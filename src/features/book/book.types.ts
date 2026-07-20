export type BookPeriodStatus = 'OPEN' | 'CLOSED';

/** `periodSelect` (book.repository.js) — snapshot tersimpan, HANYA ada setelah `close()`. Tidak ada `unitSold`. */
export interface BookPeriod {
  id: string;
  branchId: string;
  period: string;
  status: BookPeriodStatus;
  openingCash: number;
  cashIn: number;
  cashOut: number;
  endingCash: number;
  salesRevenue: number;
  unitHpp: number;
  operationalExpense: number;
  payrollExpense: number;
  reconditioningCost: number;
  grossProfit: number;
  operationalNetProfit: number;
  investorProfit: number;
  fixedReturnExpense: number;
  additionalReconditioningCost: number;
  salesIncentiveAccrued: number;
  taxProvision: number;
  companyNetProfit: number;
  closedAt: string | null;
  closedById: string | null;
  createdAt: string;
  updatedAt: string;
  branch?: { id: string; nama: string; code: string };
  closedBy?: { id: string; name?: string | null; username?: string | null } | null;
}

/** `GET /books/periods/:period` mode Owner "semua cabang" — TIDAK PERNAH 404, breakdown/consolidated bisa kosong/nol. */
export interface BookPeriodConsolidated {
  consolidated: Record<string, number> & { unitSold: number };
  breakdown: BookPeriod[];
}

export const isBookPeriodConsolidated = (d: BookPeriod | BookPeriodConsolidated): d is BookPeriodConsolidated =>
  (d as BookPeriodConsolidated).consolidated !== undefined;

/** `LedgerRow` select (book.repository.js findLedger) — subset dari CashTransaction, TANPA proofUrl/createdBy. */
export interface BookLedgerRow {
  id: string;
  branchId: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  sourceType: string;
  sourceId?: string | null;
  cashAccountId: string;
  amount: number;
  transactionDate: string;
  description?: string | null;
  transferGroupId?: string | null;
  postingKey?: string | null;
  reversalOfId?: string | null;
  reversedAt?: string | null;
  createdAt: string;
  branch?: { id: string; nama: string; code: string };
  cashAccount?: { id: string; branchId: string; name: string; code: string; type: string };
}

export const CASH_SUMMARY_FIELDS = ['openingCash', 'cashIn', 'cashOut', 'endingCash'] as const;
export interface CashSummaryFields {
  openingCash: number;
  cashIn: number;
  cashOut: number;
  endingCash: number;
}

export const PROFIT_SUMMARY_FIELDS = [
  'salesRevenue', 'unitSold', 'unitHpp', 'grossProfit', 'investorProfit',
  'fixedReturnExpense', 'additionalReconditioningCost', 'salesIncentiveAccrued',
  'taxProvision', 'companyNetProfit', 'operationalExpense', 'payrollExpense', 'operationalNetProfit',
] as const;
export interface ProfitSummaryFields {
  salesRevenue: number;
  unitSold: number;
  unitHpp: number;
  grossProfit: number;
  investorProfit: number;
  fixedReturnExpense: number;
  additionalReconditioningCost: number;
  salesIncentiveAccrued: number;
  taxProvision: number;
  companyNetProfit: number;
  operationalExpense: number;
  payrollExpense: number;
  operationalNetProfit: number;
}

/**
 * `liveSummary()` proyeksi (README §16 "Transfer internal"): scope single/non-Owner → objek flat
 * `{branch, period, ...fields}`. Scope "all" (Owner tanpa header) → `{period, consolidated, breakdown}`.
 * `breakdown` dihitung TERMASUK transfer internal, `consolidated` dihitung TERPISAH dengan transfer
 * internal DIKECUALIKAN — JANGAN PERNAH menjumlahkan breakdown untuk mendapatkan consolidated.
 */
export type LiveSummary<F> =
  | ({ branch: { id: string; nama: string; code: string }; period: string } & F)
  | { period: string; consolidated: F; breakdown: Array<{ branch: { id: string; nama: string; code: string }; period: string } & F> };

export const isConsolidatedSummary = <F,>(s: LiveSummary<F>): s is Extract<LiveSummary<F>, { consolidated: F }> =>
  (s as { consolidated?: F }).consolidated !== undefined;

export type CashSummary = LiveSummary<CashSummaryFields>;
export type ProfitSummary = LiveSummary<ProfitSummaryFields>;

/** Nilai `missing` dari `taxSettings()` — kode literal dari book.service.js, tidak semua terdokumentasi di PRD. */
export type TaxSettingMissingReason = 'TAX_SETTING' | 'SOURCE_CASH_ACCOUNT' | 'RESERVE_CASH_ACCOUNT' | 'DISTINCT_CASH_ACCOUNTS';

export interface TaxSetting {
  id: string;
  branchId: string;
  taxRatePercent: number;
  sourceCashAccountId: string;
  reserveCashAccountId: string;
  createdAt: string;
  updatedAt: string;
  branch?: { id: string; nama: string; code: string };
  sourceCashAccount?: { id: string; branchId: string; name: string; code: string };
  reserveCashAccount?: { id: string; branchId: string; name: string; code: string };
}

export interface TaxReadiness {
  branch: { id: string; nama: string; code: string };
  ready: boolean;
  missing: TaxSettingMissingReason[];
  setting: TaxSetting | null;
}

export type TaxReserveStatus = 'NOT_REQUIRED' | 'PENDING_TRANSFER' | 'TRANSFERRED' | 'REVERSED';

/** Hasil `POST /books/tax-reserve/retry` — array `SaleSettlement` yang diproses ulang, selalu 200
 * (kegagalan per-item, mis. saldo kurang, tercermin di `taxReserveStatus`, BUKAN error HTTP). */
export interface RetriedTaxSettlement {
  id: string;
  orderId: string;
  branchId: string;
  taxProvision: number;
  companyNetProfit: number;
  taxReserveStatus: TaxReserveStatus;
  taxTransferGroupId?: string | null;
  branch?: { id: string; nama: string; code: string };
}

export const TAX_RESERVE_STATUS_LABEL: Record<TaxReserveStatus, string> = {
  NOT_REQUIRED: 'Tidak Diperlukan',
  PENDING_TRANSFER: 'Menunggu Transfer',
  TRANSFERRED: 'Berhasil Ditransfer',
  REVERSED: 'Dibalik',
};

export const TAX_RESERVE_STATUS_COLOR: Record<TaxReserveStatus, string> = {
  NOT_REQUIRED: 'bg-surface-soft text-muted',
  PENDING_TRANSFER: 'bg-accent-amber/15 text-accent-amber',
  TRANSFERRED: 'bg-semantic-success/10 text-semantic-success',
  REVERSED: 'bg-semantic-error/10 text-semantic-error',
};

export const BOOK_PERIOD_STATUS_LABEL: Record<BookPeriodStatus, string> = {
  OPEN: 'Belum Ditutup',
  CLOSED: 'Ditutup',
};

export const BOOK_PERIOD_STATUS_COLOR: Record<BookPeriodStatus, string> = {
  OPEN: 'bg-accent-amber/15 text-accent-amber',
  CLOSED: 'bg-semantic-success/10 text-semantic-success',
};

export const TAX_MISSING_LABEL: Record<TaxSettingMissingReason, string> = {
  TAX_SETTING: 'Pengaturan pajak belum dibuat',
  SOURCE_CASH_ACCOUNT: 'Akun kas sumber belum dipilih',
  RESERVE_CASH_ACCOUNT: 'Akun kas cadangan belum dipilih',
  DISTINCT_CASH_ACCOUNTS: 'Akun sumber & cadangan harus berbeda',
};
