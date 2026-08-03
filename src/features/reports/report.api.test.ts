import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/core/api/client', () => ({ apiClient: mocks }));
import { reportApi } from './report.api';

describe('reportApi', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.get.mockResolvedValue({ data: { success: true, data: {} }, headers: {} }); });

  it('mengirim filter dan branch scope ke laporan closing', async () => {
    const params = { dateFrom: '2026-08-01', dateTo: '2026-08-31', paymentType: 'KREDIT' as const };
    const headers = { 'X-Branch-Id': 'branch-1' };
    await reportApi.closing(params, headers);
    expect(mocks.get).toHaveBeenCalledWith('/reports/closing', { params, headers });
  });

  it('mengirim periode ke laporan pengeluaran', async () => {
    const params = { period: '2026-08' };
    await reportApi.expenses(params);
    expect(mocks.get).toHaveBeenCalledWith('/reports/expenses', { params, headers: undefined });
  });
});
