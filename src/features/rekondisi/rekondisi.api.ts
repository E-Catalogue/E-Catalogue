import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { Rekondisi, RekondisiDetail, RekondisiFormData, RekondisiDetailFormData, RekondisiDoneFormData, RekondisiPayFormData, RekondisiListParams } from './rekondisi.types';

export const rekondisiApi = {
  list: async (params?: RekondisiListParams) => {
    const res = await apiClient.get<ApiResponse<Rekondisi[]>>('/rekondisis', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Rekondisi>>(`/rekondisis/${id}`);
    return res.data;
  },

  update: async (id: string, data: RekondisiFormData) => {
    const res = await apiClient.put<ApiResponse<Rekondisi>>(`/rekondisis/${id}`, data);
    return res.data;
  },

  progress: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Rekondisi>>(`/rekondisis/${id}/progress`);
    return res.data;
  },

  done: async (id: string, data: RekondisiDoneFormData) => {
    const form = new FormData();
    if (data.tax !== undefined) form.append('tax', String(data.tax));
    if (data.adminFee !== undefined) form.append('adminFee', String(data.adminFee));
    if (data.additionalFee !== undefined) form.append('additionalFee', String(data.additionalFee));
    if (data.invoice) form.append('invoice', data.invoice);
    const res = await apiClient.post<ApiResponse<Rekondisi>>(`/rekondisis/${id}/done`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  pay: async (id: string, data: RekondisiPayFormData) => {
    const res = await apiClient.post<ApiResponse<Rekondisi>>(`/rekondisis/${id}/pay`, data);
    return res.data;
  },

  listDetail: async (rekondisiId: string, params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<RekondisiDetail[]>>(`/rekondisis/${rekondisiId}/detail`, { params });
    return res.data;
  },

  getDetail: async (rekondisiId: string, id: string) => {
    const res = await apiClient.get<ApiResponse<RekondisiDetail>>(`/rekondisis/${rekondisiId}/detail/${id}`);
    return res.data;
  },

  createDetail: async (rekondisiId: string, data: RekondisiDetailFormData) => {
    const res = await apiClient.post<ApiResponse<RekondisiDetail>>(`/rekondisis/${rekondisiId}/detail`, data);
    return res.data;
  },

  updateDetail: async (rekondisiId: string, id: string, data: Partial<RekondisiDetailFormData>) => {
    const res = await apiClient.put<ApiResponse<RekondisiDetail>>(`/rekondisis/${rekondisiId}/detail/${id}`, data);
    return res.data;
  },

  deleteDetail: async (rekondisiId: string, id: string) => {
    const res = await apiClient.delete<ApiResponse<RekondisiDetail>>(`/rekondisis/${rekondisiId}/detail/${id}`);
    return res.data;
  },
};
