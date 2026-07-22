import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from '@tanstack/react-router';
import { Menu, Search, ChevronDown, Store, LogOut, ShieldOff, Command } from 'lucide-react';
import { MENU_ITEMS, isPathActive } from './menu';
import { CURRENT_USER } from '@/shared/constants';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { queryClient } from '@/app/queryClient';
import { clearCredentials } from '@/app/store/authSlice';
import { authApi } from '@/features/auth/auth.api';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { MenuSearchModal } from '@/shared/components/ui/MenuSearchModal';
import { BranchSwitcher } from './BranchSwitcher';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  isProfileOpen: boolean;
  onToggleProfile: () => void;
}

export const Header = ({ onOpenMobileSidebar, isProfileOpen, onToggleProfile }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const active = MENU_ITEMS.find((m) => isPathActive(location.pathname, m.path));
  const title = active?.label ?? 'Dashboard';
  const isDashboard = isPathActive(location.pathname, '/dashboard') || location.pathname === '/dashboard-cashflow';

  const name = user?.name ?? CURRENT_USER.name;
  const role = user?.role?.name ?? CURRENT_USER.role;
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const askLogout = () => { onToggleProfile(); setConfirmLogout(true); };
  const askLogoutAll = () => { onToggleProfile(); setConfirmLogoutAll(true); };

  const finishLogout = () => {
    dispatch(clearCredentials());
    queryClient.clear();
    setConfirmLogout(false);
    setConfirmLogoutAll(false);
    setLoggingOut(false);
    navigate({ to: '/login' });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await authApi.logout(); } catch { /* ignore */ }
    finishLogout();
  };

  const handleLogoutAll = async () => {
    setLoggingOut(true);
    try { await authApi.logoutAll(); } catch { /* ignore */ }
    finishLogout();
  };

  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

  return (
    <>
      <header className="px-4 md:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4 shrink-0 bg-surface border-b border-border z-30">
        {/* LEFT: title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 bg-surface-soft rounded-xl text-muted hover:text-ink transition-colors shrink-0"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-extrabold text-ink tracking-tight leading-none truncate">{title}</h1>
            {isDashboard && (
              <p className="text-[11px] md:text-xs text-muted font-medium mt-1 truncate">
                Selamat datang kembali, <span className="text-primary font-bold">{name}</span>
              </p>
            )}
          </div>
        </div>

        {/* CENTER: search trigger (looks like input, opens modal) */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className="group relative w-full flex items-center h-11 pl-11 pr-4 rounded-2xl bg-surface-soft border border-border hover:border-primary/40 hover:bg-primary/[0.03] transition-all text-left"
          >
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-hover:text-primary transition-colors" strokeWidth={2.2} />
            <span className="text-sm font-medium text-muted flex-1">Cari menu...</span>
            <kbd className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border text-[10px] font-bold text-muted/60 shrink-0">
              <Command size={9} />
              <span>{isMac ? '⌘' : 'Ctrl'} K</span>
            </kbd>
          </button>
        </div>

        {/* RIGHT: actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Branch switcher global (OWNER/ADMIN) — sumber kebenaran cabang aktif */}
          <BranchSwitcher />

          {/* Mobile search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2.5 rounded-xl bg-surface-soft text-ink-soft hover:text-primary hover:bg-primary-light transition-colors"
          >
            <Search size={20} strokeWidth={2.2} />
          </button>

          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-surface-soft border border-border text-ink-soft hover:text-primary hover:border-primary font-bold text-[12px] px-3 py-2.5 transition-colors"
            title="Lihat katalog publik"
          >
            <Store size={16} /> Katalog
          </Link>

          <div className="relative">
            <button
              onClick={onToggleProfile}
              className="flex items-center gap-2.5 pl-1.5 pr-2 md:pr-3 py-1.5 rounded-full bg-surface-soft border border-border hover:border-primary transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-extrabold shrink-0">{initials}</span>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-[12px] font-bold text-ink">{name}</span>
                <span className="text-[10px] text-muted font-medium mt-0.5">{role}</span>
              </div>
              <ChevronDown size={16} className="text-muted hidden md:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-2xl shadow-card-hover z-50 overflow-hidden ">
                <div className="p-4 border-b border-divider flex items-center gap-3 bg-surface-soft">
                  <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-extrabold shrink-0">{initials}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink leading-tight truncate">{name}</p>
                    <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mt-0.5 truncate">{role}</p>
                  </div>
                </div>
                <div className="p-2">
                  <Link to="/pengaturan" onClick={onToggleProfile} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-ink-soft hover:bg-surface-soft transition-colors">
                    Pengaturan
                  </Link>
                  <button onClick={askLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-semantic-error hover:bg-semantic-error/10 transition-colors">
                    <LogOut size={16} /> Keluar
                  </button>
                  <button onClick={askLogoutAll} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-ink-soft hover:bg-surface-soft transition-colors">
                    <ShieldOff size={16} /> Keluar dari Semua Perangkat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Menu search modal */}
      <MenuSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => !loggingOut && setConfirmLogout(false)}
        onConfirm={handleLogout}
        tone="warning"
        icon={LogOut}
        title="Keluar dari Akun?"
        message={`Anda akan keluar dari sesi ${name}. Pastikan pekerjaan sudah tersimpan.`}
        confirmLabel={loggingOut ? 'Keluar...' : 'Ya, Keluar'}
        cancelLabel="Batal"
        loading={loggingOut}
        closeOnConfirm={false}
      />
      <ConfirmDialog
        open={confirmLogoutAll}
        onClose={() => !loggingOut && setConfirmLogoutAll(false)}
        onConfirm={handleLogoutAll}
        tone="danger"
        icon={ShieldOff}
        title="Keluar dari Semua Perangkat?"
        message="Seluruh sesi aktif Anda di semua perangkat akan dicabut. Gunakan ini bila akun dirasa berisiko."
        confirmLabel={loggingOut ? 'Memproses...' : 'Ya, Cabut Semua'}
        cancelLabel="Batal"
        loading={loggingOut}
        closeOnConfirm={false}
      />
    </>
  );
};
