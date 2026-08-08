import { useState, type FormEvent } from 'react';
import { ReceiptText } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { SelectField, NumericField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { DateField } from '@/shared/components/ui/DateField';
import { useLeadOrderFormLookup } from '@/features/crm/crm.hooks';
import { usePermissions } from '@/features/auth/usePermissions';
import { unitOptionLabel } from '@/features/units/unit.display';
import { toBusinessDate } from '@/core/utils/businessDate';
import type { HistoricalMode, JenisPembayaran, LeadOrder, OrderCancellationReason, OrderStatus, PaymentType } from '@/features/crm/crm.types';

type BranchHeaders = Record<string, string> | undefined;

const PAYMENT_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'KREDIT', label: 'Kredit' },
];

interface FormState {
  leadId: string;
  unitId: string;
  paymentType: PaymentType;
  salesId: string;
  leasingId: string;
  diskonShowroom: string;
  tanggalOrder: string;
  catatan: string;
  historicalMode: '' | HistoricalMode;
  historicalReason: string;
  finalStatus: Extract<OrderStatus, 'DEAL' | 'CANCELLED'>;
  terminalDate: string;
  hargaPenawaran: string;
  hargaFinal: string;
  referencePayments: Array<{ amount: string; paymentDate: string; jenisPembayaran: JenisPembayaran }>;
  cancellationReason: OrderCancellationReason;
}

const emptyForm = (currentUserId?: string | null): FormState => ({
  leadId: '', unitId: '', paymentType: 'CASH', salesId: currentUserId ?? '', leasingId: '',
  diskonShowroom: '0', tanggalOrder: '', catatan: '', historicalMode: '', historicalReason: '',
  finalStatus: 'DEAL', terminalDate: '', hargaPenawaran: '', hargaFinal: '',
  referencePayments: [{ amount: '', paymentDate: '', jenisPembayaran: 'PELUNASAN' }], cancellationReason: 'CUSTOMER_REQUEST',
});

const toForm = (o: LeadOrder): FormState => ({
  leadId: o.leadId,
  unitId: o.unitId,
  paymentType: o.paymentType,
  salesId: o.salesId ?? '',
  leasingId: o.leasingId ?? '',
  diskonShowroom: String(o.diskonShowroom ?? 0),
  tanggalOrder: toBusinessDate(o.tanggalOrder),
  catatan: o.catatan ?? '',
  historicalMode: o.historicalMode ?? '', historicalReason: o.historicalReason ?? '', finalStatus: o.status === 'CANCELLED' ? 'CANCELLED' : 'DEAL',
  terminalDate: toBusinessDate(o.status === 'CANCELLED' ? o.cancelledAt : o.dealAt),
  hargaPenawaran: String(o.hargaPenawaran ?? ''), hargaFinal: String(o.hargaFinal ?? ''),
  referencePayments: [], cancellationReason: o.cancellationReason ?? 'CUSTOMER_REQUEST',
});

const bangkokIso = (value: string) => value ? `${value}T00:00:00+07:00` : undefined;

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
  const { can } = usePermissions();
  const [form, setForm] = useState<FormState>(item ? toForm(item) : emptyForm(currentUserId));

  // Satu agregat lookup untuk seluruh dropdown form order (PRD §4.9). Pencarian jadi client-side
  // di dalam SearchableSelect, jadi tidak perlu query terpisah per keystroke lagi.
  const { data: lookup, isLoading: lookupLoading } = useLeadOrderFormLookup(branchKey, branchHeader, open);

  const leadOptions = (lookup?.leads ?? []).map((l) => ({
    value: l.id,
    label: l.nama,
    sublabel: l.opportunities?.[0]
      ? `${l.nik || '-'} · Siklus ${l.opportunities[0].status}`
      : `${l.nik || '-'} · Pembelian ulang`,
  }));
  const referenceOnly = form.historicalMode === 'REFERENCE_ONLY';
  const unitOptions = (lookup?.units ?? [])
    .filter((u) => referenceOnly ? u.historicalMode === 'REFERENCE_ONLY' : u.historicalMode !== 'REFERENCE_ONLY')
    .map((u) => ({
      value: u.id,
      label: unitOptionLabel(u),
      sublabel: [
        u.merek?.name,
        u.tipe?.name,
        u.historicalMode === 'REFERENCE_ONLY' ? 'Staging historis' : '',
        u.activeBookingCount > 0 ? `${u.activeBookingCount} booking aktif` : '',
      ].filter(Boolean).join(' · ') || undefined,
    }));
  const leasingOptions = (lookup?.leasings ?? []).map((l) => ({ value: l.id, label: l.name }));
  const salesOptions = (lookup?.sales ?? []).map((s) => ({ value: s.id, label: s.name, sublabel: s.username }));
  const referencePaid = form.referencePayments.reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const historicalInvalid = !!form.historicalMode && form.historicalReason.trim().length < 5;
  const referenceInvalid = referenceOnly && (
    !form.terminalDate || Number(form.hargaPenawaran) <= 0 || Number(form.hargaFinal) <= 0
    || Number(form.hargaFinal) > Number(form.hargaPenawaran)
    || form.referencePayments.some((payment) => Number(payment.amount) > 0 && !payment.paymentDate)
    || (form.finalStatus === 'DEAL' && referencePaid < Number(form.hargaFinal))
  );

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const historical = form.historicalMode ? {
      mode: form.historicalMode,
      reason: form.historicalReason.trim(),
      ...(referenceOnly ? {
        finalStatus: form.finalStatus,
        [form.finalStatus === 'DEAL' ? 'dealDate' : 'cancelledAt']: bangkokIso(form.terminalDate),
        hargaPenawaran: Number(form.hargaPenawaran),
        diskonShowroom: Number(form.diskonShowroom || 0),
        hargaFinal: Number(form.hargaFinal),
        ...(form.finalStatus === 'CANCELLED' ? { cancellationReason: form.cancellationReason } : {}),
        payments: form.referencePayments.filter((payment) => Number(payment.amount) > 0).map((payment) => ({
          amount: Number(payment.amount), paymentDate: bangkokIso(payment.paymentDate) ?? '', jenisPembayaran: payment.jenisPembayaran,
        })),
      } : {}),
    } : undefined;
    onSubmit({
      leadId: form.leadId || undefined,
      unitId: form.unitId || undefined,
      paymentType: form.paymentType,
      salesId: form.salesId || undefined,
      leasingId: form.paymentType === 'KREDIT' ? form.leasingId || undefined : null,
      diskonShowroom: Number(form.diskonShowroom || 0),
      tanggalOrder: bangkokIso(form.tanggalOrder),
      catatan: form.catatan?.trim() || undefined,
      historical,
    });
  };

  return (
    <Modal
      open={open} onClose={onClose} icon={<ReceiptText size={20} />}
      title={item ? `Edit Order — ${item.nomorOrder}` : 'Buat Sales Order'}
      subtitle="Pilih lead & unit, atur tipe pembayaran"
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="order-form" disabled={submitting || historicalInvalid || referenceInvalid}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="order-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!item && can('TRANSACTION_BACKDATE') && <div className="sm:col-span-2 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3 space-y-3">
          <SelectField label="Input data lama" value={form.historicalMode} onChange={(e) => { set('historicalMode', e.target.value); set('unitId', ''); }} options={[
            { value: '', label: 'Transaksi hari ini' }, { value: 'POST_LEDGER', label: 'POST_LEDGER — posting saldo normal' }, { value: 'REFERENCE_ONLY', label: 'REFERENCE_ONLY — laporan saja' },
          ]} />
          {form.historicalMode && <><p className="text-[11px] font-semibold text-ink-soft">{referenceOnly ? 'Tidak mengubah kas, modal investor, kewajiban, atau settlement. Record final tidak dapat diedit.' : 'Ledger dan seluruh dampak finansial diposting seperti transaksi normal.'}</p><textarea required minLength={5} value={form.historicalReason} onChange={(e) => set('historicalReason', e.target.value)} placeholder="Alasan input data lama (minimal 5 karakter)" rows={2} className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" /></>}
        </div>}
        <SearchableSelect label="Lead / Customer" required wrapClass="sm:col-span-2" value={form.leadId} onChange={(v) => set('leadId', v)} options={leadOptions} loading={lookupLoading} placeholder="Pilih lead" searchPlaceholder="Cari nama / NIK lead..." emptyMessage="Tidak ada lead." />
        <SearchableSelect label={referenceOnly ? 'Unit staging historis' : 'Unit (Ready Stock)'} required wrapClass="sm:col-span-2" value={form.unitId} onChange={(v) => set('unitId', v)} options={unitOptions} loading={lookupLoading} placeholder="Pilih unit" searchPlaceholder="Cari merek/tipe/plat..." emptyMessage={referenceOnly ? 'Tidak ada Unit REFERENCE_ONLY yang belum final.' : 'Tidak ada unit ready stock.'} />

        <SearchableSelect label="Sales" required value={form.salesId} onChange={(v) => set('salesId', v)} options={salesOptions} loading={lookupLoading} placeholder="Pilih sales" searchPlaceholder="Cari sales..." />
        <SelectField label="Tipe Pembayaran" required value={form.paymentType} onChange={(e) => set('paymentType', e.target.value as PaymentType)} options={PAYMENT_OPTIONS} />
        <NumericField label="Diskon Showroom" prefix="Rp" min={0} value={Number(form.diskonShowroom) || 0} onChange={(v) => set('diskonShowroom', String(v))} />

        {form.paymentType === 'KREDIT' && (
          <>
            <SearchableSelect label="Leasing" value={form.leasingId} onChange={(v) => set('leasingId', v)} options={leasingOptions} loading={lookupLoading} clearable placeholder="(tidak ada)" searchPlaceholder="Cari leasing..." />
          </>
        )}

        <DateField label="Tanggal Order" value={form.tanggalOrder} onChange={(v) => set('tanggalOrder', v)} />
        <div />
        {referenceOnly && <>
          <SelectField label="Status final" required value={form.finalStatus} onChange={(e) => set('finalStatus', e.target.value)} options={[{ value: 'DEAL', label: 'DEAL' }, { value: 'CANCELLED', label: 'CANCELLED' }]} />
          <DateField label={form.finalStatus === 'DEAL' ? 'Tanggal DEAL' : 'Tanggal batal'} required value={form.terminalDate} onChange={(v) => set('terminalDate', v)} />
          {form.finalStatus === 'CANCELLED' && <SelectField label="Alasan pembatalan" required value={form.cancellationReason} onChange={(e) => set('cancellationReason', e.target.value)} options={[{ value: 'CUSTOMER_REQUEST', label: 'Permintaan Customer' }, { value: 'CREDIT_REJECTED', label: 'Kredit Ditolak' }, { value: 'UNIT_ISSUE', label: 'Masalah Unit' }, { value: 'PRICE_DISAGREEMENT', label: 'Harga Tidak Sepakat' }, { value: 'DUPLICATE_ORDER', label: 'Order Duplikat' }]} />}
          <NumericField label="Harga penawaran snapshot" required prefix="Rp" min={0} value={Number(form.hargaPenawaran) || 0} onChange={(v) => set('hargaPenawaran', String(v))} />
          <NumericField label="Harga final snapshot" required prefix="Rp" min={0} value={Number(form.hargaFinal) || 0} onChange={(v) => set('hargaFinal', String(v))} />
          <div className="sm:col-span-2 space-y-2 rounded-xl border border-border bg-surface-soft p-3">
            <div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold uppercase tracking-wide text-muted">Daftar pembayaran referensi</p><button type="button" onClick={() => setForm((current) => ({ ...current, referencePayments: [...current.referencePayments, { amount: '', paymentDate: '', jenisPembayaran: 'PELUNASAN' }] }))} className="rounded-lg bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary">+ Tambah</button></div>
            {form.referencePayments.map((payment, index) => <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 rounded-xl border border-border bg-surface p-2">
              <NumericField label="Jumlah" prefix="Rp" min={0} value={Number(payment.amount) || 0} onChange={(value) => setForm((current) => ({ ...current, referencePayments: current.referencePayments.map((item, itemIndex) => itemIndex === index ? { ...item, amount: String(value) } : item) }))} />
              <DateField label="Tanggal" value={payment.paymentDate} onChange={(value) => setForm((current) => ({ ...current, referencePayments: current.referencePayments.map((item, itemIndex) => itemIndex === index ? { ...item, paymentDate: value } : item) }))} />
              <SelectField label="Jenis" value={payment.jenisPembayaran} onChange={(event) => setForm((current) => ({ ...current, referencePayments: current.referencePayments.map((item, itemIndex) => itemIndex === index ? { ...item, jenisPembayaran: event.target.value as JenisPembayaran } : item) }))} options={[{ value: 'BOOKING_FEE', label: 'Booking Fee' }, { value: 'DP', label: 'DP' }, { value: 'TAMBAHAN_DP', label: 'Tambahan DP' }, { value: 'PELUNASAN', label: 'Pelunasan' }, { value: 'PENCAIRAN_LEASING', label: 'Pencairan Leasing' }]} />
              <button type="button" aria-label="Hapus pembayaran" onClick={() => setForm((current) => ({ ...current, referencePayments: current.referencePayments.filter((_, itemIndex) => itemIndex !== index) }))} className="self-end h-10 rounded-lg px-2 text-[11px] font-bold text-semantic-error">Hapus</button>
            </div>)}
          </div>
        </>}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Catatan</label>
          <textarea value={form.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="Catatan order (opsional)" rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-none" />
        </div>
      </form>
    </Modal>
  );
};
