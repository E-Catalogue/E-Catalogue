import { useState, useEffect } from 'react';
import type { DashboardMetrics, TopProduct, RecentTransaction } from '../schema';

export const useDashboardMetrics = () => {
  const [isLoading, setIsLoading] = useState(true);

  const formatRupiah = (price: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  // DUMMY DATA
  const metrics: DashboardMetrics = {
    totalRevenue: 4250000,
    revenueGrowth: 12.5,
    totalOrders: 86,
    averageOrderValue: 49418,
  };

  const topProducts: TopProduct[] = [
    { id: '1', name: 'Kopi Susu Gula Aren', category: 'Coffee', soldCount: 42, revenue: 1050000, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300' },
    { id: '2', name: 'Paket Ngopi Berdua', category: 'Bundle', soldCount: 28, revenue: 1260000, image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=300' },
    { id: '3', name: 'Caramel Macchiato', category: 'Coffee', soldCount: 15, revenue: 525000, image: 'https://images.unsplash.com/photo-1689358931339-cf2ccd39e7b1?q=80&w=300' },
    { id: '4', name: 'Croissant Butter', category: 'Snack', soldCount: 12, revenue: 240000, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300' },
  ];

  const recentTransactions: RecentTransaction[] = [
    { id: 'ORD-2504-A1B2', time: '14:30 WIB', customerName: 'Bpk. Dimas', total: 120000, status: 'success', paymentMethod: 'QRIS' },
    { id: 'ORD-2504-C3D4', time: '14:15 WIB', customerName: 'Walk-in', total: 30000, status: 'success', paymentMethod: 'Cash' },
    { id: 'ORD-2504-E5F6', time: '13:50 WIB', customerName: 'Ibu Sarah', total: 85000, status: 'success', paymentMethod: 'Debit' },
    { id: 'ORD-2504-G7H8', time: '13:42 WIB', customerName: 'Walk-in', total: 45000, status: 'success', paymentMethod: 'Cash' },
    { id: 'ORD-2504-I9J0', time: '13:10 WIB', customerName: 'Andi', total: 150000, status: 'success', paymentMethod: 'QRIS' },
  ];

  useEffect(() => {
    // Simulasi loading API
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return {
    metrics,
    topProducts,
    recentTransactions,
    isLoading,
    formatRupiah
  };
};