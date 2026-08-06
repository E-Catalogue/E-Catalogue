import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ApiMeta } from '@/core/api/types';

interface PaginationProps {
  meta?: ApiMeta;
  page: number;
  onChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  itemLabel?: string;
  className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 1) {
    return [1];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export const Pagination = ({
  meta,
  page,
  onChange,
  limit,
  onLimitChange,
  limitOptions = [10, 15, 25, 50, 100],
  itemLabel = 'data',
  className = '',
}: PaginationProps) => {
  const total = meta?.total ?? 0;
  const currentLimit = limit ?? meta?.limit ?? 15;
  const totalPages = Math.max(1, meta?.totalPages ?? (currentLimit > 0 && total > 0 ? Math.ceil(total / currentLimit) : 1));

  const startItem = total > 0 ? (page - 1) * currentLimit + 1 : 0;
  const endItem = total > 0 ? Math.min(page * currentLimit, total) : 0;

  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (total === 0 && (!meta || meta.total === 0)) {
    return null;
  }

  return (
    <div className={`flex flex-col lg:flex-row items-center justify-between gap-4 pt-3.5 border-t border-border/70 ${className}`}>
      {/* Pojok Kiri Bawah: Keterangan Data & Show Rows Dropdown */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-[12px] font-semibold text-muted w-full lg:w-auto">
        {total > 0 ? (
          <div className="flex items-center gap-1.5 bg-surface-soft border border-border/80 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <span>Menampilkan</span>
            <span className="text-primary font-extrabold">{startItem}–{endItem}</span>
            <span>dari</span>
            <span className="text-ink font-extrabold">{total}</span>
            <span>{itemLabel}</span>
          </div>
        ) : (
          <div className="bg-surface-soft border border-border/80 px-3.5 py-1.5 rounded-xl">
            <span>Halaman <span className="text-primary font-extrabold">{page}</span> dari {totalPages}</span>
          </div>
        )}

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-muted text-[11px] font-medium hidden sm:inline">Tampilkan:</span>
            <div className="relative inline-flex items-center">
              <select
                value={currentLimit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="h-8.5 pl-3 pr-7 rounded-xl bg-surface border border-border text-ink text-[12px] font-bold appearance-none cursor-pointer hover:border-primary/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light shadow-2xs transition-all"
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} baris
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 text-muted">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pojok Kanan Bawah: Pagination Controls (Prev, Numbered Pages with Active State, Next) */}
      <div className="flex items-center gap-1.5 select-none w-full lg:w-auto justify-center lg:justify-end">
        {/* Tombol Sebelumnya */}
        <button
          type="button"
          onClick={() => canPrev && onChange(page - 1)}
          disabled={!canPrev}
          aria-label="Halaman Sebelumnya"
          className={`h-9 px-3.5 rounded-xl border flex items-center gap-1.5 text-[12px] font-bold transition-all shadow-2xs ${
            canPrev
              ? 'bg-primary text-white border-primary hover:bg-primary-dark shadow-sm shadow-primary/30 active:scale-95 cursor-pointer'
              : 'bg-surface/50 border-border/40 text-muted/30 opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Nomor Halaman (Selalu tampil nomor halaman termasuk halaman 1) */}
        <div className="flex items-center gap-1.5">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-9 flex items-center justify-center text-muted/70 font-bold text-[13px] tracking-wider"
                >
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === page;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[36px] h-9 px-2.5 rounded-xl text-[12px] font-extrabold transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/35 ring-2 ring-primary/25 scale-102 cursor-default'
                    : 'bg-surface border border-border text-ink-soft hover:border-primary hover:text-primary hover:bg-surface-soft active:scale-95 cursor-pointer'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Tombol Berikutnya */}
        <button
          type="button"
          onClick={() => canNext && onChange(page + 1)}
          disabled={!canNext}
          aria-label="Halaman Berikutnya"
          className={`h-9 px-3.5 rounded-xl border flex items-center gap-1.5 text-[12px] font-bold transition-all shadow-2xs ${
            canNext
              ? 'bg-primary text-white border-primary hover:bg-primary-dark shadow-sm shadow-primary/30 active:scale-95 cursor-pointer'
              : 'bg-surface/50 border-border/40 text-muted/30 opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight size={16} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
};
