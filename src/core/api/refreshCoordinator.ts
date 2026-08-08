import { getAccessToken } from './token';

const REFRESH_LOCK_NAME = 'gm-auth-refresh';

/**
 * Menjamin hanya satu tab yang merotasi refresh token pada satu waktu.
 * Setelah memperoleh lock, token dibaca ulang karena tab lain mungkin sudah
 * menyelesaikan refresh ketika tab ini masih menunggu.
 */
export async function coordinateTokenRefresh(
  failedAccessToken: string | null,
  refresh: () => Promise<string>,
): Promise<string> {
  const execute = async () => {
    const latestAccessToken = getAccessToken();
    if (latestAccessToken && latestAccessToken !== failedAccessToken) return latestAccessToken;
    return refresh();
  };

  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(REFRESH_LOCK_NAME, execute);
  }

  // Browser lama tetap dilindungi antrean per-tab di interceptor.
  return execute();
}
