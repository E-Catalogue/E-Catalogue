import { beforeEach, describe, expect, it, vi } from 'vitest';
import { coordinateTokenRefresh } from './refreshCoordinator';
import { clearTokens, setTokens } from './token';

class SerialLockManager {
  private queue: Promise<unknown> = Promise.resolve();

  request<T>(_name: string, callback: () => Promise<T>): Promise<T> {
    const result = this.queue.then(callback);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }
}

describe('koordinasi refresh token lintas tab', () => {
  beforeEach(() => {
    clearTokens();
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: new SerialLockManager(),
    });
  });

  it('hanya merotasi sekali untuk dua tab yang gagal dengan access token sama', async () => {
    setTokens('access-lama', 'refresh-lama');
    const refresh = vi.fn(async () => {
      await Promise.resolve();
      setTokens('access-baru', 'refresh-baru');
      return 'access-baru';
    });

    const [first, second] = await Promise.all([
      coordinateTokenRefresh('access-lama', refresh),
      coordinateTokenRefresh('access-lama', refresh),
    ]);

    expect(first).toBe('access-baru');
    expect(second).toBe('access-baru');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('memakai token terbaru tanpa refresh ulang setelah menunggu lock', async () => {
    setTokens('access-baru', 'refresh-baru');
    const refresh = vi.fn();

    await expect(coordinateTokenRefresh('access-lama', refresh)).resolves.toBe('access-baru');
    expect(refresh).not.toHaveBeenCalled();
  });
});
