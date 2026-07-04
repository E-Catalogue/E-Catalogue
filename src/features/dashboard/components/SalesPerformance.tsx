import { SALES_PERF, DASH } from '@/data/mock';
import { formatCurrency } from '@/core/utils/format';
import { Trophy, Award } from 'lucide-react';

const RANK_MEDALS = ['text-accent-amber bg-accent-amber/10 border-accent-amber/30', 'text-muted bg-muted/10 border-muted/30', 'text-accent-orange bg-accent-orange/10 border-accent-orange/30'];

export const SalesPerformance = () => {
  const maxUnit = Math.max(...SALES_PERF.map(s => s.unit), 10);
  const maxRev = Math.max(...SALES_PERF.map(s => s.revenue), 2000000000);
  const targetPerSales = Math.ceil(DASH.targetUnit / SALES_PERF.length);

  return (
    <div className="space-y-5">
      {/* Chart Legend */}
      <div className="flex items-center justify-between pb-2 border-b border-divider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-[11px] font-bold text-ink">Volume Unit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-accent-green" />
            <span className="text-[11px] font-bold text-ink">Kontribusi Omzet</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Dual Bar Chart</span>
      </div>

      {/* Sales Bars */}
      <div className="space-y-5">
        {SALES_PERF.map((s, i) => {
          const unitPct = Math.min(Math.round((s.unit / maxUnit) * 100), 100);
          const revPct = Math.min(Math.round((s.revenue / maxRev) * 100), 100);
          const targetPct = Math.round((s.unit / targetPerSales) * 100);

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                    i < 3 ? RANK_MEDALS[i] : 'bg-surface-soft border-border text-muted'
                  }`}>
                    {i === 0 ? <Trophy size={13} /> : i === 1 ? <Award size={13} /> : i + 1}
                  </div>
                  <span className="text-[13px] font-extrabold text-ink">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted">Target ({targetPerSales} unit):</span>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                    targetPct >= 100 ? 'bg-accent-green/10 text-accent-green' : targetPct >= 70 ? 'bg-accent-amber/10 text-accent-amber' : 'bg-semantic-error/10 text-semantic-error'
                  }`}>
                    {targetPct}% Tercapai
                  </span>
                </div>
              </div>

              {/* Pair of bars: Unit & Omzet */}
              <div className="space-y-1.5 pt-0.5 pl-8">
                {/* Unit Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-14 text-[10px] font-bold text-muted shrink-0">Unit Terjual</span>
                  <div className="flex-1 h-3.5 rounded-full bg-surface-soft overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${unitPct}%` }} />
                  </div>
                  <span className="w-20 text-[11px] font-extrabold text-primary text-right shrink-0">{s.unit} Unit</span>
                </div>

                {/* Omzet Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-14 text-[10px] font-bold text-muted shrink-0">Omzet Deal</span>
                  <div className="flex-1 h-3.5 rounded-full bg-surface-soft overflow-hidden">
                    <div className="h-full rounded-full bg-accent-green transition-all duration-700" style={{ width: `${revPct}%` }} />
                  </div>
                  <span className="w-20 text-[11px] font-extrabold text-accent-green text-right shrink-0">{formatCurrency(s.revenue, { compact: true })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
