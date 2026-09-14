import { Link, useLocation } from '@tanstack/react-router';
import {
  Home,
  Car,
  Calculator,
  Star,
  Phone,
  Info,
  Compass,
  type LucideIcon,
} from 'lucide-react';

interface MobileFloatingNavItem {
  to: string;
  label: string;
}

interface MobileFloatingNavProps {
  items: MobileFloatingNavItem[];
}

const getNavIcon = (to: string, label: string): LucideIcon => {
  const lower = `${label} ${to}`.toLowerCase();
  if (to === '/' || lower.includes('beranda') || lower.includes('home')) return Home;
  if (to.includes('katalog') || lower.includes('katalog') || lower.includes('mobil') || lower.includes('unit')) return Car;
  if (to.includes('simulasi') || lower.includes('kredit') || lower.includes('simulasi') || lower.includes('cicilan')) return Calculator;
  if (to.includes('testimoni') || lower.includes('testimoni') || lower.includes('ulasan') || lower.includes('review')) return Star;
  if (to.includes('kontak') || lower.includes('kontak') || lower.includes('hubungi') || lower.includes('contact')) return Phone;
  if (to.includes('tentang') || lower.includes('tentang') || lower.includes('about') || lower.includes('profil')) return Info;
  return Compass;
};

export const MobileFloatingNav = ({ items }: MobileFloatingNavProps) => {
  const location = useLocation();

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Navigasi Utama Mobile"
      className="fixed bottom-3 sm:bottom-4 inset-x-0 mx-auto z-50 md:hidden w-[calc(100%-1.25rem)] max-w-md pointer-events-auto select-none"
    >
      <div className="flex items-center justify-around gap-1 rounded-full bg-white/95 px-2 py-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl border border-border/80 ring-1 ring-black/5">
        {items.map((item) => {
          const Icon = getNavIcon(item.to, item.label);
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 min-w-0 ${
                isActive
                  ? 'bg-primary text-white shadow-sm font-extrabold'
                  : 'text-ink-soft hover:text-primary hover:bg-surface-soft/80'
              }`}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                  isActive ? 'text-white' : 'text-muted group-hover:text-primary'
                }`}
              />
              <span
                className={`text-[10px] font-bold tracking-tight mt-0.5 leading-none truncate max-w-[56px] ${
                  isActive ? 'text-white font-extrabold' : 'text-ink-soft'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
