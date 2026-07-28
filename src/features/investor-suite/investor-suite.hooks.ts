import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { investorSuiteApi } from './investor-suite.api';

export const useInvestorFundings = (params: Record<string, unknown>) =>
  useQuery({ queryKey: ['investor-fundings', params], queryFn: () => investorSuiteApi.listFundings(params), placeholderData: keepPreviousData });

export const useInvestorPayments = (params: Record<string, unknown>) =>
  useQuery({ queryKey: ['investor-payments', params], queryFn: () => investorSuiteApi.listPayments(params), placeholderData: keepPreviousData });
