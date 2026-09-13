import { useState, type FormEvent } from 'react';
import { Loader2, Plus, ReceiptText, RotateCcw } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { NumericField } from '@/shared/components/ui/Field';
import { DateField } from '@/shared/components/ui/DateField';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { getApiErrorCode, getApiErrorMessage } from '@/core/api/apiError';
import { notifyApiError } from '@/core/api/notify';
import { useCreditProcessExpenses, useCreditProcessExpenseMutations } from '@/features/crm/crm.hooks';
import { usePermissions } from '@/features/auth/usePermissions';
import { businessToday } from '@/core/utils/businessDate';
import type { CreditProcessExpense } from '@/features/crm/crm.types';

type BranchHeaders = Record<string, string> | undefined;

/** Chip keterangan sekali tap — tujuan utama quick form "1 tap + 1 ketik nominal". */
export const CREDIT_EXPENSE_LABELS = ['Faktur', 'Absah', 'Survei', 'Rabing Data', 'Mediator', 'Lainnya'] as const;

interface CreditExpenseQuickFormProps {
  orderId: string;
  orderNumber?: string;
  unitLabel?: string;
  branchKey: string;
  headers: BranchHeaders;
  open: boolean;
  onClose: () => void;
}

/**
 * Quick input biaya proses kredit — alur 3 ketukan:
 * 1. tap chip keterangan (Faktur/Absah/Survei/Rabing Data/Mediator/Lainnya),
 * 2. ketik nominal,
 * 3. simpan (langsung terposting ke kas; akun kas default dipakai otomatis, tanggal default hari ini).
 */
export const CreditExpenseQuickForm = ({ orderId, orderNumber, unitLabel, branchKey, headers, open, onClose }: CreditExpenseQuickFormProps) => {
  const { can } = usePermissions();
  const m = useCreditProcessExpenseMutations(branchKey, orderId);
  const [label, setLabel] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [amount, setAmount] = useState(0);
  const [expenseDate, setExpenseDate] = useState(businessToday());
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!open) return null;

  const finalLabel = label === 'Lainnya' ? customLabel.trim() : label;
  const canCreate = can('OPERATIONAL_EXPENSE_CREATE');
  const valid = !!finalLabel && finalLabel.length >= 2 && amount > 0;

  const pick = (value: string) => {
    setLabel(value);
    setCustomLabel('');
    setError(null);
  };

  const submit = () => {
    m.create.mutate(
      { body: { label: finalLabel, amount: Number(amount), expenseDate: new Date(expenseDate).toISOString() }, headers },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setError(null);
          setLabel('');
          setCustomLabel('');
          setAmount(0);
          setExpenseDate(businessToday());
          onClose();
        },
        onError: (e: unknown) => {
          setConfirmOpen(false);
          setError({ code: getApiErrorCode(e), message: getApiErrorMessage(e) });
        },
      },
    );
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<ReceiptText size={20} />}
      title="Tambah Biaya Proses Kredit"
      subtitle={[orderNumber, unitLabel].filter(Boolean).join(' · ') || 'Biaya menempel ke order & unit ini'}
      size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button type="submit" form="credit-expense-form" disabled={!valid || !canCreate || m.create.isPending}>Simpan</Button>
      </>}
    >
      <form id="credit-expense-form" onSubmit={(e: FormEvent) => { e.preventDefault(); if (valid) setConfirmOpen(true); }} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Keterangan</label>
          <div className="flex flex-wrap gap-1.5">
            {CREDIT_EXPENSE_LABELS.map((option) => (
              <button
                key={option} type="button" onClick={() => pick(option)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition ${label === option ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border hover:border-primary/40'}`}
              >
                {option}
              </button>
            ))}
          </div>
          {label === 'Lainnya' && (
            <input
              type="text" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} maxLength={120}
              placeholder="Tulis keterangan biaya..." autoFocus
              className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-[13px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
        </div>
        <NumericField label="Nominal (Rp)" required value={amount} onChange={(v) => setAmount(v ?? 0)} prefix="Rp" />
        <DateField label="Tanggal" value={expenseDate} onChange={setExpenseDate} />
        <p className="text-[11px] font-medium text-muted">
          Biaya langsung terposting ke akun kas default cabang dan otomatis mengurangi profit bersih owner periode ini.
        </p>
        {error && (
          <div className="rounded-xl bg-semantic-error/10 border border-semantic-error/30 px-3 py-2.5 text-[12px] font-semibold text-semantic-error">
            {error.code === 'INSUFFICIENT_BALANCE'
              ? 'Saldo akun kas tidak mencukupi — top up kas atau pilih akun lain via Pengeluaran Operasional.'
              : error.message}
          </div>
        )}
        {!canCreate && <p className="text-[11px] font-semibold text-accent-amber">Anda tidak memiliki izin mencatat biaya (OPERATIONAL_EXPENSE_CREATE).</p>}
      </form>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        closeOnConfirm={false}
        loading={m.create.isPending}
        tone="primary"
        icon={ReceiptText}
        title="Simpan Biaya Proses Kredit"
        message={`${finalLabel} sebesar ${formatCurrency(amount)} akan langsung terposting ke kas order ${orderNumber ?? ''} ini. Lanjutkan?`}
        confirmLabel="Ya, Simpan"
      />
    </Modal>
  );
};

interface CreditExpenseSectionProps {
  orderId: string;
  orderNumber: string;
  unitLabel?: string;
  branchKey: string;
  headers: BranchHeaders;
  mutationBlocked?: boolean;
}

/** Section daftar biaya proses kredit di detail order + tombol quick add. */
export const CreditExpenseSection = ({ orderId, orderNumber, unitLabel, branchKey, headers, mutationBlocked }: CreditExpenseSectionProps) => {
  const { can } = usePermissions();
  const { data: expenses = [], isLoading } = useCreditProcessExpenses(branchKey, orderId, headers);
  const m = useCreditProcessExpenseMutations(branchKey, orderId);
  const [formOpen, setFormOpen] = useState(false);
  const [reverseTarget, setReverseTarget] = useState<CreditProcessExpense | null>(null);

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const canCreate = can('OPERATIONAL_EXPENSE_CREATE') && !mutationBlocked;
  const canReverse = can('OPERATIONAL_EXPENSE_DELETE') && !mutationBlocked;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-bold text-ink">Biaya Proses Kredit ({expenses.length})</p>
        {canCreate && (
          <button onClick={() => setFormOpen(true)} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
            <Plus size={13} /> Tambah Biaya
          </button>
        )}
      </div>
      <div className="border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-muted" /></div>
        ) : expenses.length === 0 ? (
          <div className="p-4 text-center text-[12px] text-muted">Belum ada biaya proses kredit (faktur, absah, survei, rabing data, mediator, dll).</div>
        ) : (
          <div className="divide-y divide-divider">
            {expenses.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-soft">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-ink truncate">{item.label}</p>
                  <p className="text-[10px] font-medium text-muted">{formatDate(item.expenseDate)}{item.cashAccount?.name ? ` · ${item.cashAccount.name}` : ''}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[12px] font-extrabold text-semantic-error">−{formatCurrency(item.amount)}</span>
                  {canReverse && (
                    <button onClick={() => setReverseTarget(item)} className="text-primary hover:underline" title="Balik biaya ini">
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {expenses.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-soft border-t border-divider">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Total Biaya Kredit</span>
            <span className="text-[13px] font-extrabold text-semantic-error">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
      <CreditExpenseQuickForm
        orderId={orderId} orderNumber={orderNumber} unitLabel={unitLabel}
        branchKey={branchKey} headers={headers}
        open={formOpen} onClose={() => setFormOpen(false)}
      />
      <ConfirmDialog
        open={!!reverseTarget}
        onClose={() => setReverseTarget(null)}
        onConfirm={() => reverseTarget && m.reverse.mutate({ id: reverseTarget.id, headers }, { onSuccess: () => setReverseTarget(null), onError: (e) => notifyApiError(e) })}
        loading={m.reverse.isPending}
        closeOnConfirm={false}
        tone="danger"
        icon={RotateCcw}
        title="Balik Biaya Proses Kredit"
        message={reverseTarget ? `Biaya "${reverseTarget.label}" ${formatCurrency(reverseTarget.amount)} akan dibalik dengan entri kas kompensasi. Lanjutkan?` : ''}
        confirmLabel="Ya, Balik"
      />
    </section>
  );
};
