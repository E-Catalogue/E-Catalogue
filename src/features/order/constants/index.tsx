import type { Promo } from '../schema';

// Promo masih statis (belum ada endpoint). Produk & kategori sudah di-consume dari API
// melalui hooks useProducts / useProductCategories.
export const PROMOS: Promo[] = [
  { id: 'p1', code: 'HEMAT10', name: 'Diskon Karyawan 10%', type: 'percentage', value: 10 },
  { id: 'p2', code: 'MANTAP20K', name: 'Potongan Rp 20.000', type: 'fixed', value: 20000 },
];