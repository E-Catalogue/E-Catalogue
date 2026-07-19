import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { ListParams } from './types';

// Entitas master sederhana: name + code + isActive.
export interface SimpleMaster {
  id: string;
  name: string;
  code?: string | null;
  isActive: boolean;
}

export interface SimpleMasterApi {
  path: string;
  list: (params: ListParams) => Promise<ApiResponse<SimpleMaster[]>>;
  create: (body: Partial<SimpleMaster>) => Promise<SimpleMaster>;
  update: (id: string, body: Partial<SimpleMaster>) => Promise<SimpleMaster>;
  remove: (id: string) => Promise<unknown>;
}

/** Factory CRUD untuk endpoint master sederhana (pola seragam). */
export const makeSimpleApi = (path: string): SimpleMasterApi => ({
  path,
  list: (params) => apiClient.get<ApiResponse<SimpleMaster[]>>(`/${path}`, { params }).then((r) => r.data),
  create: (body) => apiClient.post<ApiResponse<SimpleMaster>>(`/${path}`, body).then((r) => r.data.data),
  update: (id, body) => apiClient.patch<ApiResponse<SimpleMaster>>(`/${path}/${id}`, body).then((r) => r.data.data),
  remove: (id) => apiClient.delete(`/${path}/${id}`).then((r) => r.data),
});

// Instance siap pakai (juga bisa dipakai untuk dropdown di modul lain).
export const leasingApi = makeSimpleApi('leasings');
export const sumberLeadApi = makeSimpleApi('sumber-leads');
export const pengecekanApi = makeSimpleApi('pengecekans');
export const kategoriPengeluaranApi = makeSimpleApi('kategori-pengeluarans');
export const metodePembayaranApi = makeSimpleApi('metode-pembayarans');
export const dokumenApi = makeSimpleApi('dokumens');
export const perlengkapanApi = makeSimpleApi('perlengkapans');
