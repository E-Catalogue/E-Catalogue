// Foto interior/detail generik untuk melengkapi galeri tiap unit (demo).
const GENERIC = [
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop',
];

type GalleryImage = string | { filename?: string | null } | null | undefined;
interface GalleryUnit { image?: GalleryImage; images?: GalleryImage[] }

const imagePath = (image: GalleryImage) => typeof image === 'string'
  ? image
  : image?.filename ? `/uploads/unit/${image.filename}` : '';

export const getGallery = (unit?: GalleryUnit | null): string[] => {
  if (!unit) return GENERIC;
  const mainImg = imagePath(unit.image);
  const extraImgs = Array.isArray(unit.images) ? unit.images.map(imagePath).filter(Boolean) : [];
  return [mainImg, ...extraImgs, ...GENERIC].filter(Boolean);
};
