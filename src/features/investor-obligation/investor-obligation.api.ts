import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  InvestorObligation,
  InvestorObligationGeneratePayload,
  InvestorObligationListParams,
  InvestorObligationPayPayload,
  InvestorObligationPayResult,
  InvestorObligationReversePayload,
  InvestorPayment,
} from './investor-obligation.types';

/** Header opsional `{ 'X-Branch-Id': branchId }` — wajib diisi caller untuk mutation Owner (README §8). */
type BranchHeaders = Record<string, string> | undefined;

export const investorObligationApi = {
  list: async (params?: InvestorObligationListParams, headers?: BranchHeaders) => {
    const res = await apiClient.get<ApiResponse<InvestorObligation[]>>('/investor-obligations', { params, headers });
    return res.data;
  },

  get: async (id: string, headers?: BranchHeaders) => {
    const res = await apiClient.get<ApiResponse<InvestorObligation>>(`/investor-obligations/${id}`, { headers });
    return res.data;
  },

  generate: async (data: InvestorObligationGeneratePayload, headers?: BranchHeaders) => {
    const res = await apiClient.post<ApiResponse<InvestorObligation[]>>('/investor-obligations/generate', data, { headers });
    return res.data;
  },

  listPayments: async (id: string, headers?: BranchHeaders) => {
    const res = await apiClient.get<ApiResponse<InvestorPayment[]>>(`/investor-obligations/${id}/payments`, { headers });
    return res.data;
  },

  /** Wajib header `Idempotency-Key` (README §14) — dikirim terpisah dari branch header agar lifecycle-nya eksplisit di caller. */
  pay: async (id: string, data: InvestorObligationPayPayload, headers: BranchHeaders, idempotencyKey: string) => {
    const res = await apiClient.post<ApiResponse<InvestorObligationPayResult>>(`/investor-obligations/${id}/payments`, data, {
      headers: { ...headers, 'Idempotency-Key': idempotencyKey },
    });
    return res.data;
  },

  /**
   * Response `data` adalah InvestorObligation yang sudah diperbarui (bukan payment reversal) —
   * dikonfirmasi dari investor-obligation.service.js `reversePayment()`: `return repository.findById(obligationId, scope, tx)`.
   * Ini menyimpang dari prosa PRD ("envelope berisi payment reversal lengkap"); kode backend menang.
   */
  reversePayment: async (id: string, paymentId: string, data: InvestorObligationReversePayload, headers?: BranchHeaders) => {
    const res = await apiClient.post<ApiResponse<InvestorObligation>>(`/investor-obligations/${id}/payments/${paymentId}/reverse`, data, { headers });
    return res.data;
  },
};
