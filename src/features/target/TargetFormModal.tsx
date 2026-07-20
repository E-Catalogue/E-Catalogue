import { useState, type FormEvent } from 'react';
import type { AxiosError } from 'axios';
import { Target } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, NumericField } from '@/shared/components/ui/Field';
import { classifyAxiosError } from '@/core/api/errorHandler';
import type { ApiErrorBody } from '@/core/api/types';
import { notifyApiError } from '@/core/api/notify';
import { useTargetMutations } from './target.hooks';
import type { BranchTarget } from './target.types';

const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const currentPeriod = () => new Date().toISOString().slice(0, 7);

interface Props {
  open: boolean;
  onClose: () => void;
  target?: BranchTarget | null;
  branchKey: string;
  branchHeader: Record<string, string> | undefined;
}

/** Create/Edit BranchTarget. Edit hanya diizinkan saat status === 'DRAFT' (double-guard, page sudah gating). */
export const TargetFormModal = ({ open, onClose, target, branchKey, branchHeader }: Props) => {
  const isEdit = !!target;
  // Parent (TargetPage) me-remount komponen ini lewat `key` setiap kali modal dibuka,
  // jadi state cukup di-init langsung dari `target` tanpa perlu useEffect untuk menyinkronkannya.
  const [period, setPeriod] = useState(() => target?.period ?? currentPeriod());
  const [unitTarget, setUnitTarget] = useState(() => target?.unitTarget ?? 0);
  const [revenueTarget, setRevenueTarget] = useState(() => target?.revenueTarget ?? 0);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const m = useTargetMutations(branchKey, branchHeader);

  const disabled = isEdit && target?.status !== 'DRAFT';
  const validPeriod = PERIOD_RE.test(period);
  const pending = m.create.isPending || m.update.isPending;

  const handleError = (err: unknown) => {
    if (classifyAxiosError(err)) return;
    const ax = err as AxiosError<ApiErrorBody>;
    const code = ax.response?.data?.error?.code;
    if (code === 'BRANCH_TARGET_ALREADY_EXISTS') {
      setPeriodError('Target untuk periode ini sudah ada.');
      return;
    }
    notifyApiError(err);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setPeriodError(null);
    if (!validPeriod) {
      setPeriodError('Format periode harus YYYY-MM.');
      return;
    }
    if (disabled) return;

    if (isEdit && target) {
      const data: Record<string, unknown> = {};
      if (period !== target.period) data.period = period;
      if (unitTarget !== target.unitTarget) data.unitTarget = unitTarget;
      if (revenueTarget !== target.revenueTarget) data.revenueTarget = revenueTarget;
      if (Object.keys(data).length === 0) {
        onClose();
        return;
      }
      m.update.mutate({ id: target.id, body: data }, { onSuccess: onClose, onError: handleError });
    } else {
      m.create.mutate({ period, unitTarget, revenueTarget }, { onSuccess: onClose, onError: handleError });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Target size={20} />}
      title={isEdit ? 'Edit Target Cabang' : 'Buat Target Cabang'}
      subtitle={isEdit ? target?.branch?.nama : 'Target unit & revenue untuk satu periode'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>Batal</Button>
          <Button type="submit" form="target-form" disabled={pending || disabled}>
            {pending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </>
      }
    >
      {disabled ? (
        <p className="text-center py-6 text-[13px] font-semibold text-muted">
          Target ini sudah tidak berstatus Draft dan tidak dapat diubah.
        </p>
      ) : (
        <form id="target-form" onSubmit={submit} className="space-y-4">
          <div>
            <TextField
              label="Periode (YYYY-MM)"
              required
              type="month"
              value={period}
              onChange={(e) => { setPeriod(e.target.value); setPeriodError(null); }}
            />
            {periodError && <p className="text-[11px] font-semibold text-semantic-error mt-1">{periodError}</p>}
          </div>
          <NumericField
            label="Target Unit"
            required
            value={unitTarget}
            onChange={setUnitTarget}
            min={0}
            suffix="unit"
          />
          <NumericField
            label="Target Revenue"
            required
            value={revenueTarget}
            onChange={setRevenueTarget}
            min={0}
            prefix="Rp"
          />
        </form>
      )}
    </Modal>
  );
};
