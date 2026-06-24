import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
    <div>
      <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted font-medium mt-1">{description}</p>}
    </div>
    {action}
  </div>
);
