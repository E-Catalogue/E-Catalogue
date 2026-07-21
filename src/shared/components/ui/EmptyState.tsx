import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Belum ada data',
  description = 'Data akan tampil di sini setelah tersedia.',
  className = '',
}: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center text-center px-6 py-14 ${className}`}>
    <div className="w-12 h-12 rounded-2xl bg-surface-soft border border-border text-muted flex items-center justify-center mb-3">
      <Icon size={24} />
    </div>
    <p className="text-[14px] font-bold text-ink">{title}</p>
    <p className="text-[12px] font-medium text-muted mt-1 max-w-sm">{description}</p>
  </div>
);
