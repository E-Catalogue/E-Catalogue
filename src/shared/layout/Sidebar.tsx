import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion';
import { Layers, X, PanelLeftClose, PanelLeftOpen, ChevronDown } from 'lucide-react';
import { Tooltip } from '@/shared/components/ui/Tooltip';
import { useAppSelector } from '@/app/store';
import { getIconComponent } from './iconMapper';
import { childrenOf, isGroup, resolveMenus } from './menu';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@/shared/constants';
import type { ApiMenuItem } from '@/features/auth/types';

interface SidebarProps {
  /** Drawer mobile. */
  open: boolean;
  onClose: () => void;
  /** Sidebar mini (desktop). */
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) => {
  const { location } = useRouterState();
  const reduceMotion = useReducedMotion();

  /** Pegas pendek — penanda aktif terasa "meluncur", bukan melompat. */
  const slide: Transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 520, damping: 40, mass: 0.7 };

  /** Buka/tutup grup: tinggi + fade, kurva yang sama dengan modal. */
  const collapse: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] };

  const apiMenus = useAppSelector((state) => state.auth.groupMenus);
  const groupMenus = resolveMenus(apiMenus);

  /**
   * Grup mana yang terbuka. Aturannya:
   * - Default **tertutup** semua; yang terbuka hanya grup berisi halaman aktif.
   * - Hanya satu grup terbuka (accordion) — buka grup B, grup A ikut menutup.
   * - Pilihan manual user hanya berlaku untuk pathname saat itu. Begitu pindah halaman,
   *   override kedaluwarsa dan grup kembali mengikuti halaman aktif. Ini membuat state
   *   grup **turunan dari route** — tidak perlu useEffect untuk menyinkronkannya.
   */
  const [override, setOverride] = useState<{ path: string; group: string | null } | null>(null);

  const isMenuActive = (path?: string | null): boolean => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/'; // Dashboard: cocok persis
    // Halaman turunan (mis. /customers/123) ikut menyalakan menu induknya.
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const activeGroupId =
    groupMenus.find((g) => isGroup(g) && childrenOf(g).some((c) => isMenuActive(c.path)))?.id ?? null;

  const openGroupId = override?.path === location.pathname ? override.group : activeGroupId;

  const toggleGroup = (id: string) =>
    setOverride({ path: location.pathname, group: openGroupId === id ? null : id });

  const renderBrand = (mini: boolean) => (
    <div
      className={`flex items-center h-16 border-b border-divider shrink-0 ${
        mini ? 'justify-center px-3' : 'gap-3 px-4'
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0">
        <Layers size={18} className="text-white" strokeWidth={2.4} />
      </div>

      {!mini && (
        <>
          <div className="leading-none min-w-0 flex-1">
            <p className="font-extrabold text-ink text-[13px] tracking-tight uppercase truncate">{APP_NAME}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-primary mt-1 truncate">
              {APP_TAGLINE}
            </p>
          </div>

          {/* Tombol perkecil sidebar — di dalam area brand (design.md §3). */}
          <button
            onClick={onToggleCollapse}
            aria-label="Perkecil sidebar"
            aria-expanded
            title="Perkecil sidebar"
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-colors shrink-0"
          >
            <PanelLeftClose size={16} />
          </button>

          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="lg:hidden text-muted hover:text-ink p-1 rounded-lg shrink-0"
          >
            <X size={18} />
          </button>
        </>
      )}
    </div>
  );

  /** Saat mini, tombol perlebar berdiri sendiri di bawah brand. */
  const renderExpandButton = () => (
    <div className="flex justify-center py-3 border-b border-divider shrink-0">
      <Tooltip label="Perlebar sidebar" side="right">
        <button
          onClick={onToggleCollapse}
          aria-label="Perlebar sidebar"
          aria-expanded={false}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-colors"
        >
          <PanelLeftOpen size={16} />
        </button>
      </Tooltip>
    </div>
  );

  /**
   * Item menu (design.md §3):
   * - nested aktif  → solid primary (bg-primary text-white)
   * - tunggal aktif → soft primary (bg-primary-light text-primary) + batang kiri
   */
  const renderItem = (item: ApiMenuItem, mini: boolean, nested: boolean) => {
    const Icon = getIconComponent(item.icon);
    const path = item.path || '#';
    const active = isMenuActive(item.path);

    // Latar sub-menu aktif digambar oleh layer `nav-pill` di bawah; di sini cukup warna teks.
    const activeClass = nested ? 'text-white' : 'bg-primary-light text-primary';

    return (
      <Tooltip key={item.id} label={item.name} enabled={mini} side="right">
        <Link
          to={path}
          onClick={onClose}
          aria-label={item.name}
          aria-current={active ? 'page' : undefined}
          className={`relative flex items-center h-10 rounded-xl text-[13px] font-bold transition-colors ${
            mini ? 'justify-center px-0' : 'gap-3 px-3'
          } ${active ? activeClass : 'text-muted hover:bg-surface-soft hover:text-ink'}`}
        >
          {/* Latar aktif dipisah jadi layer ber-`layoutId` supaya meluncur dari menu
              sebelumnya, bukan muncul-hilang. `nav-pill` untuk sub-menu (solid),
              `nav-bar` untuk item tunggal & judul grup (batang tepi). */}
          {active && nested && (
            <motion.span
              layoutId="nav-pill"
              transition={slide}
              className="absolute inset-0 rounded-xl bg-primary shadow-sm shadow-primary/20"
            />
          )}
          {active && !nested && !mini && (
            <motion.span
              layoutId="nav-bar"
              transition={slide}
              className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-md bg-primary"
            />
          )}

          <Icon size={17} strokeWidth={2.2} className="relative z-10 shrink-0" />
          {!mini && <span className="relative z-10 truncate">{item.name}</span>}
        </Link>
      </Tooltip>
    );
  };

  const renderNav = (mini: boolean) => (
    <nav className="flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-slim">
      {groupMenus.map((entry) => {
        const items = childrenOf(entry);

        // Menu tunggal di level atas (mis. Dashboard) — bukan grup.
        if (!isGroup(entry)) {
          return (
            <div key={entry.id} className="px-3">
              {renderItem(entry, mini, false)}
            </div>
          );
        }

        // Saat mini, sub-menu selalu tampil (tidak ada judul grup untuk diklik).
        const opened = mini || openGroupId === entry.id;
        const hasActiveChild = items.some((i) => isMenuActive(i.path));
        const GroupIcon = getIconComponent(entry.icon);

        return (
          <div key={entry.id} className="px-3">
            {mini ? (
              /* Mini: judul grup jadi ikon grup — ikut menyala bila salah satu anaknya aktif. */
              <Tooltip label={entry.name} side="right">
                <div
                  className={`flex items-center justify-center h-8 transition-colors ${
                    hasActiveChild ? 'text-primary' : 'text-muted'
                  }`}
                >
                  <GroupIcon size={15} strokeWidth={2.4} />
                </div>
              </Tooltip>
            ) : (
              <button
                onClick={() => toggleGroup(entry.id)}
                aria-expanded={opened}
                className={`relative w-full flex items-center gap-2.5 h-10 px-3 rounded-xl text-[13px] font-bold transition-colors ${
                  hasActiveChild ? 'text-primary' : 'text-muted hover:bg-surface-soft hover:text-ink'
                }`}
              >
                {/* Grup dengan halaman aktif → batang penanda, berbagi `layoutId` dengan
                    item tunggal supaya batangnya meluncur, bukan berkedip. */}
                {hasActiveChild && !opened && (
                  <motion.span
                    layoutId="nav-bar"
                    transition={slide}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-md bg-primary"
                  />
                )}

                <GroupIcon size={17} strokeWidth={2.2} className="shrink-0" />
                <span className="flex-1 text-left truncate">{entry.name}</span>

                <motion.span
                  animate={{ rotate: opened ? 0 : -90 }}
                  transition={collapse}
                  className="shrink-0 flex"
                >
                  <ChevronDown size={15} />
                </motion.span>
              </button>
            )}

            <AnimatePresence initial={false}>
              {opened && items.length > 0 && (
                <motion.div
                  key="sub"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={collapse}
                  className="overflow-hidden"
                >
                  <div className={`space-y-1 ${mini ? 'mt-1' : 'mt-1 pl-3'}`}>
                    {items.map((item) => renderItem(item, mini, true))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );

  const renderVersion = (mini: boolean) =>
    !mini && (
      <div className="px-5 py-3 border-t border-divider shrink-0">
        <p className="text-[10px] font-bold text-muted">{APP_VERSION}</p>
      </div>
    );

  return (
    <>
      {/* Desktop */}
      {/* Setinggi viewport & menempel — brand/footer tetap, hanya <nav> yang scroll. */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-surface border-r border-border transition-[width] duration-200 ${
          collapsed ? 'w-[4.5rem]' : 'w-60'
        }`}
      >
        {renderBrand(collapsed)}
        {collapsed && renderExpandButton()}
        {renderNav(collapsed)}
        {renderVersion(collapsed)}
      </aside>

      {/* Drawer mobile — selalu penuh, tidak ikut mini. */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[90] flex">
          <div className="absolute inset-0 bg-ink/50 animate-fade-in" onClick={onClose} />
          <aside className="relative z-10 flex flex-col h-full w-60 bg-surface border-r border-border animate-float-up">
            {renderBrand(false)}
            {renderNav(false)}
            {renderVersion(false)}
          </aside>
        </div>
      )}
    </>
  );
};
