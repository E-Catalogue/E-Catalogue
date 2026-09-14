import { useState } from 'react';
import type { TrafficTrendPoint } from '../crmAnalytics.types';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Activity } from 'lucide-react';
import { formatNumber } from '@/core/utils/format';

type MetricMode = 'pageViews' | 'unitViews' | 'inquiries' | 'visitors';

const METRIC_CONFIG: Record<
  MetricMode,
  { label: string; color: string; stroke: string; fill: string; unit: string }
> = {
  pageViews: {
    label: 'Kunjungan Halaman',
    color: 'bg-primary text-white',
    stroke: 'var(--color-primary)',
    fill: 'var(--color-primary)',
    unit: 'Views',
  },
  unitViews: {
    label: 'Minat Mobil',
    color: 'bg-accent-orange text-white',
    stroke: '#EA580C',
    fill: '#EA580C',
    unit: 'Unit View',
  },
  inquiries: {
    label: 'Lead WA / Chat',
    color: 'bg-accent-green text-white',
    stroke: '#16A34A',
    fill: '#16A34A',
    unit: 'Inquiry',
  },
  visitors: {
    label: 'Pengunjung Unik',
    color: 'bg-accent-purple text-white',
    stroke: '#8B5CF6',
    fill: '#8B5CF6',
    unit: 'Orang',
  },
};

interface TrafficActivityChartProps {
  data: TrafficTrendPoint[];
}

export const TrafficActivityChart = ({ data }: TrafficActivityChartProps) => {
  const [mode, setMode] = useState<MetricMode>('pageViews');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const cfg = METRIC_CONFIG[mode];
  const values = data.map((d) => d[mode] || 0);
  const total = values.reduce((sum, v) => sum + v, 0);
  const maxVal = Math.max(...values, 5);
  const avg = values.length > 0 ? (total / values.length).toFixed(1) : '0';

  const W = 720;
  const H = 220;
  const PAD = { top: 24, right: 20, bottom: 32, left: 24 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const count = Math.max(data.length, 1);
  const gap = innerW / count;
  const barW = Math.min(Math.max(gap * 0.55, 6), 24);

  const xCenter = (i: number) => PAD.left + gap * i + gap / 2;
  const yVal = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  // Polyline coordinates
  const points = data.map((d, i) => ({
    x: xCenter(i),
    y: yVal(d[mode]),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <SectionCard
      title="Tren Kunjungan & Minat Pembeli"
      subtitle={`Total ${formatNumber(total)} ${cfg.unit} pada periode ini (Rata-rata ${avg}/hari)`}
      icon={<Activity size={18} />}
      action={
        <div className="flex items-center gap-1 bg-surface-soft p-1 rounded-xl border border-border">
          {(Object.keys(METRIC_CONFIG) as MetricMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setHoverIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                mode === m
                  ? `${METRIC_CONFIG[m].color} shadow-sm`
                  : 'text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {METRIC_CONFIG[m].label}
            </button>
          ))}
        </div>
      }
    >
      <div className="relative pt-2">
        {/* Hover detail tooltip */}
        {activePoint && hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none -top-2 bg-ink text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl transition-all -translate-x-1/2 flex items-center gap-2 border border-white/10"
            style={{ left: `${(xCenter(hoverIndex) / W) * 100}%` }}
          >
            <span className="text-white/75">{activePoint.date}:</span>
            <span className="text-white font-extrabold">
              {formatNumber(activePoint[mode])} {cfg.unit}
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={`grad-${mode}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.stroke} stopOpacity="0.8" />
              <stop offset="100%" stopColor={cfg.stroke} stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={PAD.top + innerH * t}
              y2={PAD.top + innerH * t}
              stroke="var(--color-border)"
              strokeDasharray="3 4"
            />
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const val = d[mode];
            const barH = (val / maxVal) * innerH;
            const isHovered = hoverIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <rect
                  x={xCenter(i) - barW / 2}
                  y={PAD.top + innerH - barH}
                  width={barW}
                  height={Math.max(barH, 2)}
                  rx={4}
                  fill={`url(#grad-${mode})`}
                  opacity={isHovered ? 1 : 0.75}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Trendline */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={cfg.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm pointer-events-none"
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => {
            const isHovered = hoverIndex === i;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3}
                fill={isHovered ? cfg.stroke : 'var(--color-surface)'}
                stroke={cfg.stroke}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            // Tampilkan label hanya setiap interval tertentu jika data banyak
            const interval = data.length > 20 ? 3 : data.length > 10 ? 2 : 1;
            if (i % interval !== 0 && i !== data.length - 1) return null;

            return (
              <text
                key={i}
                x={xCenter(i)}
                y={H - 8}
                textAnchor="middle"
                className="fill-muted text-[10px] font-bold"
              >
                Tgl {d.day}
              </text>
            );
          })}
        </svg>
      </div>
    </SectionCard>
  );
};
