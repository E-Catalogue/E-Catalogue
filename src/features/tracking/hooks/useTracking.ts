import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackingApi } from '../api/tracking.api';
import { useOrderDetail } from '@/features/order/hooks/useOrderDetail';
import type { OrderType } from '@/features/order/api/transaction.schema';
import type { OrderStatus } from '../schema';

export const useTracking = () => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | OrderType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const formatRupiah = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  // List semua order (GET /sales/order)
  const ordersQuery = useQuery({
    queryKey: ['tracking-orders'],
    queryFn: trackingApi.getAll,
  });

  // Detail order terpilih (GET /sales/order/{id})
  const orderDetailQuery = useOrderDetail(selectedOrderId);

  const filteredOrders = useMemo(() => {
    const list = ordersQuery.data ?? [];
    const search = searchQuery.trim().toLowerCase();

    return list.filter(order => {
      const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchType = typeFilter === 'ALL' || order.type === typeFilter;
      const matchSearch = !search
        || order.orderNo.toLowerCase().includes(search)
        || order.ordererName.toLowerCase().includes(search)
        || order.queueNo.toLowerCase().includes(search);
      return matchStatus && matchType && matchSearch;
    });
  }, [ordersQuery.data, statusFilter, typeFilter, searchQuery]);

  return {
    orders: filteredOrders,
    totalOrders: ordersQuery.data?.length ?? 0,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    refetch: ordersQuery.refetch,

    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    searchQuery, setSearchQuery,

    selectedOrderId, setSelectedOrderId,
    orderDetail: orderDetailQuery.data,
    isDetailLoading: orderDetailQuery.isLoading,

    formatRupiah,
  };
};
