import { SLOW_MOVING } from '@/data/mock';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';

export const SlowMoving = () => {
  const maxStock = Math.max(...SLOW_MOVING.map(s => Math.max(s.stokSaatIni, s.terjual3bln)), 5);

  return (
    <div className="space-y-4">
      {/* Chart Legend */}
      <div className="flex items-center justify-between pb-2 border-b border-divider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-semantic-error" />
            <span className="text-[11px] font-bold text-ink">Stok Tertahan (Ready)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-accent-amber" />
            <span className="text-[11px] font-bold text-ink">Terjual (3 Bulan Terakhir)</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Velocity Bar Chart</span>
      </div>

      {/* Velocity Bars */}
      <div className="space-y-4">
        {SLOW_MOVING.map((s, i) => {
          const isCritical = s.terjual3bln <= 1;
          const stokWidth = Math.min(Math.round((s.stokSaatIni / maxStock) * 100), 100);
          const salesWidth = Math.min(Math.round((s.terjual3bln / maxStock) * 100), 100);

          return (
            <div key={i} className="space-y-2 p-3 rounded-xl bg-surface-soft/60 border border-border/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isCritical ? 'bg-semantic-error/15 text-semantic-error' : 'bg-accent-amber/15 text-accent-amber'
                  }`}>
                    <AlertTriangle size={14} />
                  </div>
                  <span className="text-[12px] font-extrabold text-ink">{s.merek} {s.tipe}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-muted"><Clock size={12} /> Avg {s.avgDays} Hari di Showroom</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isCritical ? 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20' : 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20'
                  }`}>
                    {isCritical ? 'Sangat Lambat (Kritis)' : 'Perlu Diskon / Promo'}
                  </span>
                </div>
              </div>

              {/* Pair of comparison bars: Stok vs Sales */}
              <div className="space-y-1.5 pt-1">
                {/* Stock Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-20 text-[10px] font-bold text-semantic-error shrink-0">Stok Tersisa</span>
                  <div className="flex-1 h-3.5 rounded-full bg-surface overflow-hidden border border-divider/40">
                    <div className="h-full rounded-full bg-semantic-error transition-all duration-700" style={{ width: `${stokWidth}%` }} />
                  </div>
                  <span className="w-14 text-[11px] font-extrabold text-semantic-error text-right shrink-0">{s.stokSaatIni} Unit</span>
                </div>

                {/* 3-Month Sales Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-20 text-[10px] font-semibold text-muted shrink-0">Terjual 3 Bln</span>
                  <div className="flex-1 h-3.5 rounded-full bg-surface overflow-hidden border border-divider/40">
                    <div className="h-full rounded-full bg-accent-amber transition-all duration-700" style={{ width: `${salesWidth}%` }} />
                  </div>
                  <span className="w-14 text-[11px] font-bold text-accent-amber text-right shrink-0">{s.terjual3bln} Unit</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-semantic-error/5 border border-semantic-error/20 rounded-xl p-3 flex items-center gap-2.5 text-[11px] font-semibold text-ink">
        <TrendingDown size={16} className="text-semantic-error shrink-0" />
        <span>Saran Sistem: Berikan diskon khusus atau bundling promo untuk model dengan penjualan ≤ 1 unit dalam 90 hari agar perputaran kas tidak terhambat.</span>
      </div>
    </div>
  );
};
