import type { HistoricalMode } from '@/features/units/unit.types';

const MODE_STYLE: Record<HistoricalMode, string> = {
  POST_LEDGER: 'border-accent-blue/25 bg-accent-blue/10 text-accent-blue',
  REFERENCE_ONLY: 'border-accent-amber/30 bg-accent-amber/10 text-accent-amber',
};

const MODE_LABEL: Record<HistoricalMode, string> = {
  POST_LEDGER: 'POST LEDGER',
  REFERENCE_ONLY: 'REFERENCE ONLY',
};

export const HistoricalModeBadge = ({ mode, className = '' }: { mode?: HistoricalMode | null; className?: string }) => {
  if (!mode) return null;

  return (
    <span className={`inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide ${MODE_STYLE[mode]} ${className}`}>
      {MODE_LABEL[mode]}
    </span>
  );
};
