import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { FieldWrap } from './Field';

export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  wrapClass?: string;
}

/**
 * Dropdown dengan input pencarian di dalamnya (combobox) — dipakai untuk semua select
 * lookup yang opsinya bisa banyak (unit, lead, sales, akun kas, dll). Popover di-portal ke
 * `document.body` (pola sama dengan `ActionMenu.tsx`) supaya tidak terpotong `overflow-y-auto`
 * body Modal.
 */
export const SearchableSelect = ({
  label, required, value, onChange, options, placeholder = 'Pilih...', searchPlaceholder = 'Cari...',
  emptyMessage = 'Tidak ada hasil.', disabled, loading, clearable, wrapClass,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q));
  }, [options, search]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setHighlight(Math.max(0, filtered.findIndex((o) => o.value === value)));
      setTimeout(() => searchRef.current?.focus(), 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => setHighlight(0), [search]);

  const toggle = () => {
    if (disabled || loading) return;
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    setOpen((v) => !v);
  };

  const pick = (opt: SearchableSelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); return; }
    if (e.key === 'Enter') { e.preventDefault(); const opt = filtered[highlight]; if (opt) pick(opt); }
  };

  return (
    <FieldWrap label={label ?? ''} required={required} className={wrapClass}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || loading}
        onClick={toggle}
        className={`w-full h-11 px-3.5 rounded-xl bg-surface-soft border text-sm font-semibold text-left flex items-center justify-between gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? 'border-primary ring-2 ring-primary-light' : 'border-border hover:border-primary/50'
        }`}
      >
        <span className={`truncate ${selected ? 'text-ink' : 'text-muted font-medium'}`}>
          {loading ? 'Memuat...' : selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {loading && <Loader2 size={14} className="animate-spin text-muted" />}
          {clearable && selected && !loading && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="p-0.5 rounded text-muted hover:text-semantic-error"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={15} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 260) }}
          className="fixed z-[150] bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-80"
        >
          <div className="shrink-0 p-2 border-b border-divider">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-soft border border-border text-[13px] font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="overflow-y-auto scrollbar-slim py-1">
            {filtered.length === 0 ? (
              <p className="text-center text-[12px] font-semibold text-muted py-6 px-4">{emptyMessage}</p>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(opt)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    i === highlight ? 'bg-primary-light text-primary' : 'text-ink-soft'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{opt.label}</span>
                    {opt.sublabel && <span className="block truncate text-[11px] font-medium text-muted">{opt.sublabel}</span>}
                  </span>
                  {opt.value === value && <Check size={14} className="shrink-0 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}
    </FieldWrap>
  );
};
