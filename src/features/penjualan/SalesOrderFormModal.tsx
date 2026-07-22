import { useState, type FormEvent } from 'react';
import { ReceiptText } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { SelectField, NumericField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { DateField } from '@/shared/components/ui/DateField';
import { useLeadOrderFormLookup } from '@/features/crm/crm.hooks';
import type { LeadOrder, PaymentType, StatusApproval } from '@/features/crm/crm.types';

type BranchHeaders = Record<string, string> | undefined;

const PAYMENT_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'KREDIT', label: 'Kredit' },
];

const SLIK_OPTIONS = [
  { value: '', label: '(tidak ada)' },
  { value: 'BI_CHECKING', label: 'Proses BI Checking' },
  { value: 'LOLOS', label: 'Lolos' },
  { value: 'REJECT', label: 'Ditolak' },
];

const APPROVAL_OPTIONS = [
  { value: '', label: '(tidak ada)' },
  { value: 'PENDING', label: 'Menunggu Approval' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
];

interface FormState {
  leadId: string;
  unitId: string;
  paymentType: PaymentType;
  salesId: string;
  leasingId: string;
  diskonShowroom: string;
  statusSlik: string;
  statusApproval: '' | StatusApproval;
  tanggalOrder: string;
  catatan: string;
}

const emptyForm = (currentUserId?: string | null): FormState => ({
  leadId: '', unitId: '', paymentType: 'CASH', salesId: currentUserId ?? '', leasingId: '',
  diskonShowroom: '0', statusSlik: '', statusApproval: '', tanggalOrder: '', catatan: '',
});

const toForm = (o: LeadOrder): FormState => ({
  leadId: o.leadId,
  unitId: o.unitId,
  paymentType: o.paymentType,
  salesId: o.salesId ?? '',
  leasingId: o.leasingId ?? '',
  diskonShowroom: String(o.diskonShowroom ?? 0),
  statusSlik: o.statusSlik ?? '',
  statusApproval: (o.statusApproval as StatusApproval | null) ?? '',
  tanggalOrder: o.tanggalOrder ? o.tanggalOrder.slice(0, 10) : '',
  catatan: o.catatan ?? '',
});

interface Props {
  open: boolean;
  onClose: () => void;
  item?: LeadOrder | null;
  submitting?: boolean;
  currentUserId?: string | null;
  branchKey?: string;
  branchHeader?: BranchHeaders;
  onSubmit: (values: Partial<LeadOrder>) => void;
}

export const SalesOrderFormModal = ({ open, onClose, item, submitting, currentUserId, branchKey = 'all', branchHeader, onSubmit }: Props) => {
  const [form, setForm] = useState<FormState>(item ? toForm(item) : emptyForm(currentUserId));
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ? toForm(item) : emptyForm(currentUserId)); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(emptyForm(currentUserId)); }
  if (open && !item && currentUserId && !form.salesId) { setForm((f) => ({ ...f, salesId: currentUserId })); }

  // Satu agregat lookup untuk seluruh dropdown form order (PRD §4.9). Pencarian jadi client-side
  // di dalam SearchableSelect, jadi tidak perlu query terpisah per keystroke lagi.
  const { data: lookup, isLoading: lookupLoading } = useLeadOrderFormLookup(branchKey, branchHeader, open);

  const leadOptions = (lookup?.leads ?? []).map((l) => ({ value: l.id, label: l.nama, sublabel: l.nik || undefined }));
  const unitOptions = (lookup?.units ?? []).map((u) => ({ value: u.id, label: [u.merek?.name, u.tipe?.name, u.platNomor].filter(Boolean).join(' ') || u.id }));
  const leasingOptions = (lookup?.leasings ?? []).map((l) => ({ value: l.id, label: l.name }));
  const salesOptions = (lookup?.sales ?? []).map((s) => ({ value: s.id, label: s.name, sublabel: s.username }));

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      leadId: form.leadId || undefined,
      unitId: form.unitId || undefined,
      paymentType: form.paymentType,
      salesId: form.salesId || undefined,
      leasingId: form.paymentType === 'KREDIT' ? form.leasingId || undefined : null,
      diskonShowroom: Number(form.diskonShowroom || 0),
      statusSlik: form.paymentType === 'KREDIT' ? form.statusSlik || undefined : null,
      statusApproval: form.paymentType === 'KREDIT' ? form.statusApproval || null : null,
      tanggalOrder: form.tanggalOrder ? new Date(form.tanggalOrder).toISOString() : undefined,
      catatan: form.catatan?.trim() || undefined,
    });
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<ReceiptText size={20} />}
      title={item ? `Edit Order — ${item.nomorOrder}` : 'Buat Sales Order'}
      subtitle="Pilih lead & unit, atur tipe pembayaran"
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="order-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="order-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SearchableSelect label="Lead / Customer" required wrapClass="sm:col-span-2" value={form.leadId} onChange={(v) => set('leadId', v)} options={leadOptions} loading={lookupLoading} placeholder="Pilih lead" searchPlaceholder="Cari nama / NIK lead..." emptyMessage="Tidak ada lead aktif." />
        <SearchableSelect label="Unit (Ready Stock)" required wrapClass="sm:col-span-2" value={form.unitId} onChange={(v) => set('unitId', v)} options={unitOptions} loading={lookupLoading} placeholder="Pilih unit" searchPlaceholder="Cari merek/tipe/plat..." emptyMessage="Tidak ada unit ready stock." />

        <SearchableSelect label="Sales" required value={form.salesId} onChange={(v) => set('salesId', v)} options={salesOptions} loading={lookupLoading} placeholder="Pilih sales" searchPlaceholder="Cari sales..." />
        <SelectField label="Tipe Pembayaran" required value={form.paymentType} onChange={(e) => set('paymentType', e.target.value as PaymentType)} options={PAYMENT_OPTIONS} />
        <NumericField label="Diskon Showroom" prefix="Rp" min={0} value={Number(form.diskonShowroom) || 0} onChange={(v) => set('diskonShowroom', String(v))} />

        {form.paymentType === 'KREDIT' && (
          <>
            <SearchableSelect label="Leasing" value={form.leasingId} onChange={(v) => set('leasingId', v)} options={leasingOptions} loading={lookupLoading} clearable placeholder="(tidak ada)" searchPlaceholder="Cari leasing..." />
            <SelectField label="Status SLIK" value={form.statusSlik} onChange={(e) => set('statusSlik', e.target.value)} options={SLIK_OPTIONS} />
            <SelectField label="Status Approval" wrapClass="sm:col-span-2" value={form.statusApproval} onChange={(e) => set('statusApproval', e.target.value as FormState['statusApproval'])} options={APPROVAL_OPTIONS} />
          </>
        )}

        <DateField label="Tanggal Order" value={form.tanggalOrder} onChange={(v) => set('tanggalOrder', v)} />
        <div />
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Catatan</label>
          <textarea value={form.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="Catatan order (opsional)" rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-none" />
        </div>
      </form>
    </Modal>
  );
};
