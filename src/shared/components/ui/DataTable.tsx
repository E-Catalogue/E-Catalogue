import type { ReactNode } from 'react';
import { AlertCircle, Loader2, type LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './Skeleton';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  refreshing?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    description: string;
  };
  skeletonRows?: number;
}

export function DataTable<T>({
  columns, data, rowKey, loading = false, refreshing = false, error = false,
  onRetry, emptyState, skeletonRows = 6,
}: DataTableProps<T>) {
  const alignClass = (a?: string) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  if (loading) return <TableSkeleton rows={skeletonRows} cols={columns.length} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-14">
        <AlertCircle size={30} className="text-semantic-error mb-3" />
        <p className="text-[14px] font-bold text-ink">Gagal memuat data</p>
        <p className="text-[12px] font-medium text-muted mt-1">Periksa koneksi lalu coba muat kembali.</p>
        {onRetry && <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">Coba Lagi</Button>}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState {...emptyState} />;
  }

  return (
    <div className="relative overflow-x-auto scrollbar-slim">
      {refreshing && (
        <div className="absolute right-3 top-2 z-10 inline-flex items-center gap-1.5 rounded-lg bg-surface/95 border border-border px-2 py-1 text-[10px] font-bold text-muted shadow-sm">
          <Loader2 size={11} className="animate-spin" /> Memperbarui
        </div>
      )}
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c, i) => (
              <th key={i} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted ${alignClass(c.align)}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={rowKey(row)} className="border-b border-divider last:border-0 hover:bg-surface-soft transition-colors">
              {columns.map((c, i) => (
                <td key={i} className={`px-4 py-3.5 text-[12px] font-semibold text-ink-soft ${alignClass(c.align)} ${c.className ?? ''}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
