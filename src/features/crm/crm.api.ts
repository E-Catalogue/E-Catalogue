import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { Lead, LeadOrder, LeadPayment, OrderStatus, SalesComboboxUser, UnitSummary } from './crm.types';

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
};

// ---- Sales Order ----
export const leadOrderApi = {
  sales: () =>
    apiClient.get<ApiResponse<SalesComboboxUser[]>>('/lead-orders/sales').then((r) => r.data.data),
  list: (params: OrderListParams) =>
    apiClient.get<ApiResponse<LeadOrder[]>>('/lead-orders', { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<ApiResponse<LeadOrder>>(`/lead-orders/${id}`).then((r) => r.data.data),
  create: (body: Partial<LeadOrder> & { lead?: Partial<Lead> }) =>
    apiClient.post<ApiResponse<LeadOrder>>('/lead-orders', body).then((r) => r.data.data),
  update: (id: string, body: Partial<LeadOrder>) =>
    apiClient.patch<ApiResponse<LeadOrder>>(`/lead-orders/${id}`, body).then((r) => r.data.data),
  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<ApiResponse<LeadOrder>>(`/lead-orders/${id}/status`, { status }).then((r) => r.data.data),
};

// ---- Payment (nested under order) ----
export const leadPaymentApi = {
  list: (orderId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<LeadPayment[]>>(`/lead-orders/${orderId}/payments`, { params }).then((r) => r.data),
  create: (orderId: string, body: FormData | Partial<LeadPayment>) =>
    apiClient.post<ApiResponse<LeadPayment>>(`/lead-orders/${orderId}/payments`, body, {
      headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then((r) => r.data.data),
  update: (orderId: string, id: string, body: FormData | Partial<LeadPayment>) =>
    apiClient.patch<ApiResponse<LeadPayment>>(`/lead-orders/${orderId}/payments/${id}`, body, {
      headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then((r) => r.data.data),
  remove: (orderId: string, id: string) =>
    apiClient.delete(`/lead-orders/${orderId}/payments/${id}`).then((r) => r.data),
};

// ---- Unit (minimal — untuk dropdown pilih unit READY_STOCK di form order) ----
export const unitApi = {
  list: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient.get<ApiResponse<UnitSummary[]>>('/units', { params }).then((r) => r.data),
};

