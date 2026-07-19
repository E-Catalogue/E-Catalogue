import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { testDriveApi } from './testDrive.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { TestDriveListParams } from './testDrive.types';

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

export const useTestDrives = (params: TestDriveListParams) =>
  useQuery({ queryKey: ['test-drives', params], queryFn: () => testDriveApi.list(params) });

export const useTestDriveUnits = (params: { search?: string }, enabled = true) =>
  useQuery({ queryKey: ['test-drive-units', params], queryFn: () => testDriveApi.units(params), enabled });

export const useTestDriveMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['test-drives'] });
  return {
    create: useMutation({ mutationFn: (body: FormData) => testDriveApi.create(body), onSuccess: () => { toast('Jadwal test drive ditambahkan'); invalidate(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: FormData }) => testDriveApi.update(v.id, v.body), onSuccess: () => { toast('Jadwal test drive diperbarui'); invalidate(); } }),
    remove: useMutation({ mutationFn: testDriveApi.remove, onSuccess: () => { toast('Jadwal test drive dihapus'); invalidate(); } }),
  };
};
