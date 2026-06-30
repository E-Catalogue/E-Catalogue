import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Loader2, Wallet } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import { ActiveBadge } from './ActiveBadge';
import { useInvestorModals, useInvestorModalMutations } from './master.hooks';
import { notifyApiError } from '@/core/api/notify';
import type { Investor, InvestorModal, ProfitSharingType } from './types';
import { CashAccountSelect } from '@/features/finance/components';

interface Props {
  open: boolean;
  onClose: () => void;
  investor: Investor | null;
}

const idr = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtSharing = (m: InvestorModal) =>
  m.profitSharingType === 'percentage' ? `${m.profitSharing}%` : idr(m.profitSharing);

const fmtPeriod = (m: InvestorModal) => `${m.shareStart} → ${m.shareEnd ?? 'sekarang'}`;

// ---- form values & helpers ----
interface FormState {
  amount: string;
  profitSharingType: ProfitSharingType;
  profitSharing: string;
  profitSharingDate: string; // YYYY-MM-DD
  shareStart: string; // YYYY-MM
  shareEnd: string; // YYYY-MM | ''
  isActive: boolean;
  cashAccountId: string;
}

const emptyForm = (): FormState => ({
  amount: '',
  profitSharingType: 'percentage',
  profitSharing: '',
  profitSharingDate: '',
  shareStart: '',
  shareEnd: '',
  isActive: true,
  cashAccountId: '',
});

const toForm = (m: InvestorModal): FormState => ({
  amount: String(m.amount ?? ''),
  profitSharingType: m.profitSharingType,
  profitSharing: String(m.profitSharing ?? ''),
  profitSharingDate: m.profitSharingDate ? m.profitSharingDate.slice(0, 10) : '',
  shareStart: m.shareStart ?? '',
  shareEnd: m.shareEnd ?? '',
  isActive: m.isActive,
  cashAccountId: m.cashAccountId ?? '',
});

const TYPE_OPTIONS = [
  { value: 'percentage', label: 'Persentase (%)' },
  { value: 'fixed', label: 'Nominal Tetap (Rp)' },
];

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  item: InvestorModal | null;
  submitting?: boolean;
  onSubmit: (values: Partial<InvestorModal>) => void;
}

const ModalFormModal = ({ open, onClose, item, submitting, onSubmit }: FormModalProps) => {
  const [form, setForm] = useState<FormState>(item ? toForm(item) : emptyForm());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ? toForm(item) : emptyForm()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(emptyForm()); }

  const set = (k: keyof FormState, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(form.amount || 0),
      profitSharingType: form.profitSharingType,
      profitSharing: Number(form.profitSharing || 0),
      profitSharingDate: form.profitSharingDate ? new Date(form.profitSharingDate).toISOString() : null,
      shareStart: form.shareStart.trim(),
      shareEnd: form.shareEnd.trim() ? form.shareEnd.trim() : null,
      isActive: form.isActive,
      cashAccountId: form.cashAccountId,
    });
  };
  const amountLocked = !!item?.cashTransactionId;

  return (
    <Modal
      open={open} onClose={onClose} icon={<Wallet size={20} />}
      title={item ? 'Edit Modal' : 'Tambah Modal'}
      subtitle="Nominal modal & skema bagi hasil"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="modal-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="modal-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nominal Modal (Rp)" required type="number" min={0} disabled={amountLocked} value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="100000000" />
        {!item && <CashAccountSelect label="Akun Kas Modal" required value={form.cashAccountId} onChange={(v) => set('cashAccountId', v)} />}
        <SelectField label="Tipe Bagi Hasil" required value={form.profitSharingType} onChange={(e) => set('profitSharingType', e.target.value as ProfitSharingType)} options={TYPE_OPTIONS} />
        {form.profitSharingType === 'percentage' ? (
          <NumericField
            label="Bagi Hasil (%)"
            required
            value={Number(form.profitSharing) || 0}
            onChange={(v) => set('profitSharing', String(v))}
            suffix="%"
            placeholder="0"
            decimal
            min={0}
            max={100}
          />
        ) : (
          <NumericField
            label="Bagi Hasil"
            required
            value={Number(form.profitSharing) || 0}
            onChange={(v) => set('profitSharing', String(v))}
            prefix="Rp"
            placeholder="0"
            min={0}
          />
        )}
        <TextField label="Tgl Pembagian (opsional)" type="date" value={form.profitSharingDate} onChange={(e) => set('profitSharingDate', e.target.value)} />
        <TextField label="Mulai Bagi Hasil" required type="month" value={form.shareStart} onChange={(e) => set('shareStart', e.target.value)} />
        <TextField label="Selesai (kosong = ongoing)" type="month" value={form.shareEnd} onChange={(e) => set('shareEnd', e.target.value)} />
        <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Aktif</span>
        </label>
      </form>
    </Modal>
  );
};

export const InvestorModalModal = ({ open, onClose, investor }: Props) => {
  const investorId = investor?.id ?? '';
  const { data, isLoading } = useInvestorModals(open ? investorId : null, { page: 1, limit: 100 });
  const m = useInvestorModalMutations(investorId);

  const [form, setForm] = useState<{ item: InvestorModal | null } | null>(null);
  const [toDelete, setToDelete] = useState<InvestorModal | null>(null);

  const modals = data?.data ?? [];
  const total = modals.reduce((s, x) => s + (x.amount ?? 0), 0);

  const handleSubmit = (values: Partial<InvestorModal>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Modal — ${investor?.name ?? ''}`}
        subtitle="Kelola rincian modal & bagi hasil investor ini"
        size="lg"
        footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[13px] font-semibold text-muted">{modals.length} entri modal</p>
            {modals.length > 0 && <p className="text-sm font-extrabold text-ink">Total: {idr(total)}</p>}
          </div>
          <Button icon={<Plus size={16} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Modal</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted"><Loader2 size={22} className="animate-spin" /></div>
        ) : modals.length === 0 ? (
          <div className="text-center py-12 text-muted font-semibold text-sm">Belum ada modal.</div>
        ) : (
          <div className="divide-y divide-divider border border-border rounded-2xl overflow-hidden">
            {modals.map((x) => (
              <div key={x.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-soft transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-ink text-[13px]">{idr(x.amount)}</p>
                  <p className="text-[11px] font-medium text-muted">Bagi hasil {fmtSharing(x)} · {fmtPeriod(x)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ActiveBadge active={x.isActive} />
                  <button onClick={() => setForm({ item: x })} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setToDelete(x)} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10" title="Hapus"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ModalFormModal
        open={!!form}
        onClose={() => setForm(null)}
        item={form?.item ?? null}
        submitting={m.create.isPending || m.update.isPending}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onError: (e) => notifyApiError(e) })}
        title="Hapus Modal"
        message={toDelete ? `Hapus entri modal ${idr(toDelete.amount)}?` : ''}
      />
    </>
  );
};
