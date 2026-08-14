import { AlertTriangle } from 'lucide-react';
import { usePendingDealFinalizations } from './crm.hooks';

export function PendingDealFinalizationNotice({ branchKey, headers, active = false, onToggle }: { branchKey: string; headers?: Record<string, string>; active?: boolean; onToggle?: () => void }) {
  const { data } = usePendingDealFinalizations(branchKey, headers);
  if (!data?.count && !active) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-[12px] font-semibold text-ink">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-amber" />
      <p className="flex-1"><b>{data?.count ?? 0} order DEAL</b> belum difinalisasi. Nilai laba dan pembukuan terkait belum menjadi angka final.</p>
      {onToggle && (
        <button type="button" onClick={onToggle} className="shrink-0 rounded-lg border border-accent-amber/40 bg-surface px-3 py-1.5 font-bold text-accent-amber transition-colors hover:bg-accent-amber/10">
          {active ? 'Reset Filter' : 'Lihat Data'}
        </button>
      )}
    </div>
  );
}
