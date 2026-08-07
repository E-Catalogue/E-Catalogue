export type FundingAgreementStatus = 'DRAFT' | 'ACTIVE' | 'RELEASED' | 'ENDED' | 'CANCELLED';
export type InvestorScheme = 'FIXED_MONTHLY' | 'PROFIT_SHARE';

export interface InvestorFundingRow {
  id: string;
  unitId: string;
  scheme: InvestorScheme | null;
  status: FundingAgreementStatus;
  principalAmount: number;
  fixedReturnRate: number | null;
  profitShareRate: number | null;
  effectiveDate: string | null;
  nextDueDate: string | null;
  investor: { id: string; name: string; code: string } | null;
  branch: { id: string; nama: string; code: string } | null;
  unit: { id: string; name: string; platNomor: string; merek: { name: string } | null; tipe: { name: string } | null } | null;
}

export interface InvestorPaymentRow {
  id: string;
  amount: number;
  paidAt: string;
  postingStatus: 'POSTED' | 'REVERSED';
  reversalOfId: string | null;
  description: string | null;
  cashAccount: { id: string; name: string; code: string } | null;
  branch: { id: string; nama: string; code: string } | null;
  obligation: {
    id: string; type: string; cycleKey: string; dueDate: string;
    investor: { id: string; name: string; code: string } | null;
    fundingAgreement: { id: string; unitId: string } | null;
  } | null;
}

export const FUNDING_STATUS_LABEL: Record<FundingAgreementStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Aktif',
  RELEASED: 'Lunas',
  ENDED: 'Berakhir',
  CANCELLED: 'Batal (Dana Kembali)',
};

export const FUNDING_SCHEME_LABEL: Record<InvestorScheme, string> = {
  FIXED_MONTHLY: 'Fixed Monthly',
  PROFIT_SHARE: 'Profit Share',
};
