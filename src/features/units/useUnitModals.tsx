import { useState, useCallback } from 'react';
import type { Unit } from '@/features/units/unit.types';
import { UnitFormModal } from './UnitFormModal';
import { UnitLeasingModal } from './UnitLeasingModal';
import { UnitDetailModal } from './UnitDetailModal';
import { ArchiveUnitModal } from './ArchiveUnitModal';
import { CancelPurchaseModal } from './CancelPurchaseModal';
import { unitApi } from './unit.api';
import { notifyApiError } from '@/core/api/notify';

export const useUnitModals = () => {
  const [detail, setDetail] = useState<{ unit: Unit; salesView: boolean } | null>(null);
  const [form, setForm] = useState<{ unit: Unit | null } | null>(null);
  const [leasing, setLeasing] = useState<Unit | null>(null);
  const [toArchive, setToArchive] = useState<Unit | null>(null);
  const [toCancelPurchase, setToCancelPurchase] = useState<Unit | null>(null);

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
  const openArchive = useCallback((u: Unit) => setToArchive(u), []);
  const openCancelPurchase = useCallback((u: Unit) => setToCancelPurchase(u), []);

  const modals = (
    <>
      <UnitDetailModal open={!!detail} unit={detail?.unit ?? null} salesView={detail?.salesView} onClose={() => setDetail(null)} onEdit={openEdit} />
      <UnitFormModal open={!!form} unit={form?.unit} onClose={() => setForm(null)} />
      {leasing && <UnitLeasingModal key={leasing.id} open unit={leasing} onClose={() => setLeasing(null)} />}
      <ArchiveUnitModal open={!!toArchive} unit={toArchive} onClose={() => setToArchive(null)} />
      <CancelPurchaseModal open={!!toCancelPurchase} unit={toCancelPurchase} onClose={() => setToCancelPurchase(null)} />
    </>
  );

  return { openDetail, openCardDetail, openCreate, openEdit, openLeasing, openArchive, openCancelPurchase, openDelete: openArchive, modals };
};
