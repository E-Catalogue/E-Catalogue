import { useState } from 'react';
import { SALES_TREND } from '@/data/mock';

const W = 320;
const H = 160;
const PAD = { top: 16, right: 12, bottom: 24, left: 24 };

export const SalesChart = () => {
  const [hover, setHover] = useState<number | null>(6); // default highlight 21 Mei

  const data = SALES_TREND;
  const max = Math.max(...data.map((d) => d.value));
  const min = 0;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - ((v - min) / (max - min)) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');
  const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;

  const active = hover ?? data.length - 1;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + innerH * t}
            y2={PAD.top + innerH * t}
            stroke="var(--color-divider)"
            strokeDasharray="3 4"
          />
        ))}

        <path d={areaPath} fill="url(#salesArea)" />
        <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* points + hover targets */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(d.value)}
              r={i === active ? 5 : 3}
              fill="var(--color-surface)"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
            />
            <rect
              x={x(i) - innerW / data.length / 2}
              y={0}
              width={innerW / data.length}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          </g>
        ))}

        {/* x labels (sparse) */}
        {data.map((d, i) =>
          i % 3 === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted" fontSize="8" fontWeight="600">
              {d.label}
            </text>
          ) : null,
        )}
      </svg>

      {/* tooltip */}
      <div className="absolute top-0 right-0 bg-ink text-white rounded-xl px-3 py-2 shadow-lg pointer-events-none">
        <p className="text-[9px] font-semibold text-white/70">{data[active].label}</p>
        <p className="text-sm font-extrabold leading-none mt-0.5">{data[active].value} Unit</p>
      </div>
    </div>
  );
};
