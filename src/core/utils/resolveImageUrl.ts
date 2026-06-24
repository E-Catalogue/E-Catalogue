// Backend mengirim imageUrl relatif (mis. "/images/products/foo.jpg").
// Helper ini mengubahnya menjadi URL absolut berdasarkan origin server API.

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

// Ambil origin server (tanpa path /api/v1) dari base URL API.
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
})();

export const resolveImageUrl = (path?: string | null): string => {
  if (!path) return '';
  // Sudah absolut (http/https/data) -> pakai apa adanya.
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  // Relatif -> gabungkan dengan origin server.
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalized}`;
};
