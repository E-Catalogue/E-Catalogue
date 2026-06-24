// Konstanta statis global lintas fitur.

// Identitas aplikasi (versi diambil dari package.json via Vite define)
export const APP_NAME = 'Adonara POS';
export const APP_VERSION = `v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}`;

// Gambar default produk bila API tidak mengirim imageUrl (atau gambar gagal dimuat).
export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1502462041640-b3d7e50d0662?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
