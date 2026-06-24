import type { LucideIcon } from 'lucide-react';

type AccentColor = 'red' | 'blue' | 'green' | 'orange' | 'purple';

const ACCENT: Record<AccentColor, { bg: string; text: string; bar: string }> = {
  red: { bg: 'bg-primary', text: 'text-primary', bar: 'bg-primary' },
  blue: { bg: 'bg-accent-blue', text: 'text-accent-blue', bar: 'bg-accent-blue' },
  green: { bg: 'bg-accent-green', text: 'text-accent-green', bar: 'bg-accent-green' },
  orange: { bg: 'bg-accent-orange', text: 'text-accent-orange', bar: 'bg-accent-orange' },
  purple: { bg: 'bg-accent-purple', text: 'text-accent-purple', bar: 'bg-accent-purple' },
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  color: AccentColor;
  subtitle?: { text: string; highlight?: string };
  progress?: { percent: number; label: string };
}

export const StatCard = ({ icon: Icon, label, value, unit, color, subtitle, progress }: StatCardProps) => {
  const accent = ACCENT[color];
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card p-4 md:p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center text-white shadow-sm shrink-0`}>
          <Icon size={20} strokeWidth={2.3} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted truncate">{label}</p>
          <div className="flex items-baseline gap-1 mt-1 whitespace-nowrap">
            <span className="text-lg md:text-xl font-extrabold text-ink leading-none">{value}</span>
            {unit && <span className="text-[10px] font-bold text-muted">{unit}</span>}
          </div>
        </div>
      </div>

      {subtitle && (
        <p className="text-[11px] font-semibold text-muted mt-3">
          {subtitle.text}{' '}
          {subtitle.highlight && <span className={`${accent.text} font-bold`}>{subtitle.highlight}</span>}
        </p>
      )}

      {progress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
            <span className="text-muted">{progress.label}</span>
            <span className={accent.text}>{progress.percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-soft overflow-hidden">
            <div className={`h-full rounded-full ${accent.bar} transition-all`} style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};
