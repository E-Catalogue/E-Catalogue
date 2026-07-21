import { Car, Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useUnits } from '@/features/units/unit.hooks';
import type { Unit } from '@/features/units/unit.types';

export const ReadyStockPage = () => {
  const { data, isLoading, isError, refetch } = useUnits({ page: 1, limit: 100, statusUnit: 'READY_STOCK' });
  const units: Unit[] = data?.data ?? [];
  const m = useUnitModals();

  return (
    <div className="max-w-[1600px] mx-auto ">
      <PageHeader
        title="Ready Stock"
        description={`${units.length} unit siap dipasarkan & test drive`}
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={m.openCreate}>Tambah Unit</Button>}
      />
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 w-full !rounded-2xl" />)}
        </div>
      ) : isError ? (
        <div className="text-center py-20"><p className="text-semantic-error font-semibold">Gagal memuat ready stock.</p><Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-4">Coba Lagi</Button></div>
      ) : units.length === 0 ? (
        <EmptyState icon={Car} title="Belum ada unit ready" description="Unit akan tampil setelah pricing dan pendanaan selesai difinalisasi." className="py-20" />
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
