import { useMutation } from '@tanstack/react-query';
import { transactionApi } from '../api/transaction.api';

// Mutation untuk membuat order baru (POST /sales/order)
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: transactionApi.createOrder,
  });
};
