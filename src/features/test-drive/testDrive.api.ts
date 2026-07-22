import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { TestDrive, TestDriveFormLookup, TestDriveListParams } from './testDrive.types';

type BranchHeaders = Record<string, string> | undefined;

export const testDriveApi = {
  list: (params: TestDriveListParams) =>
    apiClient.get<ApiResponse<TestDrive[]>>('/test-drives', { params }).then((r) => r.data),
  /** `.prd/update_module_owned_lookup_20260721.md` §4.10 — satu agregat lead/unit-ready-stock/sales. */
  lookups: (headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<TestDriveFormLookup>>('/test-drives/lookups', { headers }).then((r) => r.data.data),
  create: (body: FormData) =>
    apiClient.post<ApiResponse<TestDrive>>('/test-drives', body, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (id: string, body: FormData) =>
    apiClient.patch<ApiResponse<TestDrive>>(`/test-drives/${id}`, body, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiResponse<unknown>>(`/test-drives/${id}`).then((r) => r.data),
};
