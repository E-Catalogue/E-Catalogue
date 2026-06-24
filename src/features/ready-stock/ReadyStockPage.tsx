import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { Button } from '@/shared/components/ui/Button';
import { useAppSelector } from '@/app/store';
import { useUnitModals } from '@/features/units/useUnitModals';

export const ReadyStockPage = () => {
  const units = useAppSelector((s) => s.data.units.filter((u) => u.status === 'ready'));
  const m = useUnitModals();

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader
        title="Ready Stock"
        description={`${units.length} unit siap dipasarkan & test drive`}
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={m.openCreate}>Tambah Unit</Button>}
      />
      {units.length === 0 ? (
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
