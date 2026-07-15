import type { ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

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
  
  // Optional features
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  limit?: number;
  onLimitChange?: (limit: number) => void;
  
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({ 
  columns, 
  data, 
  rowKey,
  searchPlaceholder = 'Cari data...',
  searchValue,
  onSearchChange,
  limit,
  onLimitChange,
  page,
  totalPages,
  onPageChange
}: DataTableProps<T>) {
  const alignClass = (a?: string) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  const hasToolbar = onSearchChange || onLimitChange;
  const hasPagination = onPageChange && page !== undefined && totalPages !== undefined;

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
      
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border bg-surface-soft/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onSearchChange && (
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-surface border border-border text-[13px] font-medium placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {onLimitChange && limit !== undefined && (
              <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
                <span>Tampilkan</span>
                <div className="relative">
                  <select
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="h-10 pl-3 pr-8 rounded-xl bg-surface border border-border text-ink appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    {[10, 25, 50, 100].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <span>baris</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto scrollbar-slim flex-1">
        <table className="w-full border-collapse min-w-[640px]">
          <thead className="bg-surface-soft/30">
            <tr className="border-b border-border">
              {columns.map((c, i) => (
                <th key={i} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted ${alignClass(c.align)}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-medium text-muted">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)} className="border-b border-divider last:border-0 hover:bg-surface-soft/50 transition-colors">
                  {columns.map((c, i) => (
                    <td key={i} className={`px-4 py-3.5 text-[12px] font-semibold text-ink-soft ${alignClass(c.align)} ${c.className ?? ''}`}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {hasPagination && (
        <div className="flex items-center justify-between p-4 border-t border-border bg-surface-soft/50">
          <p className="text-[12px] font-medium text-muted">
            Halaman <span className="font-bold text-ink">{page}</span> dari <span className="font-bold text-ink">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-surface text-ink hover:bg-surface-soft hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-surface text-ink hover:bg-surface-soft hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
