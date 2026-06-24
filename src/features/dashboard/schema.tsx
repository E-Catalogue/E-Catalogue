export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  soldCount: number;
  revenue: number;
  image: string;
}

export interface RecentTransaction {
  id: string;
  time: string;
  customerName: string;
  total: number;
  status: 'success' | 'pending' | 'failed';
  paymentMethod: string;
}