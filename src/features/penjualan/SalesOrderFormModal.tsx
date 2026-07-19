import { useState, type FormEvent } from 'react';
import { ReceiptText, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { leasingApi } from '@/features/master/simpleMaster.api';
import { leadApi, leadOrderApi, unitApi } from '@/features/crm/crm.api';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import type { LeadOrder, PaymentType, StatusApproval } from '@/features/crm/crm.types';

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
  onSubmit: (values: Partial<LeadOrder>) => void;
}

export const SalesOrderFormModal = ({ open, onClose, item, submitting, currentUserId, onSubmit }: Props) => {
  const [form, setForm] = useState<FormState>(item ? toForm(item) : emptyForm(currentUserId));
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ? toForm(item) : emptyForm(currentUserId)); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(emptyForm(currentUserId)); }
  if (open && !item && currentUserId && !form.salesId) { setForm((f) => ({ ...f, salesId: currentUserId })); }

  const [leadSearch, setLeadSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const debouncedLead = useDebouncedValue(leadSearch, 350);
  const debouncedUnit = useDebouncedValue(unitSearch, 350);

  const { data: leadsRes } = useQuery({
    queryKey: ['leads-dropdown', debouncedLead],
    queryFn: () => leadApi.list({ page: 1, limit: 20, search: debouncedLead }),
    enabled: open,
  });
  const { data: unitsRes } = useQuery({
    queryKey: ['units-dropdown', debouncedUnit],
    queryFn: () => unitApi.list({ page: 1, limit: 20, search: debouncedUnit, status: 'READY_STOCK' }),
    enabled: open,
  });
  const { data: leasingRes } = useQuery({
    queryKey: ['leasing-dropdown'],
    queryFn: () => leasingApi.list({ page: 1, limit: 100 }),
    enabled: open,
  });
  const { data: salesRes } = useQuery({
    queryKey: ['sales-combobox'],
    queryFn: leadOrderApi.sales,
    enabled: open,
  });

  const leadOptions = [
    { value: '', label: 'Pilih Lead...' },
    ...(leadsRes?.data ?? []).map((l) => ({ value: l.id, label: `${l.nama}${l.noHp ? ` · ${l.noHp}` : ''}` })),
  ];
  const unitOptions = [
    { value: '', label: 'Pilih Unit (READY STOCK)...' },
    ...(unitsRes?.data ?? []).map((u) => ({ value: u.id, label: [u.merek?.name, u.tipe?.name, u.platNomor].filter(Boolean).join(' ') || u.id })),
  ];
  const leasingOptions = [
    { value: '', label: '(tidak ada)' },
    ...(leasingRes?.data ?? []).filter((l) => l.isActive).map((l) => ({ value: l.id, label: l.name })),
  ];
  const salesOptions = [
    { value: '', label: 'Pilih Sales...' },
    ...(salesRes ?? []).map((s) => ({ value: s.id, label: `${s.name}${s.username ? ` (${s.username})` : ''}` })),
  ];

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
        {/* Lead */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted">Lead / Customer <span className="text-primary">*</span></label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} placeholder="Cari nama, HP lead..." className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-soft border border-border text-sm focus:outline-none focus:border-primary mb-1.5" />
          </div>
          <select required value={form.leadId} onChange={(e) => set('leadId', e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light">
            {leadOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Unit */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted">Unit <span className="text-primary">*</span></label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} placeholder="Cari merek/tipe/plat..." className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-soft border border-border text-sm focus:outline-none focus:border-primary mb-1.5" />
          </div>
          <select required value={form.unitId} onChange={(e) => set('unitId', e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light">
            {unitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <SelectField label="Sales" required value={form.salesId} onChange={(e) => set('salesId', e.target.value)} options={salesOptions} />
        <SelectField label="Tipe Pembayaran" required value={form.paymentType} onChange={(e) => set('paymentType', e.target.value as PaymentType)} options={PAYMENT_OPTIONS} />
        <TextField label="Diskon Showroom (Rp)" type="number" min={0} value={form.diskonShowroom} onChange={(e) => set('diskonShowroom', e.target.value)} placeholder="0" />

        {form.paymentType === 'KREDIT' && (
          <>
            <SelectField label="Leasing" value={form.leasingId} onChange={(e) => set('leasingId', e.target.value)} options={leasingOptions} />
            <SelectField label="Status SLIK" value={form.statusSlik} onChange={(e) => set('statusSlik', e.target.value)} options={SLIK_OPTIONS} />
            <SelectField label="Status Approval" wrapClass="sm:col-span-2" value={form.statusApproval} onChange={(e) => set('statusApproval', e.target.value as FormState['statusApproval'])} options={APPROVAL_OPTIONS} />
          </>
        )}

        <TextField label="Tanggal Order" type="date" value={form.tanggalOrder} onChange={(e) => set('tanggalOrder', e.target.value)} />
        <div />
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Catatan</label>
          <textarea value={form.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="Catatan order (opsional)" rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-none" />
        </div>
      </form>
    </Modal>
  );
};
