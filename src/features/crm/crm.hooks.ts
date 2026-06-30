import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadApi, leadOrderApi, leadPaymentApi, unitApi } from './crm.api';
import type { LeadListParams, OrderListParams } from './crm.api';
import type { Lead, LeadOrder, LeadPayment, OrderStatus } from './crm.types';

// ---------- Lead ----------
export const useLeads = (params: LeadListParams) =>
  useQuery({ queryKey: ['leads', params], queryFn: () => leadApi.list(params) });

export const useLead = (id: string | null) =>
  useQuery({ queryKey: ['lead', id], queryFn: () => leadApi.get(id as string), enabled: !!id });

export const useLeadMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['leads'] });
  return {
    create: useMutation({ mutationFn: (body: FormData | Partial<Lead>) => leadApi.create(body), onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: FormData | Partial<Lead> }) => leadApi.update(v.id, v.body), onSuccess: inval }),
  };
};

// ---------- Sales Order ----------
export const useLeadOrders = (params: OrderListParams) =>
  useQuery({ queryKey: ['lead-orders', params], queryFn: () => leadOrderApi.list(params) });

export const useLeadOrder = (id: string | null) =>
  useQuery({ queryKey: ['lead-order', id], queryFn: () => leadOrderApi.get(id as string), enabled: !!id });

export const useLeadOrderMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['lead-orders'] });
  const invalOne = (id: string) => qc.invalidateQueries({ queryKey: ['lead-order', id] });
  return {
    create: useMutation({ mutationFn: (body: Partial<LeadOrder> & { lead?: Partial<Lead> }) => leadOrderApi.create(body), onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<LeadOrder> }) => leadOrderApi.update(v.id, v.body), onSuccess: inval }),
    updateStatus: useMutation({
      mutationFn: (v: { id: string; status: OrderStatus }) => leadOrderApi.updateStatus(v.id, v.status),
      onSuccess: (_d, v) => { inval(); invalOne(v.id); },
    }),
  };
};

// ---------- Payment ----------
export const useLeadPayments = (orderId: string | null) =>
  useQuery({
    queryKey: ['lead-payments', orderId],
    queryFn: () => leadPaymentApi.list(orderId as string, { page: 1, limit: 100 }),
    enabled: !!orderId,
  });

export const useLeadPaymentMutations = (orderId: string) => {
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['lead-payments', orderId] });
    qc.invalidateQueries({ queryKey: ['lead-order', orderId] });
    qc.invalidateQueries({ queryKey: ['lead-orders'] });
  };
  return {
    create: useMutation({ mutationFn: (body: FormData | Partial<LeadPayment>) => leadPaymentApi.create(orderId, body), onSuccess: inval }),
    update: useMutation({ mutationFn: (v: { id: string; body: FormData | Partial<LeadPayment> }) => leadPaymentApi.update(orderId, v.id, v.body), onSuccess: inval }),
    remove: useMutation({ mutationFn: (id: string) => leadPaymentApi.remove(orderId, id), onSuccess: inval }),
  };
};

// ---------- Unit dropdown ----------
export const useReadyStockUnits = (search: string, enabled = true) =>
  useQuery({
    queryKey: ['units-dropdown', search],
    queryFn: () => unitApi.list({ page: 1, limit: 30, search, status: 'READY_STOCK' }),
    enabled,
  });
