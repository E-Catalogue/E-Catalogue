import { DASH } from '@/data/mock';
import { formatCurrency } from '@/core/utils/format';
import { Target } from 'lucide-react';

export const TargetChart = () => {
  const unitPct = Math.min(Math.round((DASH.unitTerjual / DASH.targetUnit) * 100), 100);
  const omzetPct = Math.min(Math.round((DASH.omzet / DASH.targetOmzet) * 100), 100);

  // SVG parameters for circular gauge
  const size = 130;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  const unitDash = (unitPct / 100) * circ;
  const omzetDash = (omzetPct / 100) * circ;

  return (
    <div className="space-y-6">
      {/* Dual Radial Gauges Graph */}
      <div className="grid grid-cols-2 gap-4">
        {/* Unit Gauge */}
        <div className="bg-surface-soft/60 rounded-2xl p-4 border border-border/80 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="currentColor" strokeWidth={stroke} className="text-divider/60" />
              {/* Progress circle */}
              <circle
                cx={cx} cy={cy} r={r}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeDasharray={`${unitDash} ${circ - unitDash}`}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-ink">{unitPct}%</span>
              <span className="text-[10px] font-bold uppercase text-muted">Tercapai</span>
            </div>
          </div>
          <span className="text-[12px] font-extrabold text-ink">Penjualan Unit</span>
          <span className="text-[11px] font-bold text-primary mt-0.5">{DASH.unitTerjual} / {DASH.targetUnit} Unit</span>
        </div>

        {/* Omzet Gauge */}
        <div className="bg-surface-soft/60 rounded-2xl p-4 border border-border/80 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="currentColor" strokeWidth={stroke} className="text-divider/60" />
              {/* Progress circle */}
              <circle
                cx={cx} cy={cy} r={r}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeDasharray={`${omzetDash} ${circ - omzetDash}`}
                strokeLinecap="round"
                className="text-accent-green transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-ink">{omzetPct}%</span>
              <span className="text-[10px] font-bold uppercase text-muted">Tercapai</span>
            </div>
          </div>
          <span className="text-[12px] font-extrabold text-ink">Target Omzet</span>
          <span className="text-[11px] font-bold text-accent-green mt-0.5">{formatCurrency(DASH.omzet, { compact: true })} / {formatCurrency(DASH.targetOmzet, { compact: true })}</span>
        </div>
      </div>

      {/* Horizontal Progress Breakdown Graph */}
      <div className="bg-surface rounded-xl p-4 border border-border space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted">
          <span className="flex items-center gap-1.5 text-ink">
            <Target size={14} className="text-primary" /> Analisis Defisit Target Bulan Ini
          </span>
          <span className="text-accent-amber font-extrabold">Sisa 7 Hari Kerja</span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-divider/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">Kekurangan Unit</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-ink">{Math.max(DASH.targetUnit - DASH.unitTerjual, 0)} Unit</span>
              <span className="text-[11px] font-bold text-semantic-error">(28% lagi)</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">Kekurangan Omzet</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-ink">{formatCurrency(Math.max(DASH.targetOmzet - DASH.omzet, 0), { compact: true })}</span>
              <span className="text-[11px] font-bold text-semantic-error">(35% lagi)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
