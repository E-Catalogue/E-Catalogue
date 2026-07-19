import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  BranchTarget,
  BranchTargetCreateInput,
  BranchTargetUpdateInput,
  SalesTargetReplaceInput,
  TargetListParams,
  TargetSalesLookup,
  TargetBranchesOwnerAll,
} from './target.types';

type BranchHeader = Record<string, string> | undefined;

export const targetApi = {
  lookupSales: async (branchHeader?: BranchHeader) => {
    const res = await apiClient.get<ApiResponse<TargetSalesLookup[]>>('/targets/lookups/sales', { headers: branchHeader });
    return res.data;
  },

  achievement: async (period: string, branchHeader?: BranchHeader) => {
    const res = await apiClient.get<ApiResponse<BranchTarget | TargetBranchesOwnerAll | null>>('/targets/achievement', {
      params: { period },
      headers: branchHeader,
    });
    return res.data;
  },

  listBranches: async (params?: TargetListParams, branchHeader?: BranchHeader) => {
    const res = await apiClient.get<ApiResponse<BranchTarget[]>>('/targets/branches', { params, headers: branchHeader });
    return res.data;
  },

  getBranch: async (id: string, branchHeader?: BranchHeader) => {
    const res = await apiClient.get<ApiResponse<BranchTarget>>(`/targets/branches/${id}`, { headers: branchHeader });
    return res.data;
  },

  create: async (body: BranchTargetCreateInput, branchHeader: BranchHeader) => {
    const res = await apiClient.post<ApiResponse<BranchTarget>>('/targets/branches', body, { headers: branchHeader });
    return res.data;
  },

  update: async (id: string, body: BranchTargetUpdateInput, branchHeader?: BranchHeader) => {
    const res = await apiClient.patch<ApiResponse<BranchTarget>>(`/targets/branches/${id}`, body, { headers: branchHeader });
    return res.data;
  },

  replaceSales: async (id: string, body: SalesTargetReplaceInput, branchHeader?: BranchHeader) => {
    const res = await apiClient.put<ApiResponse<BranchTarget>>(`/targets/branches/${id}/sales`, body, { headers: branchHeader });
    return res.data;
  },

  activate: async (id: string, branchHeader?: BranchHeader) => {
    const res = await apiClient.post<ApiResponse<BranchTarget>>(`/targets/branches/${id}/activate`, undefined, { headers: branchHeader });
    return res.data;
  },

  close: async (id: string, branchHeader?: BranchHeader) => {
    const res = await apiClient.post<ApiResponse<BranchTarget>>(`/targets/branches/${id}/close`, undefined, { headers: branchHeader });
    return res.data;
  },
};
