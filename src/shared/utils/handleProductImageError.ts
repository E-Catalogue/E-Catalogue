import type { SyntheticEvent } from 'react';
import { DEFAULT_PRODUCT_IMAGE } from '@/shared/constants';

// Handler onError untuk <img> produk: bila gambar gagal dimuat (404/timeout),
// ganti ke gambar default. Guard mencegah loop bila default-nya sendiri gagal.
export const handleProductImageError = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src !== DEFAULT_PRODUCT_IMAGE) img.src = DEFAULT_PRODUCT_IMAGE;
};
