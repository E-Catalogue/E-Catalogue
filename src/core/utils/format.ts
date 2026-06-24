// Helper format angka & tanggal untuk konteks Indonesia.

export const formatCurrency = (value: number, opts?: { compact?: boolean }): string => {
  if (opts?.compact) {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2).replace(/\.00$/, '')} M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')} Jt`;
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} Rb`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('id-ID').format(value);

export const formatKm = (value: number): string => `${formatNumber(value)} KM`;

export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
