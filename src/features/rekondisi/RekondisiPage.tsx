import { Wrench, Calendar, Eye, Pencil } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { useAppSelector } from '@/app/store';
import { useUnitModals } from '@/features/units/useUnitModals';
import { formatDate, formatCurrency } from '@/core/utils/format';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';

export const RekondisiPage = () => {
  const units = useAppSelector((s) => s.data.units.filter((u) => u.status === 'rekondisi'));
  const m = useUnitModals();

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader title="Rekondisi" description={`${units.length} unit sedang dalam proses perbaikan & perawatan`} />

      {units.length === 0 ? (
        <div className="text-center py-20 text-muted font-semibold">Tidak ada unit dalam rekondisi.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {units.map((u) => (
            <div key={u.id} className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden group">
              <div className="flex gap-4 p-4">
                <img
                  src={u.image}
                  alt=""
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
                  className="w-28 h-20 rounded-xl object-cover bg-surface-soft shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-ink text-[14px] truncate">{u.brand} {u.model}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => m.openDetail(u)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary-light" title="Detail"><Eye size={15} /></button>
                      <button onClick={() => m.openEdit(u)} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10" title="Edit"><Pencil size={14} /></button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted font-semibold">{u.variant} • {u.year}</p>
                  <p className="text-[13px] font-extrabold text-primary mt-2">{formatCurrency(u.price)}</p>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-accent-orange"><Wrench size={13} /> Progress Rekondisi</span>
                  <span className="text-accent-orange">{u.rekondisiProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
                  <div className="h-full rounded-full bg-accent-orange transition-all duration-500" style={{ width: `${u.rekondisiProgress}%` }} />
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-muted">
                  <Calendar size={13} /> Estimasi selesai: <span className="text-ink-soft font-bold">{u.rekondisiEta ? formatDate(u.rekondisiEta) : '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {m.modals}
    </div>
  );
};
