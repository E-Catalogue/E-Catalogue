import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { Unit, UnitFormData, UnitStatusUpdate, MasterKelengkapan, MasterDokumen } from './unit.types';

export const unitApi = {
  list: async (params?: Record<string, any>) => {
    const res = await apiClient.get<ApiResponse<Unit[]>>('/units', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Unit>>(`/units/${id}`);
    return res.data;
  },

  create: async (data: UnitFormData) => {
    const res = await apiClient.post<ApiResponse<Unit>>('/units', data);
    return res.data;
  },

  update: async (id: string, data: Partial<UnitFormData>) => {
    const res = await apiClient.put<ApiResponse<Unit>>(`/units/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, data: UnitStatusUpdate) => {
    const res = await apiClient.patch<ApiResponse<Unit>>(`/units/${id}/status`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<Unit>>(`/units/${id}`);
    return res.data;
  },

  getMasterKelengkapans: async () => {
    const res = await apiClient.get<ApiResponse<MasterKelengkapan[]>>('/units/kelengkapan');
    return res.data;
  },

  getMasterDokumens: async () => {
    const res = await apiClient.get<ApiResponse<MasterDokumen[]>>('/units/dokumen');
    return res.data;
  },
  
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post<ApiResponse<any>>(`/units/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteImage: async (id: string, imageId: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/units/${id}/image/${imageId}`);
    return res.data;
  },
};
