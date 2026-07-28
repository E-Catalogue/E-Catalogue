import { useEffect } from 'react';
import { usePublicSiteSettings } from '@/features/landing/landing.hooks';
import { applyPrimaryColor } from '@/core/utils/theme';

/**
 * Menerapkan warna utama dari Site Settings ke CSS variables root, sehingga tema web (admin + publik)
 * mengikuti pilihan warna dinamis. Endpoint publik tanpa auth, jadi aman dipasang global.
 */
export const ThemeColorApplier = () => {
  const { data } = usePublicSiteSettings();
  useEffect(() => {
    applyPrimaryColor(data?.primaryColor);
  }, [data?.primaryColor]);
  return null;
};
