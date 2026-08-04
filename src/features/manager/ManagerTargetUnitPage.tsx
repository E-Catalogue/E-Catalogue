import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { RequirePermission } from '@/features/auth/permissions';
import { managerApi } from './manager.api';

const monthNow = () => new Date().toISOString().slice(0, 7);

function ManagerTargetUnitContent() {
  const [period, setPeriod] = useState(monthNow);
  const summary = useQuery({ queryKey: ['manager-target-unit', period], queryFn: () => managerApi.targetUnit(period) });
  const item = summary.data?.data;
  return <><PageHeader title="Target Unit" description="Ringkasan target penjualan unit cabang Anda tanpa nominal atau rincian sales." action={<input aria-label="Periode target" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-semibold" />} />
    <SectionCard>{summary.isLoading ? <div className="py-16 text-center text-muted">Memuat ringkasan target...</div> : !item ? <div className="py-16 text-center"><Target className="mx-auto mb-3 text-muted" size={34} /><p className="font-bold text-ink">Target unit belum tersedia</p><p className="mt-1 text-sm text-muted">Belum ada target untuk periode ini di cabang Anda.</p></div> : <div><div className="mb-6"><p className="text-sm text-muted">{item.branch.nama} · {item.period}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">Status: {item.status}</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Target unit', item.unitTarget], ['Aktual unit', item.unitActual], ['Sisa target', item.remainingUnit], ['Pencapaian', `${item.achievementPercent}%`]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-border bg-surface-soft p-5"><p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p><p className="mt-2 text-2xl font-extrabold text-ink">{value}</p></div>)}</div><div className="mt-6 h-3 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, item.achievementPercent)}%` }} /></div></div>}</SectionCard></>;
}

export function ManagerTargetUnitPage() { return <RequirePermission code="TARGET_UNIT_SUMMARY_READ"><ManagerTargetUnitContent /></RequirePermission>; }
