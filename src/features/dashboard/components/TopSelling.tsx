import { formatCurrency } from '@/core/utils/format';
import { Trophy } from 'lucide-react';
import type { DashboardTopSelling } from '../dashboard.types';

const MEDAL_COLORS = ['text-accent-amber bg-accent-amber/10 border-accent-amber/30', 'text-muted bg-muted/10 border-muted/30', 'text-accent-orange bg-accent-orange/10 border-accent-orange/30'];
const BAR_GRADIENTS = [
  'from-accent-amber to-accent-orange',
  'from-primary to-accent-blue',
  'from-accent-green to-accent-teal',
  'from-accent-purple to-primary',
  'from-muted to-ink-soft',
];

export const TopSelling = ({ data, totalUnit }: { data: DashboardTopSelling[]; totalUnit: number }) => {
  const maxCount = Math.max(...data.map(t => t.count), 1);

  return (
    <div className="space-y-4">
      {/* Graph Header */}
      <div className="flex items-center justify-between pb-2 border-b border-divider text-[11px] font-bold text-muted">
        <span>Model Mobil & Peringkat</span>
        <span>Kontribusi Volume & Omzet</span>
      </div>

      <div className="space-y-3.5">
        {data.length === 0 && <p className="text-[12px] font-semibold text-muted">Belum ada penjualan pada periode ini.</p>}
        {data.map((t, i) => {
          const pct = totalUnit > 0 ? Math.round((t.count / totalUnit) * 100) : 0;
          const barWidth = Math.min(Math.round((t.count / maxCount) * 100), 100);

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                    i < 3 ? MEDAL_COLORS[i] : 'bg-surface-soft border-border text-muted'
                  }`}>
                    {i === 0 ? <Trophy size={13} /> : t.rank}
                  </div>
                  <span className="text-[12px] font-extrabold text-ink truncate">{t.merek} {t.tipe}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[12px] font-extrabold text-ink">{t.count} Unit</span>
                  <span className="text-[11px] font-bold text-muted ml-1.5">({pct}%)</span>
                </div>
              </div>

              {/* Bar & Revenue Label */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-5 rounded-lg bg-surface-soft overflow-hidden p-0.5 border border-divider/60">
                  <div
                    className={`h-full rounded-md bg-gradient-to-r ${BAR_GRADIENTS[i % BAR_GRADIENTS.length]} transition-all duration-700 flex items-center justify-end px-2`}
                    style={{ width: `${barWidth}%` }}
                  >
                    {barWidth >= 30 && (
                      <span className="text-[9px] font-extrabold text-white drop-shadow-sm">{formatCurrency(t.revenue, { compact: true })}</span>
                    )}
                  </div>
                </div>
                {barWidth < 30 && (
                  <span className="text-[10px] font-extrabold text-muted shrink-0">{formatCurrency(t.revenue, { compact: true })}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
