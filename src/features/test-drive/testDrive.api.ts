import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { TestDrive, TestDriveListParams, TestDriveUnitLookup } from './testDrive.types';

export const testDriveApi = {
  list: (params: TestDriveListParams) =>
    apiClient.get<ApiResponse<TestDrive[]>>('/test-drives', { params }).then((r) => r.data),
  units: (params: { search?: string } = {}) =>
    apiClient.get<ApiResponse<TestDriveUnitLookup[]>>('/test-drives/units', { params }).then((r) => r.data),
  create: (body: FormData) =>
    apiClient.post<ApiResponse<TestDrive>>('/test-drives', body, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (id: string, body: FormData) =>
    apiClient.patch<ApiResponse<TestDrive>>(`/test-drives/${id}`, body, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete<ApiResponse<unknown>>(`/test-drives/${id}`).then((r) => r.data),
};
