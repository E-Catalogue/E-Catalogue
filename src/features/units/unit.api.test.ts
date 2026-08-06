import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));

vi.mock('@/core/api/client', () => ({ apiClient: mocks }));

import { unitApi } from './unit.api';

describe('unitApi daftar inventori', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.get.mockResolvedValue({ data: { success: true, data: [], meta: {} } });
  });

  it('meneruskan pagination dan filter investor ke daftar unit', async () => {
    const params = { page: 2, limit: 15, statusUnits: 'INVENTORY,HOLD', fundingSource: 'INVESTOR' as const, investorId: 'investor-1' };

    await unitApi.list(params);

    expect(mocks.get).toHaveBeenCalledWith('/units', { params });
  });

  it('mengambil lookup filter inventori yang ringan', async () => {
    await unitApi.getInventoryFilters();

    expect(mocks.get).toHaveBeenCalledWith('/units/lookups/inventory-filters', { headers: undefined });
  });
});
