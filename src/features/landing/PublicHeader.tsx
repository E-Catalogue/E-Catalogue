import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface PublicHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  align?: 'left' | 'center';
  children?: ReactNode;
}

/** Header band konsisten untuk halaman-halaman publik. */
export const PublicHeader = ({ eyebrow, title, subtitle, breadcrumb, align = 'left', children }: PublicHeaderProps) => (
  <section className="bg-surface border-b border-border">
    <div className={`max-w-7xl mx-auto px-4 md:px-6 py-9 md:py-12 ${align === 'center' ? 'text-center' : ''}`}>
      {breadcrumb && (
        <nav className={`flex items-center gap-1.5 text-[12px] font-semibold text-muted mb-3 flex-wrap ${align === 'center' ? 'justify-center' : ''}`}>
          {breadcrumb.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {c.to ? <Link to={c.to} className="hover:text-primary transition-colors">{c.label}</Link> : <span className="text-ink font-bold">{c.label}</span>}
              {i < breadcrumb.length - 1 && <ChevronRight size={13} />}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{eyebrow}</p>}
      <h1 className="text-2xl md:text-4xl font-extrabold text-ink mt-1.5 tracking-tight">{title}</h1>
      {subtitle && <p className={`text-muted font-medium mt-2 ${align === 'center' ? 'max-w-lg mx-auto' : 'max-w-2xl'}`}>{subtitle}</p>}
      {children}
    </div>
  </section>
);
