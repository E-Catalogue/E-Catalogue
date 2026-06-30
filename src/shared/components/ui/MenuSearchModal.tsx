import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, ArrowRight, Command, type LucideIcon } from 'lucide-react';
import { MENU_ITEMS, PATH_BY_CODE, VALID_PATHS } from '@/shared/layout/menu';
import { resolveIcon } from '@/shared/layout/iconMap';
import { useAppSelector } from '@/app/store';

interface SearchItem {
  path: string;
  label: string;
  group: string;
  Icon: LucideIcon;
}

const resolveFrontendPath = (m: { path?: string | null; code?: string }): string | null => {
  if (m.code && PATH_BY_CODE[m.code]) return PATH_BY_CODE[m.code];
  if (m.path && VALID_PATHS.has(m.path)) return m.path;
  return null;
};

const GROUP_LABELS: Record<string, string> = {
  main: 'Menu Utama',
  operasional: 'Operasional',
  master: 'Master Data',
  akses: 'Akses Kontrol',
  lainnya: 'Lainnya',
};

// Group color accent (for the icon background pill)
const GROUP_ACCENT: Record<string, string> = {
  main:        'bg-primary/10 text-primary',
  operasional: 'bg-amber-100 text-amber-700',
  master:      'bg-blue-100 text-blue-700',
  akses:       'bg-purple-100 text-purple-700',
  lainnya:     'bg-slate-100 text-slate-600',
};

const useAllMenuItems = (): SearchItem[] => {
  const groupMenus = useAppSelector((s) => s.auth.groupMenus);

  return useMemo<SearchItem[]>(() => {
    if (groupMenus && groupMenus.length > 0) {
      return groupMenus
        .flatMap((g) =>
          (g.menus ?? []).map((m) => {
            const path = resolveFrontendPath(m);
            if (!path) return null;
            return {
              path,
              label: m.name,
              group: g.name,
              Icon: resolveIcon({ icon: m.icon, code: m.code, path: m.path }),
            } satisfies SearchItem;
          })
        )
        .filter((x): x is SearchItem => x !== null);
    }
    return MENU_ITEMS.map((m) => ({
      path: m.path,
      label: m.label,
      group: GROUP_LABELS[m.group] ?? m.group,
      Icon: m.icon,
    }));
  }, [groupMenus]);
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export const MenuSearchModal = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const allItems = useAllMenuItems();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Clamp active index when results shrink
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(results.length - 1, 0)));
  }, [results.length]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = useCallback(
    (item: SearchItem) => {
      navigate({ to: item.path });
      onClose();
    },
    [navigate, onClose]
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { go(results[active]); }
    else if (e.key === 'Escape') { onClose(); }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-ink/30 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
        <div
          className="w-full max-w-[520px] bg-surface rounded-2xl shadow-[0_24px_64px_-12px_rgba(24,29,42,0.28)] border border-border overflow-hidden pointer-events-auto animate-float-up"
          onKeyDown={handleKey}
        >
          {/* Search input row */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-divider">
            <Search size={18} className="text-muted shrink-0" strokeWidth={2.2} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              placeholder="Cari menu..."
              className="flex-1 bg-transparent text-[15px] font-semibold text-ink placeholder:text-muted focus:outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-soft border border-border text-[10px] font-bold text-muted shrink-0">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="overflow-y-auto max-h-[340px] py-1.5 no-scrollbar">
            {results.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Search size={28} className="mx-auto text-muted/40 mb-3" strokeWidth={1.5} />
                <p className="text-[13px] font-semibold text-muted">Tidak ditemukan untuk "{query}"</p>
                <p className="text-[11px] text-muted/60 mt-1">Coba kata kunci lain</p>
              </div>
            ) : (
              results.map((item, i) => {
                const isActive = i === active;
                const accent = GROUP_ACCENT[
                  MENU_ITEMS.find((m) => m.path === item.path)?.group ?? 'lainnya'
                ] ?? 'bg-slate-100 text-slate-600';

                return (
                  <button
                    key={item.path}
                    data-idx={i}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActive(i)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                      ${isActive ? 'bg-primary/6' : 'hover:bg-surface-soft'}
                    `}
                  >
                    {/* Icon pill */}
                    <span className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${accent}`}>
                      <item.Icon size={15} strokeWidth={2} />
                    </span>

                    {/* Label + group */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold leading-tight truncate ${isActive ? 'text-primary' : 'text-ink'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted mt-0.5 truncate">
                        {item.group}
                      </p>
                    </div>

                    {/* Arrow — only shown on active */}
                    <ArrowRight
                      size={14}
                      className={`shrink-0 text-primary transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-divider bg-surface-soft">
            <div className="flex items-center gap-3 text-[10px] text-muted font-bold">
              <span className="flex items-center gap-1"><kbd className="kbd">↑↓</kbd> Navigasi</span>
              <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> Buka</span>
              <span className="flex items-center gap-1"><kbd className="kbd">Esc</kbd> Tutup</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted/50 font-bold shrink-0">
              <Command size={10} />
              <span>{isMac ? '⌘' : 'Ctrl'}+K</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
