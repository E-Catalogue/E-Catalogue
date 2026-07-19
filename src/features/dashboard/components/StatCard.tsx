import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

type AccentColor = 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'teal';

const ACCENT: Record<AccentColor, { bg: string; text: string; bar: string }> = {
  red: { bg: 'bg-primary', text: 'text-primary', bar: 'bg-primary' },
  blue: { bg: 'bg-accent-blue', text: 'text-accent-blue', bar: 'bg-accent-blue' },
  green: { bg: 'bg-accent-green', text: 'text-accent-green', bar: 'bg-accent-green' },
  orange: { bg: 'bg-accent-orange', text: 'text-accent-orange', bar: 'bg-accent-orange' },
  purple: { bg: 'bg-accent-purple', text: 'text-accent-purple', bar: 'bg-accent-purple' },
  teal: { bg: 'bg-accent-teal', text: 'text-accent-teal', bar: 'bg-accent-teal' },
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  color: AccentColor;
  subtitle?: { text: string; highlight?: string };
  progress?: { percent: number; label: string };
  trend?: { value: number; label?: string };
  details?: { label: string; value: string; color?: string }[];
}

export const StatCard = ({ icon: Icon, label, value, unit, color, subtitle, progress, trend, details }: StatCardProps) => {
  const accent = ACCENT[color];
  const trendUp = trend && trend.value > 0;
  const trendDown = trend && trend.value < 0;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card p-4 md:p-5 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-xl ${accent.bg} flex items-center justify-center text-white shadow-sm shrink-0`}>
            <Icon size={22} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted leading-snug break-words">{label}</p>
            <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
              <span className="text-xl md:text-2xl font-extrabold text-ink leading-tight break-words">{value}</span>
              {unit && <span className="text-[11px] font-bold text-muted shrink-0">{unit}</span>}
            </div>
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            <div className={`flex items-center gap-0.5 text-[11px] font-bold ${trendUp ? 'text-accent-green' : trendDown ? 'text-semantic-error' : 'text-muted'}`}>
              <TrendIcon size={14} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">{trend.label || 'vs bulan lalu'}</span>
          </div>
        )}

        {subtitle && (
          <p className="text-[11px] font-semibold text-muted mt-3 leading-relaxed">
            {subtitle.text}{' '}
            {subtitle.highlight && <span className={`${accent.text} font-bold`}>{subtitle.highlight}</span>}
          </p>
        )}

        {progress && (
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-muted">{progress.label}</span>
              <span className={accent.text}>{progress.percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
              <div className={`h-full rounded-full ${accent.bar} transition-all duration-500`} style={{ width: `${Math.min(progress.percent, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {details && details.length > 0 && (
        <div className="mt-4 pt-3 border-t border-divider/70 space-y-1.5">
          {details.map((d, i) => (
            <div key={i} className="flex justify-between items-center text-[11px] gap-2">
              <span className="font-semibold text-muted truncate">{d.label}</span>
              <span className={`font-extrabold shrink-0 ${d.color || 'text-ink'}`}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
