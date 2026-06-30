import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  ChevronLeft, ChevronRight, ChevronDown, Car,
  LayoutDashboard, Wrench, Database, ShieldCheck, Settings,
  type LucideIcon,
} from 'lucide-react';
import { MENU_ITEMS, PATH_BY_CODE, VALID_PATHS } from './menu';
import { Logo } from './Logo';
import { QuickInput } from './QuickInput';
import { Tooltip } from '@/shared/components/ui/Tooltip';
import { resolveIcon } from './iconMap';
import { useAppSelector } from '@/app/store';

interface SidebarProps {
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
}
interface NavGroup {
  key: string;
  label: string;
  Icon: LucideIcon;
  items: NavItem[];
}

const STATIC_GROUP_META: Record<string, { label: string; Icon: LucideIcon }> = {
  main:        { label: 'Menu Utama',    Icon: LayoutDashboard },
  operasional: { label: 'Operasional',   Icon: Wrench          },
  master:      { label: 'Master Data',   Icon: Database        },
  akses:       { label: 'Akses Kontrol', Icon: ShieldCheck     },
  lainnya:     { label: 'Lainnya',       Icon: Settings        },
};
const STATIC_GROUP_ORDER = ['main', 'operasional', 'master', 'akses', 'lainnya'] as const;

const buildStaticGroups = (): NavGroup[] =>
  STATIC_GROUP_ORDER.map((key) => {
    const meta = STATIC_GROUP_META[key];
    return {
      key,
      label: meta.label,
      Icon: meta.Icon,
      items: MENU_ITEMS.filter((m) => m.group === key).map((m) => ({
        path: m.path, label: m.label, Icon: m.icon,
      })),
    };
  }).filter((g) => g.items.length > 0);

const resolveFrontendPath = (m: { path?: string | null; code?: string }): string | null => {
  if (m.code && PATH_BY_CODE[m.code]) return PATH_BY_CODE[m.code];
  if (m.path && VALID_PATHS.has(m.path)) return m.path;
  return null;
};

export const Sidebar = ({ isMobileOpen, isDesktopOpen, onCloseMobile, onToggleDesktop }: SidebarProps) => {
  const location = useLocation();
  const isExpanded = isDesktopOpen || isMobileOpen;
  const groupMenus = useAppSelector((s) => s.auth.groupMenus);

  const navGroups = useMemo<NavGroup[]>(() => {
    let groups: NavGroup[] = [];
    if (groupMenus && groupMenus.length > 0) {
      groups = [...groupMenus]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((g) => ({
          key: g.id,
          label: g.name,
          Icon: resolveIcon({ icon: g.icon, code: g.code }),
          items: [...(g.menus ?? [])]
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((m) => {
              const path = resolveFrontendPath(m);
              return path
                ? { path, label: m.name, Icon: resolveIcon({ icon: m.icon, code: m.code, path: m.path }) }
                : null;
            })
            .filter((it): it is NavItem => it !== null),
        }))
        .filter((g) => g.items.length > 0);
    }
    return groups.length > 0 ? groups : buildStaticGroups();
  }, [groupMenus]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const activeKey = navGroups.find((g) =>
      g.items.some((item) => location.pathname.startsWith(item.path))
    )?.key;
    if (activeKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenGroups((prev) => {
        if (prev.has(activeKey)) return prev;
        return new Set([...prev, activeKey]);
      });
    }
  }, [location.pathname, navGroups]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 lg:hidden backdrop-blur-[2px]"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[60] lg:relative
          bg-surface flex flex-col
          border-r border-divider
          shadow-[2px_0_24px_-4px_rgba(24,29,42,0.10)] lg:shadow-none
          transition-all duration-300 ease-in-out shrink-0
          ${isMobileOpen ? 'translate-x-0 w-[268px]' : '-translate-x-full lg:translate-x-0'}
          ${isDesktopOpen ? 'lg:w-[256px]' : 'lg:w-[70px]'}
        `}
      >
        {/* Toggle pill */}
        <button
          onClick={onToggleDesktop}
          className="hidden lg:flex absolute -right-[13px] top-6 z-20
            w-6 h-6 rounded-full bg-surface border border-border shadow-card
            text-muted hover:text-primary hover:border-primary
            items-center justify-center transition-all duration-150"
          title={isDesktopOpen ? 'Tutup sidebar' : 'Buka sidebar'}
        >
          {isDesktopOpen
            ? <ChevronLeft size={13} strokeWidth={2.8} />
            : <ChevronRight size={13} strokeWidth={2.8} />}
        </button>

        {/* Logo header */}
        <div
          className={`
            flex items-center h-[68px] shrink-0 border-b border-divider
            transition-all duration-300
            ${isExpanded ? 'px-5' : 'justify-center px-2'}
          `}
        >
          {isExpanded ? <Logo /> : <Logo compact />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2.5">
          {isExpanded ? (
            /* ── EXPANDED: accordion groups ── */
            <div className="space-y-0.5">
              {navGroups.map((group, gi) => {
                const isOpen = openGroups.has(group.key);
                const hasActive = group.items.some((item) =>
                  location.pathname.startsWith(item.path)
                );
                const GroupIcon = group.Icon;

                return (
                  <div key={group.key} className={gi > 0 ? 'pt-0.5' : ''}>
                    {/* Group accordion trigger */}
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className={`
                        relative w-full flex items-start gap-2.5 pl-3 pr-2.5 py-2.5 rounded-xl
                        select-none transition-all duration-150
                        ${hasActive
                          ? 'text-primary'
                          : 'text-muted/60 hover:text-muted hover:bg-surface-soft'
                        }
                      `}
                    >
                      {/* Left accent bar on active */}
                      <span
                        className={`
                          absolute left-0 top-1/2 -translate-y-1/2
                          w-[3px] rounded-full transition-all duration-200
                          ${hasActive ? 'h-5 bg-primary opacity-100' : 'h-0 opacity-0'}
                        `}
                      />

                      <GroupIcon
                        size={14}
                        strokeWidth={hasActive ? 2.4 : 2}
                        className="shrink-0 mt-[1px]"
                      />
                      <span className="flex-1 text-left text-[13px] font-bold leading-snug">
                        {group.label}
                      </span>

                      <ChevronDown
                        size={13}
                        strokeWidth={2.4}
                        className={`
                          shrink-0 mt-[1px] transition-transform duration-200
                          ${isOpen ? 'rotate-180' : ''}
                          ${hasActive ? 'text-primary/70' : 'text-muted/30'}
                        `}
                      />
                    </button>

                    {/* Accordion body */}
                    <div
                      className={`
                        grid transition-[grid-template-rows] duration-200 ease-in-out
                        ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
                      `}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-0.5 pt-0.5 pb-1 pl-1">
                          {group.items.map((item) => {
                            const Icon = item.Icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={onCloseMobile}
                                className={`
                                  flex items-center min-h-[38px] py-[9px] px-3 gap-2.5 rounded-xl
                                  text-[12.5px] transition-all duration-150
                                  ${isActive
                                    ? 'bg-primary text-white font-semibold shadow-glow'
                                    : 'text-ink-soft font-medium hover:bg-primary-light hover:text-primary'
                                  }
                                `}
                              >
                                <Icon
                                  size={15}
                                  strokeWidth={isActive ? 2.3 : 1.9}
                                  className="shrink-0"
                                />
                                <span className="leading-snug">{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── COLLAPSED: flat icons + group separators ── */
            <div className="space-y-0.5">
              {navGroups.map((group, gi) => (
                <div key={group.key}>
                  {gi > 0 && (
                    <div className="flex items-center justify-center py-1.5">
                      <div className="w-5 h-px rounded-full bg-divider" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.Icon;
                      const isActive = location.pathname.startsWith(item.path);
                      return (
                        <Tooltip key={item.path} label={item.label} enabled>
                          <Link
                            to={item.path}
                            onClick={onCloseMobile}
                            className={`
                              flex items-center justify-center h-10 rounded-xl
                              transition-all duration-150
                              ${isActive
                                ? 'bg-primary text-white shadow-glow'
                                : 'text-ink-soft hover:bg-primary-light hover:text-primary'
                              }
                            `}
                          >
                            <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} />
                          </Link>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div
          className={`border-t border-divider shrink-0 transition-all duration-300 ${isExpanded ? 'p-3 space-y-2.5' : 'p-2 space-y-2'}`}
        >
          {isExpanded && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D97757] to-[#B05232] p-4 text-white select-none">
              {/* Dot texture */}
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              />
              {/* Ghost car */}
              <Car
                size={72}
                className="absolute -right-3 -bottom-4 text-white/15"
                strokeWidth={1.2}
              />
              <p className="relative text-[9.5px] font-black uppercase tracking-[0.22em] text-white/60 mb-1">
                GM Mobilindo
              </p>
              <p className="relative text-[13px] font-extrabold leading-snug">
                Pilihan Terbaik
              </p>
              <p className="relative text-[11px] font-semibold text-white/75 leading-tight">
                untuk Mobil Impian Anda
              </p>
            </div>
          )}
          <QuickInput expanded={isExpanded} />
        </div>
      </aside>
    </>
  );
};
