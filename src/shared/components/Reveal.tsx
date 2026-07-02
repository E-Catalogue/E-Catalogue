import { useEffect, useRef, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Delay animasi (ms) untuk efek berurutan. */
  delay?: number;
  className?: string;
  as?: 'div' | 'section';
}

/**
 * Reveal saat elemen masuk viewport — **hanya sekali** (observer di-unobserve
 * setelah tampil), jadi tidak berulang ketika section disorot ulang.
 */
export const Reveal = ({ children, delay = 0, className = '', as = 'div' }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.classList.contains('is-visible')) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const t = window.setTimeout(() => el.classList.add('is-visible'), delay);
            io.unobserve(el);           // sekali saja
            return () => window.clearTimeout(t);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const Tag = as;
  return <Tag ref={ref as never} className={`reveal ${className}`}>{children}</Tag>;
};
