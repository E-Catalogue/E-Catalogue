// Template pesan WhatsApp terpusat — hindari duplikasi logic `https://wa.me/...` di tiap halaman publik.
import { formatCurrency } from './format';
import type { Unit } from '@/features/units/unit.types';

export const DEFAULT_WHATSAPP_NUMBER = '628000000000';
/** Alamat website publik — disertakan di pesan agar sales tahu lead datang dari web. */
export const WEBSITE_URL = 'https://gmmobilindo.com';

export function buildWhatsAppUrl(phone: string | undefined | null, message?: string): string {
  const base = `https://wa.me/${(phone || DEFAULT_WHATSAPP_NUMBER).replace(/[^0-9]/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

const value = (input: unknown) => input === null || input === undefined || input === '' ? 'Belum tersedia' : String(input);
const date = (input?: string | null) => input ? new Date(input).toLocaleDateString('id-ID') : 'Belum tersedia';
const money = (input?: number | null) => input == null ? 'Belum tersedia' : formatCurrency(input);

/** Satu template informasi Sales untuk clipboard dan Bagikan WhatsApp. */
export function buildUnitCopyText(unit: Unit): string {
  const equipment = unit.unitKelengkapans?.map((item) => item.perlengkapan?.name).filter(Boolean) ?? [];
  const documents = unit.unitDokumens?.map((item) => item.dokumen?.name).filter(Boolean) ?? [];
  const offers = unit.leasingOffers ?? [];
  const offersByLeasing = offers.reduce((groups, offer) => {
    const key = offer.leasingId || offer.leasing?.name || 'leasing';
    const group = groups.get(key);
    if (group) group.offers.push(offer);
    else groups.set(key, { name: offer.leasing?.name ?? 'Leasing', offers: [offer] });
    return groups;
  }, new Map<string, { name: string; offers: typeof offers }>());
  const status = unit.statusUnit === 'INVENTORY' || unit.statusUnit === 'HOLD'
    ? 'Coming Soon'
    : unit.statusUnit === 'READY_STOCK' ? 'Ready Stock' : 'Terjual';

  const lines = [
    '*INFORMASI UNIT*',
    '',
    `Nama: ${value(unit.name)}`,
    `Cabang: ${value(unit.branch?.nama)}`,
    `Merek / Tipe: ${value([unit.merek?.name, unit.tipe?.name, unit.variant].filter(Boolean).join(' '))}`,
    `Tahun: ${unit.tahun}`,
    `Warna: ${value(unit.warna)}`,
    `Transmisi: ${unit.transmisi === 'AUTOMATIC' ? 'Automatic (AT)' : 'Manual (MT)'}`,
    `Bahan bakar: ${unit.bahanBakar ? ({ BENSIN: 'Bensin', DIESEL: 'Diesel', HYBRID: 'Hybrid', LISTRIK: 'Listrik' } as const)[unit.bahanBakar] : 'Belum tersedia'}`,
    `Kilometer: ${unit.kilometer.toLocaleString('id-ID')} km`,
    `Plat nomor: ${value(unit.platNomor)}`,
    `Tanggal pajak: ${date(unit.tanggalPajak)}`,
    '',
    '*HARGA*',
    `Harga OTR: ${money(unit.otrPrice)}`,
    '',
    '*STATUS*',
    `Status unit: ${status}`,
    '',
    '*KELENGKAPAN & DOKUMEN*',
    `Kelengkapan: ${equipment.length ? equipment.join(', ') : 'Belum tersedia'}`,
    `Dokumen: ${documents.length ? documents.join(', ') : 'Belum tersedia'}`,
    `Deskripsi: ${value(unit.deskripsi)}`,
    '',
    '*PENAWARAN LEASING*',
    ...(offers.length ? [...offersByLeasing.values()].flatMap((group, leasingIndex) => [
      `${leasingIndex + 1}. ${group.name}`,
      ...group.offers.map((offer) =>
        `   - DP: ${money(offer.dpAmount)}${offer.monthlyInstallmentAmount != null && offer.monthlyInstallmentAmount > 0
          ? ` | Cicilan ${offer.tenorMonths} Bulan x ${money(offer.monthlyInstallmentAmount)}`
          : ` | Tenor ${offer.tenorMonths} Bulan`}`),
    ]) : ['Belum tersedia']),
  ];
  if (unit.isPublished) lines.push('', `Katalog: ${WEBSITE_URL}/katalog/${unit.id}`);
  return lines.join('\n');
}

export function buildUnitShareMessage(unit: Unit): string {
  return buildUnitCopyText(unit);
}

export const waMessages = {
  generalContact: (companyName?: string | null) =>
    `Halo${companyName ? ` ${companyName}` : ''}, saya menemukan showroom Anda dari website ${WEBSITE_URL} dan ingin bertanya seputar unit mobil yang tersedia.`,

  unitInquiry: (unit: { title: string; tahun: number; harga: number; unitId?: string }) =>
    `Halo, saya tertarik dengan ${unit.title} (${unit.tahun}) seharga ${formatCurrency(unit.harga)} yang saya lihat di website ${WEBSITE_URL}${unit.unitId ? `/katalog/${unit.unitId}` : ''}. Apakah unit ini masih tersedia?`,

  creditConsult: (companyName?: string | null) =>
    `Halo${companyName ? ` ${companyName}` : ''}, saya sedang mencari mobil dan ingin berkonsultasi mengenai unit yang tersedia. Saya mendapat informasi dari website ${WEBSITE_URL}.`,

  creditSimulation: (v: { unitLabel?: string; dpPercent: number; tenor: number; cicilan: number }) =>
    `Halo, saya ingin berkonsultasi mengenai ketersediaan dan proses pembelian${v.unitLabel ? ` unit ${v.unitLabel}` : ' unit mobil'} yang saya lihat di website ${WEBSITE_URL}. Mohon dibantu informasi selengkapnya.`,
};
