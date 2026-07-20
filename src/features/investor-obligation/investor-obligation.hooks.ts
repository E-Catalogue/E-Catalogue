import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { notifyApiError } from '@/core/api/notify';
import { investorObligationApi } from './investor-obligation.api';
import type {
  InvestorObligationGeneratePayload,
  InvestorObligationListParams,
  InvestorObligationPayPayload,
  InvestorObligationReversePayload,
} from './investor-obligation.types';

type BranchHeaders = Record<string, string> | undefined;

/**
 * Query key wajib menyertakan `branchKey` (README §8) supaya cache Cabang A tidak
 * bocor ke Cabang B saat Owner memindahkan selector.
 */
const keys = {
  list: (branchKey: string, params?: InvestorObligationListParams) => ['investor-obligations', branchKey, params] as const,
  detail: (branchKey: string, id?: string) => ['investor-obligation', branchKey, id] as const,
  payments: (branchKey: string, id?: string) => ['investor-obligation-payments', branchKey, id] as const,
};

export function useInvestorObligations(branchKey: string, params: InvestorObligationListParams | undefined, headers: BranchHeaders, enabled = true) {
  return useQuery({
    queryKey: keys.list(branchKey, params),
    queryFn: () => investorObligationApi.list(params, headers),
    enabled,
  });
}

export function useInvestorObligation(branchKey: string, id: string | undefined, headers: BranchHeaders) {
  return useQuery({
    queryKey: keys.detail(branchKey, id),
    queryFn: () => investorObligationApi.get(id!, headers),
    enabled: !!id,
  });
}

export function useInvestorObligationPayments(branchKey: string, id: string | undefined, headers: BranchHeaders) {
  return useQuery({
    queryKey: keys.payments(branchKey, id),
    queryFn: () => investorObligationApi.listPayments(id!, headers),
    enabled: !!id,
  });
}

/**
 * Semua mutation di modul ini finansial (README §18): TIDAK ada optimistic update —
 * selalu tunggu response server lalu invalidate, jangan menebak state baru di client.
 */
export function useInvestorObligationMutations(branchKey: string) {
  const qc = useQueryClient();

  /** Invalidate consumer downstream sesuai README §18 contoh "pembayaran investor". */
  const invalDownstream = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['investor-obligations'] });
    if (id) {
      qc.invalidateQueries({ queryKey: ['investor-obligation', branchKey, id] });
      qc.invalidateQueries({ queryKey: ['investor-obligation-payments', branchKey, id] });
    }
    qc.invalidateQueries({ queryKey: ['cash-accounts'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
    qc.invalidateQueries({ queryKey: ['cash-flow-dashboard'] });
    qc.invalidateQueries({ queryKey: ['dashboard-overview'] });
  };

  return {
    generate: useMutation({
      mutationFn: ({ data, headers }: { data: InvestorObligationGeneratePayload; headers: BranchHeaders }) =>
        investorObligationApi.generate(data, headers),
      onSuccess: (res) => {
        store.dispatch(showToast({
          type: 'general',
          title: 'Berhasil',
          message: `Tagihan investor berhasil digenerate (${res.data.length} kewajiban).`,
        }));
        qc.invalidateQueries({ queryKey: ['investor-obligations'] });
      },
      onError: (e: unknown) => notifyApiError(e),
    }),

    pay: useMutation({
      mutationFn: ({ id, data, headers, idempotencyKey }: { id: string; data: InvestorObligationPayPayload; headers: BranchHeaders; idempotencyKey: string }) =>
        investorObligationApi.pay(id, data, headers, idempotencyKey),
      onSuccess: (_res, { id }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Pembayaran investor berhasil diposting' }));
        invalDownstream(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),

    reverse: useMutation({
      mutationFn: ({ id, paymentId, data, headers }: { id: string; paymentId: string; data: InvestorObligationReversePayload; headers: BranchHeaders }) =>
        investorObligationApi.reversePayment(id, paymentId, data, headers),
      onSuccess: (_res, { id }) => {
        store.dispatch(showToast({ type: 'general', title: 'Berhasil', message: 'Pembayaran investor berhasil dibalik' }));
        invalDownstream(id);
      },
      onError: (e: unknown) => notifyApiError(e),
    }),
  };
}
