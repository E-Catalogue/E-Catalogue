export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type CashAccountType = 'CASH' | 'BANK' | 'OTHER';
export type CashTransactionType = 'IN' | 'OUT' | 'TRANSFER';
export type CashSourceType =
  | 'UNIT_PURCHASE'
  | 'REKONDISI'
  | 'LEAD_PAYMENT'
  | 'OPERATIONAL'
  | 'PAYROLL'
  | 'INVESTOR_MODAL'
  | 'MANUAL_ADJUSTMENT'
  | 'TRANSFER'
  | 'INTER_BRANCH_TRANSFER'
  | 'REVERSAL';

export interface CashAccount {
  id: string;
  name: string;
  code: string;
  type: CashAccountType;
  accountNumber?: string | null;
  bankName?: string | null;
  openingBalance: number;
  defaultPayment: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CashTransaction {
  id: string;
  type: CashTransactionType;
  sourceType: CashSourceType;
  sourceId?: string | null;
  cashAccountId: string;
  amount: number;
  transactionDate: string;
  description?: string | null;
  proofUrl?: string | null;
  transferGroupId?: string | null;
  branchId?: string;
  /** Terisi kalau baris ini SENDIRI adalah hasil reversal dari transaksi lain. */
  reversalOfId?: string | null;
  /** Terisi kalau baris ini SUDAH dibalik — cegah reversal dobel (409 `CASH_TRANSACTION_ALREADY_REVERSED`). */
  reversedAt?: string | null;
  createdById?: string | null;
  reversedById?: string | null;
  branch?: { id: string; nama: string; code: string };
  cashAccount?: Pick<CashAccount, 'id' | 'name' | 'code'>;
  createdBy?: { id: string; name?: string | null; username?: string | null } | null;
  reversedBy?: { id: string; name?: string | null; username?: string | null } | null;
}

export interface CashDashboardSummary {
  openingBalance: number;
  totalIn: number;
  totalOut: number;
  endingBalance: number;
}

export type CashDashboardAccount = Pick<CashAccount, 'id' | 'name' | 'code' | 'type' | 'openingBalance' | 'defaultPayment'> & {
  totalIn: number;
  totalOut: number;
  endingBalance: number;
  branchId?: string;
  branch?: { id: string; nama: string; code: string };
};

/**
 * `GET /cash-flow/dashboard` (README §8/§16 — mirip pola "Owner capital account"):
 * - scope single (Owner dengan branch terpilih, atau non-Owner): `{ summary, accounts }`.
 * - scope all (Owner tanpa header): `{ consolidated, accounts, breakdown }` — TIDAK ada `summary`.
 * Gunakan type guard `isConsolidatedCashDashboard`, jangan asumsikan `summary` selalu ada.
 */
export interface CashDashboardSingle {
  summary: CashDashboardSummary;
  accounts: CashDashboardAccount[];
}

export interface CashDashboardConsolidated {
  consolidated: CashDashboardSummary;
  accounts: CashDashboardAccount[];
  breakdown: Array<{ branch: { id: string; nama: string; code: string } | null; accounts: CashDashboardAccount[]; summary: CashDashboardSummary }>;
}

export type CashDashboard = CashDashboardSingle | CashDashboardConsolidated;

export const isConsolidatedCashDashboard = (d: CashDashboard): d is CashDashboardConsolidated =>
  (d as CashDashboardConsolidated).consolidated !== undefined;

export type OperationalExpenseType = 'NORMAL' | 'BACKDATE';
export type FinanceStatus = 'DRAFT' | 'PAID' | 'CANCELLED';

export interface OperationalExpense {
  id: string;
  type: OperationalExpenseType;
  status: FinanceStatus;
  title: string;
  kategoriPengeluaranId: string;
  amount: number;
  expenseDate: string;
  expensePeriodStart?: string | null;
  expensePeriodEnd?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  description?: string | null;
  proofUrl?: string | null;
  cashAccountId?: string | null;
  cashTransactionId?: string | null;
  kategoriPengeluaran?: { id: string; name: string; code?: string | null };
}

export interface RecurringExpense {
  id: string;
  name: string;
  kategoriPengeluaranId: string;
  defaultAmount: number;
  description?: string | null;
  isActive: boolean;
  kategoriPengeluaran?: { id: string; name: string; code?: string | null };
}

export interface PayrollBaseSalary {
  id: string;
  userId: string;
  amount: number;
  effectiveStart: string;
  effectiveEnd?: string | null;
  isActive: boolean;
  user?: { id: string; name?: string | null; username?: string | null; isActive?: boolean };
}

export type SalesIncentiveStatus = 'DRAFT' | 'INCLUDED' | 'PAID' | 'CANCELLED';

export interface SalesIncentive {
  id: string;
  salesId: string;
  leadOrderId: string;
  amount: number;
  period: string;
  status: SalesIncentiveStatus;
  description?: string | null;
  sales?: { id: string; name?: string | null; username?: string | null };
  leadOrder?: { id: string; nomorOrder?: string | null; status?: string; salesId?: string; hargaFinal?: number };
}

export interface PayrollItem {
  id: string;
  userId: string;
  baseSalary: number;
  incentive: number;
  allowance: number;
  deduction: number;
  total: number;
  user?: { id: string; name?: string | null; username?: string | null };
  salesIncentives?: SalesIncentive[];
}

export interface PayrollRun {
  id: string;
  period: string;
  status: FinanceStatus;
  totalBaseSalary: number;
  totalIncentive: number;
  totalAllowance: number;
  totalDeduction: number;
  totalPaid: number;
  paidDate?: string | null;
  cashAccountId?: string | null;
  cashTransactionId?: string | null;
  items?: PayrollItem[];
}
