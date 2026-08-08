import { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, RotateCcw, XCircle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { SelectField, TextField } from '@/shared/components/ui/Field';
import { DateField } from '@/shared/components/ui/DateField';
import { CashAccountSelect } from '@/features/finance/components';
import { useLeadOrderCashAccounts } from '@/features/finance/lookup';
import { useLeadOrderDealImpact, useLeadPayments } from '@/features/crm/crm.hooks';
import { formatCurrency } from '@/core/utils/format';
import { usePermissions } from '@/features/auth/usePermissions';
import { businessToday } from '@/core/utils/businessDate';
import {
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR,
  type LeadOrder, type LeadOrderCancellation, type OrderCancellationReason, type OrderStatus,
} from '@/features/crm/crm.types';

interface Props {
  open: boolean;
  onClose: () => void;
  order: LeadOrder | null;
  submitting?: boolean;
  onSubmit: (status: Extract<OrderStatus, 'DEAL' | 'CANCELLED'>, cancellation?: LeadOrderCancellation) => Promise<unknown>;
}

const today = businessToday;

export const OrderStatusModal = ({ open, onClose, order, submitting, onSubmit }: Props) => {
  const { can } = usePermissions();
  const [pending, setPending] = useState<Extract<OrderStatus, 'DEAL' | 'CANCELLED'> | null>(null);
  const [refundEnabled, setRefundEnabled] = useState(false);
  const [paymentIds, setPaymentIds] = useState<string[]>([]);
  const [cashAccountId, setCashAccountId] = useState('');
  const [transactionDate, setTransactionDate] = useState(today());
  const [description, setDescription] = useState('Refund pembatalan booking');
  const [cancellationReason, setCancellationReason] = useState<OrderCancellationReason>('CUSTOMER_REQUEST');
  const [cancellationNote, setCancellationNote] = useState('');
  const [dealDate, setDealDate] = useState(today());
  const [cancelledAt, setCancelledAt] = useState(today());
  const [backdateReason, setBackdateReason] = useState('');

  const resourceKey = order?.branchId ?? 'order';
  const resourceHeaders = order?.branchId ? { 'X-Branch-Id': order.branchId } : undefined;
  const paymentsQuery = useLeadPayments(resourceKey, open && order ? order.id : null, resourceHeaders);
  const dealImpactQuery = useLeadOrderDealImpact(
    resourceKey,
    open && pending === 'DEAL' && order ? order.id : null,
    resourceHeaders,
    open && pending === 'DEAL',
  );
  const dealImpact = dealImpactQuery.data;
  const { data: cashAccounts = [], isLoading: cashLoading } = useLeadOrderCashAccounts(resourceKey, {
    headers: resourceHeaders,
    enabled: open && refundEnabled,
  });

  const payments = useMemo(() => paymentsQuery.data?.data ?? [], [paymentsQuery.data]);
  const refundedIds = useMemo(() => new Set(
    payments
      .filter((payment) => payment.jenisPembayaran === 'REFUND_DP' && payment.refundOfPaymentId)
      .map((payment) => payment.refundOfPaymentId as string),
  ), [payments]);
  const eligiblePayments = payments.filter((payment) =>
    payment.postingStatus === 'POSTED'
    && ['BOOKING_FEE', 'DP', 'TAMBAHAN_DP'].includes(payment.jenisPembayaran)
    && !refundedIds.has(payment.id));
  const refundTotal = eligiblePayments
    .filter((payment) => paymentIds.includes(payment.id))
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const refundValid = (!refundEnabled || (paymentIds.length > 0 && !!cashAccountId && !!transactionDate))
    && (cancellationReason !== 'OTHER' || !!cancellationNote.trim());
  const canTransition = order?.status === 'BOOKING';
  const isPaid = order?.isPaid === true;
  const isPast = (value: string) => value < today();
  const backdateRequired = can('TRANSACTION_BACKDATE') && ((pending === 'DEAL' && isPast(dealDate)) || (pending === 'CANCELLED' && isPast(cancelledAt)));
  const backdateValid = !backdateRequired || backdateReason.trim().length >= 5;
  const bangkokIso = (value: string) => `${value}T00:00:00+07:00`;

  const close = () => {
    setPending(null);
    setRefundEnabled(false);
    setPaymentIds([]);
    setCashAccountId('');
    setTransactionDate(today());
    setDescription('Refund pembatalan booking');
    setCancellationReason('CUSTOMER_REQUEST');
    setCancellationNote('');
    setDealDate(today());
    setCancelledAt(today());
    setBackdateReason('');
    onClose();
  };
  const togglePayment = (id: string) => setPaymentIds((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const submitDeal = () => {
    if (!backdateValid) return;
    void onSubmit('DEAL', { dealDate: bangkokIso(dealDate), ...(backdateRequired ? { backdateReason: backdateReason.trim() } : {}) }).then(close).catch(() => undefined);
  };
  const submitCancellation = () => {
    if (!refundValid || !backdateValid) return;
    void onSubmit('CANCELLED', {
      cancellationReason,
      cancellationNote: cancellationNote.trim() || undefined,
      cancelledAt: bangkokIso(cancelledAt),
      ...(backdateRequired ? { backdateReason: backdateReason.trim() } : {}),
      ...(refundEnabled ? { refund: { paymentIds, cashAccountId, transactionDate: bangkokIso(transactionDate), description: description.trim() || undefined } } : {}),
    }).then(close).catch(() => undefined);
  };

  return (
    <>
      <Modal open={open} onClose={close} icon={<RefreshCw size={20} />} title="Ubah Status Order"
        subtitle={order?.nomorOrder ? `Order: ${order.nomorOrder}` : undefined}
        footer={<Button variant="secondary" onClick={close}>Tutup</Button>}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Status saat ini</span>
            {order?.status && <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</span>}
          </div>
          {canTransition ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => isPaid && setPending('DEAL')}
                disabled={!isPaid}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-accent-green/30 bg-accent-green/5 hover:bg-accent-green/10 text-left disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-green/5"
              >
                <CheckCircle2 size={18} className="text-accent-green shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-ink">Tandai DEAL</p>
                  <p className="text-[11px] text-muted font-medium">
                    {isPaid ? 'Unit terjual, settlement dibuat otomatis' : `Lunasi tagihan terlebih dahulu${order?.remainingPayment ? ` (sisa ${formatCurrency(order.remainingPayment)})` : ''}`}
                  </p>
                </div>
              </button>
              <button onClick={() => setPending('CANCELLED')} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-semantic-error/30 bg-semantic-error/5 hover:bg-semantic-error/10 text-left">
                <XCircle size={18} className="text-semantic-error shrink-0" />
                <div><p className="text-[13px] font-bold text-ink">Batalkan Order</p><p className="text-[11px] text-muted font-medium">Opsional refund DP secara atomik</p></div>
              </button>
            </div>
          ) : <p className="text-[12px] font-semibold text-muted py-2">Order sudah final dan status tidak dapat diubah lagi.</p>}
        </div>
      </Modal>

      <ConfirmDialog open={pending === 'DEAL'} onClose={() => setPending(null)} onConfirm={submitDeal}
        closeOnConfirm={false} loading={submitting || dealImpactQuery.isLoading} confirmDisabled={!backdateValid || !dealImpact?.canDeal} tone="primary" icon={CheckCircle2} title="Tandai Order DEAL"
        message="Unit akan ditandai SOLD, lead menjadi WON, dan settlement penjualan dibuat. Booking pesaing dibatalkan serta pembayaran kasnya direfund otomatis dalam transaksi yang sama."
        confirmLabel="Ya, Tandai DEAL">
        <div className="mt-3 space-y-3">
          {dealImpactQuery.isError && <p className="rounded-xl bg-semantic-error/10 p-3 text-[11px] font-semibold text-semantic-error">Dampak DEAL gagal dimuat. Muat ulang sebelum melanjutkan.</p>}
          {dealImpact && <div className="rounded-xl border border-border bg-surface-soft p-3 text-[12px]">
            <div className="flex justify-between gap-3 font-bold text-ink"><span>Booking yang dibatalkan</span><span>{dealImpact.competitorCount}</span></div>
            <div className="mt-1 flex justify-between gap-3 font-bold text-ink"><span>Total refund otomatis</span><span className="text-primary">{formatCurrency(dealImpact.totalRefund)}</span></div>
            {dealImpact.competitors.length > 0 && <div className="mt-2 space-y-1 text-[11px] text-muted">{dealImpact.competitors.map((competitor) => <p key={competitor.id}>{competitor.nomorOrder} · {competitor.customer.nama} · {formatCurrency(competitor.refundableAmount)}</p>)}</div>}
            {dealImpact.blockers.length > 0 && <div className="mt-3 space-y-1 rounded-lg bg-semantic-error/10 p-2 text-[11px] font-semibold text-semantic-error">{dealImpact.blockers.map((blocker) => <p key={`${blocker.code}:${blocker.paymentId ?? blocker.orderId}`}>{blocker.message}</p>)}</div>}
          </div>}
          <DateField label="Tanggal DEAL" required value={dealDate} onChange={setDealDate} />
          {backdateRequired && <TextField label="Alasan backdate *" value={backdateReason} onChange={(event) => setBackdateReason(event.target.value)} maxLength={2000} />}
        </div>
      </ConfirmDialog>

      <ConfirmDialog open={pending === 'CANCELLED'} onClose={() => setPending(null)} onConfirm={submitCancellation}
        closeOnConfirm={false} loading={submitting} confirmDisabled={!refundValid || !backdateValid} tone="danger" icon={XCircle} title="Batalkan Order"
        message="Order dan refund yang dipilih diproses atomik dalam satu request; tidak ada reversal terpisah."
        confirmLabel="Ya, Batalkan">
        <div className="mt-4 space-y-3 text-left">
          <SelectField label="Alasan Pembatalan" required value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value as OrderCancellationReason)} options={[
            { value: 'CUSTOMER_REQUEST', label: 'Permintaan Customer' }, { value: 'CREDIT_REJECTED', label: 'Kredit Ditolak' },
            { value: 'UNIT_ISSUE', label: 'Masalah Unit' }, { value: 'PRICE_DISAGREEMENT', label: 'Harga Tidak Sepakat' },
            { value: 'DUPLICATE_ORDER', label: 'Order Duplikat' }, { value: 'OTHER', label: 'Lainnya' },
          ]} />
          <DateField label="Tanggal Pembatalan" required value={cancelledAt} onChange={setCancelledAt} />
          {backdateRequired && <TextField label="Alasan backdate *" value={backdateReason} onChange={(event) => setBackdateReason(event.target.value)} maxLength={2000} />}
          <TextField label={cancellationReason === 'OTHER' ? 'Catatan Pembatalan *' : 'Catatan Pembatalan'} value={cancellationNote} onChange={(event) => setCancellationNote(event.target.value)} maxLength={2000} />
          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-soft p-3 cursor-pointer">
            <input type="checkbox" checked={refundEnabled} onChange={(event) => { setRefundEnabled(event.target.checked); if (!event.target.checked) setPaymentIds([]); }} className="h-4 w-4 accent-[color:var(--color-primary)]" />
            <RotateCcw size={15} className="text-primary" />
            <span className="text-[12px] font-bold text-ink">Refund DP / booking fee</span>
          </label>
          {refundEnabled && (
            <>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-border divide-y divide-divider">
                {paymentsQuery.isLoading ? <p className="p-3 text-[11px] font-semibold text-muted">Memuat pembayaran…</p>
                  : eligiblePayments.length === 0 ? <p className="p-3 text-[11px] font-semibold text-muted">Tidak ada pembayaran DP yang dapat direfund.</p>
                  : eligiblePayments.map((payment) => (
                    <label key={payment.id} className="flex items-center gap-2.5 p-3 cursor-pointer hover:bg-surface-soft">
                      <input type="checkbox" checked={paymentIds.includes(payment.id)} onChange={() => togglePayment(payment.id)} className="h-4 w-4 accent-[color:var(--color-primary)]" />
                      <span className="flex-1 text-[11px] font-bold text-ink">{payment.jenisPembayaran.replaceAll('_', ' ')}</span>
                      <span className="text-[11px] font-extrabold text-primary">{formatCurrency(payment.amount)}</span>
                    </label>
                  ))}
              </div>
              <div className="rounded-xl bg-primary-light px-3 py-2.5 flex justify-between text-[12px] font-bold"><span>Total refund</span><span className="text-primary">{formatCurrency(refundTotal)}</span></div>
              <CashAccountSelect label="Akun Kas Refund" required value={cashAccountId} onChange={setCashAccountId} accounts={cashAccounts} loading={cashLoading} />
              <DateField label="Tanggal Refund" required value={transactionDate} onChange={setTransactionDate} />
              <TextField label="Keterangan" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} />
              {!refundValid && <p className="text-[11px] font-semibold text-semantic-error">Pilih minimal satu pembayaran, akun kas, dan tanggal refund.</p>}
            </>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
};
