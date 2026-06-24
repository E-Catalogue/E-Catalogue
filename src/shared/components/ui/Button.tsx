import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-glow',
  secondary: 'bg-surface border border-border text-ink-soft hover:border-primary hover:text-primary',
  danger: 'bg-semantic-error text-white hover:brightness-95 shadow-sm',
  ghost: 'text-muted hover:text-primary hover:bg-primary-light',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  block?: boolean;
}

export const Button = ({ variant = 'primary', icon, block, className = '', children, ...rest }: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] px-4 py-2.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${block ? 'w-full' : ''} ${className}`}
    {...rest}
  >
    {icon}
    {children}
  </button>
);
