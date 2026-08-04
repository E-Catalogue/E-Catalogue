import { describe, expect, it } from 'vitest';
import { buildUnitCopyText, buildUnitShareMessage, buildWhatsAppShareUrl } from './whatsapp';
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
  it('memuat informasi Sales, leasing, dan link katalog tanpa data internal', () => {
    const message = buildUnitShareMessage({
      ...unit,
      targetPrice: 140000000,
      pricingCostBasis: 100000000,
      totalActualUnitCost: 100000000,
      pricingFinalizedAt: '2026-08-03',
    });
    expect(message).toContain('*INFORMASI UNIT*');
    expect(message).toContain('Harga OTR:');
    expect(message).toContain('Adira Finance - 24 bulan');
    expect(message).toContain('/katalog/unit-1');
    expect(message).not.toContain('Tanggal pembelian');
    expect(message).not.toContain('Harga beli');
    expect(message).not.toContain('Rekondisi awal');
    expect(message).not.toContain('HPP');
    expect(message).not.toContain('Total biaya aktual');
    expect(message).not.toContain('Harga target');
    expect(message).not.toContain('Pricing difinalisasi');
    expect(message).not.toContain('PENDANAAN');
    expect(message).not.toContain('Investor:');
    expect(message).not.toContain('Aktif:');
    expect(message).not.toContain('Dipublikasikan');
    expect(message).not.toContain('Status katalog');
    expect(message).not.toContain('Unit unggulan');
  });

  it('membuka pemilih kontak tanpa nomor tujuan dan meng-encode pesan', () => {
    expect(buildWhatsAppShareUrl('Unit A\nHarga Rp 1.000')).toBe('https://wa.me/?text=Unit%20A%0AHarga%20Rp%201.000');
  });

  it('membuat salinan informasi Sales tanpa target, gambar, dan biaya internal', () => {
    const text = buildUnitCopyText({
      ...unit,
      targetPrice: 140000000,
      otrPrice: 150000000,
      unitImages: [{
        id: 'image-1', unitId: 'unit-1', filename: 'rahasia.jpg', originalName: 'rahasia.jpg',
        extension: 'jpg', sequence: 1, isMain: true,
      }],
    });

    expect(text).toContain('Nama: Avanza G');
    expect(text).toContain('Harga OTR:');
    expect(text).toContain('Status unit: Coming Soon');
    expect(text).toContain('Adira Finance - 24 bulan');
    expect(text).toBe(buildUnitShareMessage({
      ...unit,
      targetPrice: 140000000,
      otrPrice: 150000000,
      unitImages: [{
        id: 'image-1', unitId: 'unit-1', filename: 'rahasia.jpg', originalName: 'rahasia.jpg',
        extension: 'jpg', sequence: 1, isMain: true,
      }],
    }));
    expect(text).not.toContain('target');
    expect(text).not.toContain('rahasia.jpg');
    expect(text).not.toContain('Harga beli');
    expect(text).not.toContain('HPP');
  });
});
