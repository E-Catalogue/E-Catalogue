import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { investorFundingApi } from './investorFunding.api';
import type { FundingUsageMutationBody, FundingUsageResourceType } from './investorFunding.types';

type Headers = Record<string, string> | undefined;
const toast = (message: string) => store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message }));

export const useInvestorCapitalAccounts = (resourceType: FundingUsageResourceType, branchKey: string, headers: Headers, enabled = true) =>
  useQuery({ queryKey: ['investor-funding-capital-accounts', resourceType, branchKey], queryFn: () => investorFundingApi.capitalAccounts(resourceType, headers), enabled });

export const useInvestorFundingCashAccounts = (resourceType: FundingUsageResourceType, branchKey: string, headers: Headers, enabled = true) =>
  useQuery({ queryKey: ['investor-funding-cash-accounts', resourceType, branchKey], queryFn: () => investorFundingApi.cashAccounts(resourceType, headers), enabled });

export const useInvestorFundingUsages = (resourceType: FundingUsageResourceType, resourceId: string | null, branchKey: string, headers: Headers) =>
  useQuery({ queryKey: ['investor-funding-usages', resourceType, branchKey, resourceId], queryFn: () => investorFundingApi.resourceUsages(resourceType, resourceId as string, headers), enabled: !!resourceId });

export const useInvestorFundingMutations = (resourceType: FundingUsageResourceType, resourceId: string, branchKey: string) => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['investor-funding-usages', resourceType, branchKey, resourceId] });
    qc.invalidateQueries({ queryKey: ['investor-funding-capital-accounts', resourceType, branchKey] });
    qc.invalidateQueries({ queryKey: ['investor-funding-report'] });
    qc.invalidateQueries({ queryKey: ['capital-accounts'] });
    qc.invalidateQueries({ queryKey: ['capital-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-accounts'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
    qc.invalidateQueries({ queryKey: ['dashboard-overview'] });
    qc.invalidateQueries({ queryKey: ['books'] });
    if (resourceType === 'REKONDISI') {
      qc.invalidateQueries({ queryKey: ['rekondisi', resourceId] });
      qc.invalidateQueries({ queryKey: ['rekondisis'] });
    } else {
      qc.invalidateQueries({ queryKey: ['unit', resourceId] });
      qc.invalidateQueries({ queryKey: ['unit-funding', resourceId] });
      qc.invalidateQueries({ queryKey: ['units'] });
    }
  };
  return {
    allocate: useMutation({ mutationFn: (v: { body: FundingUsageMutationBody; headers: Headers }) => investorFundingApi.allocate(resourceType, resourceId, v.body, v.headers), onSuccess: () => { toast('Dana investor berhasil dialokasikan'); invalidate(); } }),
    deposit: useMutation({ mutationFn: (v: { body: FundingUsageMutationBody; headers: Headers; idempotencyKey: string }) => investorFundingApi.depositAndAllocate(resourceType, resourceId, v.body, v.headers, v.idempotencyKey), onSuccess: () => { toast('Setoran dan alokasi berhasil dicatat'); invalidate(); } }),
  };
};

export const useInvestorFundingReport = (params: Record<string, unknown>, branchKey: string, headers: Headers, investorId?: string) =>
  useQuery({ queryKey: ['investor-funding-report', branchKey, investorId ?? 'all', params], queryFn: () => investorFundingApi.report(params, headers, investorId) });
