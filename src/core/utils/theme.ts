// Tema warna dinamis: warna utama disimpan di Site Settings (hex), lalu diterapkan ke CSS variables
// `--color-primary`, `--color-primary-dark`, `--color-primary-light` agar seluruh web ikut berubah.

export const DEFAULT_PRIMARY = '#D97757';

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

const parseHex = (hex: string): [number, number, number] | null => {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;

/** Campur warna dengan hitam/putih. ratio 0..1 (0 = warna asli, 1 = target). */
const mix = ([r, g, b]: [number, number, number], target: number, ratio: number) =>
  toHex(r + (target - r) * ratio, g + (target - g) * ratio, b + (target - b) * ratio);

/** Terapkan warna utama + turunannya (dark/light) ke root document. */
export const applyPrimaryColor = (hex?: string | null) => {
  const rgb = parseHex(hex || DEFAULT_PRIMARY) ?? parseHex(DEFAULT_PRIMARY)!;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', toHex(...rgb));
  root.style.setProperty('--color-primary-dark', mix(rgb, 0, 0.22)); // ~22% lebih gelap
  root.style.setProperty('--color-primary-light', mix(rgb, 255, 0.9)); // tint sangat terang
};

export const isValidHex = (hex: string) => /^#([0-9a-fA-F]{6})$/.test(hex.trim());
