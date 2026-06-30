import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Loader2, Wallet, ReceiptText } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { useLeadOrder, useLeadPayments, useLeadPaymentMutations } from '@/features/crm/crm.hooks';
import { notifyApiError } from '@/core/api/notify';
import {
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR,
  JENIS_PEMBAYARAN_LABEL,
  type LeadOrder, type LeadPayment, type JenisPembayaran,
} from '@/features/crm/crm.types';

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const JENIS_OPTIONS = (Object.keys(JENIS_PEMBAYARAN_LABEL) as JenisPembayaran[]).map((k) => ({
  value: k, label: JENIS_PEMBAYARAN_LABEL[k],
}));

interface PaymentFormState {
  amount: string;
  paymentDate: string;
  jenisPembayaran: JenisPembayaran;
  description: string;
}

const emptyPayment = (): PaymentFormState => ({
  amount: '', paymentDate: new Date().toISOString().slice(0, 10),
  jenisPembayaran: 'BOOKING_FEE', description: '',
});

const toPaymentForm = (p: LeadPayment): PaymentFormState => ({
  amount: String(p.amount),
  paymentDate: p.paymentDate.slice(0, 10),
  jenisPembayaran: p.jenisPembayaran,
  description: p.description ?? '',
});

interface PayFormProps {
  open: boolean;
  onClose: () => void;
  item: LeadPayment | null;
  submitting?: boolean;
  onSubmit: (values: Partial<LeadPayment>) => void;
}

const PaymentFormModal = ({ open, onClose, item, submitting, onSubmit }: PayFormProps) => {
  const [form, setForm] = useState<PaymentFormState>(item ? toPaymentForm(item) : emptyPayment());
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ? toPaymentForm(item) : emptyPayment()); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm(emptyPayment()); }

  const set = (k: keyof PaymentFormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(form.amount),
      paymentDate: new Date(form.paymentDate).toISOString(),
      jenisPembayaran: form.jenisPembayaran,
      description: form.description?.trim() || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} icon={<Wallet size={20} />} title={item ? 'Edit Pembayaran' : 'Tambah Pembayaran'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="pay-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}
    >
      <form id="pay-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Jumlah (Rp)" required type="number" min={1} value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="1000000" />
        <TextField label="Tanggal Bayar" required type="date" value={form.paymentDate} onChange={(e) => set('paymentDate', e.target.value)} />
        <SelectField label="Jenis Pembayaran" required wrapClass="sm:col-span-2" value={form.jenisPembayaran} onChange={(e) => set('jenisPembayaran', e.target.value as JenisPembayaran)} options={JENIS_OPTIONS} />
        <TextField label="Keterangan" wrapClass="sm:col-span-2" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Keterangan opsional" />
      </form>
    </Modal>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  onEdit?: () => void;
}

export const OrderDetailModal = ({ open, onClose, orderId, onEdit }: Props) => {
  const { data: order, isLoading: orderLoading } = useLeadOrder(open ? orderId : null);
  const { data: paymentsRes, isLoading: payLoading } = useLeadPayments(open ? orderId : null);
  const m = useLeadPaymentMutations(orderId ?? '');

  const [payForm, setPayForm] = useState<{ item: LeadPayment | null } | null>(null);
  const [toDelete, setToDelete] = useState<LeadPayment | null>(null);

  const payments = paymentsRes?.data ?? [];

  const handlePaySubmit = (values: Partial<LeadPayment>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setPayForm(null) };
    if (payForm?.item) m.update.mutate({ id: payForm.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  const o = order as LeadOrder | undefined;
  const statusLabel = o?.status ? ORDER_STATUS_LABEL[o.status] : '';
  const statusColor = o?.status ? ORDER_STATUS_COLOR[o.status] : '';

  const isLoading = orderLoading || payLoading;

  return (
    <>
      <Modal
        open={open} onClose={onClose} icon={<ReceiptText size={20} />}
        title={o?.nomorOrder ?? 'Detail Order'}
        subtitle="Informasi sales order & riwayat pembayaran"
        size="xl"
        footer={
          <div className="flex gap-2">
            {onEdit && <Button variant="secondary" onClick={onEdit}>Edit Order</Button>}
            <Button variant="secondary" onClick={onClose}>Tutup</Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
        ) : !o ? (
          <div className="text-center py-12 text-muted">Data tidak ditemukan.</div>
        ) : (
          <div className="space-y-6">
            {/* Order info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Status" value={<span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${statusColor}`}>{statusLabel}</span>} />
              <InfoItem label="Tipe Bayar" value={o.paymentType} />
              <InfoItem label="Tanggal Order" value={o.tanggalOrder ? new Date(o.tanggalOrder).toLocaleDateString('id-ID') : '-'} />
              <InfoItem label="Lead" value={o.lead?.nama ?? '-'} />
              <InfoItem label="Unit" value={[o.unit?.merek?.name, o.unit?.tipe?.name, o.unit?.platNomor].filter(Boolean).join(' ') || '-'} />
              <InfoItem label="Sales" value={o.sales?.name ?? '-'} />
              <InfoItem label="Harga Penawaran" value={idr(o.hargaPenawaran)} />
              <InfoItem label="Diskon" value={idr(o.diskonShowroom)} />
              <InfoItem label="Harga Final" value={<span className="font-bold text-ink">{idr(o.hargaFinal)}</span>} />
              {o.paymentType === 'KREDIT' && (
                <>
                  <InfoItem label="Leasing" value={o.leasing?.name ?? '-'} />
                  <InfoItem label="Status SLIK" value={o.statusSlik ?? '-'} />
                  <InfoItem label="Status Approval" value={o.statusApproval ?? '-'} />
                </>
              )}
              {o.catatan && <InfoItem label="Catatan" value={o.catatan} wrapClass="col-span-2 md:col-span-3" />}
            </div>

            {/* Payment summary */}
            <div className="flex flex-wrap gap-3">
              <SummaryCard label="Total Terbayar" value={idr(o.totalPaid)} color="text-green-600" />
              <SummaryCard label="Sisa Tagihan" value={idr(o.remainingPayment)} color="text-red-600" />
              <SummaryCard label="Status" value={o.isPaid ? 'Lunas ✓' : 'Belum Lunas'} color={o.isPaid ? 'text-green-700' : 'text-amber-600'} />
            </div>

            {/* Payments list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-bold text-ink">Riwayat Pembayaran ({payments.length})</p>
                <Button icon={<Plus size={14} />} onClick={() => setPayForm({ item: null })}>Tambah</Button>
              </div>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm border border-dashed border-border rounded-xl">Belum ada pembayaran.</div>
              ) : (
                <div className="divide-y divide-divider border border-border rounded-2xl overflow-hidden">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-soft">
                      <div>
                        <p className="font-bold text-ink text-[13px]">{idr(p.amount)}</p>
                        <p className="text-[11px] text-muted font-medium">
                          {JENIS_PEMBAYARAN_LABEL[p.jenisPembayaran]} · {new Date(p.paymentDate).toLocaleDateString('id-ID')}
                          {p.description ? ` · ${p.description}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setPayForm({ item: p })} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10"><Pencil size={13} /></button>
                        <button onClick={() => setToDelete(p)} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <PaymentFormModal
        open={!!payForm}
        onClose={() => setPayForm(null)}
        item={payForm?.item ?? null}
        submitting={m.create.isPending || m.update.isPending}
        onSubmit={handlePaySubmit}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onError: (e) => notifyApiError(e) })}
        title="Hapus Pembayaran"
        message={toDelete ? `Hapus pembayaran ${idr(toDelete.amount)}?` : ''}
        tone="danger"
      />
    </>
  );
};

const InfoItem = ({ label, value, wrapClass = '' }: { label: string; value: React.ReactNode; wrapClass?: string }) => (
  <div className={wrapClass}>
    <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-0.5">{label}</p>
    <p className="text-[13px] font-semibold text-ink">{value}</p>
  </div>
);

const SummaryCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex-1 bg-surface-soft border border-border rounded-xl p-3 text-center">
    <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
    <p className={`text-[15px] font-extrabold mt-0.5 ${color}`}>{value}</p>
  </div>
);
