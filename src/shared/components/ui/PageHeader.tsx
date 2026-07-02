import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"
  >
    <div>
      <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted font-medium mt-1">{description}</p>}
    </div>
    {action}
  </motion.div>
);
