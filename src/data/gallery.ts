// Foto interior/detail generik untuk melengkapi galeri tiap unit (demo).
const GENERIC = [
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop', // interior dashboard
  'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop', // wheel/exterior
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop', // rear
  'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop', // seats
];

export const getGallery = (unit: any): string[] => {
  if (!unit) return GENERIC;
  const mainImg = typeof unit.image === 'string' ? unit.image : unit.image?.filename ? `/uploads/unit/${unit.image.filename}` : '';
  const extraImgs = Array.isArray(unit.images) ? unit.images.map((img: any) => typeof img === 'string' ? img : img?.filename ? `/uploads/unit/${img.filename}` : '').filter(Boolean) : [];
  return [mainImg, ...extraImgs, ...GENERIC].filter(Boolean);
};
