import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from '@tanstack/react-router';
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { getIconComponent } from '@/shared/layout/iconMapper';
import { flattenWithGroup, resolveMenus } from '@/shared/layout/menu';
import type { ApiMenuItem } from '@/features/auth/types';

interface MenuSearchModalProps {
  onClose: () => void;
}

interface Hit extends ApiMenuItem {
  group?: string;
}

/**
 * Command palette pencarian menu — dibuka dari header atau ⌘K / Ctrl+K.
 * Di-mount hanya saat terbuka (lihat Header), jadi state selalu mulai bersih.
 */
export const MenuSearchModal = ({ onClose }: MenuSearchModalProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const groupMenus = resolveMenus(useAppSelector((state) => state.auth.groupMenus));

  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  // Ratakan menu + simpan nama grupnya untuk ditampilkan sebagai konteks.
  const hits: Hit[] = useMemo(() => {
    const all: Hit[] = flattenWithGroup(groupMenus).map(({ item, group }) => ({ ...item, group }));
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (i) => i.name.toLowerCase().includes(q),
    );
  }, [query, groupMenus]);

  // Fokus ke input & kunci scroll latar selama palette terbuka.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, []);

  // Kursor tidak boleh menggantung di luar daftar saat hasil menyusut.
  const safeCursor = Math.min(cursor, Math.max(hits.length - 1, 0));

  const go = (item: Hit) => {
    if (item.path) {
      navigate({ to: item.path });
    }
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (hits.length ? (c + 1) % hits.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (hits.length ? (c - 1 + hits.length) % hits.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = hits[safeCursor];
      if (item) go(item);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cari menu"
        onKeyDown={onKeyDown}
        className="relative z-10 w-full max-w-lg bg-surface rounded-2xl border border-border shadow-card-hover overflow-hidden animate-modal-in"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-divider">
          <Search size={17} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Cari menu…"
            aria-label="Cari menu"
            className="flex-1 h-full bg-transparent text-[14px] font-semibold text-ink placeholder:text-muted placeholder:font-medium focus:outline-none"
          />
          <kbd className="kbd shrink-0">ESC</kbd>
        </div>

        {/* Hasil */}
        <div className="max-h-[46vh] overflow-y-auto scrollbar-slim py-2">
          {hits.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] font-semibold text-muted">
              Menu <span className="text-ink">“{query}”</span> tidak ditemukan.
            </p>
          ) : (
            hits.map((item, i) => {
              const Icon = getIconComponent(item.icon);
              const active = i === safeCursor;
              const path = item.path || '#';
              return (
                <button
                  key={path}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    active ? 'bg-primary-light' : 'hover:bg-surface-soft'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      active ? 'bg-primary text-white' : 'bg-surface-soft text-muted'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] font-bold truncate ${active ? 'text-primary' : 'text-ink'}`}>
                      {item.name}
                    </span>
                  </span>

                  {item.group && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted shrink-0 hidden sm:block">
                      {item.group}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Petunjuk keyboard */}
        <div className="flex items-center gap-4 px-4 h-10 border-t border-divider bg-surface-soft">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
            <kbd className="kbd">
              <ArrowUp size={9} />
            </kbd>
            <kbd className="kbd">
              <ArrowDown size={9} />
            </kbd>
            navigasi
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
            <kbd className="kbd">
              <CornerDownLeft size={9} />
            </kbd>
            buka
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
};
