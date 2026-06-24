import { Link, useLocation } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Car } from 'lucide-react';
import { MENU_ITEMS } from './menu';
import { Logo } from './Logo';
import { QuickInput } from './QuickInput';
import { Tooltip } from '@/shared/components/ui/Tooltip';

interface SidebarProps {
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  main: 'Menu Utama',
  operasional: 'Operasional',
  lainnya: 'Lainnya',
};

export const Sidebar = ({ isMobileOpen, isDesktopOpen, onCloseMobile, onToggleDesktop }: SidebarProps) => {
  const location = useLocation();
  const isExpanded = isDesktopOpen || isMobileOpen;

  const groups = ['main', 'operasional', 'lainnya'] as const;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-ink/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[60] lg:relative bg-surface flex flex-col border-r border-border shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out shrink-0
          ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
          ${isDesktopOpen ? 'lg:w-[264px]' : 'lg:w-[84px]'}`}
      >
        {/* FLOATING TOGGLE (straddles right border, works in both states) */}
        <button
          onClick={onToggleDesktop}
          className="hidden lg:flex absolute -right-3 top-[26px] z-20 w-6 h-6 rounded-full bg-surface border border-border shadow-card text-muted hover:text-primary hover:border-primary items-center justify-center transition-colors"
          title={isDesktopOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {isDesktopOpen ? <ChevronLeft size={14} strokeWidth={2.6} /> : <ChevronRight size={14} strokeWidth={2.6} />}
        </button>

        {/* HEADER / LOGO */}
        <div
          className={`flex items-center h-[76px] shrink-0 border-b border-divider ${
            isExpanded ? 'px-5' : 'justify-center px-2'
          }`}
        >
          {isExpanded ? <Logo /> : <Logo compact />}
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
          {groups.map((group) => {
            const items = MENU_ITEMS.filter((m) => m.group === group);
            return (
              <div key={group}>
                {isExpanded && (
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted/70">
                    {GROUP_LABELS[group]}
                  </p>
                )}
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <Tooltip key={item.path} label={item.label} enabled={!isExpanded}>
                        <Link
                          to={item.path}
                          onClick={onCloseMobile}
                          className={`flex items-center rounded-xl font-semibold transition-all
                            ${isActive
                              ? 'bg-primary text-white shadow-glow'
                              : 'text-ink-soft hover:bg-surface-soft hover:text-primary'}
                            ${isExpanded ? 'h-11 px-3 gap-3' : 'h-11 justify-center'}`}
                        >
                          <Icon size={20} strokeWidth={isActive ? 2.4 : 2} className="shrink-0" />
                          {isExpanded && <span className="text-[13px] tracking-tight whitespace-nowrap">{item.label}</span>}
                        </Link>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* PROMO CARD + QUICK INPUT */}
        <div className="p-3 border-t border-divider space-y-3 shrink-0">
          {isExpanded && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-4 text-white">
              <Car size={64} className="absolute -right-3 -bottom-3 text-white/15" strokeWidth={1.5} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Cars Showroom</p>
              <p className="text-sm font-extrabold leading-tight mt-1">#PilihanTerbaik<br />Untuk Mobil Impian Anda</p>
            </div>
          )}
          <QuickInput expanded={isExpanded} />
        </div>
      </aside>
    </>
  );
};
