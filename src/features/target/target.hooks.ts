import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { targetApi } from './target.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { refreshAfterMutation } from '@/core/query/refreshAfterMutation';
import type {
  BranchTargetCreateInput,
  BranchTargetUpdateInput,
  SalesTargetReplaceInput,
  TargetListParams,
} from './target.types';

type BranchHeaders = Record<string, string> | undefined;

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

/** `/targets/lookups/branches` — pilihan cabang untuk halaman Target (update_target §1). */
export const useTargetLookupBranches = (headers?: BranchHeaders, enabled = true) =>
  useQuery({
    queryKey: ['lookup', 'target', 'branches', headers?.['X-Branch-Id'] ?? 'all'],
    queryFn: () => targetApi.lookupBranches(headers),
    enabled,
  });

export const useTargetLookupSales = (headers: BranchHeaders, enabled = true) =>
  useQuery({
    queryKey: ['lookup', 'target', 'sales', headers?.['X-Branch-Id'] ?? 'none'],
    queryFn: () => targetApi.lookupSales(headers),
    enabled,
  });

export const useTargetAchievement = (period: string | undefined, branchKey: string, headers?: BranchHeaders) =>
  useQuery({
    queryKey: ['target-achievement', branchKey, period],
    queryFn: () => targetApi.achievement(period as string, headers),
    enabled: !!period,
  });

export const useTargetBranches = (params: TargetListParams, branchKey: string, headers?: BranchHeaders) =>
  useQuery({
    queryKey: ['targets', branchKey, params],
    queryFn: () => targetApi.listBranches(params, headers),
  });

export const useTargetBranch = (id: string | undefined, branchKey: string, headers?: BranchHeaders) =>
  useQuery({
    queryKey: ['target', branchKey, id],
    queryFn: () => targetApi.getBranch(id as string, headers),
    enabled: !!id,
  });

export const useTargetMutations = (branchKey: string, headers?: BranchHeaders) => {
  const queryClient = useQueryClient();
  const refresh = (id?: string) => refreshAfterMutation(queryClient, [
    ['targets'],
    ['target-achievement'],
    ...(id ? [['target', branchKey, id] as const] : []),
  ]);

  return {
    create: useMutation({
      mutationFn: (body: BranchTargetCreateInput) => targetApi.create(body, headers),
      onSuccess: async () => { await refresh(); toast('Target dibuat'); },
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: BranchTargetUpdateInput }) => targetApi.update(id, body, headers),
      onSuccess: async (_, { id }) => { await refresh(id); toast('Target diperbarui'); },
    }),
    replaceSales: useMutation({
      mutationFn: ({ id, body }: { id: string; body: SalesTargetReplaceInput }) => targetApi.replaceSales(id, body, headers),
      onSuccess: async (_, { id }) => { await refresh(id); toast('Distribusi sales disimpan'); },
    }),
    activate: useMutation({
      mutationFn: (id: string) => targetApi.activate(id, headers),
      onSuccess: async (_, id) => { await refresh(id); toast('Target diaktifkan'); },
    }),
    close: useMutation({
      mutationFn: (id: string) => targetApi.close(id, headers),
      onSuccess: async (_, id) => { await refresh(id); toast('Target ditutup'); },
    }),
  };
};
