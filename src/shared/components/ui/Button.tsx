import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | string;

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-glow',
  secondary: 'bg-surface border border-border text-ink-soft hover:border-primary hover:text-primary',
  danger: 'bg-semantic-error text-white hover:brightness-95 shadow-sm',
  ghost: 'text-muted hover:text-primary hover:bg-primary-light',
};

const SIZES: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-[13px] px-4 py-2.5 rounded-xl',
  lg: 'text-sm px-5 py-3 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
  /** Tampilkan spinner + nonaktifkan tombol (cegah double-click saat proses). */
  loading?: boolean;
}

export const Button = ({ variant = 'primary', size = 'md', icon, block, loading, disabled, className = '', children, ...rest }: ButtonProps) => (
  <button
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size] || SIZES.md} ${block ? 'w-full' : ''} ${className}`}
    {...rest}
  >
    {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
    {children}
  </button>
);
