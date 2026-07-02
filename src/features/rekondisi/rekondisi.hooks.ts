import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rekondisiApi } from './rekondisi.api';
import { notifyApiError } from '@/core/api/notify';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { RekondisiFormData, RekondisiDetailFormData, RekondisiDoneFormData, RekondisiPayFormData, RekondisiListParams } from './rekondisi.types';

export function useRekondisis(params?: RekondisiListParams, enabled = true) {
  return useQuery({
    queryKey: ['rekondisis', params],
    queryFn: () => rekondisiApi.list(params),
    enabled,
  });
}

export function useRekondisi(id?: string) {
  return useQuery({
    queryKey: ['rekondisi', id],
    queryFn: () => rekondisiApi.get(id!),
    enabled: !!id,
  });
}

export function useRekondisiMutations() {
  const qc = useQueryClient();
  const inval = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['rekondisis'] });
    if (id) qc.invalidateQueries({ queryKey: ['rekondisi', id] });
  };

  return {
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: RekondisiFormData }) => rekondisiApi.update(id, data),
      onSuccess: (_, { id }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Rekondisi diperbarui' }));
        inval(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    progress: useMutation({
      mutationFn: (id: string) => rekondisiApi.progress(id),
      onSuccess: (_, id) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Rekondisi dimulai' }));
        inval(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    done: useMutation({
      mutationFn: ({ id, data }: { id: string; data: RekondisiDoneFormData }) => rekondisiApi.done(id, data),
      onSuccess: (_, { id }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Rekondisi selesai' }));
        inval(id);
        qc.invalidateQueries({ queryKey: ['units'] });
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    pay: useMutation({
      mutationFn: ({ id, data }: { id: string; data: RekondisiPayFormData }) => rekondisiApi.pay(id, data),
      onSuccess: (_, { id }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Rekondisi berhasil dibayar' }));
        inval(id);
        qc.invalidateQueries({ queryKey: ['cash-transactions'] });
        qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
        qc.invalidateQueries({ queryKey: ['finance-lookups', 'rekondisis-payable'] });
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
}

export function useRekondisiDetails(rekondisiId?: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['rekondisi-details', rekondisiId, params],
    queryFn: () => rekondisiApi.listDetail(rekondisiId!, params),
    enabled: !!rekondisiId,
  });
}

export function useRekondisiDetail(rekondisiId?: string, id?: string) {
  return useQuery({
    queryKey: ['rekondisi-detail', rekondisiId, id],
    queryFn: () => rekondisiApi.getDetail(rekondisiId!, id!),
    enabled: !!rekondisiId && !!id,
  });
}

export function useRekondisiDetailMutations(rekondisiId: string) {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['rekondisi-details', rekondisiId] });
    qc.invalidateQueries({ queryKey: ['rekondisi-detail', rekondisiId] });
    qc.invalidateQueries({ queryKey: ['rekondisi', rekondisiId] });
    qc.invalidateQueries({ queryKey: ['rekondisis'] });
  };

  return {
    create: useMutation({
      mutationFn: (data: RekondisiDetailFormData) => rekondisiApi.createDetail(rekondisiId, data),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Item pekerjaan ditambahkan' }));
        inval();
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<RekondisiDetailFormData> }) =>
        rekondisiApi.updateDetail(rekondisiId, id, data),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Item diperbarui' }));
        inval();
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
    remove: useMutation({
      mutationFn: (id: string) => rekondisiApi.deleteDetail(rekondisiId, id),
      onSuccess: () => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Item dihapus' }));
        inval();
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
}
