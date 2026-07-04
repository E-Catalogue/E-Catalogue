import { Loader2 } from 'lucide-react';

/** Blok shimmer dasar. */
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
);

/** Skeleton baris tabel — dipakai di state loading DataTable (bodyClassName p-0). */
export const TableSkeleton = ({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="w-full">
    {/* Header row */}
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-32' : 'flex-1 max-w-[90px]'}`} />
      ))}
    </div>
    {/* Body rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 px-4 py-3.5 border-b border-divider last:border-0">
        <div className="flex items-center gap-3 w-32">
          <Skeleton className="w-9 h-9 !rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        </div>
        {Array.from({ length: cols - 1 }).map((_, c) => (
          <Skeleton key={c} className="h-3 flex-1 max-w-[80px]" />
        ))}
      </div>
    ))}
  </div>
);

/** Skeleton kartu statistik (grid dashboard). */
export const StatCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4">
        <Skeleton className="w-12 h-12 !rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    ))}
  </div>
);

/** Loader halaman admin (branded, centered) — untuk full-page load. */
export const PageLoader = ({ label = 'Memuat data…' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="relative">
      <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
        <Loader2 size={26} className="animate-spin text-primary" />
      </div>
      <div className="absolute -inset-1.5 rounded-[1.25rem] border-2 border-primary/10 border-t-primary/40 animate-spin" style={{ animationDuration: '1.2s' }} />
    </div>
    <p className="text-[12.5px] font-semibold text-muted">{label}</p>
  </div>
);
