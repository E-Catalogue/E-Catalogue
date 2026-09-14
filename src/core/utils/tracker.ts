import { API_BASE_URL } from '@/core/api/client';
import { getAccessToken } from '@/core/api/token';

const VISITOR_KEY = 'ecat_visitor_id';
const SESSION_KEY = 'ecat_session_token';

const EXCLUDED_PAGE_PREFIXES = [
  '/login',
  '/auth',
  '/dashboard',
  '/inventory',
  '/crm',
  '/analisispelanggan',
  '/access-control',
  '/master',
  '/cashflow',
  '/manager',
  '/pembayaran',
  '/pengeluaran',
  '/payroll',
  '/targets',
  '/test-drive',
  '/vendor',
  '/merek',
  '/branch',
  '/pembukuan',
  '/pengaturan',
  '/cms',
  '/laporan',
  '/admin',
];

export function isEligibleForTracking(pagePath?: string): boolean {
  if (typeof window === 'undefined') return false;
  // Jangan catat jika user sedang login (admin/staff)
  if (getAccessToken()) return false;

  const p = (pagePath || window.location.pathname || '').toLowerCase().trim();
  if (!p) return false;
  if (p === '/login' || p.startsWith('/login/') || p.startsWith('/auth/')) return false;
  for (const prefix of EXCLUDED_PAGE_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`) || p.startsWith(`${prefix}-`)) {
      return false;
    }
  }
  return true;
}

export type TrackingEventType =
  | 'PAGE_VIEW'
  | 'UNIT_VIEW'
  | 'WHATSAPP_CLICK'
  | 'PHONE_CLICK'
  | 'SHARE_CLICK';

export interface TrackPayload {
  eventType: TrackingEventType;
  pagePath?: string;
  pageTitle?: string;
  unitId?: string;
  referrer?: string;
  durationSeconds?: number;
  meta?: Record<string, unknown>;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `vis_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    try {
      localStorage.setItem(VISITOR_KEY, id);
    } catch {
      // ignore storage quota / private mode errors
    }
  }
  return id;
}

export function getSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem(SESSION_KEY);
  if (!token) {
    token = `ses_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    try {
      sessionStorage.setItem(SESSION_KEY, token);
    } catch {
      // ignore storage quota / private mode errors
    }
  }
  return token;
}

function getDeviceType(): 'MOBILE' | 'DESKTOP' | 'TABLET' {
  if (typeof window === 'undefined') return 'DESKTOP';
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'TABLET';
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'MOBILE';
  return 'DESKTOP';
}

export function trackEvent(payload: TrackPayload): void {
  if (typeof window === 'undefined') return;

  const pagePath = payload.pagePath || window.location.pathname;
  if (!isEligibleForTracking(pagePath)) return;

  const visitorId = getVisitorId();
  const sessionToken = getSessionToken();
  const pageTitle = payload.pageTitle || document.title;
  const referrer = payload.referrer !== undefined ? payload.referrer : document.referrer;
  const deviceType = getDeviceType();

  const body = {
    visitorId,
    sessionToken,
    eventType: payload.eventType,
    pagePath,
    pageTitle,
    unitId: payload.unitId || undefined,
    referrer: referrer || undefined,
    deviceType,
    durationSeconds: payload.durationSeconds || 0,
    meta: payload.meta,
  };

  const endpoint = `${API_BASE_URL}/public/tracking/events`;
  const jsonString = JSON.stringify(body);

  // 1. Gunakan sendBeacon bila didukung agar tidak terputus saat pengunjung berganti halaman
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    } catch {
      // Fallback ke native fetch
    }
  }

  // 2. Fallback ke native fetch dengan keepalive (tanpa axios interceptor konfirmasi modal)
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonString,
    keepalive: true,
  }).catch(() => {
    // Silent fail
  });
}
