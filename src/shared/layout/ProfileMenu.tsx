import { useEffect, useRef, useState } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';

interface ProfileMenuProps {
  name: string;
  role: string;
  initials: string;
  onProfile: () => void;
  onLogout: () => void;
}

/** Dropdown profil di header: klik avatar/nama → Profil & Keluar. */
export const ProfileMenu = ({ name, role, initials, onProfile, onLogout }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar atau tekan Escape.
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item =
    'w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold transition-colors text-left';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu profil"
        className={`flex items-center gap-2.5 h-11 pl-1.5 pr-2 rounded-xl border transition-colors ${
          open ? 'bg-surface-soft border-border' : 'border-transparent hover:bg-surface-soft'
        }`}
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0">
          <span className="text-[11px] font-extrabold text-white">{initials}</span>
        </span>

        <span className="leading-none hidden lg:block text-left">
          <span className="block text-[12px] font-bold text-ink">{name}</span>
          <span className="block text-[10px] font-medium text-muted mt-0.5">{role}</span>
        </span>

        <ChevronDown
          size={14}
          className={`text-muted shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-card-hover py-1.5 z-50 animate-scale-in origin-top-right"
        >
          {/* Identitas — konteks siapa yang sedang masuk. */}
          <div className="px-4 py-2.5 border-b border-divider">
            <p className="text-[12px] font-bold text-ink truncate">{name}</p>
            <p className="text-[11px] font-medium text-muted truncate mt-0.5">{role}</p>
          </div>

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onProfile();
            }}
            className={`${item} text-ink-soft hover:bg-surface-soft hover:text-primary`}
          >
            <User size={14} /> Profil
          </button>

          <div className="my-1 border-t border-divider" />

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className={`${item} text-semantic-error hover:bg-semantic-error/10`}
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      )}
    </div>
  );
};
