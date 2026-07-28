// Template pesan WhatsApp terpusat — hindari duplikasi logic `https://wa.me/...` di tiap halaman publik.
import { formatCurrency } from './format';

export const DEFAULT_WHATSAPP_NUMBER = '628000000000';
/** Alamat website publik — disertakan di pesan agar sales tahu lead datang dari web. */
export const WEBSITE_URL = 'https://gmmobilindo.com';

export function buildWhatsAppUrl(phone: string | undefined | null, message?: string): string {
  const base = `https://wa.me/${(phone || DEFAULT_WHATSAPP_NUMBER).replace(/[^0-9]/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const waMessages = {
  generalContact: (companyName?: string | null) =>
    `Halo${companyName ? ` ${companyName}` : ''}, saya menemukan showroom Anda dari website ${WEBSITE_URL} dan ingin bertanya seputar unit mobil yang tersedia.`,

  unitInquiry: (unit: { title: string; tahun: number; harga: number; unitId?: string }) =>
    `Halo, saya tertarik dengan ${unit.title} (${unit.tahun}) seharga ${formatCurrency(unit.harga)} yang saya lihat di website ${WEBSITE_URL}${unit.unitId ? `/katalog/${unit.unitId}` : ''}. Apakah unit ini masih tersedia?`,

  creditConsult: (companyName?: string | null) =>
    `Halo${companyName ? ` ${companyName}` : ''}, saya ingin konsultasi simulasi kredit untuk pembelian mobil. Saya mendapat informasi dari website ${WEBSITE_URL}.`,

  creditSimulation: (v: { unitLabel?: string; dpPercent: number; tenor: number; cicilan: number }) =>
    `Halo, saya tertarik mengajukan kredit${v.unitLabel ? ` untuk ${v.unitLabel}` : ''} dengan DP ${v.dpPercent}% tenor ${v.tenor} bulan (estimasi cicilan ${formatCurrency(v.cicilan)}/bulan). Info saya dapat dari website ${WEBSITE_URL}. Mohon info lebih lanjut.`,
};
