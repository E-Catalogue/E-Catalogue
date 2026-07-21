import { apiClient, API_ORIGIN } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  Merek, Tipe, Vendor, VendorCreateInput, VendorUpdateInput, Branch, BranchImage, Investor, ListParams,
  CapitalAccount, CapitalAccountsConsolidated, CapitalTransaction, CapitalMutationPayload,
} from './types';

/** Header opsional `{ 'X-Branch-Id': branchId }` — wajib diisi caller untuk mutation Owner (README §8). */
type BranchHeaders = Record<string, string> | undefined;

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
  get: (id: string) => apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`).then((r) => r.data.data),
  create: (body: VendorCreateInput) => apiClient.post<ApiResponse<Vendor>>('/vendors', body).then((r) => r.data.data),
  update: (id: string, body: VendorUpdateInput) => apiClient.patch<ApiResponse<Vendor>>(`/vendors/${id}`, body).then((r) => r.data.data),
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

// ---- Investor Capital (nested di investor) ----
// Endpoint lama `/investors/:id/modals` sudah 410 Gone (INVESTOR_MODAL_DEPRECATED) — JANGAN dipanggil lagi.
// Mount path dikonfirmasi dari ecatalogue-be/src/modules/investor/capital/capital.route.js.
export const capitalApi = {
  accounts: (investorId: string, headers?: BranchHeaders) =>
    apiClient
      .get<ApiResponse<CapitalAccount[] | CapitalAccountsConsolidated>>(`/investors/${investorId}/capital-accounts`, { headers })
      .then((r) => r.data),
  transactions: (investorId: string, params: ListParams, headers?: BranchHeaders) =>
    apiClient
      .get<ApiResponse<CapitalTransaction[]>>(`/investors/${investorId}/capital-transactions`, { params, headers })
      .then((r) => r.data),
  /** Wajib header `Idempotency-Key` (README §14) — response `data` adalah CapitalTransaction, BUKAN saldo akun; refetch capital-accounts terpisah. */
  deposit: (investorId: string, body: CapitalMutationPayload, headers: BranchHeaders, idempotencyKey: string) =>
    apiClient
      .post<ApiResponse<CapitalTransaction>>(`/investors/${investorId}/capital/deposits`, body, { headers: { ...headers, 'Idempotency-Key': idempotencyKey } })
      .then((r) => r.data),
  withdraw: (investorId: string, body: CapitalMutationPayload, headers: BranchHeaders, idempotencyKey: string) =>
    apiClient
      .post<ApiResponse<CapitalTransaction>>(`/investors/${investorId}/capital/withdrawals`, body, { headers: { ...headers, 'Idempotency-Key': idempotencyKey } })
      .then((r) => r.data),
};
