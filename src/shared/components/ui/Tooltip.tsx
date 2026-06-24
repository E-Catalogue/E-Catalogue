import { useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  label: string;
  children: ReactNode;
  /** Tampilkan tooltip atau tidak (mis. hanya saat sidebar mini). */
  enabled?: boolean;
  side?: 'right' | 'top';
}

/**
 * Tooltip ringan berbasis portal — posisinya dihitung dari bounding rect target,
 * jadi tidak ikut terpotong oleh container yang ber-overflow (mis. nav yang bisa scroll).
 */
export const Tooltip = ({ label, children, enabled = true, side = 'right' }: TooltipProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  const show = () => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (side === 'right') setCoords({ x: r.right + 12, y: r.top + r.height / 2 });
    else setCoords({ x: r.left + r.width / 2, y: r.top - 10 });
  };
  const hide = () => setCoords(null);

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="block">
      {children}
      {coords &&
        createPortal(
          <div
            style={{ left: coords.x, top: coords.y }}
            className={`fixed z-[200] pointer-events-none bg-ink text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-fade-in ${
              side === 'right' ? '-translate-y-1/2' : '-translate-x-1/2 -translate-y-full'
            }`}
          >
            {label}
          </div>,
          document.body,
        )}
    </div>
  );
};
