const BUSINESS_TIME_ZONE = 'Asia/Bangkok';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Tanggal kalender bisnis YYYY-MM-DD, tidak bergeser karena UTC browser. */
export const businessToday = () => formatter.format(new Date());
export const businessMonth = () => businessToday().slice(0, 7);

/** Ubah ISO/Date API menjadi tanggal kalender bisnis Asia/Bangkok. */
export const toBusinessDate = (value?: string | Date | null) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : formatter.format(date);
};
