// Penyimpanan token (localStorage). Akses token & refresh token disimpan terpisah.

export const ACCESS_TOKEN_STORAGE_KEY = 'gm_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'gm_refresh_token';

export const getAccessToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;

export const getRefreshToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) : null;

export const setTokens = (accessToken: string, refreshToken: string) => {
  // Access token menjadi penanda commit lintas-tab. Simpan refresh token lebih
  // dahulu agar tab lain yang menerima event access selalu melihat pasangan baru.
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
};

export const clearTokens = () => {
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};
