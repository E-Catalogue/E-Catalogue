import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../api/transaction.api';

// Ambil detail order (GET /sales/order/{id}). Aktif hanya bila orderId tersedia.
export const useOrderDetail = (orderId: string | null) => {
  return useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => transactionApi.getDetail(orderId as string),
    enabled: !!orderId,
  });
};
