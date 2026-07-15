export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_CLASS: Record<BadgeTone, string> = {
  success: 'bg-accent-green/15 text-accent-green border border-accent-green/25',
  warning: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/25',
  danger: 'bg-semantic-error/15 text-semantic-error border border-semantic-error/25',
  info: 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25',
  neutral: 'bg-ink/8 text-ink-soft border border-ink/15',
};

/** Status yang dikenal lintas fitur. Status baru cukup ditambahkan di sini. */
const STATUS_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: 'Aktif', tone: 'success' },
  INACTIVE: { label: 'Nonaktif', tone: 'neutral' },
  PENDING: { label: 'Pending', tone: 'warning' },
  SUSPENDED: { label: 'Ditangguhkan', tone: 'danger' },
  TRIAL: { label: 'Trial', tone: 'info' },
  EXPIRED: { label: 'Kedaluwarsa', tone: 'danger' },
};

interface StatusBadgeProps {
  status: string;
  /** Timpa tone bawaan, atau tentukan tone untuk status yang belum ada di STATUS_MAP. */
  tone?: BadgeTone;
}

export const StatusBadge = ({ status, tone }: StatusBadgeProps) => {
  const config = STATUS_MAP[status];
  const label = config?.label ?? status;
  const resolved = tone ?? config?.tone ?? 'neutral';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${TONE_CLASS[resolved]}`}
    >
      {label}
    </span>
  );
};
