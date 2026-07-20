import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  BranchTarget,
  BranchTargetCreateInput,
  BranchTargetUpdateInput,
  SalesTargetReplaceInput,
  TargetAchievementConsolidated,
  TargetListParams,
  TargetSalesLookup,
} from './target.types';

/** Header opsional `{ 'X-Branch-Id': branchId }` — wajib diisi caller untuk mutation Owner (README §8). */
type BranchHeaders = Record<string, string> | undefined;

export const targetApi = {
  /** Owner mode "all" (tanpa header) balikin sales lintas SEMUA cabang — jangan dipakai untuk wizard
   * distribusi tanpa branch header konkret (lihat README §9). */
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

  /** Backend `create()` memanggil `requireBranchId()` — Owner WAJIB pilih cabang konkret. `branchId`
   * TIDAK PERNAH dikirim di body, backend ambil dari header/session. */
  create: (body: BranchTargetCreateInput, headers: BranchHeaders) =>
    apiClient.post<ApiResponse<BranchTarget>>('/targets/branches', body, { headers }).then((r) => r.data),

  update: (id: string, body: BranchTargetUpdateInput, headers?: BranchHeaders) =>
    apiClient.patch<ApiResponse<BranchTarget>>(`/targets/branches/${id}`, body, { headers }).then((r) => r.data),

  /** FULL REPLACE, bukan merge — selalu kirim array LENGKAP distribusi yang diinginkan. Array kosong
   * valid (menghapus semua distribusi). */
  replaceSales: (id: string, body: SalesTargetReplaceInput, headers?: BranchHeaders) =>
    apiClient.put<ApiResponse<BranchTarget>>(`/targets/branches/${id}/sales`, body, { headers }).then((r) => r.data),

  /** Tidak ada body. Backend cek sum(salesTargets) === unitTarget/revenueTarget PERSIS (Decimal-exact). */
  activate: (id: string, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<BranchTarget>>(`/targets/branches/${id}/activate`, undefined, { headers }).then((r) => r.data),

  /** Tidak ada body. Terminal — tidak ada endpoint reopen. */
  close: (id: string, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<BranchTarget>>(`/targets/branches/${id}/close`, undefined, { headers }).then((r) => r.data),
};
