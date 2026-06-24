import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/app/store';
import { removeUnit } from '@/app/store/dataSlice';
import type { Unit } from '@/data/types';
import { UnitFormModal } from './UnitFormModal';
import { UnitDetailModal } from './UnitDetailModal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

/**
 * Mengelola state modal CRUD unit (detail/form/hapus) + merender modalnya.
 * Pakai: const m = useUnitModals(); lalu sebar m.openCreate/openEdit/openDetail/openDelete
 * dan render {m.modals} di akhir komponen.
 */
export const useUnitModals = () => {
  const dispatch = useAppDispatch();
  const [detail, setDetail] = useState<Unit | null>(null);
  const [form, setForm] = useState<{ unit: Unit | null } | null>(null);
  const [toDelete, setToDelete] = useState<Unit | null>(null);

  const openDetail = useCallback((u: Unit) => setDetail(u), []);
  const openCreate = useCallback(() => setForm({ unit: null }), []);
  const openEdit = useCallback((u: Unit) => { setDetail(null); setForm({ unit: u }); }, []);
  const openDelete = useCallback((u: Unit) => setToDelete(u), []);

  const modals = (
    <>
      <UnitDetailModal open={!!detail} unit={detail} onClose={() => setDetail(null)} onEdit={openEdit} />
      <UnitFormModal open={!!form} unit={form?.unit} onClose={() => setForm(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && dispatch(removeUnit(toDelete.id))}
        title="Hapus Unit"
        message={toDelete ? `Hapus ${toDelete.brand} ${toDelete.model} (${toDelete.code}) dari inventory?` : ''}
      />
    </>
  );

  return { openDetail, openCreate, openEdit, openDelete, modals };
};
