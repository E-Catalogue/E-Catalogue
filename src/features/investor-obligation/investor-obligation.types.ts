// Kontrak: ecatalogue-be/.prd/create_investor_obligation_20260717_090122.md
// + ecatalogue-be/src/modules/investor-obligation/*.js (kode backend menang atas prosa PRD).

export type InvestorObligationType = 'FIXED_RETURN' | 'PRINCIPAL' | 'PROFIT_SHARE';
export type InvestorObligationStatus = 'ACCRUED' | 'DUE' | 'PARTIALLY_PAID' | 'PAID' | 'REVERSED';
export type InvestorPaymentPostingStatus = 'PENDING' | 'POSTED' | 'REVERSED';

export interface InvestorObligation {
  id: string;
  fundingAgreementId: string;
  settlementId: string | null;
  investorId: string;
  branchId: string;
  type: InvestorObligationType;
  status: InvestorObligationStatus;
  cycleKey: string;
  cycleStart: string;
  cycleEnd: string;
  dueDate: string;
  basisAmount: number;
  rateSnapshot: number;
  amount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  investor: { id: string; name: string; code: string };
  branch: { id: string; nama: string; code: string };
  fundingAgreement: { id: string; unitId: string; scheme: string; status: string; principalAmount: number };
}

export interface InvestorPayment {
  id: string;
  obligationId: string;
  branchId: string;
  cashAccountId: string;
  amount: number;
  paidAt: string;
  description: string | null;
  cashTransactionId: string | null;
  postingStatus: InvestorPaymentPostingStatus;
  idempotencyKey: string;
  reversalOfId: string | null;
  createdAt: string;
  cashAccount: { id: string; branchId: string; name: string; code: string };
}

export interface InvestorObligationListParams {
  page?: number;
  limit?: number;
  investorId?: string;
  status?: InvestorObligationStatus;
  type?: InvestorObligationType;
  dueBefore?: string;
}

export interface InvestorObligationGeneratePayload {
  /** ISO date. Bila kosong, backend memakai tanggal sekarang. */
  throughDate?: string;
}

export interface InvestorObligationPayPayload {
  cashAccountId: string;
  /** amount > 0 dan <= amount - paidAmount (divalidasi FE, backend menegakkan ulang). */
  amount: number;
  /** ISO date. */
  paidAt: string;
  description?: string;
}

export interface InvestorObligationReversePayload {
  /** ISO date, opsional — default tanggal sekarang di backend. */
  transactionDate?: string;
  description?: string;
}

/** Response POST /investor-obligations/:id/payments. */
export interface InvestorObligationPayResult {
  obligation: InvestorObligation;
  payment: InvestorPayment;
}

export const OBLIGATION_TYPE_LABEL: Record<InvestorObligationType, string> = {
  FIXED_RETURN: 'Fixed Return',
  PRINCIPAL: 'Pokok (Principal)',
  PROFIT_SHARE: 'Bagi Hasil',
};

export const OBLIGATION_STATUS_LABEL: Record<InvestorObligationStatus, string> = {
  ACCRUED: 'Accrued',
  DUE: 'Jatuh Tempo',
  PARTIALLY_PAID: 'Dibayar Sebagian',
  PAID: 'Lunas',
  REVERSED: 'Dibalik',
};

export const OBLIGATION_STATUS_COLOR: Record<InvestorObligationStatus, string> = {
  ACCRUED: 'bg-slate-100 text-slate-600',
  DUE: 'bg-amber-100 text-amber-700',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  REVERSED: 'bg-red-100 text-red-700',
};

export const POSTING_STATUS_LABEL: Record<InvestorPaymentPostingStatus, string> = {
  PENDING: 'Pending',
  POSTED: 'Terposting',
  REVERSED: 'Dibalik',
};

/** Status yang boleh menerima pembayaran (README §15 state machine obligation). */
export const PAYABLE_STATUSES: InvestorObligationStatus[] = ['DUE', 'PARTIALLY_PAID'];

/** Error codes finansial khusus modul ini — dipetakan ke banner inline, bukan sekadar toast. */
export const OBLIGATION_INLINE_ERROR_CODES = [
  'PAYMENT_EXCEEDS_OBLIGATION',
  'INVESTOR_OBLIGATION_NOT_PAYABLE',
  'INVESTOR_OBLIGATION_NOT_FOUND',
  'INVESTOR_PAYMENT_NOT_REVERSIBLE',
  'IDEMPOTENCY_KEY_REQUIRED',
  'IDEMPOTENCY_KEY_CONFLICT',
  'CASH_ACCOUNT_NOT_FOUND',
  'CASH_ACCOUNT_INACTIVE',
  'BOOK_PERIOD_CLOSED',
  'INSUFFICIENT_BALANCE',
  'CROSS_BRANCH_RELATION',
  'BRANCH_SCOPE_FORBIDDEN',
] as const;
