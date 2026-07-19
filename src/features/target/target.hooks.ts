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

type BranchHeader = Record<string, string> | undefined;

export function useTargetLookupSales(branchHeader?: BranchHeader, enabled = true) {
  return useQuery({
    queryKey: ['target-sales-lookup', branchHeader?.['X-Branch-Id'] ?? 'none'],
    queryFn: () => targetApi.lookupSales(branchHeader),
    enabled,
  });
}

export function useTargetAchievement(period: string | undefined, branchHeader: BranchHeader, branchKey: string) {
  return useQuery({
    queryKey: ['target-achievement', branchKey, period],
    queryFn: () => targetApi.achievement(period as string, branchHeader),
    enabled: !!period,
  });
}

export function useTargetBranches(params: TargetListParams | undefined, branchHeader: BranchHeader, branchKey: string) {
  return useQuery({
    queryKey: ['targets', branchKey, params],
    queryFn: () => targetApi.listBranches(params, branchHeader),
  });
}

export function useTargetBranch(id: string | undefined, branchHeader: BranchHeader, branchKey: string) {
  return useQuery({
    queryKey: ['target', branchKey, id],
    queryFn: () => targetApi.getBranch(id as string, branchHeader),
    enabled: !!id,
  });
}

export function useTargetMutations(branchHeader: BranchHeader, branchKey: string) {
  const qc = useQueryClient();
  const inval = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['targets'] });
    if (id) qc.invalidateQueries({ queryKey: ['target', branchKey, id] });
    qc.invalidateQueries({ queryKey: ['target-achievement'] });
  };

  return {
    create: useMutation({
      mutationFn: (body: BranchTargetCreateInput) => targetApi.create(body, branchHeader),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Target dibuat' }));
        inval();
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: BranchTargetUpdateInput }) => targetApi.update(id, data, branchHeader),
      onSuccess: (_, { id }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Target diperbarui' }));
        inval(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    replaceSales: useMutation({
      mutationFn: ({ id, data }: { id: string; data: SalesTargetReplaceInput }) => targetApi.replaceSales(id, data, branchHeader),
      onSuccess: (_, { id }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Distribusi sales disimpan' }));
        inval(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    activate: useMutation({
      mutationFn: (id: string) => targetApi.activate(id, branchHeader),
      onSuccess: (_, id) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Target diaktifkan' }));
        inval(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    close: useMutation({
      mutationFn: (id: string) => targetApi.close(id, branchHeader),
      onSuccess: (_, id) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Target ditutup' }));
        inval(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
}
