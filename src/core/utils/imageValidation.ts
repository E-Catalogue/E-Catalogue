// Validasi gambar sisi klien — selaras batasan server (docs/frontend/cms_module_prd.md §1.5).
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB per gambar
export const OK_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const IMAGE_UPLOAD_NOTE = 'JPG/PNG · maksimal 2 MB per gambar';

/** Kembalikan pesan error (bahasa Indonesia) bila tidak valid, atau null bila valid. */
export function validateImageFile(file: File): string | null {
  if (!OK_IMAGE_TYPES.includes(file.type)) return `Gambar “${file.name}” harus berformat JPG atau PNG.`;
  if (file.size > MAX_IMAGE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1).replace('.', ',');
    return `Gambar “${file.name}” berukuran ${sizeMb} MB. Ukuran maksimal 2 MB per gambar.`;
  }
  return null;
}
