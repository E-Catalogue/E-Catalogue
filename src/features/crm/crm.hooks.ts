import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  leadApi, leadOrderApi, leadPaymentApi, settlementApi, unitApi,
} from './crm.api';
import type { LeadListParams, OrderListParams } from './crm.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { notifyApiError } from '@/core/api/notify';
import type {
  Lead, LeadOrder, LeadPayment, LeadStatus, OrderStatus,
} from './crm.types';

type BranchHeaders = Record<string, string> | undefined;

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

// ---------- Lead ----------
export const useLeads = (params: LeadListParams) =>
  useQuery({ queryKey: ['leads', params], queryFn: () => leadApi.list(params) });

export const useLead = (id: string | null) =>
  useQuery({ queryKey: ['lead', id], queryFn: () => leadApi.get(id as string), enabled: !!id });

export const useLeadMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['leads'] });
  return {
    create: useMutation({ mutationFn: (body: FormData | Partial<Lead>) => leadApi.create(body), onSuccess: () => { toast('Lead ditambahkan'); inval(); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: FormData | Partial<Lead> }) => leadApi.update(v.id, v.body), onSuccess: () => { toast('Lead diperbarui'); inval(); } }),
    updateStatus: useMutation({
      mutationFn: (v: { id: string; status: LeadStatus }) => leadApi.updateStatus(v.id, v.status),
      onSuccess: (_, v) => {
        toast('Status lead diperbarui');
        inval();
        qc.invalidateQueries({ queryKey: ['lead', v.id] });
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
};

// ---------- Sales Order ----------
/**
 * Query key wajib menyertakan `branchKey` (README §8) supaya cache Cabang A tidak bocor
 * ke Cabang B saat Owner memindahkan selector — lihat pola di investor-obligation.hooks.ts.
 */
const orderKeys = {
  list: (branchKey: string, params: OrderListParams) => ['lead-orders', branchKey, params] as const,
  detail: (branchKey: string, id?: string | null) => ['lead-order', branchKey, id] as const,
};
const paymentKeys = {
  list: (branchKey: string, orderId?: string | null) => ['lead-payments', branchKey, orderId] as const,
};
const settlementKeys = {
  detail: (branchKey: string, orderId?: string | null) => ['lead-order-settlement', branchKey, orderId] as const,
};

export const useLeadOrders = (branchKey: string, params: OrderListParams, headers: BranchHeaders) =>
  useQuery({ queryKey: orderKeys.list(branchKey, params), queryFn: () => leadOrderApi.list(params, headers) });

export const useLeadOrder = (branchKey: string, id: string | null, headers: BranchHeaders) =>
  useQuery({ queryKey: orderKeys.detail(branchKey, id), queryFn: () => leadOrderApi.get(id as string, headers), enabled: !!id });

export const useLeadOrderMutations = (branchKey: string) => {
  const qc = useQueryClient();
  const invalList = () => qc.invalidateQueries({ queryKey: ['lead-orders'] });
  const invalOne = (id: string) => qc.invalidateQueries({ queryKey: ['lead-order', branchKey, id] });

  /**
   * Cache invalidation setelah transisi status (README §18, contoh DEAL):
   * order detail/list, lead detail/list, unit detail/list, settlement, dashboard.
   * Target achievement & book profit summary SENGAJA tidak diinvalidate — modul itu
   * belum punya hooks TanStack Query di codebase ini (tidak mengarang query key baru).
   */
  const invalAfterStatusChange = (order: LeadOrder) => {
    invalList();
    invalOne(order.id);
    qc.invalidateQueries({ queryKey: ['leads'] });
    if (order.leadId) qc.invalidateQueries({ queryKey: ['lead', order.leadId] });
    qc.invalidateQueries({ queryKey: ['units'] });
    if (order.unitId) qc.invalidateQueries({ queryKey: ['unit', order.unitId] });
    qc.invalidateQueries({ queryKey: ['lead-order-settlement', branchKey, order.id] });
    qc.invalidateQueries({ queryKey: ['dashboard-overview'] });
  };

  return {
    create: useMutation({
      mutationFn: (v: { body: Partial<LeadOrder> & { lead?: Partial<Lead> }; headers: BranchHeaders }) =>
        leadOrderApi.create(v.body, v.headers),
      onSuccess: () => { toast('Sales order ditambahkan'); invalList(); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    update: useMutation({
      mutationFn: (v: { id: string; body: Partial<LeadOrder>; headers: BranchHeaders }) =>
        leadOrderApi.update(v.id, v.body, v.headers),
      onSuccess: (_d, v) => { toast('Sales order diperbarui'); invalList(); invalOne(v.id); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    updateStatus: useMutation({
      mutationFn: (v: { id: string; status: Extract<OrderStatus, 'DEAL' | 'CANCELLED'>; headers: BranchHeaders }) =>
        leadOrderApi.updateStatus(v.id, v.status, v.headers),
      onSuccess: (order, v) => {
        toast(v.status === 'DEAL' ? 'Order berhasil ditandai DEAL' : 'Order berhasil dibatalkan');
        invalAfterStatusChange(order);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
};

// ---------- Payment ----------
export const useLeadPayments = (branchKey: string, orderId: string | null, headers: BranchHeaders) =>
  useQuery({
    queryKey: paymentKeys.list(branchKey, orderId),
    queryFn: () => leadPaymentApi.list(orderId as string, { page: 1, limit: 100 }, headers),
    enabled: !!orderId,
  });

export const useLeadPaymentMutations = (branchKey: string, orderId: string) => {
  const qc = useQueryClient();
  /**
   * Setelah payment/reversal (README §16 "Payment customer" + §18 contoh pembayaran):
   * invalidate order, payment, settlement, obligation, dashboard, dan cash ledger terkait.
   */
  const invalDownstream = () => {
    qc.invalidateQueries({ queryKey: ['lead-payments', branchKey, orderId] });
    qc.invalidateQueries({ queryKey: ['lead-order', branchKey, orderId] });
    qc.invalidateQueries({ queryKey: ['lead-orders'] });
    qc.invalidateQueries({ queryKey: ['lead-order-settlement', branchKey, orderId] });
    qc.invalidateQueries({ queryKey: ['investor-obligations'] });
    qc.invalidateQueries({ queryKey: ['investor-obligation'] });
    qc.invalidateQueries({ queryKey: ['cash-accounts'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['dashboard-overview'] });
  };

  return {
    create: useMutation({
      mutationFn: (v: { body: FormData | Partial<LeadPayment>; headers: BranchHeaders; idempotencyKey: string }) =>
        leadPaymentApi.create(orderId, v.body, v.headers, v.idempotencyKey),
      onSuccess: () => { toast('Pembayaran ditambahkan'); invalDownstream(); },
    }),
    update: useMutation({
      mutationFn: (v: { id: string; body: FormData | Partial<LeadPayment>; headers: BranchHeaders }) =>
        leadPaymentApi.update(orderId, v.id, v.body, v.headers),
      onSuccess: () => { toast('Pembayaran diperbarui'); invalDownstream(); },
    }),
    reverse: useMutation({
      mutationFn: (v: { id: string; body: { transactionDate?: string; description?: string }; headers: BranchHeaders }) =>
        leadPaymentApi.reverse(orderId, v.id, v.body, v.headers),
      onSuccess: () => { toast('Pembayaran berhasil dibalik'); invalDownstream(); },
    }),
  };
};

// ---------- Settlement ----------
export const useSaleSettlement = (branchKey: string, orderId: string | null, headers: BranchHeaders, enabled = true) =>
  useQuery({
    queryKey: settlementKeys.detail(branchKey, orderId),
    queryFn: () => settlementApi.get(orderId as string, headers),
    enabled: !!orderId && enabled,
    retry: false,
  });

export const useSaleSettlementMutations = (branchKey: string, orderId: string) => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['lead-order-settlement', branchKey, orderId] });
    qc.invalidateQueries({ queryKey: ['lead-order', branchKey, orderId] });
    qc.invalidateQueries({ queryKey: ['lead-orders'] });
    qc.invalidateQueries({ queryKey: ['dashboard-overview'] });
  };
  return {
    setIncentive: useMutation({
      mutationFn: (v: { amount: number; headers: BranchHeaders }) => settlementApi.setIncentive(orderId, { amount: v.amount }, v.headers),
      onSuccess: () => { toast('Insentif sales disimpan'); inval(); },
    }),
    finalize: useMutation({
      mutationFn: (v: { headers: BranchHeaders }) => settlementApi.finalize(orderId, v.headers),
      onSuccess: () => { toast('Settlement penjualan diproses'); inval(); },
    }),
  };
};

// ---------- Unit dropdown ----------
export const useReadyStockUnits = (search: string, enabled = true) =>
  useQuery({
    queryKey: ['units-dropdown', search],
    queryFn: () => unitApi.list({ page: 1, limit: 30, search, status: 'READY_STOCK' }),
    enabled,
  });
