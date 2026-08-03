import { useState, useCallback } from 'react';
import type { Unit } from '@/features/units/unit.types';
import { UnitFormModal } from './UnitFormModal';
import { UnitLeasingModal } from './UnitLeasingModal';
import { UnitDetailModal } from './UnitDetailModal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useDeleteUnit } from './unit.hooks';
import { unitDisplayName } from './unit.display';
import { unitApi } from './unit.api';
import { notifyApiError } from '@/core/api/notify';

export const useUnitModals = () => {
  const [detail, setDetail] = useState<{ unit: Unit; salesView: boolean } | null>(null);
  const [form, setForm] = useState<{ unit: Unit | null } | null>(null);
  const [leasing, setLeasing] = useState<Unit | null>(null);
  const [toDelete, setToDelete] = useState<Unit | null>(null);

  const deleteUnit = useDeleteUnit();

  const openDetail = useCallback((u: Unit) => setDetail({ unit: u, salesView: false }), []);
  const openCardDetail = useCallback((u: Unit) => setDetail({ unit: u, salesView: true }), []);
  const openCreate = useCallback(() => setForm({ unit: null }), []);
  const openEdit = useCallback((u: Unit) => {
    unitApi.get(u.id)
      .then((response) => { setDetail(null); setForm({ unit: response.data }); })
      .catch(notifyApiError);
  }, []);
  const openLeasing = useCallback((u: Unit) => {
    unitApi.get(u.id)
      .then((response) => { setDetail(null); setLeasing(response.data); })
      .catch(notifyApiError);
  }, []);
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
      <UnitDetailModal open={!!detail} unit={detail?.unit ?? null} salesView={detail?.salesView} onClose={() => setDetail(null)} onEdit={openEdit} />
      <UnitFormModal open={!!form} unit={form?.unit} onClose={() => setForm(null)} />
      {leasing && <UnitLeasingModal key={leasing.id} open unit={leasing} onClose={() => setLeasing(null)} />}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Unit"
        message={toDelete ? `Hapus ${unitDisplayName(toDelete)} (${toDelete.platNomor}) dari inventory?` : ''}
        loading={deleteUnit.isPending}
        closeOnConfirm={false}
      />
    </>
  );

  return { openDetail, openCardDetail, openCreate, openEdit, openLeasing, openDelete, modals };
};
