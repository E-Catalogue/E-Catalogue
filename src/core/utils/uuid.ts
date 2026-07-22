/**
 * `crypto.randomUUID()` HANYA tersedia di secure context (HTTPS atau `localhost`) — kalau app
 * diakses lewat IP LAN via HTTP biasa (mis. `http://10.x.x.x:5173`, dipakai tim ini untuk testing
 * lintas device), `crypto.randomUUID` tidak ada sama sekali dan langsung throw
 * `TypeError: crypto.randomUUID is not a function`. Fallback manual RFC4122-v4 di bawah TIDAK
 * kriptografis kuat (pakai `Math.random`), tapi cukup untuk keperluan FE ini (idempotency-key
 * best-effort, modal-stack id, toast id) — bukan untuk keamanan.
 */
export const safeRandomUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
