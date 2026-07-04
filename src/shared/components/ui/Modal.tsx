import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({ open, onClose, title, subtitle, icon, children, footer, size = 'md', className = '' }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

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
            onClick={onClose} 
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
                  onClick={onClose}
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
