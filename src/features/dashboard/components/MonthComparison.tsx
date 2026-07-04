import { TrendingUp, TrendingDown } from 'lucide-react';
import { MONTH_COMPARE } from '@/data/mock';
import { formatCurrency } from '@/core/utils/format';

const pct = (now: number, prev: number) => prev === 0 ? 0 : Math.round(((now - prev) / prev) * 100);

export const MonthComparison = () => {
  const { bulanIni: n, bulanLalu: p } = MONTH_COMPARE;

  const metrics = [
    { label: 'Unit Terjual', now: n.unit, prev: p.unit, max: Math.max(n.unit, p.unit, 20), isCurrency: false, color: 'bg-primary' },
    { label: 'Omzet Penjualan', now: n.omzet, prev: p.omzet, max: Math.max(n.omzet, p.omzet, 4000000000), isCurrency: true, color: 'bg-accent-green' },
    { label: 'Profit Bersih', now: n.profit, prev: p.profit, max: Math.max(n.profit, p.profit, 400000000), isCurrency: true, color: 'bg-accent-orange' },
    { label: 'Pengeluaran Operasional', now: n.pengeluaran, prev: p.pengeluaran, max: Math.max(n.pengeluaran, p.pengeluaran, 80000000), isCurrency: true, color: 'bg-semantic-error', inverse: true },
  ];

  return (
    <div className="space-y-5">
      {/* Chart Legend & Period Header */}
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-[11px] font-extrabold text-ink">{n.label} (Current)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-surface-soft border border-border" />
            <span className="text-[11px] font-semibold text-muted">{p.label} (Previous)</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Grouped Bar Chart</span>
      </div>

      {/* Horizontal Bar Graphs */}
      <div className="space-y-5">
        {metrics.map((m, i) => {
          const change = pct(m.now, m.prev);
          const up = change >= 0;
          const isGood = m.inverse ? !up : up;
          const fmt = (val: number) => m.isCurrency ? formatCurrency(val, { compact: true }) : `${val} Unit`;
          const nowWidth = Math.min(Math.round((m.now / m.max) * 100), 100);
          const prevWidth = Math.min(Math.round((m.prev / m.max) * 100), 100);

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-extrabold text-ink">{m.label}</span>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isGood ? 'bg-accent-green/10 text-accent-green' : 'bg-semantic-error/10 text-semantic-error'
                }`}>
                  {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  <span>{Math.abs(change)}% vs Juni</span>
                </div>
              </div>

              {/* Pair of comparison bars */}
              <div className="space-y-1.5 pt-0.5">
                {/* Now Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-10 text-[10px] font-bold text-ink shrink-0">{n.label}</span>
                  <div className="flex-1 h-3.5 rounded-full bg-surface-soft overflow-hidden">
                    <div className={`h-full rounded-full ${m.color} transition-all duration-700`} style={{ width: `${nowWidth}%` }} />
                  </div>
                  <span className="w-20 text-[11px] font-extrabold text-ink text-right shrink-0">{fmt(m.now)}</span>
                </div>

                {/* Prev Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-10 text-[10px] font-semibold text-muted shrink-0">{p.label}</span>
                  <div className="flex-1 h-3.5 rounded-full bg-surface-soft/60 overflow-hidden">
                    <div className="h-full rounded-full bg-muted/40 transition-all duration-700" style={{ width: `${prevWidth}%` }} />
                  </div>
                  <span className="w-20 text-[11px] font-semibold text-muted text-right shrink-0">{fmt(m.prev)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
