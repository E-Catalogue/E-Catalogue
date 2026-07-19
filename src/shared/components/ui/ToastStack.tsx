import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X, type LucideIcon } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { removeToastItem, type ToastItem } from '@/app/store/uiSlice';

const VARIANT_STYLE: Record<ToastItem['variant'], { Icon: LucideIcon; wrap: string; bar: string }> = {
  success: { Icon: CheckCircle2, wrap: 'bg-accent-green/10 text-accent-green', bar: 'bg-accent-green' },
  info: { Icon: Info, wrap: 'bg-accent-blue/10 text-accent-blue', bar: 'bg-accent-blue' },
  warning: { Icon: AlertTriangle, wrap: 'bg-accent-amber/10 text-accent-amber', bar: 'bg-accent-amber' },
};

const AUTO_DISMISS_MS = 4000;

const ToastCard = ({ item }: { item: ToastItem }) => {
  const dispatch = useAppDispatch();
  const { Icon, wrap } = VARIANT_STYLE[item.variant];

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToastItem(item.id)), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [dispatch, item.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="pointer-events-auto w-full sm:w-96 bg-surface border border-border rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${wrap}`}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[13px] font-bold text-ink leading-snug">{item.title}</p>
          {item.message && <p className="text-[12px] text-muted font-medium mt-0.5 leading-snug">{item.message}</p>}
        </div>
        <button
          type="button"
          onClick={() => dispatch(removeToastItem(item.id))}
          aria-label="Tutup notifikasi"
          className="shrink-0 text-muted hover:text-ink p-1 -m-1 rounded-lg transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
};

/** Notifikasi non-blocking (sukses/info/warning), auto-dismiss. Error tetap lewat GlobalErrorModal. */
export const ToastStack = () => {
  const toasts = useAppSelector((s) => s.ui.toasts);

  return createPortal(
    <div className="fixed z-[200] bottom-4 right-4 left-4 sm:left-auto flex flex-col items-end gap-2.5 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
};
