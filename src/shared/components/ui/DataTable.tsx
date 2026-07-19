import type { ReactNode } from 'react';

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
}

export function DataTable<T>({ columns, data, rowKey }: DataTableProps<T>) {
  const alignClass = (a?: string) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="overflow-x-auto scrollbar-slim">
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
