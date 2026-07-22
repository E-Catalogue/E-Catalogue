import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { FieldWrap } from './Field';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
const MONTH_LABELS_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const toIso = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`;
const parseIso = (s?: string) => {
  if (!s) return null;
  const [y, m] = s.split('-').map(Number);
  if (!y || !m) return null;
  return { year: y, month: m - 1 };
};

interface MonthFieldProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  wrapClass?: string;
}

/**
 * Month picker kustom (popover grid 12 bulan + navigasi tahun) — pengganti seragam untuk
 * `<input type="month">` polos bawaan browser. Value/onChange tetap format ISO `YYYY-MM`.
 */
export const MonthField = ({ label, required, value, onChange, disabled, min, max, placeholder = 'Pilih bulan', wrapClass }: MonthFieldProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const selected = parseIso(value);
  const minVal = parseIso(min);
  const maxVal = parseIso(max);
  const [viewYear, setViewYear] = useState(() => selected?.year ?? new Date().getFullYear());
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
      setViewYear(selected?.year ?? new Date().getFullYear());
    }
    setOpen((v) => !v);
  };

  const isDisabled = (year: number, month: number) => {
    const key = year * 12 + month;
    if (minVal && key < minVal.year * 12 + minVal.month) return true;
    if (maxVal && key > maxVal.year * 12 + maxVal.month) return true;
    return false;
  };

  const today = new Date();
  const displayText = selected ? `${MONTH_LABELS_LONG[selected.month]} ${selected.year}` : placeholder;

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
        <Calendar size={15} className="text-muted shrink-0" />
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[150] bg-surface border border-border rounded-2xl shadow-xl p-3 w-[260px]"
        >
          <div className="flex items-center justify-between mb-2.5">
            <button type="button" onClick={() => setViewYear((y) => y - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-extrabold text-ink">{viewYear}</span>
            <button type="button" onClick={() => setViewYear((y) => y + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_LABELS.map((label, m) => {
              const disabledCell = isDisabled(viewYear, m);
              const isSelected = selected && selected.year === viewYear && selected.month === m;
              const isCurrent = today.getFullYear() === viewYear && today.getMonth() === m;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={disabledCell}
                  onClick={() => { onChange(toIso(viewYear, m)); setOpen(false); }}
                  className={`h-9 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    isSelected ? 'bg-primary text-white' : isCurrent ? 'text-primary bg-primary-light' : 'text-ink-soft hover:bg-surface-soft'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => { onChange(toIso(today.getFullYear(), today.getMonth())); setOpen(false); }}
            className="w-full mt-2.5 h-8 rounded-lg text-[11px] font-bold text-primary hover:bg-primary-light transition-colors"
          >
            Bulan Ini
          </button>
        </div>,
        document.body,
      )}
    </FieldWrap>
  );
};
