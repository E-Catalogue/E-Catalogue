import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookApi } from './book.api';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { notifyApiError } from '@/core/api/notify';

type BranchHeaders = Record<string, string> | undefined;

const toast = (message: string) => store.dispatch(showToast({ title: 'Berhasil', message, variant: 'success' }));

export const useBookPeriods = (branchKey: string, params: { period?: string } = {}, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['book-periods', branchKey, params], queryFn: () => bookApi.periods(params, headers) });

export const useBookPeriod = (branchKey: string, period: string | null, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['book-period', branchKey, period], queryFn: () => bookApi.period(period as string, headers), enabled: !!period });

export const useBookLedger = (branchKey: string, params: { period?: string; page?: number; limit?: number; cashAccountId?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['book-ledger', branchKey, params], queryFn: () => bookApi.ledger(params, headers) });

export const useBookCashSummary = (branchKey: string, params: { period?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['book-cash-summary', branchKey, params], queryFn: () => bookApi.cashSummary(params, headers) });

export const useBookProfitSummary = (branchKey: string, params: { period?: string }, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['book-profit-summary', branchKey, params], queryFn: () => bookApi.profitSummary(params, headers) });

export const useTaxSettings = (branchKey: string, headers?: BranchHeaders) =>
  useQuery({ queryKey: ['tax-settings', branchKey], queryFn: () => bookApi.taxSettings(headers) });

export const useBookMutations = () => {
  const qc = useQueryClient();
  const invalSummaries = () => {
    qc.invalidateQueries({ queryKey: ['book-cash-summary'] });
    qc.invalidateQueries({ queryKey: ['book-profit-summary'] });
    qc.invalidateQueries({ queryKey: ['book-ledger'] });
    qc.invalidateQueries({ queryKey: ['cash-accounts'] });
    qc.invalidateQueries({ queryKey: ['cash-transactions'] });
  };
  return {
    updateTaxSetting: useMutation({
      mutationFn: ({ body, headers }: { body: { taxRatePercent: number; sourceCashAccountId: string; reserveCashAccountId: string }; headers?: BranchHeaders }) =>
        bookApi.updateTaxSetting(body, headers),
      onSuccess: () => { toast('Pengaturan pajak disimpan'); qc.invalidateQueries({ queryKey: ['tax-settings'] }); },
      onError: (e: unknown) => notifyApiError(e),
    }),
    retryTaxReserve: useMutation({
      mutationFn: ({ headers }: { headers?: BranchHeaders }) => bookApi.retryTaxReserve(headers),
      onSuccess: () => { invalSummaries(); },
    }),
    closePeriod: useMutation({
      mutationFn: ({ period, headers }: { period: string; headers?: BranchHeaders }) => bookApi.closePeriod(period, headers),
      onSuccess: () => {
        toast('Periode pembukuan ditutup');
        qc.invalidateQueries({ queryKey: ['book-periods'] });
        qc.invalidateQueries({ queryKey: ['book-period'] });
        invalSummaries();
      },
    }),
  };
};
