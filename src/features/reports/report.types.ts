import type { LeadOrder, LeadOrderStageEvent, PaymentType } from '@/features/crm/crm.types';

export interface ClosingFilters {
  dateFrom?: string;
  dateTo?: string;
  salesId?: string;
  paymentType?: PaymentType;
  leasingId?: string;
}

export type ClosingMetric =
  | 'APPLICATION' | 'SLIK_PASSED' | 'SLIK_REJECTED' | 'SURVEY_REJECTED' | 'APPROVED'
  | 'CANCELLED' | 'CANCELLED_CASH' | 'CANCELLED_KREDIT' | 'DEAL' | 'DEAL_CASH' | 'DEAL_KREDIT';

export interface RefundSummary {
  category: string;
  direction: 'IN' | 'OUT';
  transactionCount: number;
  orderCount: number;
  amount: number;
}

export interface ClosingReport {
  period: { dateFrom: string; dateTo: string; timezone: string };
  summary: {
    totalApplications: number; uniqueCustomers: number; slikPassed: number; slikRejected: number;
    surveyRejected: number; approved: number; cancelled: number; cancelledCash: number;
    cancelledCredit: number; deals: number; cashDeals: number; creditDeals: number;
  };
  bySales: Array<{ sales: { id: string; name: string }; totalApplications: number; totalDeals: number; cashDeals: number; creditDeals: number }>;
  byLeasing: Array<{ leasing: { id: string; name: string; code: string } | null; totalApplications: number }>;
  refunds: RefundSummary[];
  legacy: { slikWithoutTimestamp: number; surveyWithoutTimestamp: number; approvalWithoutTimestamp: number };
}

export interface ExpenseFilters {
  period: string;
  kategoriPengeluaranId?: string;
  status?: 'DRAFT' | 'PAID' | 'ALL';
  type?: 'RECURRING' | 'NON_RECURRING' | 'PAYROLL' | 'RECONDITIONING' | 'REFUND' | 'CREDIT_PROCESS';
}

/** Filter khusus rincian biaya proses kredit (`creditBreakdownQuerySchema`). */
export interface CreditBreakdownFilters {
  period: string;
  salesId?: string;
  leasingId?: string;
  paymentType?: PaymentType;
}

export interface CreditBreakdownGroup {
  sales?: { id: string; name: string; username?: string | null } | null;
  leasing?: { id: string; name: string; code?: string | null } | null;
  totalAmount: number;
  transactionCount: number;
  orderCount: number;
  labels: Array<{ label: string; amount: number }>;
}

export interface CreditBreakdownReport {
  period: { period: string; timezone: string };
  total: number;
  orderCount: number;
  bySales: CreditBreakdownGroup[];
  byLeasing: CreditBreakdownGroup[];
  byLabel: CreditBreakdownGroup[];
}

export interface ExpenseReport {
  period: { period: string; timezone: string };
  summary: {
    recurringGenerated: number; recurringPaid: number; recurringUnpaid: number; nonRecurringExpense: number; operationalUnpaid: number;
    payrollExpense: number; payrollPaid: number; payrollUnpaid: number;
    payrollBaseSalary: number; payrollBaseSalaryPaid: number; payrollBaseSalaryUnpaid: number;
    payrollSalaryPaid: number; payrollSalaryUnpaid: number;
    payrollIncentive: number; payrollIncentivePaid: number; payrollIncentiveUnpaid: number;
    initialReconditioningCapitalized: number; additionalReconditioningExpense: number;
    totalExpense: number; operationalCashOut: number; payrollCashOut: number;
    reconditioningCashOut: number; refundCashOut: number; totalCashOut: number;
  };
  refunds: RefundSummary[];
  legacy: { generatedRecurringWithoutSource: number; completedReconditioningWithoutTimestamp: number };
}

export interface ExpenseDetailRow {
  id: string;
  type: string;
  date: string;
  title: string;
  status: string;
  amount: number;
  category?: string | null;
}

export type ClosingOrder = Omit<LeadOrder, 'unit' | 'stageEvents'> & {
  branch?: { id: string; nama: string; code: string } | null;
  unit?: {
    id: string; name?: string | null; platNomor?: string | null; variant?: string | null; tahun?: number | null;
    merek?: { id?: string; name: string } | null; tipe?: { id?: string; name: string } | null;
  } | null;
  stageEvents?: LeadOrderStageEvent[];
  leadPayments?: Array<{
    id: string; jenisPembayaran: string; paymentDate: string; amount: number; description?: string | null;
    postingStatus: string; hasProof: boolean; createdAt?: string;
  }>;
  latestProcess: { stage: string; toStatus: string; effectiveAt?: string | null; reason?: string | null; note?: string | null };
};
