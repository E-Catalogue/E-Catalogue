import { AlertTriangle } from 'lucide-react';
import { usePendingDealFinalizations } from './crm.hooks';

export function PendingDealFinalizationNotice({ branchKey, headers }: { branchKey: string; headers?: Record<string, string> }) {
  const { data } = usePendingDealFinalizations(branchKey, headers);
  if (!data?.count) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-[12px] font-semibold text-ink">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-amber" />
      <p><b>{data.count} order DEAL</b> belum difinalisasi. Nilai laba dan pembukuan terkait belum menjadi angka final.</p>
    </div>
  );
}
