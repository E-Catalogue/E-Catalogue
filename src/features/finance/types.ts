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
  | 'TRANSFER';

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
  createdById?: string | null;
  cashAccount?: Pick<CashAccount, 'id' | 'name' | 'code'>;
  createdBy?: { id: string; name?: string | null; username?: string | null } | null;
}

export interface CashDashboard {
  summary: {
    openingBalance: number;
    totalIn: number;
    totalOut: number;
    endingBalance: number;
  };
  accounts: Array<Pick<CashAccount, 'id' | 'name' | 'code' | 'type' | 'openingBalance' | 'defaultPayment'> & {
    totalIn: number;
    totalOut: number;
    endingBalance: number;
  }>;
}

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

export interface LookupCashAccount {
  id: string;
  name: string;
  code: string;
  type: CashAccountType;
  defaultPayment: boolean;
  isActive: boolean;
}

export interface LookupExpenseCategory {
  id: string;
  name: string;
  code?: string | null;
  isActive: boolean;
}

export interface LookupUser {
  id: string;
  name: string;
  username: string;
  roleName?: string | null;
  isActive: boolean;
}

export interface LookupDealOrder {
  id: string;
  nomorOrder: string;
  salesId: string;
  salesName: string;
  customerName?: string | null;
  status: 'DEAL';
  hargaFinal: number;
  dealDate?: string | null;
  hasIncentive: boolean;
}

export interface LookupRecurringExpense {
  id: string;
  name: string;
  kategoriPengeluaranId: string;
  kategoriName: string;
  defaultAmount: number;
  isActive: boolean;
}

export interface LookupPayrollRun {
  id: string;
  period: string;
  status: FinanceStatus;
  totalPaid: number;
}

export interface LookupUnit {
  id: string;
  platNomor: string;
  merekName: string;
  tipeName: string;
  hargaBeli: number;
  tanggalPembelian: string;
  purchaseCashTransactionId?: string | null;
}

export interface LookupRekondisiPayable {
  id: string;
  unitId: string;
  platNomor: string;
  unitName: string;
  totalCost: number;
  status: 'COMPLETED';
  paidAt: string | null;
}

export interface LookupInvestor {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}
