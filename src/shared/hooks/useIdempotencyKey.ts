import { useState } from 'react';

/**
 * Idempotency-Key untuk mutation finansial (ecatalogue-be/.prd/README.md §14: payment
 * customer, deposit/withdrawal investor, pembayaran kewajiban investor, transaksi kas
 * manual/adjustment/transfer).
 *
 * Aturan lifecycle:
 * 1. Key dibuat sekali saat form/draft mutation dibuka (lazy initializer — tidak berubah
 *    antar render selama komponennya tidak remount).
 * 2. Panggil `regenerate()` setiap kali user mengubah amount/account/tanggal/tipe/resource.
 * 3. JANGAN panggil `regenerate()` setelah timeout/network error — retry dengan key yang
 *    SAMA supaya request pertama yang mungkin sudah terposting tidak dobel.
 * 4. Setelah mutation sukses, buang draft (komponen unmount) — key otomatis hilang.
 */
export const useIdempotencyKey = () => {
  const [key, setKey] = useState(() => crypto.randomUUID());
  const regenerate = () => setKey(crypto.randomUUID());
  return { key, regenerate };
};
