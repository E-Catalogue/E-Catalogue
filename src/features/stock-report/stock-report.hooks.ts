import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { StockOverview, StockUnitRow, StockMovement } from './stock-report.types';

export const useStockOverview = (params: Record<string, unknown>) =>
  useQuery({
    queryKey: ['stock-report', 'overview', params],
    queryFn: () => apiClient.get<ApiResponse<StockOverview>>('/stock-report/overview', { params }).then((r) => r.data.data),
    placeholderData: keepPreviousData,
  });

export const useStockUnits = (params: Record<string, unknown>, enabled = true) =>
  useQuery({
    queryKey: ['stock-report', 'units', params],
    queryFn: () => apiClient.get<ApiResponse<StockUnitRow[]>>('/stock-report/units', { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useStockMovements = (params: Record<string, unknown>, enabled = true) =>
  useQuery({
    queryKey: ['stock-report', 'movements', params],
    queryFn: () => apiClient.get<ApiResponse<StockMovement[]>>('/stock-report/movements', { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
    enabled,
  });
