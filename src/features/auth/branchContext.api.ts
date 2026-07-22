import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';

export interface BranchContextOption {
  id: string;
  nama: string;
  code: string;
  lokasi?: string | null;
}

/**
 * `.prd/update_module_owned_lookup_20260721.md` §4.1 — pengganti `GET /branches` (CRUD, butuh
 * `BRANCH_READ`) untuk KEBUTUHAN SELECTOR CABANG GLOBAL (bukan halaman CRUD Branch itu sendiri).
 * Endpoint ini hanya butuh login (tanpa permission apa pun) — OWNER/ADMIN dapat semua cabang,
 * role lain hanya cabang miliknya sendiri (bisa 1 atau 0 baris).
 */
export const branchContextApi = {
  options: () => apiClient.get<ApiResponse<BranchContextOption[]>>('/branch-context/options').then((r) => r.data),
};

export const useBranchContextOptions = () =>
  useQuery({ queryKey: ['branch-context-options'], queryFn: () => branchContextApi.options() });
