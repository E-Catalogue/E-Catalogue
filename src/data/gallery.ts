import type { Unit } from './types';

// Foto interior/detail generik untuk melengkapi galeri tiap unit (demo).
const GENERIC = [
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop', // interior dashboard
  'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop', // wheel/exterior
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop', // rear
  'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop', // seats
];

/** Galeri foto untuk satu unit: foto utama + beberapa angle generik. */
export const getGallery = (unit: Unit): string[] => [unit.image, ...GENERIC];
