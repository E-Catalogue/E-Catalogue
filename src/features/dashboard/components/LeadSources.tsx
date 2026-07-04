import { LEAD_SOURCES } from '@/data/mock';

export const LeadSources = () => {
  const total = LEAD_SOURCES.reduce((a, s) => a + s.count, 0);

  // Build donut segments
  const R = 60;
  const CX = 70;
  const CY = 70;
  const STROKE = 18;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      {/* Donut chart */}
      <div className="shrink-0">
        <svg width={140} height={140} viewBox="0 0 140 140">
          {LEAD_SOURCES.map((s, i) => {
            const pct = s.count / total;
            const dash = circumference * pct;
            const gap = circumference - dash;
            const seg = (
              <circle
                key={i}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${CY})`}
                className="transition-all duration-300"
              />
            );
            offset += dash;
            return seg;
          })}
          {/* Center label */}
          <text x={CX} y={CY - 4} textAnchor="middle" className="fill-ink" fontSize="18" fontWeight="800">{total}</text>
          <text x={CX} y={CY + 10} textAnchor="middle" className="fill-muted" fontSize="9" fontWeight="600">LEADS</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {LEAD_SOURCES.map((s, i) => {
          const pct = Math.round((s.count / total) * 100);
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] font-semibold text-ink flex-1 truncate">{s.source}</span>
              <span className="text-[11px] font-bold text-muted">{s.count}</span>
              <span className="text-[10px] font-bold text-muted w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
