import { useMutation } from '@tanstack/react-query';
import { transactionApi } from '../api/transaction.api';

// Mutation untuk membatalkan order (PATCH /sales/order/{id}/cancel). Hanya untuk status PENDING.
export const useCancelOrder = () => {
  return useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes?: string }) =>
      transactionApi.cancelOrder(orderId, notes),
  });
};
