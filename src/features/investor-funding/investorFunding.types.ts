import type { ApiMeta } from '@/core/api/types';

export type FundingUsageResourceType = 'UNIT_PURCHASE' | 'REKONDISI';
export type FundingUsageMode = 'DIRECT' | 'AVAILABLE_CAPITAL' | 'NEW_DEPOSIT';

export interface InvestorCapitalAccountOption {
  id: string;
  availableBalance: number;
  allocatedBalance: number;
  investor: { id: string; name: string; code: string };
}

export interface InvestorFundingUsage {
  id: string;
  resourceType: FundingUsageResourceType;
  mode: FundingUsageMode;
  unitId: string;
  rekondisiId?: string | null;
  capitalAccountId: string;
  amount: number;
  businessDate: string;
  description?: string | null;
  allocationCapitalTransactionId: string;
  depositCapitalTransactionId?: string | null;
  capitalAccount: InvestorCapitalAccountOption;
  fundingAgreement?: { id: string; fundingSource: string; principalAmount: number } | null;
}

export interface FundingUsageSummary {
  costAmount: number;
  allocatedAmount: number;
  outstandingAdvanceAmount: number;
}

export interface FundingUsageResourceResult {
  data: InvestorFundingUsage[];
  summary: FundingUsageSummary;
}

export interface FundingUsageReportResult {
  data: InvestorFundingUsage[];
  meta: ApiMeta;
  summary: { allocatedAmount: number; availableBalance: number; allocatedBalance: number };
}

export interface FundingUsageMutationBody {
  capitalAccountId: string;
  amount: number;
  businessDate: string;
  description?: string;
  cashAccountId?: string;
}

export const FUNDING_USAGE_MODE_LABEL: Record<FundingUsageMode, string> = {
  DIRECT: 'Dana langsung',
  AVAILABLE_CAPITAL: 'Saldo tersedia',
  NEW_DEPOSIT: 'Setoran baru',
};
