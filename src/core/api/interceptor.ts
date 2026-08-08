import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { apiClient, API_BASE_URL } from './client';
import { ACCESS_TOKEN_STORAGE_KEY, getAccessToken, getRefreshToken, setTokens } from './token';
import { coordinateTokenRefresh } from './refreshCoordinator';
import { store } from '@/app/store';
import { queryClient } from '@/app/queryClient';
import { setCredentials, setSession, clearCredentials } from '@/app/store/authSlice';
import { showToast } from '@/app/store/uiSlice';
import { classifyAxiosError } from './errorHandler';
import type { ApiResponse, ApiErrorBody } from './types';
import type { AuthPayload, MePayload } from '@/features/auth/types';
import {
  consumeMutationConfirmationLease,
  requestTransportConfirmation,
} from './mutationConfirmation';

const isAuthEndpoint = (url?: string) =>
  !!url && (url.includes('/auth/login') || url.includes('/auth/refresh'));

// Kode 401 yang menandakan sesi sudah berakhir — jangan coba refresh, langsung logout.
const SESSION_ENDED_CODES = new Set([
  'INVALID_REFRESH_TOKEN',
  'SESSION_REVOKED',
  'SESSION_EXPIRED',
  'SESSION_BRANCH_MISMATCH',
  'USER_INACTIVE',
  'ROLE_INACTIVE',
]);

const errorCode = (error: AxiosError) =>
  (error.response?.data as ApiErrorBody | undefined)?.error?.code;

// ---- Request: lampirkan bearer token ----
type ConfirmedRequestConfig = InternalAxiosRequestConfig & { _mutationConfirmed?: boolean };

const isPersistentMutation = (config: InternalAxiosRequestConfig) => {
  const method = config.method?.toUpperCase();
  if (!method || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return false;
  const url = config.url ?? '';
  // POST preview dipakai hanya untuk menghitung simulasi dari payload dan tidak
  // menyimpan data; jangan munculkan konfirmasi "Simpan Perubahan".
  return !url.includes('/auth/')
    && !url.includes('/public/credit-simulation/calculate')
    && !url.includes('/pricing-preview');
};

const mutationLabel = (method?: string) => method?.toUpperCase() === 'DELETE' ? 'Hapus Data' : 'Simpan Perubahan';

// Role dengan akses lintas-cabang (global). Selain ini, user selalu terikat branch-nya sendiri.
const GLOBAL_BRANCH_ROLE_CODES = new Set(['OWNER', 'ADMIN']);

/**
 * Cabang aktif dari SATU sumber kebenaran global (Redux `branchSlice` + `auth`).
 * - OWNER/ADMIN: `selectedBranchId` dari header switcher (bisa `null` = "semua cabang", hanya READ).
 * - Role lain: selalu `user.branch.id`.
 * Dipakai interceptor untuk melampirkan `X-Branch-Id` OTOMATIS ke semua request — jadi tiap modul
 * branch-scoped (unit, lead, rekondisi, test-drive, finance, dst.) tidak perlu meneruskan header
 * manual dan tidak ada lagi celah "lupa kirim header" (penyebab error BRANCH_CONTEXT_REQUIRED).
 */
const resolveActiveBranchId = (): string | null => {
  const state = store.getState();
  const roleCode = state.auth.user?.role?.code;
  if (GLOBAL_BRANCH_ROLE_CODES.has(roleCode ?? '')) {
    return state.branch.selectedBranchId ?? null;
  }
  return state.auth.user?.branch?.id ?? null;
};

apiClient.interceptors.request.use(async (rawConfig) => {
  const config = rawConfig as ConfirmedRequestConfig;
  if (isPersistentMutation(config) && !config._mutationConfirmed) {
    if (!consumeMutationConfirmationLease()) {
      const approved = await requestTransportConfirmation({
        title: mutationLabel(config.method),
        message: 'Lanjutkan aksi ini? Perubahan akan disimpan ke server.',
        confirmLabel: config.method?.toUpperCase() === 'DELETE' ? 'Hapus' : 'Simpan',
      });
      // ConfirmDialog transport juga menghasilkan lease; buang agar tidak bocor ke request berikutnya.
      consumeMutationConfirmationLease();
      if (!approved) throw new axios.CanceledError('Aksi dibatalkan pengguna');
    }
    config._mutationConfirmed = true;
  }
  const token = getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;

  // Lampirkan X-Branch-Id dari state global bila belum di-set eksplisit oleh pemanggil.
  if (config.headers && !config.headers.has('X-Branch-Id')) {
    const branchId = resolveActiveBranchId();
    if (branchId) config.headers.set('X-Branch-Id', branchId);
  }
  return config;
});

// ---- Response: auto-refresh saat 401 (dengan antrean & rotation) ----
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const flushQueue = (error: unknown, token: string | null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token as string)));
  queue = [];
};

const forceLogout = (error: unknown) => {
  store.dispatch(clearCredentials());
  queryClient.clear(); // buang cache profil & data lain milik sesi lama
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

const isEndedSessionError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;
  return SESSION_ENDED_CODES.has(errorCode(error) ?? '');
};

// Sinkronkan logout dan login baru antartab. Event access token menjadi penanda
// bahwa pasangan access/refresh token sudah selesai ditulis.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', async (event) => {
    if (event.key !== ACCESS_TOKEN_STORAGE_KEY) return;
    if (!event.newValue) {
      store.dispatch(clearCredentials());
      queryClient.clear();
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
      return;
    }
    if (store.getState().auth.isAuthenticated) return;
    try {
      const response = await axios.get<ApiResponse<MePayload>>(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${event.newValue}` },
      });
      if (getAccessToken() === event.newValue) store.dispatch(setSession(response.data.data));
    } catch {
      // Request normal berikutnya akan menentukan apakah token perlu di-refresh
      // atau session memang sudah berakhir.
    }
  });
}

// Satu pintu: semua error response melewati handler ini.
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // A. Otorisasi (401) pada endpoint terproteksi.
    if (status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
      const code = errorCode(error);
      // Sesi sudah berakhir (refresh tidak akan menolong) → langsung logout.
      if (SESSION_ENDED_CODES.has(code ?? '')) return forceLogout(error);
      // Hanya access token kedaluwarsa yang bisa dipulihkan via refresh.
      // (Kode tak dikenal/absen diperlakukan sebagai access token kedaluwarsa demi ketahanan.)
      if (code && code !== 'INVALID_ACCESS_TOKEN') return Promise.reject(error);

      const refreshToken = getRefreshToken();
      if (!refreshToken) return forceLogout(error);

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;
      const failedAccessToken = getAccessToken();
      try {
        const accessToken = await coordinateTokenRefresh(failedAccessToken, async () => {
          const latestRefreshToken = getRefreshToken();
          if (!latestRefreshToken) throw new Error('Refresh token tidak tersedia');
          // Pakai axios polos agar tidak kena interceptor (hindari rekursi).
          const res = await axios.post<ApiResponse<AuthPayload>>(`${API_BASE_URL}/auth/refresh`, { refreshToken: latestRefreshToken });
          const data = res.data.data;
          setTokens(data.accessToken, data.refreshToken);
          store.dispatch(setCredentials(data));
          return data.accessToken;
        });
        flushQueue(null, accessToken);
        if (original.headers) original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (e) {
        const latestAccessToken = getAccessToken();
        if (latestAccessToken && latestAccessToken !== failedAccessToken) {
          flushQueue(null, latestAccessToken);
          if (original.headers) original.headers.Authorization = `Bearer ${latestAccessToken}`;
          return apiClient(original);
        }
        flushQueue(e, null);
        if (isEndedSessionError(e) || !getRefreshToken()) return forceLogout(e);
        const classified = axios.isAxiosError(e) ? classifyAxiosError(e) : null;
        if (classified) store.dispatch(showToast(classified));
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    // B. Error infrastruktur (network/timeout/5xx/parsing) → tampilkan modal global.
    //    Error bisnis 4xx dikembalikan apa adanya untuk ditangani komponen/hook.
    const classified = classifyAxiosError(error);
    if (classified) store.dispatch(showToast(classified));

    return Promise.reject(error);
  },
);
