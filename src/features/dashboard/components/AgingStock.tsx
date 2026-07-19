import { formatCurrency } from '@/core/utils/format';
import { Clock } from 'lucide-react';
import type { DashboardAgingStock } from '../dashboard.types';

const agingColor = (days: number) => {
  if (days > 60) return { bar: 'bg-semantic-error', text: 'text-semantic-error', bg: 'bg-semantic-error/10 border-semantic-error/30', label: 'Kritis (>60d)' };
  if (days > 30) return { bar: 'bg-accent-amber', text: 'text-accent-amber', bg: 'bg-accent-amber/10 border-accent-amber/30', label: 'Perhatian (30-60d)' };
  return { bar: 'bg-accent-green', text: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/30', label: 'Sehat (<30d)' };
};

export const AgingStock = ({
  data,
  summary,
}: {
  data: DashboardAgingStock[];
  summary: { healthyCount: number; warningCount: number; criticalCount: number; totalStock: number };
}) => {
  const maxDays = Math.max(...data.map(s => s.hari), 90);
  const pct = (value: number) => summary.totalStock > 0 ? Math.round((value / summary.totalStock) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Summary Distribution Stacked Bar Chart */}
      <div className="bg-surface-soft/80 p-3.5 rounded-xl border border-border space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-ink flex items-center gap-1.5">
            <Clock size={13} className="text-primary" /> Distribusi Umur Stok Showroom
          </span>
          <span className="text-muted">Max Limit: 90 Hari</span>
        </div>
        {/* Stacked visual bar */}
        <div className="h-3 rounded-full bg-divider/40 flex overflow-hidden gap-0.5 p-0.5">
          <div className="bg-accent-green h-full rounded-l-full" style={{ width: `${pct(summary.healthyCount)}%` }} title={`Sehat: ${summary.healthyCount} Unit`} />
          <div className="bg-accent-amber h-full" style={{ width: `${pct(summary.warningCount)}%` }} title={`Perhatian: ${summary.warningCount} Unit`} />
          <div className="bg-semantic-error h-full rounded-r-full" style={{ width: `${pct(summary.criticalCount)}%` }} title={`Kritis: ${summary.criticalCount} Unit`} />
        </div>
        <div className="flex justify-between text-[10px] font-extrabold pt-0.5">
          <span className="text-accent-green">Sehat: {summary.healthyCount} Unit ({pct(summary.healthyCount)}%)</span>
          <span className="text-accent-amber">30-60d: {summary.warningCount} Unit</span>
          <span className="text-semantic-error">&gt;60d: {summary.criticalCount} Unit</span>
        </div>
      </div>

      {/* Horizontal Duration Bar Graph */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted pb-1 border-b border-divider">
          <span>Unit Mobil & Plat Nomor</span>
          <span>Durasi Aging & Valuasi</span>
        </div>

        {data.length === 0 && <p className="text-[12px] font-semibold text-muted">Belum ada stok aktif.</p>}
        {data.map(s => {
          const c = agingColor(s.hari);
          const widthPct = Math.min(Math.round((s.hari / maxDays) * 100), 100);

          return (
            <div key={s.id} className="space-y-1.5 p-2 rounded-xl hover:bg-surface-soft/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-extrabold text-ink truncate">{s.merek} {s.tipe}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-soft border border-border text-muted shrink-0">{s.plat}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[12px] font-extrabold ${c.text}`}>{s.hari} Hari</span>
                  <span className="text-[11px] font-bold text-muted ml-2">({formatCurrency(s.harga, { compact: true })})</span>
                </div>
              </div>

              {/* Bar Graph */}
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-3 rounded-full bg-surface-soft overflow-hidden border border-divider/60">
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${c.bg} shrink-0`}>
                  {c.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
