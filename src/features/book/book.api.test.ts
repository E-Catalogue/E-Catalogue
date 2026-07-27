import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/core/api/client', () => ({ apiClient: mocks }));

import { bookApi } from './book.api';

describe('bookApi close preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.get.mockResolvedValue({ data: { success: true, data: {} } });
  });

  it('meminta preview close dengan cabang konkret', async () => {
    const headers = { 'X-Branch-Id': 'branch-1' };

    await bookApi.closePreview('2026-06', headers);

    expect(mocks.get).toHaveBeenCalledWith('/books/periods/2026-06/close-preview', { headers });
  });
});
