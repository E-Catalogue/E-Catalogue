import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FieldWrap } from './Field';

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_LABELS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** `YYYY-MM-DD` lokal (bukan `toISOString()`, yang bisa mundur 1 hari akibat konversi UTC). */
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseIso = (s?: string) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface DateFieldProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  wrapClass?: string;
  clearable?: boolean;
}

/**
 * Date picker kustom (kalender popover) — pengganti seragam untuk `<input type="date">` polos
 * bawaan browser yang gayanya beda-beda tiap OS/browser dan tidak mengikuti tema aplikasi.
 * Value/onChange tetap format ISO `YYYY-MM-DD` supaya kompatibel dengan pemakaian sebelumnya.
 */
export const DateField = ({ label, required, value, onChange, disabled, min, max, placeholder = 'Pilih tanggal', wrapClass, clearable }: DateFieldProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const selected = parseIso(value);
  const minDate = parseIso(min);
  const maxDate = parseIso(max);
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
      setViewDate(selected ?? new Date());
    }
    setOpen((v) => !v);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date; outside: boolean }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ date: new Date(year, month, i - startOffset + 1), outside: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), outside: false });
  while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ date: new Date(year, month, cells.length - startOffset + 1), outside: true });

  const isDisabled = (d: Date) => !!((minDate && d < minDate) || (maxDate && d > maxDate));
  const today = new Date();

  const displayText = selected
    ? `${selected.getDate()} ${MONTH_LABELS[selected.getMonth()].slice(0, 3)} ${selected.getFullYear()}`
    : placeholder;

  return (
    <FieldWrap label={label ?? ''} required={required} className={wrapClass}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`w-full h-11 px-3.5 rounded-xl bg-surface-soft border text-sm font-semibold text-left flex items-center justify-between gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? 'border-primary ring-2 ring-primary-light' : 'border-border hover:border-primary/50'
        }`}
      >
        <span className={`truncate ${selected ? 'text-ink' : 'text-muted font-medium'}`}>{displayText}</span>
        <span className="flex items-center gap-1 shrink-0">
          {clearable && selected && (
            <span role="button" tabIndex={-1} onClick={(e) => { e.stopPropagation(); onChange(''); }} className="p-0.5 rounded text-muted hover:text-semantic-error">
              <X size={13} />
            </span>
          )}
          <Calendar size={15} className="text-muted" />
        </span>
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[150] bg-surface border border-border rounded-2xl shadow-xl p-3 w-[280px]"
        >
          <div className="flex items-center justify-between mb-2.5">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-extrabold text-ink">{MONTH_LABELS[month]} {year}</span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAY_LABELS.map((d) => (
              <span key={d} className="text-center text-[10px] font-bold text-muted py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ date, outside }, i) => {
              const disabledCell = isDisabled(date);
              const isSelected = selected && sameDay(date, selected);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabledCell}
                  onClick={() => { onChange(toIso(date)); setOpen(false); }}
                  className={`h-8 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    isSelected ? 'bg-primary text-white' : outside ? 'text-muted/50 hover:bg-surface-soft' : isToday ? 'text-primary bg-primary-light' : 'text-ink-soft hover:bg-surface-soft'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => { onChange(toIso(new Date())); setOpen(false); }}
            className="w-full mt-2.5 h-8 rounded-lg text-[11px] font-bold text-primary hover:bg-primary-light transition-colors"
          >
            Hari Ini
          </button>
        </div>,
        document.body,
      )}
    </FieldWrap>
  );
};
