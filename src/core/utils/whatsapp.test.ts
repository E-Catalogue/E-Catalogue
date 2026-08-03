import { describe, expect, it } from 'vitest';
import { buildUnitShareMessage, buildWhatsAppShareUrl } from './whatsapp';
import type { Unit } from '@/features/units/unit.types';

const unit = {
  id: 'unit-1', name: 'Avanza G', branchId: 'branch-1', statusUnit: 'INVENTORY', isActive: true,
  merekId: 'merek-1', tipeId: 'tipe-1', platNomor: 'B 1234 ABC', tahun: 2024, warna: 'Hitam',
  transmisi: 'AUTOMATIC', noRangka: 'RANGKA', noMesin: 'MESIN', kilometer: 10000,
  tanggalPajak: '2026-08-03', purchaseCost: 100000000, tanggalPembelian: '2026-08-03',
  createdAt: '2026-08-03', updatedAt: '2026-08-03', isPublished: true,
  branch: { id: 'branch-1', nama: 'Jakarta', code: 'JKT' }, merek: { id: 'merek-1', name: 'Toyota' },
  tipe: { id: 'tipe-1', name: 'Avanza', merekId: 'merek-1' },
  leasingOffers: [{ id: 'offer-1', leasingId: 'adira', tenorMonths: 24, dpAmount: 20000000, otrPrice: 150000000, disbursementAmount: 130000000, leasing: { id: 'adira', name: 'Adira Finance', code: 'ADIRA', isActive: true } }],
} satisfies Unit;

describe('template share WhatsApp unit', () => {
  it('memuat data internal, leasing, dan link katalog', () => {
    const message = buildUnitShareMessage(unit);
    expect(message).toContain('Nomor rangka: RANGKA');
    expect(message).toContain('Harga beli:');
    expect(message).toContain('Adira Finance — 24 bulan');
    expect(message).toContain('/katalog/unit-1');
  });

  it('membuka pemilih kontak tanpa nomor tujuan dan meng-encode pesan', () => {
    expect(buildWhatsAppShareUrl('Unit A\nHarga Rp 1.000')).toBe('https://wa.me/?text=Unit%20A%0AHarga%20Rp%201.000');
  });
});
