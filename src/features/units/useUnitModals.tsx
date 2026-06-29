import { useState, useCallback } from 'react';
import type { Unit } from '@/features/units/unit.types';
import { UnitFormModal } from './UnitFormModal';
import { UnitDetailModal } from './UnitDetailModal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useDeleteUnit } from './unit.hooks';

export const useUnitModals = () => {
  const [detail, setDetail] = useState<Unit | null>(null);
  const [form, setForm] = useState<{ unit: Unit | null } | null>(null);
  const [toDelete, setToDelete] = useState<Unit | null>(null);

  const deleteUnit = useDeleteUnit();

  const openDetail = useCallback((u: Unit) => setDetail(u), []);
  const openCreate = useCallback(() => setForm({ unit: null }), []);
  const openEdit = useCallback((u: Unit) => { setDetail(null); setForm({ unit: u }); }, []);
  const openDelete = useCallback((u: Unit) => setToDelete(u), []);

  const handleDelete = () => {
    if (toDelete) {
      deleteUnit.mutate(toDelete.id, {
        onSuccess: () => setToDelete(null)
      });
    }
  };

  const modals = (
    <>
      <UnitDetailModal open={!!detail} unit={detail} onClose={() => setDetail(null)} onEdit={openEdit} />
      <UnitFormModal open={!!form} unit={form?.unit} onClose={() => setForm(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Unit"
        message={toDelete ? `Hapus ${toDelete.merek?.name} ${toDelete.tipe?.name} (${toDelete.platNomor}) dari inventory?` : ''}
        loading={deleteUnit.isPending}
      />
    </>
  );

  return { openDetail, openCreate, openEdit, openDelete, modals };
};
