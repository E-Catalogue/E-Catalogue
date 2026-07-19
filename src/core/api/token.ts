// Penyimpanan token (localStorage). Akses token & refresh token disimpan terpisah.

const ACCESS_KEY = 'gm_access_token';
const REFRESH_KEY = 'gm_refresh_token';

export const getAccessToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null;

export const getRefreshToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
