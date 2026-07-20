import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { targetApi } from './target.api';
import { notifyApiError } from '@/core/api/notify';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type {
  BranchTargetCreateInput,
  BranchTargetUpdateInput,
  SalesTargetReplaceInput,
  TargetListParams,
} from './target.types';

type BranchHeaders = Record<string, string> | undefined;

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

export const useTargetLookupSales = (headers: BranchHeaders, enabled = true) =>
  useQuery({
    queryKey: ['target-sales-lookup', headers?.['X-Branch-Id'] ?? 'none'],
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
  const qc = useQueryClient();
  const inval = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['targets'] });
    if (id) qc.invalidateQueries({ queryKey: ['target', branchKey, id] });
    // Broad invalidate (semua period/branch) — target achievement juga harus di-refresh oleh mutation
    // DEAL di modul lead-order (README §18), lihat crm.hooks.ts.
    qc.invalidateQueries({ queryKey: ['target-achievement'] });
  };

  return {
    create: useMutation({
      mutationFn: (body: BranchTargetCreateInput) => targetApi.create(body, headers),
      onSuccess: () => { toast('Target dibuat'); inval(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: BranchTargetUpdateInput }) => targetApi.update(id, body, headers),
      onSuccess: (_, { id }) => { toast('Target diperbarui'); inval(id); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    replaceSales: useMutation({
      mutationFn: ({ id, body }: { id: string; body: SalesTargetReplaceInput }) => targetApi.replaceSales(id, body, headers),
      onSuccess: (_, { id }) => { toast('Distribusi sales disimpan'); inval(id); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    activate: useMutation({
      mutationFn: (id: string) => targetApi.activate(id, headers),
      onSuccess: (_, id) => { toast('Target diaktifkan'); inval(id); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    close: useMutation({
      mutationFn: (id: string) => targetApi.close(id, headers),
      onSuccess: (_, id) => { toast('Target ditutup'); inval(id); },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
};
