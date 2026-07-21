import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  post: vi.fn(), patch: vi.fn(), put: vi.fn(), get: vi.fn(),
}));

vi.mock('@/core/api/client', () => ({ apiClient: mocks }));

import { targetApi } from './target.api';

describe('targetApi kontrak backend aktif', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.post.mockResolvedValue({ data: { success: true, message: 'ok', data: {} } });
  });

  it('create memakai X-Branch-Id dan tidak menyisipkan branchId ke body', async () => {
    const body = { period: '2026-07', unitTarget: 10, revenueTarget: 2_000_000_000 };
    const headers = { 'X-Branch-Id': 'branch-1' };
    await targetApi.create(body, headers);
    expect(mocks.post).toHaveBeenCalledWith('/targets/branches', body, { headers });
    expect(mocks.post.mock.calls[0][1]).not.toHaveProperty('branchId');
  });

  it('activate mengirim request tanpa body bisnis', async () => {
    const headers = { 'X-Branch-Id': 'branch-1' };
    await targetApi.activate('target-1', headers);
    expect(mocks.post).toHaveBeenCalledWith('/targets/branches/target-1/activate', undefined, { headers });
  });
});
