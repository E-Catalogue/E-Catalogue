import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionCardProps {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard = ({ title, icon, action, children, className = '', bodyClassName = '' }: SectionCardProps) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
      className={`bg-surface rounded-3xl border border-border shadow-card ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 md:px-6 pt-5 pb-4 border-b border-divider">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="text-primary shrink-0">{icon}</span>}
            {title && <h2 className="text-[13px] font-extrabold uppercase tracking-wide text-ink truncate">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className={`p-5 md:p-6 ${bodyClassName}`}>{children}</div>
    </motion.section>
  );
};
