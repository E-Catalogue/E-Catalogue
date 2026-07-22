import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMutating } from '@tanstack/react-query';
import { safeRandomUUID } from '@/core/utils/uuid';

const modalStack: string[] = [];

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Blokir Escape, backdrop, dan tombol tutup saat aksi async sedang berjalan. */
  busy?: boolean;
  /** Gunakan false untuk dialog yang memang tidak boleh ditutup dari luar. */
  dismissible?: boolean;
  /** Default true: editor/detail tidak dapat ditutup selama mutation global berjalan. */
  blockWhileMutating?: boolean;
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({
  open, onClose, title, subtitle, icon, children, footer, size = 'md', className = '',
  busy = false, dismissible = true, blockWhileMutating = true,
}: ModalProps) => {
  const mutationCount = useIsMutating();
  const [modalId] = useState(() => safeRandomUUID());
  const effectiveBusy = busy || (blockWhileMutating && mutationCount > 0);
  const canDismiss = dismissible && !effectiveBusy;
  useEffect(() => {
    if (!open) return;
    modalStack.push(modalId);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalStack.at(-1) === modalId && canDismiss) onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      const index = modalStack.lastIndexOf(modalId);
      if (index >= 0) modalStack.splice(index, 1);
      document.body.style.overflow = '';
    };
  }, [open, onClose, canDismiss, modalId]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm" 
            onClick={() => canDismiss && onClose()}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative z-10 w-full ${SIZES[size]} bg-surface rounded-t-3xl sm:rounded-3xl shadow-card-hover flex flex-col max-h-[92vh] sm:max-h-[88vh] ${className}`}
            role="dialog"
            aria-modal="true"
          >
            {(title || icon) && (
              <div className="flex items-start justify-between gap-3 px-5 md:px-6 py-4 md:py-5 border-b border-divider shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    {title && <h3 className="text-base md:text-lg font-extrabold text-ink truncate">{title}</h3>}
                    {subtitle && <p className="text-[12px] text-muted font-medium truncate">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={() => canDismiss && onClose()}
                  disabled={!canDismiss}
                  aria-label="Tutup dialog"
                  className="p-2 -mr-1 rounded-xl text-muted hover:text-primary hover:bg-primary-light transition-colors shrink-0"
                >
                  <X size={20} strokeWidth={2.4} />
                </button>
              </div>
            )}

            <div className="px-5 md:px-6 py-5 overflow-y-auto scrollbar-slim flex-1">{children}</div>

            {footer && (
              <div className="px-5 md:px-6 py-4 border-t border-divider flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 shrink-0 bg-surface-soft/60 rounded-b-3xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
