import { useState, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  dividerAfter?: boolean;
}

interface ActionMenuProps {
  items: ActionItem[];
  label?: string;
}

export const ActionMenu = ({ items, label = 'Aksi' }: ActionMenuProps) => {
  const [open, setOpen]     = useState(false);
  const [pos, setPos]       = useState<{ top: number; right: number } | null>(null);
  const triggerRef          = useRef<HTMLButtonElement>(null);
  const menuRef             = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 6, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  const variantCls = (v?: string) => {
    if (v === 'danger')   return 'text-semantic-error hover:bg-semantic-error/8';
    if (v === 'primary')  return 'text-primary hover:bg-primary/8';
    return 'text-ink-soft hover:bg-surface-soft';
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12px] font-bold transition-all ${
          open
            ? 'bg-primary text-white border-primary shadow-glow'
            : 'bg-surface border-border text-ink-soft hover:border-primary hover:text-primary'
        }`}
      >
        {label}
        <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ top: pos.top, right: pos.right, position: 'absolute' }}
          className="z-[150] w-52 bg-surface border border-border rounded-2xl shadow-xl py-1.5 animate-fade-in"
        >
          {items.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => { if (!item.disabled) { item.onClick(); setOpen(false); } }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variantCls(item.variant)}`}
              >
                {item.icon && (
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>
                )}
                {item.label}
              </button>
              {item.dividerAfter && <div className="my-1 border-t border-divider mx-2" />}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
};
