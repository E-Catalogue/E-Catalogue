import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitApi } from './unit.api';
import type { UnitFormData, UnitStatusUpdate } from './unit.types';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';

export function useUnits(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => unitApi.list(params),
  });
}

export function useUnit(id?: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => unitApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UnitFormData) => unitApi.create(data),
    onSuccess: () => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Tindakan berhasil' }));
      qc.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UnitFormData> }) => unitApi.update(id, data),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Unit berhasil diperbarui' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
    },
  });
}

export function useUpdateUnitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitStatusUpdate }) => unitApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Status unit berhasil diperbarui' }));
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['unit', id] });
    },
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitApi.delete(id),
    onSuccess: () => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Unit berhasil dihapus' }));
      qc.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

export function useRekondisiStatusCheck(id?: string) {
  return useQuery({
    queryKey: ['unit-rekondisi-check', id],
    queryFn: () => unitApi.rekondisiStatusCheck(id!),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateRekondisi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitApi.createRekondisi(id),
    onSuccess: () => {
      store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Rekondisi baru dibuat' }));
      qc.invalidateQueries({ queryKey: ['rekondisis'] });
    },
  });
}

export function useMasterKelengkapan() {
  return useQuery({
    queryKey: ['master-kelengkapans'],
    queryFn: () => unitApi.getMasterKelengkapans(),
  });
}

export function useMasterDokumen() {
  return useQuery({
    queryKey: ['master-dokumens'],
    queryFn: () => unitApi.getMasterDokumens(),
  });
}
