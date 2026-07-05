// Validasi gambar sisi klien — selaras batasan server (docs/frontend/cms_module_prd.md §1.5).
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const OK_IMAGE_TYPES = ['image/jpeg', 'image/png'];

/** Kembalikan pesan error (bahasa Indonesia) bila tidak valid, atau null bila valid. */
export function validateImageFile(file: File): string | null {
  if (!OK_IMAGE_TYPES.includes(file.type)) return 'Format harus JPG atau PNG';
  if (file.size > MAX_IMAGE_BYTES) return 'Ukuran file maksimal 5 MB';
  return null;
}
