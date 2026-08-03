import type { LeadOrder, PaymentType } from '@/features/crm/crm.types';

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
  type?: 'RECURRING' | 'NON_RECURRING' | 'PAYROLL' | 'RECONDITIONING' | 'REFUND';
}

export interface ExpenseReport {
  period: { period: string; timezone: string };
  summary: {
    recurringGenerated: number; recurringPaid: number; recurringUnpaid: number; nonRecurringExpense: number;
    payrollExpense: number; initialReconditioningCapitalized: number; additionalReconditioningExpense: number;
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

export type ClosingOrder = LeadOrder;
