import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus, Loader2, Wallet, ReceiptText, RotateCcw, AlertTriangle,
  FileDown, CheckCircle2, Landmark, DollarSign,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import { CashAccountSelect } from '@/features/finance/components';
import { usePermissions } from '@/features/auth/usePermissions';
import { useIdempotencyKey } from '@/shared/hooks/useIdempotencyKey';
import { apiClient } from '@/core/api/client';
import { getApiErrorCode, getApiErrorMessage } from '@/core/api/apiError';
import {
  useLeadOrder, useLeadPayments, useLeadPaymentMutations,
  useSaleSettlement, useSaleSettlementMutations,
} from '@/features/crm/crm.hooks';
import {
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR,
  JENIS_PEMBAYARAN_LABEL, SETTLEMENT_STATUS_LABEL, SETTLEMENT_STATUS_COLOR,
  type LeadOrder, type LeadPayment, type JenisPembayaran, type SaleSettlement,
} from '@/features/crm/crm.types';

type BranchHeaders = Record<string, string> | undefined;

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const today = () => new Date().toISOString().slice(0, 10);

/** Nilai yang benar-benar tersimpan di database — `LEASING` cuma alias input lama yang
 * dinormalisasi backend ke `PENCAIRAN_LEASING` (payment.service.js `normalizePayload`),
 * jadi tidak ditawarkan di form biar tidak ada 2 opsi berlabel sama. */
const JENIS_OPTIONS = (Object.keys(JENIS_PEMBAYARAN_LABEL) as JenisPembayaran[])
  .filter((k) => k !== 'LEASING')
  .map((k) => ({ value: k, label: JENIS_PEMBAYARAN_LABEL[k] }));

/** Pesan banner inline per error code finansial (README §17: jangan hanya toast untuk error finansial). */
const ERROR_BANNER: Record<string, { title: string; message: string }> = {
  IDEMPOTENCY_KEY_REQUIRED: { title: 'Kunci idempotency wajib diisi', message: 'Kunci baru telah dibuat. Silakan konfirmasi ulang untuk mencoba lagi.' },
  IDEMPOTENCY_KEY_CONFLICT: { title: 'Kunci idempotency sudah dipakai', message: 'Jangan mencoba ulang otomatis. Periksa riwayat pembayaran — transaksi sebelumnya mungkin sudah terposting.' },
  INVALID_IDEMPOTENCY_KEY: { title: 'Kunci idempotency tidak valid', message: 'Kunci baru telah dibuat. Silakan coba lagi.' },
  INVALID_AMOUNT: { title: 'Nominal tidak valid', message: 'Nominal pembayaran harus lebih dari nol.' },
  ORDER_CANCELLED: { title: 'Order sudah dibatalkan', message: 'Order ini sudah dibatalkan dan tidak dapat menerima pembayaran baru.' },
  LEAD_ORDER_NOT_FOUND: { title: 'Order tidak ditemukan', message: 'Order mungkin sudah dihapus/berubah. Detail akan dimuat ulang.' },
  PAYMENT_LEDGER_LOCKED: { title: 'Pembayaran terposting tidak dapat diubah', message: 'Detail finansial pembayaran yang sudah terposting tidak dapat diubah — gunakan reversal.' },
  POSTED_PAYMENT_IMMUTABLE: { title: 'Pembayaran terposting tidak dapat dihapus', message: 'Gunakan aksi Reverse untuk mengoreksi pembayaran yang sudah terposting.' },
  PAYMENT_NOT_REVERSIBLE: { title: 'Pembayaran tidak dapat dibalik', message: 'Riwayat pembayaran telah dimuat ulang — kemungkinan sudah dibalik atau belum terposting.' },
  SETTLEMENT_DEPENDENCY_EXISTS: { title: 'Reversal tidak diizinkan', message: 'Settlement sudah bergantung pada pembayaran ini. Perlu financial adjustment resmi, bukan reversal biasa.' },
  SETTLEMENT_CAPITAL_ALREADY_REUSED: { title: 'Tidak dapat diproses ulang', message: 'Modal settlement sudah dipakai ulang — eskalasi ke adjustment resmi, jangan mencoba lagi.' },
  INSUFFICIENT_BALANCE: { title: 'Saldo akun kas tidak mencukupi', message: 'Draft dipertahankan — pilih akun kas dengan saldo cukup sebelum mencoba lagi.' },
  SALE_SETTLEMENT_NOT_FOUND: { title: 'Settlement belum tersedia', message: 'Settlement hanya ada setelah order berstatus DEAL.' },
};
const FALLBACK_5XX_BANNER = { title: 'Permintaan gagal diproses', message: 'Kunci idempotency dipertahankan — transaksi mungkin sudah terposting di server. Coba lagi secara manual, jangan ulangi dengan kunci baru.' };

const InlineErrorBanner = ({ code, message, onDismiss }: { code?: string; message: string; onDismiss: () => void }) => {
  const mapped = (code && ERROR_BANNER[code]) || (!code ? FALLBACK_5XX_BANNER : undefined);
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-semantic-error/10 border border-semantic-error/30 text-semantic-error">
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold">{mapped?.title ?? 'Terjadi kesalahan'}</p>
        <p className="text-[11px] font-medium mt-0.5 leading-relaxed">{mapped?.message ?? message}</p>
      </div>
      <button onClick={onDismiss} className="text-[11px] font-bold underline shrink-0">Tutup</button>
    </div>
  );
};

/** Bukti pembayaran = private media — dibuka via authenticated fetch + blob (README §16),
 * bukan `<img src>`/link langsung tanpa bearer token. */
const ProofLink = ({ url }: { url: string }) => {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data as Blob);
      window.open(blobUrl, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={open} disabled={loading} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50">
      {loading ? <Loader2 size={11} className="animate-spin" /> : <FileDown size={11} />} Lihat Bukti
    </button>
  );
};

interface PaymentFormState {
  amount: number;
  paymentDate: string;
  jenisPembayaran: JenisPembayaran;
  description: string;
  cashAccountId: string;
  bukti: File | null;
}

const emptyPayment = (): PaymentFormState => ({
  amount: 0, paymentDate: today(), jenisPembayaran: 'DP', description: '', cashAccountId: '', bukti: null,
});

interface PayFormProps {
  orderId: string;
  branchKey: string;
  headers: BranchHeaders;
  disabled?: boolean;
  disabledReason?: string;
}

/** Diekspor supaya bisa dipakai ulang di luar `OrderDetailModal` (mis. quick-input "Catat
 * Pembayaran") tanpa menduplikasi logic idempotency-key/error-banner/posting kas di atas. */
export const PayForm = ({ orderId, branchKey, headers, disabled, disabledReason }: PayFormProps) => {
  const [form, setForm] = useState<PaymentFormState>(emptyPayment());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const idem = useIdempotencyKey();
  const m = useLeadPaymentMutations(branchKey, orderId);
  const qc = useQueryClient();

  const set = <K extends keyof PaymentFormState>(k: K, v: PaymentFormState[K], resetKey = true) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (resetKey) idem.regenerate();
  };

  const valid = form.amount > 0 && !!form.paymentDate && !!form.jenisPembayaran && !!form.cashAccountId;

  const submit = () => {
    const body: FormData | Partial<LeadPayment> = form.bukti
      ? (() => {
          const fd = new FormData();
          fd.append('amount', String(form.amount));
          fd.append('paymentDate', new Date(form.paymentDate).toISOString());
          fd.append('jenisPembayaran', form.jenisPembayaran);
          fd.append('cashAccountId', form.cashAccountId);
          if (form.description.trim()) fd.append('description', form.description.trim());
          fd.append('bukti', form.bukti);
          return fd;
        })()
      : {
          amount: form.amount,
          paymentDate: new Date(form.paymentDate).toISOString(),
          jenisPembayaran: form.jenisPembayaran,
          cashAccountId: form.cashAccountId,
          description: form.description.trim() || undefined,
        };

    m.create.mutate(
      { body, headers, idempotencyKey: idem.key },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setError(null);
          setForm(emptyPayment());
          idem.regenerate();
        },
        onError: (e: unknown) => {
          const code = getApiErrorCode(e);
          setError({ code, message: getApiErrorMessage(e) });
          if (code === 'ORDER_CANCELLED' || code === 'LEAD_ORDER_NOT_FOUND') {
            qc.invalidateQueries({ queryKey: ['lead-order', branchKey, orderId] });
          }
          if (code === 'IDEMPOTENCY_KEY_REQUIRED' || code === 'INVALID_IDEMPOTENCY_KEY') idem.regenerate();
          // Kode lain (termasuk 5xx/IDEMPOTENCY_KEY_CONFLICT) TIDAK meregenerasi kunci — retry manual harus memakai kunci yang sama.
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      {disabled && disabledReason && (
        <p className="text-[12px] font-semibold text-accent-amber">{disabledReason}</p>
      )}
      {error && <InlineErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} />}
      <form onSubmit={(e: FormEvent) => { e.preventDefault(); if (valid) setConfirmOpen(true); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NumericField label="Jumlah (Rp)" required value={form.amount} onChange={(v) => set('amount', v)} prefix="Rp" />
        <TextField label="Tanggal Bayar" required type="date" value={form.paymentDate} onChange={(e) => set('paymentDate', e.target.value)} />
        <SelectField label="Jenis Pembayaran" required value={form.jenisPembayaran} onChange={(e) => set('jenisPembayaran', e.target.value as JenisPembayaran)} options={JENIS_OPTIONS} />
        <CashAccountSelect required value={form.cashAccountId} onChange={(v) => set('cashAccountId', v)} />
        <TextField label="Keterangan (opsional)" wrapClass="sm:col-span-2" value={form.description} onChange={(e) => set('description', e.target.value, false)} />
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Bukti Pembayaran (opsional)</label>
          <input type="file" accept="image/*,.pdf" onChange={(e) => set('bukti', e.target.files?.[0] ?? null, false)} className="w-full text-[12px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-[11px] file:font-bold file:px-3 file:py-1.5" />
        </div>
        <Button type="submit" icon={<Plus size={14} />} disabled={!valid || disabled} className="sm:col-span-2">Tambah Pembayaran</Button>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        closeOnConfirm={false}
        loading={m.create.isPending}
        tone="primary"
        icon={Wallet}
        title="Konfirmasi Pembayaran"
        message={`${form.jenisPembayaran === 'REFUND_LEASING' ? 'Refund' : 'Pembayaran'} ${idr(form.amount)} akan langsung terposting ke akun kas terpilih. Lanjutkan?`}
        confirmLabel="Ya, Simpan"
      />
    </div>
  );
};

const PaymentRow = ({
  payment, orderId, branchKey, headers, canReverse,
}: { payment: LeadPayment; orderId: string; branchKey: string; headers: BranchHeaders; canReverse: boolean }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState(today());
  const [description, setDescription] = useState('');
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const m = useLeadPaymentMutations(branchKey, orderId);
  const qc = useQueryClient();

  const isRefund = payment.jenisPembayaran === 'REFUND_LEASING';
  const reversible = payment.postingStatus === 'POSTED';

  return (
    <div className="px-4 py-3 hover:bg-surface-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-bold text-[13px] ${isRefund ? 'text-semantic-error' : 'text-ink'}`}>{isRefund ? '−' : '+'}{idr(payment.amount)}</p>
          <p className="text-[11px] text-muted font-medium">
            {JENIS_PEMBAYARAN_LABEL[payment.jenisPembayaran]} · {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
            {payment.cashAccount?.name ? ` · ${payment.cashAccount.name}` : ''}
          </p>
          {payment.description && <p className="text-[11px] text-muted mt-0.5">{payment.description}</p>}
          {payment.buktiUrl && <div className="mt-1"><ProofLink url={payment.buktiUrl} /></div>}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${payment.postingStatus === 'POSTED' ? 'bg-accent-green/10 text-accent-green' : 'bg-semantic-error/10 text-semantic-error'}`}>
            {payment.postingStatus === 'POSTED' ? 'Terposting' : 'Dibalik'}
          </span>
          {canReverse && reversible && (
            <button onClick={() => setConfirmOpen(true)} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
              <RotateCcw size={11} /> Reverse
            </button>
          )}
        </div>
      </div>
      {error && <div className="mt-2"><InlineErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} /></div>}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        closeOnConfirm={false}
        loading={m.reverse.isPending}
        tone="danger"
        icon={RotateCcw}
        title="Balik Pembayaran"
        message={`Pembayaran ${idr(payment.amount)} akan dibalik dan tercatat sebagai transaksi kas baru (bukan penghapusan). Lanjutkan?`}
        confirmLabel="Ya, Balik"
        onConfirm={() => m.reverse.mutate(
          { id: payment.id, body: { transactionDate, description: description || undefined }, headers },
          {
            onSuccess: () => { setConfirmOpen(false); setError(null); },
            onError: (e: unknown) => {
              const code = getApiErrorCode(e);
              setError({ code, message: getApiErrorMessage(e) });
              if (code === 'PAYMENT_NOT_REVERSIBLE') {
                qc.invalidateQueries({ queryKey: ['lead-payments', branchKey, orderId] });
              }
            },
          },
        )}
      >
        <div className="space-y-2.5">
          <TextField label="Tanggal Transaksi" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
          <TextField label="Keterangan (opsional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
        </div>
      </ConfirmDialog>
    </div>
  );
};

const SettlementPanel = ({
  orderId, branchKey, headers, canFinalize,
}: { orderId: string; branchKey: string; headers: BranchHeaders; canFinalize: boolean }) => {
  const { data, isLoading, isError } = useSaleSettlement(branchKey, orderId, headers);
  const settlement = data as SaleSettlement | undefined;
  const m = useSaleSettlementMutations(branchKey, orderId);

  const [incentive, setIncentive] = useState(0);
  const [confirmIncentive, setConfirmIncentive] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);

  if (isLoading) return <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-muted" /></div>;
  if (isError || !settlement) return <p className="text-center py-6 text-[12px] text-muted border border-dashed border-border rounded-xl">Settlement belum tersedia.</p>;

  const row = (label: string, value: number | null | undefined, bold = false) => (
    <div className={`flex justify-between text-[12px] ${bold ? 'font-extrabold text-ink' : 'font-medium text-muted'}`}>
      <span>{label}</span><span>{value == null ? '-' : idr(value)}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {error && <InlineErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} />}
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${SETTLEMENT_STATUS_COLOR[settlement.status]}`}>
          {SETTLEMENT_STATUS_LABEL[settlement.status]}
        </span>
        {settlement.finalizedAt && <span className="text-[11px] text-muted font-medium">Difinalisasi {new Date(settlement.finalizedAt).toLocaleDateString('id-ID')}</span>}
      </div>

      <div className="border border-border rounded-xl p-3.5 space-y-1.5 bg-surface-soft/50">
        {row('Harga Final', settlement.finalPrice)}
        {row('Cost Basis Pricing', settlement.pricingCostBasis)}
        {row('Profit Basis', settlement.profitBasis)}
        {row('Profit Investor', settlement.investorProfit)}
        {row('Rekondisi Tambahan', settlement.additionalReconditioningCost)}
        {row('Insentif Sales', settlement.salesIncentiveAmount)}
        <div className="border-t border-border my-1.5" />
        {row('Profit Perusahaan (sblm Pajak)', settlement.companyProfitBeforeTax)}
        {row('Provisi Pajak', settlement.taxProvision)}
        {row('Profit Bersih Perusahaan', settlement.companyNetProfit, true)}
      </div>

      <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
        <Landmark size={13} /> Tax reserve: <span className="font-bold text-ink">{settlement.taxReserveStatus}</span>
      </div>

      {canFinalize && settlement.status !== 'FINALIZED' && settlement.status !== 'REVERSED' && (
        <div className="space-y-3 border-t border-divider pt-3.5">
          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Input Insentif Sales</p>
            <div className="flex items-end gap-2">
              <NumericField label="Nominal Insentif" value={incentive} onChange={setIncentive} prefix="Rp" wrapClass="flex-1" />
              <Button icon={<DollarSign size={14} />} disabled={incentive < 0} onClick={() => setConfirmIncentive(true)}>Simpan</Button>
            </div>
          </section>
          <Button icon={<CheckCircle2 size={15} />} variant="secondary" block onClick={() => setConfirmFinalize(true)}>
            Finalisasi Settlement
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmIncentive}
        onClose={() => setConfirmIncentive(false)}
        closeOnConfirm={false}
        loading={m.setIncentive.isPending}
        tone="primary"
        icon={DollarSign}
        title="Simpan Insentif Sales"
        message={`Simpan insentif sales sebesar ${idr(incentive)} untuk order ini?`}
        confirmLabel="Ya, Simpan"
        onConfirm={() => m.setIncentive.mutate(
          { amount: incentive, headers },
          { onSuccess: () => { setConfirmIncentive(false); setError(null); }, onError: (e: unknown) => setError({ code: getApiErrorCode(e), message: getApiErrorMessage(e) }) },
        )}
      />
      <ConfirmDialog
        open={confirmFinalize}
        onClose={() => setConfirmFinalize(false)}
        closeOnConfirm={false}
        loading={m.finalize.isPending}
        tone="primary"
        icon={CheckCircle2}
        title="Finalisasi Settlement"
        message="Sistem akan menghitung status akhir settlement berdasarkan pelunasan & insentif yang sudah diinput. Jika belum lunas atau insentif belum diisi, status akan tetap menunggu. Lanjutkan?"
        confirmLabel="Ya, Finalisasi"
        onConfirm={() => m.finalize.mutate(
          { headers },
          { onSuccess: () => { setConfirmFinalize(false); setError(null); }, onError: (e: unknown) => setError({ code: getApiErrorCode(e), message: getApiErrorMessage(e) }) },
        )}
      />
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  branchKey: string;
  branchHeader: BranchHeaders;
  mutationBlocked: boolean;
  onEdit?: () => void;
}

export const OrderDetailModal = ({ open, onClose, orderId, branchKey, branchHeader, mutationBlocked, onEdit }: Props) => {
  const { can } = usePermissions();
  const { data: order, isLoading: orderLoading } = useLeadOrder(branchKey, open ? orderId : null, branchHeader);
  const { data: paymentsRes, isLoading: payLoading } = useLeadPayments(branchKey, open ? orderId : null, branchHeader);

  const payments = paymentsRes?.data ?? [];

  const o = order as LeadOrder | undefined;
  const statusLabel = o?.status ? ORDER_STATUS_LABEL[o.status] : '';
  const statusColor = o?.status ? ORDER_STATUS_COLOR[o.status] : '';

  const isLoading = orderLoading || payLoading;

  return (
    <Modal
      open={open} onClose={onClose} icon={<ReceiptText size={20} />}
      title={o?.nomorOrder ?? 'Detail Order'}
      subtitle="Informasi sales order, pembayaran & settlement"
      size="xl"
      footer={
        <div className="flex gap-2">
          {onEdit && o?.status === 'BOOKING' && <Button variant="secondary" onClick={onEdit}>Edit Order</Button>}
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
            {o.status === 'DEAL' && o.dealAt && <InfoItem label="Tanggal Deal" value={new Date(o.dealAt).toLocaleDateString('id-ID')} />}
            {o.status === 'CANCELLED' && o.cancelledAt && <InfoItem label="Tanggal Batal" value={new Date(o.cancelledAt).toLocaleDateString('id-ID')} />}
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
            <SummaryCard label="Total Terbayar (Net)" value={idr(o.totalPaid)} color="text-green-600" />
            <SummaryCard label="Sisa Tagihan" value={idr(o.remainingPayment)} color="text-red-600" />
            <SummaryCard label="Status" value={o.isPaid ? 'Lunas ✓' : 'Belum Lunas'} color={o.isPaid ? 'text-green-700' : 'text-amber-600'} />
          </div>

          {/* Payments */}
          <section>
            <p className="text-[12px] font-bold text-ink mb-2">Riwayat Pembayaran ({payments.length})</p>
            {payLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-muted" /></div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm border border-dashed border-border rounded-xl mb-3">Belum ada pembayaran.</div>
            ) : (
              <div className="divide-y divide-divider border border-border rounded-2xl overflow-hidden mb-3">
                {payments.map((p) => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    orderId={o.id}
                    branchKey={branchKey}
                    headers={branchHeader}
                    canReverse={can('LEAD_PAYMENT_REVERSE') && !mutationBlocked}
                  />
                ))}
              </div>
            )}
            {can('LEAD_PAYMENT_CREATE') && o.status !== 'CANCELLED' && (
              <PayForm
                orderId={o.id}
                branchKey={branchKey}
                headers={branchHeader}
                disabled={mutationBlocked}
                disabledReason={mutationBlocked ? 'Pilih cabang konkret terlebih dahulu untuk mencatat pembayaran.' : undefined}
              />
            )}
          </section>

          {/* Settlement — hanya ada setelah DEAL (README §17 404 SALE_SETTLEMENT_NOT_FOUND: sembunyikan tab action) */}
          {o.status === 'DEAL' && can('SALE_SETTLEMENT_READ') && (
            <section className="border-t border-divider pt-5">
              <p className="text-[12px] font-bold text-ink mb-2">Settlement Penjualan</p>
              <SettlementPanel
                orderId={o.id}
                branchKey={branchKey}
                headers={branchHeader}
                canFinalize={can('SALE_SETTLEMENT_FINALIZE') && !mutationBlocked}
              />
            </section>
          )}
        </div>
      )}
    </Modal>
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
