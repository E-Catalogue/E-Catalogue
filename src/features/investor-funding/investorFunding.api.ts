import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { CashAccountOption } from '@/features/finance/lookup';
import type {
  FundingUsageMutationBody, FundingUsageReportResult, FundingUsageResourceResult,
  FundingUsageResourceType, InvestorCapitalAccountOption, InvestorFundingUsage,
} from './investorFunding.types';

type Headers = Record<string, string> | undefined;
const base = (resourceType: FundingUsageResourceType) => resourceType === 'REKONDISI' ? '/rekondisis' : '/units';

export const investorFundingApi = {
  capitalAccounts: (resourceType: FundingUsageResourceType, headers?: Headers) =>
    apiClient.get<ApiResponse<InvestorCapitalAccountOption[]>>(`${base(resourceType)}/lookups/investor-capital-accounts`, { headers }).then((r) => r.data.data ?? []),
  cashAccounts: async (resourceType: FundingUsageResourceType, headers?: Headers) => {
    if (resourceType === 'REKONDISI') {
      return apiClient.get<ApiResponse<CashAccountOption[]>>('/rekondisis/lookups/cash-accounts', { headers }).then((r) => r.data.data ?? []);
    }
    return apiClient.get<ApiResponse<{ cashAccounts: CashAccountOption[] }>>('/units/lookups', { headers }).then((r) => r.data.data.cashAccounts ?? []);
  },
  resourceUsages: (resourceType: FundingUsageResourceType, resourceId: string, headers?: Headers) =>
    apiClient.get<ApiResponse<FundingUsageResourceResult>>(`${base(resourceType)}/${resourceId}/investor-funding-usages`, { headers }).then((r) => r.data.data),
  allocate: (resourceType: FundingUsageResourceType, resourceId: string, body: FundingUsageMutationBody, headers?: Headers) =>
    apiClient.post<ApiResponse<InvestorFundingUsage>>(`${base(resourceType)}/${resourceId}/investor-funding-usages`, body, { headers }).then((r) => r.data.data),
  depositAndAllocate: (resourceType: FundingUsageResourceType, resourceId: string, body: FundingUsageMutationBody, headers: Headers, idempotencyKey: string) =>
    apiClient.post<ApiResponse<InvestorFundingUsage>>(`${base(resourceType)}/${resourceId}/investor-funding-usages/deposit`, body, { headers: { ...headers, 'Idempotency-Key': idempotencyKey } }).then((r) => r.data.data),
  report: (params: Record<string, unknown>, headers?: Headers, investorId?: string) =>
    apiClient.get<ApiResponse<FundingUsageReportResult>>(investorId ? `/investors/${investorId}/funding-usages` : '/investors/funding-usages', { params, headers }).then((r) => r.data.data),
};
