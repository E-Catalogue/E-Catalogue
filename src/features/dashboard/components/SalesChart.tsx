import { useState } from 'react';
import { formatCurrency } from '@/core/utils/format';
import type { DashboardMonthlySale } from '../dashboard.types';

type Mode = 'unit' | 'revenue';

const MONTH_LABEL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const SalesChart = ({ data, year }: { data: DashboardMonthlySale[]; year: string | number }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('unit');

  const activeData = data.filter(d => (mode === 'unit' ? d.unit : d.revenue) > 0);
  const maxVal = Math.max(...data.map(d => mode === 'unit' ? d.unit : d.revenue), 1);

  const W = 480;
  const H = 200;
  const PAD = { top: 20, right: 16, bottom: 28, left: 8 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const barW = innerW / 12 * 0.55;
  const gap = innerW / 12;

  const xCenter = (i: number) => PAD.left + gap * i + gap / 2;
  const yVal = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  // Line path for values > 0
  const linePoints = activeData.map(d => {
    const i = data.indexOf(d);
    return { x: xCenter(i), y: yVal(mode === 'unit' ? d.unit : d.revenue) };
  });
  const linePath = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const active = hover ?? (activeData.length - 1 >= 0 ? data.indexOf(activeData[activeData.length - 1]) : 0);

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1">
        {(['unit', 'revenue'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              mode === m ? 'bg-primary text-white' : 'bg-surface-soft text-muted hover:text-primary'
            }`}
          >
            {m === 'unit' ? 'Unit' : 'Omzet'}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t} x1={PAD.left} x2={W - PAD.right}
              y1={PAD.top + innerH * t} y2={PAD.top + innerH * t}
              stroke="var(--color-divider)" strokeDasharray="3 4" />
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const val = mode === 'unit' ? d.unit : d.revenue;
            if (val === 0) return null;
            const barH = (val / maxVal) * innerH;
            return (
              <rect key={i}
                x={xCenter(i) - barW / 2} y={PAD.top + innerH - barH}
                width={barW} height={barH}
                rx={3} fill={i === active ? 'var(--color-primary)' : 'url(#barGrad)'}
                opacity={i === active ? 1 : 0.6}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Line */}
          {linePath && (
            <path d={linePath} fill="none" stroke="var(--color-accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Dots */}
          {linePoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--color-accent-amber)" stroke="var(--color-surface)" strokeWidth="2" />
          ))}

          {/* X labels */}
          {data.map((d, i) => (
            <text key={i} x={xCenter(i)} y={H - 6} textAnchor="middle" className="fill-muted" fontSize="9" fontWeight="600">
              {MONTH_LABEL[d.month - 1] ?? d.month}
            </text>
          ))}

          {/* Hover targets */}
          {data.map((_, i) => (
            <rect key={`h${i}`} x={xCenter(i) - gap / 2} y={0} width={gap} height={H}
              fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          ))}
        </svg>

        {/* Tooltip */}
        {data[active] && (mode === 'unit' ? data[active].unit : data[active].revenue) > 0 && (
          <div className="absolute top-0 right-0 bg-ink text-white rounded-xl px-3 py-2 shadow-lg pointer-events-none">
            <p className="text-[9px] font-semibold text-white/70">{MONTH_LABEL[data[active].month - 1] ?? data[active].month} {year}</p>
            <p className="text-sm font-extrabold leading-none mt-0.5">
              {mode === 'unit' ? `${data[active].unit} Unit` : formatCurrency(data[active].revenue, { compact: true })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
