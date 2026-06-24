import { useAppSelector } from '@/app/store';
import { formatDate } from '@/core/utils/format';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';

export const RekondisiList = () => {
  const items = useAppSelector((s) => s.data.units.filter((u) => u.status === 'rekondisi'));

  return (
    <div className="space-y-3">
      {items.map((u) => (
        <div key={u.id} className="flex items-center gap-3">
          <img
            src={u.image}
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
            className="w-16 h-12 rounded-lg object-cover bg-surface-soft shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold text-ink truncate">{u.brand} {u.model} {u.variant}</p>
              <span className="text-[11px] font-extrabold text-accent-orange shrink-0">{u.rekondisiProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-soft overflow-hidden my-1.5">
              <div className="h-full rounded-full bg-accent-orange" style={{ width: `${u.rekondisiProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted font-semibold">
              Estimasi selesai: <span className="text-ink-soft">{u.rekondisiEta ? formatDate(u.rekondisiEta) : '-'}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
