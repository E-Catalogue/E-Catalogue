import { formatCurrency } from '@/core/utils/format';
import { WEBSITE_URL, buildWhatsAppShareUrl } from '@/core/utils/whatsapp';
import type { ManagerUnit } from './manager.types';

export function buildManagerUnitWhatsAppUrl(unit: ManagerUnit): string | null {
  if (!unit.canShare || !unit.catalogPath || unit.otrPrice === null) return null;
  const specification = [unit.merek?.name, unit.tipe?.name, unit.variant].filter(Boolean).join(' ');
  const lines = [
    '*INFORMASI UNIT*',
    '',
    `Unit: ${unit.name || specification}`,
    `Spesifikasi: ${specification || '-'}`,
    `Tahun: ${unit.tahun}`,
    `Warna: ${unit.warna || '-'}`,
    `Transmisi: ${unit.transmisi === 'AUTOMATIC' ? 'Automatic' : 'Manual'}`,
    `Kilometer: ${unit.kilometer.toLocaleString('id-ID')} km`,
    `Harga OTR: ${formatCurrency(unit.otrPrice)}`,
    '',
    `Katalog: ${WEBSITE_URL}${unit.catalogPath}`,
  ];
  return buildWhatsAppShareUrl(lines.join('\n'));
}
