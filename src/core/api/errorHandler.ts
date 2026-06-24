import axios, { type AxiosError } from 'axios';

// Kategori error infrastruktur yang ditangani secara global (1 pintu).
// Error bisnis (400/403/404/422 dengan body JSON) TIDAK termasuk — itu dibiarkan
// ditangani komponen/hook React Query.
export type GlobalErrorType =
  | 'network' // tidak ada koneksi / server tak terjangkau / kemungkinan CORS
  | 'timeout' // request melebihi batas waktu (koneksi lambat)
  | 'server' // 5xx murni dari aplikasi server
  | 'maintenance' // 502 / 503 / 504 (gateway down / overload / maintenance)
  | 'parsing' // response bukan JSON (HTML/teks) — biasanya proxy/gateway error
  | 'auth' // sesi tidak valid / kedaluwarsa
  | 'general';

export interface GlobalErrorPayload {
  title: string;
  message: string;
  type: GlobalErrorType;
}

// Cek apakah body response berupa HTML / non-JSON (mis. halaman error Nginx).
const isNonJsonResponse = (error: AxiosError): boolean => {
  const headers = error.response?.headers as Record<string, string> | undefined;
  const contentType = String(headers?.['content-type'] ?? '').toLowerCase();
  const data = error.response?.data;

  if (contentType && !contentType.includes('application/json')) {
    // Selain JSON dianggap non-JSON, kecuali memang kosong/tidak ada content-type.
    if (contentType.includes('text/html') || contentType.includes('text/plain')) return true;
  }
  // Fallback: data string yang diawali tag HTML.
  if (typeof data === 'string' && /^\s*</.test(data)) return true;
  return false;
};

/**
 * Mengklasifikasikan AxiosError menjadi payload error global yang jelas.
 * Return `null` jika error sebaiknya ditangani komponen (mis. validasi 4xx),
 * atau jika request memang sengaja dibatalkan.
 */
export const classifyAxiosError = (error: AxiosError): GlobalErrorPayload | null => {
  // 0. Request dibatalkan (mis. komponen unmount) -> jangan tampilkan apa pun.
  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
    return null;
  }

  // 1. Timeout (koneksi lambat / server tidak merespons tepat waktu).
  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
    return {
      type: 'timeout',
      title: 'Koneksi Lambat',
      message:
        'Permintaan memakan waktu terlalu lama dan dihentikan. Periksa kecepatan jaringan kasir Anda, lalu coba lagi.',
    };
  }

  // 2. Tidak ada response sama sekali (network down / server mati / diblokir CORS).
  //    Di browser, error CORS & koneksi putus sama-sama tidak menyertakan response.
  if (!error.response) {
    return {
      type: 'network',
      title: 'Koneksi Terputus',
      message:
        'Tidak dapat terhubung ke server. Mohon periksa koneksi internet (Wi-Fi/Kabel LAN). Bila jaringan normal, kemungkinan server sedang mati atau permintaan diblokir (CORS).',
    };
  }

  const status = error.response.status;

  // 3. Response bukan JSON (HTML/teks) -> biasanya error gateway/proxy, bukan API.
  if (isNonJsonResponse(error)) {
    return {
      type: 'parsing',
      title: 'Respons Tidak Dikenali',
      message:
        'Server membalas dengan format yang tidak valid (bukan data JSON). Kemungkinan ada gangguan pada gateway/proxy. Mohon coba beberapa saat lagi.',
    };
  }

  // 4. Gateway bermasalah / maintenance / overload.
  if (status === 502 || status === 503 || status === 504) {
    return {
      type: 'maintenance',
      title: 'Server Sedang Sibuk',
      message:
        'Server sedang dalam pemeliharaan atau menerima beban tinggi. Mohon tunggu sebentar lalu coba kembali.',
    };
  }

  // 5. Kesalahan server umum (5xx).
  if (status >= 500) {
    return {
      type: 'server',
      title: 'Kendala Sistem',
      message:
        'Terjadi kendala pada server utama. Tim IT kami sedang menanganinya. Mohon coba beberapa saat lagi.',
    };
  }

  // 6. 4xx bisnis (400/403/404/422 dll) -> biarkan komponen yang menangani.
  return null;
};
