import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  Lead, LeadOrder, LeadPayment, LeadPaymentReverseResult, LeadStatus,
  OrderStatus, SaleSettlement, UnitSummary,
} from './crm.types';

/** Header opsional `{ 'X-Branch-Id': branchId }` — wajib diisi caller untuk mutation Owner (README §8). */
type BranchHeaders = Record<string, string> | undefined;

export interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  sumberLeadId?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  salesId?: string;
  leadId?: string;
  unitId?: string;
  paymentType?: string;
  isPaid?: boolean;
}

// ---- Lead ----
export const leadApi = {
  list: (params: LeadListParams) =>
    apiClient.get<ApiResponse<Lead[]>>('/leads', { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<ApiResponse<Lead>>(`/leads/${id}`).then((r) => r.data.data),
  create: (body: FormData | Partial<Lead>) =>
    apiClient.post<ApiResponse<Lead>>('/leads', body, {
      headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then((r) => r.data.data),
  update: (id: string, body: FormData | Partial<Lead>) =>
    apiClient.patch<ApiResponse<Lead>>(`/leads/${id}`, body, {
      headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then((r) => r.data.data),
  /** `PATCH /leads/:id/status` — endpoint terpisah dari update umum, khusus transisi status funnel lead. */
  updateStatus: (id: string, status: LeadStatus) =>
    apiClient.patch<ApiResponse<Lead>>(`/leads/${id}/status`, { status }).then((r) => r.data.data),
  /** `/leads/lookups` — pilihan sumber lead untuk form (PRD §4.7, `authorizeAny`). */
  lookupSources: () =>
    apiClient.get<ApiResponse<{ id: string; name: string; code: string }[]>>('/leads/lookups').then((r) => r.data.data ?? []),
};

/**
 * `.prd/update_module_owned_lookup_20260721.md` §4.9 — form order & pembayaran memakai lookup
 * agregat `/lead-orders/lookups/order-form` (menggantikan `/lead-orders/sales` + CRUD Lead/Unit/
 * Leasing/Sumber Lead yang lama). Akun kas pembayaran dipisah lagi via `useLeadOrderCashAccounts`.
 */
export interface LeadOrderFormLookup {
  leads: { id: string; branchId: string; nama: string; nik: string; status: string }[];
  sources: { id: string; name: string; code: string }[];
  units: { id: string; branchId: string; platNomor: string; otrPrice: number; merek?: { name: string } | null; tipe?: { name: string } | null }[];
  sales: { id: string; branchId: string; name: string; username: string }[];
  leasings: { id: string; name: string; code: string }[];
}

export const leadOrderLookupApi = {
  orderForm: (headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<LeadOrderFormLookup>>('/lead-orders/lookups/order-form', { headers }).then((r) => r.data.data),
};

// ---- Sales Order (lead-order.route.js — branch-scoped via resolveBranchScope) ----
export const leadOrderApi = {
  list: (params: OrderListParams, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<LeadOrder[]>>('/lead-orders', { params, headers }).then((r) => r.data),
  get: (id: string, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<LeadOrder>>(`/lead-orders/${id}`, { headers }).then((r) => r.data.data),
  create: (body: Partial<LeadOrder> & { lead?: Partial<Lead> }, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<LeadOrder>>('/lead-orders', body, { headers }).then((r) => r.data.data),
  update: (id: string, body: Partial<LeadOrder>, headers?: BranchHeaders) =>
    apiClient.patch<ApiResponse<LeadOrder>>(`/lead-orders/${id}`, body, { headers }).then((r) => r.data.data),
  /** Hanya `DEAL` / `CANCELLED` yang valid dikirim — funnel lama ditolak backend 410 (README §24). */
  updateStatus: (id: string, status: Extract<OrderStatus, 'DEAL' | 'CANCELLED'>, headers?: BranchHeaders) =>
    apiClient.patch<ApiResponse<LeadOrder>>(`/lead-orders/${id}/status`, { status }, { headers }).then((r) => r.data.data),
};

// ---- Payment (nested under order — payment.route.js) ----
export const leadPaymentApi = {
  list: (orderId: string, params: { page?: number; limit?: number } | undefined, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<LeadPayment[]>>(`/lead-orders/${orderId}/payments`, { params, headers }).then((r) => r.data),
  /** Wajib header `Idempotency-Key` (README §14, payment.service.js `create()`) — dipisah dari branch header agar lifecycle-nya eksplisit di caller. */
  create: (orderId: string, body: FormData | Partial<LeadPayment>, headers: BranchHeaders, idempotencyKey: string) =>
    apiClient.post<ApiResponse<LeadPayment>>(`/lead-orders/${orderId}/payments`, body, {
      headers: {
        ...headers,
        'Idempotency-Key': idempotencyKey,
        ...(body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}),
      },
    }).then((r) => r.data.data),
  update: (orderId: string, id: string, body: FormData | Partial<LeadPayment>, headers?: BranchHeaders) =>
    apiClient.patch<ApiResponse<LeadPayment>>(`/lead-orders/${orderId}/payments/${id}`, body, {
      headers: {
        ...headers,
        ...(body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}),
      },
    }).then((r) => r.data.data),
  /** Payment POSTED tidak boleh dihapus (backend selalu menolak dengan `POSTED_PAYMENT_IMMUTABLE`) — gunakan `reverse`. */
  reverse: (orderId: string, id: string, body: { transactionDate?: string; description?: string }, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<LeadPaymentReverseResult>>(`/lead-orders/${orderId}/payments/${id}/reverse`, body, { headers }).then((r) => r.data.data),
  remove: (orderId: string, id: string, headers?: BranchHeaders) =>
    apiClient.delete<ApiResponse<LeadPayment>>(`/lead-orders/${orderId}/payments/${id}`, { headers }).then((r) => r.data),
};

// ---- Settlement (lead-order.route.js — /:id/settlement, sales-incentive, settlement/finalize) ----
export const settlementApi = {
  get: (orderId: string, headers?: BranchHeaders) =>
    apiClient.get<ApiResponse<SaleSettlement>>(`/lead-orders/${orderId}/settlement`, { headers }).then((r) => r.data.data),
  setIncentive: (orderId: string, body: { amount: number }, headers?: BranchHeaders) =>
    apiClient.put<ApiResponse<SaleSettlement>>(`/lead-orders/${orderId}/sales-incentive`, body, { headers }).then((r) => r.data.data),
  /** Finalize tidak memiliki body — kirim request tanpa payload (README §16 "Settlement"). */
  finalize: (orderId: string, headers?: BranchHeaders) =>
    apiClient.post<ApiResponse<SaleSettlement>>(`/lead-orders/${orderId}/settlement/finalize`, undefined, { headers }).then((r) => r.data.data),
};

// ---- Unit (minimal — untuk dropdown pilih unit READY_STOCK di form order) ----
export const unitApi = {
  list: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient.get<ApiResponse<UnitSummary[]>>('/units', { params }).then((r) => r.data),
};
