import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { testDriveApi } from './testDrive.api';
import type { TestDriveListParams } from './testDrive.types';

export const useTestDrives = (params: TestDriveListParams) =>
  useQuery({ queryKey: ['test-drives', params], queryFn: () => testDriveApi.list(params) });

export const useTestDriveUnits = (params: { search?: string }, enabled = true) =>
  useQuery({ queryKey: ['test-drive-units', params], queryFn: () => testDriveApi.units(params), enabled });

export const useTestDriveMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['test-drives'] });
  return {
    create: useMutation({ mutationFn: (body: FormData) => testDriveApi.create(body), onSuccess: invalidate }),
    update: useMutation({ mutationFn: (v: { id: string; body: FormData }) => testDriveApi.update(v.id, v.body), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: testDriveApi.remove, onSuccess: invalidate }),
  };
};
