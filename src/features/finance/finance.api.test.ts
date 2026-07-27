import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));

vi.mock('@/core/api/client', () => ({ apiClient: mocks }));

import { cashFlowReportApi, payrollApi } from './finance.api';

describe('payrollApi incentives', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.put.mockResolvedValue({ data: { success: true, data: {} } });
  });

  it('menyimpan insentif melalui endpoint settlement sales order', async () => {
    const headers = { 'X-Branch-Id': 'branch-1' };

    await payrollApi.incentives.setForOrder('order-1', { amount: 5_000_000 }, headers);

    expect(mocks.put).toHaveBeenCalledWith(
      '/lead-orders/order-1/sales-incentive',
      { amount: 5_000_000 },
      { headers },
    );
  });
});

describe('cashFlowReportApi', () => {
  it('mengambil laporan arus kas dengan filter periode dan branch context', async () => {
    const headers = { 'X-Branch-Id': 'branch-1' };
    const params = { dateFrom: '2026-07-01', dateTo: '2026-07-31' };
    mocks.get.mockResolvedValue({ data: { success: true, data: { summary: {} } } });

    await cashFlowReportApi.get(params, headers);

    expect(mocks.get).toHaveBeenCalledWith('/cash-flow/report', { params, headers });
  });
});
