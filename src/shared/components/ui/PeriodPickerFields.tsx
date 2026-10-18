import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { FieldWrap } from './Field';
import { useAnchoredOverlay } from '@/shared/hooks/useAnchoredOverlay';
import { businessMonth } from '@/core/utils/businessDate';

const MONTH_LABELS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
const MONTH_LABELS_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const YEARS_PER_PAGE = 12;

/** Bulan & tahun berjalan menurut kalender bisnis (bukan UTC browser). */
const currentBusinessPeriod = () => {
  const [y, m] = businessMonth().split('-').map(Number);
  return { year: y, month: m };
};

/** Tutup popover saat klik di luar trigger/panel atau tekan Escape — sama seperti DateField. */
const useDismissable = (
  open: boolean,
  setOpen: (v: boolean) => void,
  triggerRef: RefObject<HTMLButtonElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
) => {
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', esc); };
  }, [open, setOpen, triggerRef, panelRef]);
};

interface TriggerProps {
  triggerRef: RefObject<HTMLButtonElement | null>;
  open: boolean;
  disabled?: boolean;
  onClick: () => void;
  text: string;
  icon: ReactNode;
  ariaLabel?: string;
}

const PickerTrigger = ({ triggerRef, open, disabled, onClick, text, icon, ariaLabel }: TriggerProps) => (
  <button
    ref={triggerRef}
    type="button"
    disabled={disabled}
    onClick={onClick}
    aria-label={ariaLabel}
    aria-haspopup="dialog"
    aria-expanded={open}
    className={`w-full h-11 px-3.5 rounded-xl bg-surface-soft border text-sm font-semibold text-left flex items-center justify-between gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
      open ? 'border-primary ring-2 ring-primary-light' : 'border-border hover:border-primary/50'
    }`}
  >
    <span className="truncate text-ink">{text}</span>
    {icon}
  </button>
);

const navBtnClass = 'w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted';
const panelClass = 'z-[150] bg-surface border border-border rounded-2xl shadow-xl p-3 overflow-y-auto';
const cellClass = (selected: boolean, current: boolean) =>
  `h-9 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
    selected ? 'bg-primary text-white' : current ? 'text-primary bg-primary-light' : 'text-ink-soft hover:bg-surface-soft'
  }`;
const footerBtnClass = 'w-full mt-2.5 h-8 rounded-lg text-[11px] font-bold text-primary hover:bg-primary-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

interface MonthPickerFieldProps {
  label?: string;
  /** Bulan 1–12. */
  value: number;
  onChange: (month: number) => void;
  /** Bulan terakhir (1–12) yang boleh dipilih, mis. bulan berjalan saat tahun = tahun ini. */
  maxMonth?: number;
  disabled?: boolean;
  wrapClass?: string;
}

/**
 * Pemilih bulan saja (grid 12 bulan, tanpa navigasi tahun) — dipasangkan dengan `YearPickerField`
 * saat bulan & tahun perlu dipilih terpisah. Gaya mengikuti `DateField`/`MonthField`.
 */
export const MonthPickerField = ({ label, value, onChange, maxMonth, disabled, wrapClass }: MonthPickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayStyle = useAnchoredOverlay(open, triggerRef, panelRef, { width: 260, estimatedHeight: 200 });
  useDismissable(open, setOpen, triggerRef, panelRef);

  const current = currentBusinessPeriod();

  return (
    <FieldWrap label={label ?? ''} className={wrapClass}>
      <PickerTrigger
        triggerRef={triggerRef}
        open={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        text={MONTH_LABELS_LONG[value - 1] ?? 'Pilih bulan'}
        icon={<Calendar size={15} className="text-muted shrink-0" />}
        ariaLabel="Pilih bulan"
      />

      {open && overlayStyle && createPortal(
        <div ref={panelRef} style={overlayStyle} role="dialog" aria-label="Pilih bulan" className={panelClass}>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_LABELS_SHORT.map((short, i) => {
              const m = i + 1;
              return (
                <button
                  key={short}
                  type="button"
                  disabled={maxMonth !== undefined && m > maxMonth}
                  onClick={() => { onChange(m); setOpen(false); }}
                  className={cellClass(m === value, m === current.month)}
                >
                  {short}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={maxMonth !== undefined && current.month > maxMonth}
            onClick={() => { onChange(current.month); setOpen(false); }}
            className={footerBtnClass}
          >
            Bulan Ini
          </button>
        </div>,
        document.body,
      )}
    </FieldWrap>
  );
};

interface YearPickerFieldProps {
  label?: string;
  value: number;
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  wrapClass?: string;
}

/**
 * Pemilih tahun (grid 12 tahun per halaman + navigasi). Gaya mengikuti `DateField`/`MonthField`.
 */
export const YearPickerField = ({ label, value, onChange, minYear, maxYear, disabled, wrapClass }: YearPickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const pageStartFor = (y: number) => y - ((y % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE;
  const [pageStart, setPageStart] = useState(() => pageStartFor(value));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayStyle = useAnchoredOverlay(open, triggerRef, panelRef, { width: 260, estimatedHeight: 240 });
  useDismissable(open, setOpen, triggerRef, panelRef);

  const toggle = () => {
    if (disabled) return;
    if (!open) setPageStart(pageStartFor(value));
    setOpen((v) => !v);
  };

  const current = currentBusinessPeriod();
  const isDisabled = (y: number) => (minYear !== undefined && y < minYear) || (maxYear !== undefined && y > maxYear);
  const pageEnd = pageStart + YEARS_PER_PAGE - 1;
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i);

  return (
    <FieldWrap label={label ?? ''} className={wrapClass}>
      <PickerTrigger
        triggerRef={triggerRef}
        open={open}
        disabled={disabled}
        onClick={toggle}
        text={String(value)}
        icon={<CalendarDays size={15} className="text-muted shrink-0" />}
        ariaLabel="Pilih tahun"
      />

      {open && overlayStyle && createPortal(
        <div ref={panelRef} style={overlayStyle} role="dialog" aria-label="Pilih tahun" className={panelClass}>
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              aria-label="Tahun sebelumnya"
              disabled={minYear !== undefined && pageStart <= minYear}
              onClick={() => setPageStart((s) => s - YEARS_PER_PAGE)}
              className={navBtnClass}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-extrabold text-ink">{pageStart} – {pageEnd}</span>
            <button
              type="button"
              aria-label="Tahun berikutnya"
              disabled={maxYear !== undefined && pageEnd >= maxYear}
              onClick={() => setPageStart((s) => s + YEARS_PER_PAGE)}
              className={navBtnClass}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                disabled={isDisabled(y)}
                onClick={() => { onChange(y); setOpen(false); }}
                className={cellClass(y === value, y === current.year)}
              >
                {y}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={isDisabled(current.year)}
            onClick={() => { onChange(current.year); setOpen(false); }}
            className={footerBtnClass}
          >
            Tahun Ini
          </button>
        </div>,
        document.body,
      )}
    </FieldWrap>
  );
};
