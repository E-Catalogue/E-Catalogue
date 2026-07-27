import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));

vi.mock('@/core/api/client', () => ({ apiClient: mocks }));

import { payrollApi } from './finance.api';

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
