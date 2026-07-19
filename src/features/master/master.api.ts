import { apiClient, API_ORIGIN } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { Merek, Tipe, Vendor, Branch, BranchImage, Investor, InvestorModal, ListParams } from './types';

// URL publik untuk media (gambar) berdasarkan id.
export const mediaUrl = (id: string) => `${API_ORIGIN}/m/${id}`;

// ---- Merek ----
export const merekApi = {
  list: (params: ListParams) => apiClient.get<ApiResponse<Merek[]>>('/mereks', { params }).then((r) => r.data),
  create: (body: { name: string; isActive: boolean }) => apiClient.post<ApiResponse<Merek>>('/mereks', body).then((r) => r.data.data),
  update: (id: string, body: Partial<{ name: string; isActive: boolean }>) => apiClient.patch<ApiResponse<Merek>>(`/mereks/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/mereks/${id}`).then((r) => r.data),
};

// ---- Tipe (nested di merek) ----
export const tipeApi = {
  list: (merekId: string, params: ListParams) => apiClient.get<ApiResponse<Tipe[]>>(`/mereks/${merekId}/tipes`, { params }).then((r) => r.data),
  create: (merekId: string, body: { name: string; isActive: boolean }) => apiClient.post<ApiResponse<Tipe>>(`/mereks/${merekId}/tipes`, body).then((r) => r.data.data),
  update: (merekId: string, id: string, body: Partial<{ name: string; isActive: boolean }>) => apiClient.patch<ApiResponse<Tipe>>(`/mereks/${merekId}/tipes/${id}`, body).then((r) => r.data.data),
  remove: (merekId: string, id: string) => apiClient.delete(`/mereks/${merekId}/tipes/${id}`).then((r) => r.data),
};

// ---- Vendor ----
export const vendorApi = {
  list: (params: ListParams) => apiClient.get<ApiResponse<Vendor[]>>('/vendors', { params }).then((r) => r.data),
  create: (body: Partial<Vendor>) => apiClient.post<ApiResponse<Vendor>>('/vendors', body).then((r) => r.data.data),
  update: (id: string, body: Partial<Vendor>) => apiClient.patch<ApiResponse<Vendor>>(`/vendors/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/vendors/${id}`).then((r) => r.data),
};

// ---- Branch + media ----
export const branchApi = {
  list: (params: ListParams) => apiClient.get<ApiResponse<Branch[]>>('/branches', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<Branch>>(`/branches/${id}`).then((r) => r.data.data),
  create: (body: Partial<Branch>) => apiClient.post<ApiResponse<Branch>>('/branches', body).then((r) => r.data.data),
  update: (id: string, body: Partial<Branch>) => apiClient.patch<ApiResponse<Branch>>(`/branches/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/branches/${id}`).then((r) => r.data),
  uploadImage: (branchId: string, file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return apiClient
      .post<ApiResponse<BranchImage>>(`/branches/${branchId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data);
  },
  deleteImage: (branchId: string, imageId: string) => apiClient.delete(`/branches/${branchId}/images/${imageId}`).then((r) => r.data),
};

// ---- Investor ----
export const investorApi = {
  list: (params: ListParams) => apiClient.get<ApiResponse<Investor[]>>('/investors', { params }).then((r) => r.data),
  create: (body: Partial<Investor>) => apiClient.post<ApiResponse<Investor>>('/investors', body).then((r) => r.data.data),
  update: (id: string, body: Partial<Investor>) => apiClient.patch<ApiResponse<Investor>>(`/investors/${id}`, body).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/investors/${id}`).then((r) => r.data),
};

// ---- Investor Modal (nested di investor) ----
export const investorModalApi = {
  list: (investorId: string, params: ListParams) => apiClient.get<ApiResponse<InvestorModal[]>>(`/investors/${investorId}/modals`, { params }).then((r) => r.data),
  create: (investorId: string, body: Partial<InvestorModal>) => apiClient.post<ApiResponse<InvestorModal>>(`/investors/${investorId}/modals`, body).then((r) => r.data.data),
  update: (investorId: string, id: string, body: Partial<InvestorModal>) => apiClient.patch<ApiResponse<InvestorModal>>(`/investors/${investorId}/modals/${id}`, body).then((r) => r.data.data),
  remove: (investorId: string, id: string) => apiClient.delete(`/investors/${investorId}/modals/${id}`).then((r) => r.data),
};
