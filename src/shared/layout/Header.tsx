import { useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, LogOut, Search } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';
import { flattenMenus, resolveMenus } from './menu';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { MenuSearchModal } from '@/shared/components/ui/MenuSearchModal';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { clearCredentials } from '@/app/store/authSlice';

import { tenantAuthApi } from '@/features/tenant/api/tenant-auth.api';

interface HeaderProps {
  onOpenMenu: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const Header = ({ onOpenMenu }: HeaderProps) => {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const groupMenus = resolveMenus(useAppSelector((state) => state.auth.groupMenus));
  const user = useAppSelector((state) => state.auth.user);

  const [searchOpen, setSearchOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Judul halaman diambil dari menu yang path-nya cocok dengan URL sekarang.
  const current = flattenMenus(groupMenus).find((m) => m.path === location.pathname);

  // ⌘K / Ctrl+K membuka pencarian menu dari mana saja.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try {
      await tenantAuthApi.logout();
    } catch {
      // Logout server gagal pun, sesi lokal tetap dibersihkan.
    } finally {
      dispatch(clearCredentials());
      navigate({ to: '/login' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 shrink-0 flex items-center gap-3 px-4 md:px-6 bg-surface border-b border-border">
        <button
          onClick={onOpenMenu}
          aria-label="Buka menu"
          className="lg:hidden shrink-0 text-muted hover:text-ink p-1.5 -ml-1.5 rounded-lg"
        >
          <Menu size={20} />
        </button>

        {/* Kiri: judul halaman */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold text-ink truncate">{current?.name ?? 'E-Catalogue'}</p>
          <p className="text-[11px] font-medium text-muted truncate hidden sm:block">
            {user?.name ? `Showroom: ${user.name}` : 'Aplikasi operasional showroom'}
          </p>
        </div>

        {/* Kanan: Pencarian & Profil */}
        <div className="shrink-0 flex items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Cari menu"
            className="shrink-0 flex items-center gap-2.5 h-9 w-9 md:w-56 lg:w-64 justify-center md:justify-start px-0 md:px-3 rounded-xl bg-surface-soft border border-border text-muted hover:border-primary hover:text-primary transition-colors"
          >
            <Search size={15} className="shrink-0" />
            <span className="text-[12px] font-semibold hidden md:block">Cari menu…</span>
            <kbd className="kbd hidden md:inline-flex ml-auto">{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>

          <ProfileMenu
            name={user?.name ?? 'Pengguna'}
            role={user?.role?.name ?? 'Showroom'}
            initials={(user?.name ?? 'T').slice(0, 2).toUpperCase()}
            onProfile={() => {
              // TODO(profil): arahkan ke halaman profil saat routenya dibuat.
            }}
            onLogout={() => setConfirmLogout(true)}
          />
        </div>
      </header>

      {searchOpen && <MenuSearchModal onClose={() => setSearchOpen(false)} />}

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Keluar dari Showroom Web"
        message="Anda akan keluar dari sesi ini dan kembali ke halaman login. Lanjutkan?"
        confirmLabel="Keluar"
        cancelLabel="Batal"
        tone="danger"
        icon={LogOut}
      />
    </>
  );
};
