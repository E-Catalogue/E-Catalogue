import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { DashboardOverview } from './dashboard.types';

export const dashboardApi = {
  /**
   * GET /dashboard?period=YYYY-MM — satu-satunya query param yang divalidasi backend
   * (lihat dashboard.service.js `period()`; nilai tak valid/absen fallback ke bulan berjalan).
   * `headers` dipakai untuk X-Branch-Id (lihat useBranchScope) saat Owner memilih cabang konkret.
   */
  overview: (params: { period: string }, headers?: Record<string, string>) =>
    apiClient
      .get<ApiResponse<DashboardOverview>>('/dashboard', { params, headers })
      .then((r) => r.data.data),
};
