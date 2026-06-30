import { Plus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { Button } from '@/shared/components/ui/Button';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useUnits } from '@/features/units/unit.hooks';
import type { Unit } from '@/features/units/unit.types';

export const ReadyStockPage = () => {
  const { data, isLoading, isError } = useUnits({ page: 1, limit: 100, statusUnit: 'READY_STOCK' });
  const units: Unit[] = data?.data ?? [];
  const m = useUnitModals();

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader
        title="Ready Stock"
        description={`${units.length} unit siap dipasarkan & test drive`}
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={m.openCreate}>Tambah Unit</Button>}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted"><Loader2 size={24} className="animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-semantic-error font-semibold">Gagal memuat ready stock.</div>
      ) : units.length === 0 ? (
        <div className="text-center py-20 text-muted font-semibold">Belum ada unit ready.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {units.map((u) => (
            <UnitCard key={u.id} unit={u} onView={m.openDetail} onEdit={m.openEdit} onDelete={m.openDelete} />
          ))}
        </div>
      )}
      {m.modals}
    </div>
  );
};
