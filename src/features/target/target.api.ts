import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  BranchTarget,
  BranchTargetCreateInput,
  BranchTargetUpdateInput,
  SalesTargetReplaceInput,
  TargetAchievementConsolidated,
  TargetBranchLookup,
  TargetListParams,
  TargetSalesLookup,
} from './target.types';

/** Header opsional `{ 'X-Branch-Id': branchId }` — wajib diisi caller untuk mutation Owner (README §8). */
type BranchHeaders = Record<string, string> | undefined;

export const targetApi = {
  /** `/targets/lookups/branches` — cabang yang dapat dipilih (Owner/Admin = semua aktif, lainnya = miliknya). */
  lookupBranches: (headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<TargetBranchLookup[]>>('/targets/lookups/branches', { headers }).then((r) => r.data.data ?? []),

  /** Sales pada cabang terpilih — backend pakai `requireBranchId(scope)` dari header X-Branch-Id
   * (kode backend menang atas PRD yang menyebut query `?branchId=`). Kirim header cabang konkret. */
  lookupSales: (headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<TargetSalesLookup[]>>('/targets/lookups/sales', { headers }).then((r) => r.data),

  /** `period` WAJIB diisi caller meski backend tidak memvalidasinya secara ketat — tanpa period, Owner
   * mode "all" mencampur achievement lintas periode, dan single-branch balikin periode TERAKHIR bukan
   * "bulan ini" (lihat catatan kontrak di target.hooks.ts). */
  achievement: (period: string, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<BranchTarget | TargetAchievementConsolidated | null>>('/targets/achievement', { params: { period }, headers }).then((r) => r.data),

  listBranches: (params: TargetListParams, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<BranchTarget[]>>('/targets/branches', { params, headers }).then((r) => r.data),

  getBranch: (id: string, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<BranchTarget>>(`/targets/branches/${id}`, { headers }).then((r) => r.data.data),

  /** Sejak update_target: `branchId` WAJIB di BODY (backend pakai `payload.branchId`, bukan header).
   * Header tetap dikirim untuk validasi scope Owner/Admin (`scope.branchId === payload.branchId`). */
  create: (body: BranchTargetCreateInput, headers: BranchHeaders) =>
    apiClient.post<ApiResponse<BranchTarget>>('/targets/branches', body, { headers }).then((r) => r.data),

  update: (id: string, body: BranchTargetUpdateInput, headers?: BranchHeaders) =>
    apiClient.patch<ApiResponse<BranchTarget>>(`/targets/branches/${id}`, body, { headers }).then((r) => r.data),

  /** FULL REPLACE, bukan merge — selalu kirim array LENGKAP distribusi yang diinginkan. Array kosong
   * valid (menghapus semua distribusi). */
  replaceSales: (id: string, body: SalesTargetReplaceInput, headers?: BranchHeaders) =>
    apiClient.put<ApiResponse<BranchTarget>>(`/targets/branches/${id}/sales`, body, { headers }).then((r) => r.data),

  /** Tidak ada body. Sejak update_target: aktivasi TIDAK lagi menuntut sum(salesTargets) sama dengan
   * target cabang — distribusi sales opsional, `TARGET_DISTRIBUTION_MISMATCH` tidak dipakai lagi. */
  activate: (id: string, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<BranchTarget>>(`/targets/branches/${id}/activate`, undefined, { headers }).then((r) => r.data),

  /** Tidak ada body. Terminal — tidak ada endpoint reopen. */
  close: (id: string, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<BranchTarget>>(`/targets/branches/${id}/close`, undefined, { headers }).then((r) => r.data),
};
