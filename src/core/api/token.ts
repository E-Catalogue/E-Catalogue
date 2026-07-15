/**
 * Penyimpanan access token Tenant Web.
 * Refresh token dikelola backend lewat cookie HttpOnly (lihat PRD tenant auth),
 * jadi tidak pernah disimpan di sisi klien.
 */
const ACCESS_KEY = 'tenant_access_token';

export const getAccessToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null;

export const setTokens = (accessToken: string) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
};
