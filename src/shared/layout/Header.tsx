import { useLocation, Link } from '@tanstack/react-router';
import { Menu, Search, Bell, CalendarDays, ChevronDown, Store } from 'lucide-react';
import { MENU_ITEMS } from './menu';
import { CURRENT_USER } from '@/shared/constants';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  isProfileOpen: boolean;
  onToggleProfile: () => void;
}

export const Header = ({ onOpenMobileSidebar, isProfileOpen, onToggleProfile }: HeaderProps) => {
  const location = useLocation();
  const active = MENU_ITEMS.find((m) => location.pathname.startsWith(m.path));
  const title = active?.label ?? 'Dashboard';
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
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
              Selamat datang kembali, <span className="text-primary font-bold">{CURRENT_USER.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* CENTER: search */}
      <div className="hidden md:flex flex-1 max-w-md mx-auto">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" strokeWidth={2.2} />
          <input
            type="text"
            placeholder="Cari unit, pelanggan, transaksi..."
            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-surface-soft border border-border text-sm font-medium placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>
      </div>

      {/* RIGHT: actions */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Link to="/" className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-surface-soft border border-border text-ink-soft hover:text-primary hover:border-primary font-bold text-[12px] px-3 py-2.5 transition-colors" title="Lihat katalog publik">
          <Store size={16} /> Katalog
        </Link>
        <button className="relative p-2.5 rounded-xl bg-surface-soft text-ink-soft hover:text-primary hover:bg-primary-light transition-colors">
          <Bell size={20} strokeWidth={2.2} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">8</span>
        </button>
        <button className="hidden sm:flex p-2.5 rounded-xl bg-surface-soft text-ink-soft hover:text-primary hover:bg-primary-light transition-colors">
          <CalendarDays size={20} strokeWidth={2.2} />
        </button>

        <div className="relative">
          <button
            onClick={onToggleProfile}
            className="flex items-center gap-2.5 pl-1.5 pr-2 md:pr-3 py-1.5 rounded-full bg-surface-soft border border-border hover:border-primary transition-colors"
          >
            <img src={CURRENT_USER.avatar} alt="" className="w-8 h-8 rounded-full object-cover bg-primary-light" />
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-[12px] font-bold text-ink">{CURRENT_USER.name}</span>
              <span className="text-[10px] text-muted font-medium mt-0.5">{CURRENT_USER.role}</span>
            </div>
            <ChevronDown size={16} className="text-muted hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-2xl shadow-card-hover z-50 overflow-hidden animate-float-up">
              <div className="p-4 border-b border-divider flex items-center gap-3 bg-surface-soft">
                <img src={CURRENT_USER.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-ink leading-tight">{CURRENT_USER.name}</p>
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mt-0.5">{CURRENT_USER.role}</p>
                </div>
              </div>
              <div className="p-2">
                <p className="px-3 py-2 text-[11px] text-muted">Login di-skip (mode demo)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
