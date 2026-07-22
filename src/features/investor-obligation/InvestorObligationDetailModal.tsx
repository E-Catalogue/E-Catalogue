import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  PiggyBank, Loader2, Receipt, RotateCcw, AlertTriangle, CalendarDays, Landmark,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, NumericField } from '@/shared/components/ui/Field';
import { DateField } from '@/shared/components/ui/DateField';
import { CashAccountSelect } from '@/features/finance/components';
import { useInvestorObligationCashAccounts } from '@/features/finance/lookup';
import { usePermissions } from '@/features/auth/usePermissions';
import { useIdempotencyKey } from '@/shared/hooks/useIdempotencyKey';
import { getApiErrorCode, getApiErrorMessage } from '@/core/api/apiError';
import { formatCurrency, formatDate } from '@/core/utils/format';
import {
  useInvestorObligation, useInvestorObligationMutations, useInvestorObligationPayments,
} from './investor-obligation.hooks';
import {
  OBLIGATION_STATUS_COLOR, OBLIGATION_STATUS_LABEL, OBLIGATION_TYPE_LABEL, PAYABLE_STATUSES,
  POSTING_STATUS_LABEL,
  type InvestorObligation, type InvestorPayment,
} from './investor-obligation.types';

type BranchHeaders = Record<string, string> | undefined;

const today = () => new Date().toISOString().slice(0, 10);

/** Pesan banner inline per error code finansial (README §17: jangan hanya toast). */
const ERROR_BANNER: Record<string, { title: string; message: string }> = {
  PAYMENT_EXCEEDS_OBLIGATION: { title: 'Pembayaran melebihi sisa kewajiban', message: 'Sisa kewajiban telah dimuat ulang — periksa kembali nominal pembayaran.' },
  INVESTOR_OBLIGATION_NOT_PAYABLE: { title: 'Kewajiban tidak dapat dibayar', message: 'Status kewajiban sudah berubah sejak halaman dibuka. Detail telah dimuat ulang.' },
  INVESTOR_PAYMENT_NOT_REVERSIBLE: { title: 'Pembayaran tidak dapat dibalik', message: 'Histori pembayaran telah dimuat ulang — kemungkinan sudah dibalik atau belum terposting.' },
  IDEMPOTENCY_KEY_REQUIRED: { title: 'Kunci idempotency wajib diisi', message: 'Kunci baru telah dibuat. Silakan konfirmasi ulang untuk mencoba lagi.' },
  IDEMPOTENCY_KEY_CONFLICT: { title: 'Kunci idempotency sudah dipakai', message: 'Jangan mencoba ulang otomatis. Periksa histori pembayaran — transaksi sebelumnya mungkin sudah terposting.' },
  CASH_ACCOUNT_NOT_FOUND: { title: 'Akun kas tidak ditemukan', message: 'Pilih akun kas lain yang aktif pada cabang ini.' },
  CASH_ACCOUNT_INACTIVE: { title: 'Akun kas tidak aktif', message: 'Pilih akun kas lain yang aktif.' },
  BOOK_PERIOD_CLOSED: { title: 'Periode pembukuan sudah ditutup', message: 'Pilih tanggal pada periode pembukuan yang masih terbuka.' },
  INSUFFICIENT_BALANCE: { title: 'Saldo akun kas tidak mencukupi', message: 'Draft pembayaran dipertahankan — periksa saldo akun kas sebelum mencoba lagi.' },
  CROSS_BRANCH_RELATION: { title: 'Relasi lintas cabang', message: 'Salah satu relasi berasal dari cabang berbeda. Data akan dimuat ulang.' },
  BRANCH_SCOPE_FORBIDDEN: { title: 'Cabang tidak sesuai', message: 'Reset selector cabang lalu muat ulang data.' },
  INVESTOR_OBLIGATION_NOT_FOUND: { title: 'Kewajiban tidak ditemukan', message: 'Data mungkin sudah dihapus/berubah. Detail ditutup dan daftar dimuat ulang.' },
};
const FALLBACK_5XX_BANNER = { title: 'Permintaan gagal diproses', message: 'Kunci idempotency dipertahankan — transaksi mungkin sudah terposting di server. Coba lagi secara manual, jangan ulangi dengan kunci baru.' };

const InlineErrorBanner = ({ code, message, onDismiss }: { code?: string; message: string; onDismiss: () => void }) => {
  // Kode tak terpetakan (mis. tanpa error.code sama sekali) kemungkinan besar 5xx yang lolos
  // dari interceptor infra — pakai banner "mungkin sudah terposting" alih-alih pesan generik.
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

const PayForm = ({
  obligation, branchKey, headers, onNotPayable,
}: { obligation: InvestorObligation; branchKey: string; headers: BranchHeaders; onNotPayable: () => void }) => {
  const remaining = obligation.amount - obligation.paidAmount;
  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState(remaining);
  const [paidAt, setPaidAt] = useState(today());
  const [description, setDescription] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const idem = useIdempotencyKey();
  const m = useInvestorObligationMutations(branchKey);
  const qc = useQueryClient();
  const { data: cashAccounts = [], isLoading: cashLoading } = useInvestorObligationCashAccounts(branchKey, { headers });

  const valid = !!cashAccountId && amount > 0 && amount <= remaining && !!paidAt;

  const submit = () => {
    m.pay.mutate(
      { id: obligation.id, data: { cashAccountId, amount, paidAt, description: description || undefined }, headers, idempotencyKey: idem.key },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setError(null);
          setCashAccountId('');
          setAmount(0);
          setDescription('');
          setPaidAt(today());
          idem.regenerate();
        },
        onError: (e: unknown) => {
          const code = getApiErrorCode(e);
          setError({ code, message: getApiErrorMessage(e) });
          if (code === 'INVESTOR_OBLIGATION_NOT_PAYABLE' || code === 'INVESTOR_OBLIGATION_NOT_FOUND') {
            qc.invalidateQueries({ queryKey: ['investor-obligation', branchKey, obligation.id] });
            if (code === 'INVESTOR_OBLIGATION_NOT_FOUND') {
              qc.invalidateQueries({ queryKey: ['investor-obligations'] });
              onNotPayable();
            }
          }
          if (code === 'PAYMENT_EXCEEDS_OBLIGATION') {
            qc.invalidateQueries({ queryKey: ['investor-obligation', branchKey, obligation.id] });
          }
          if (code === 'IDEMPOTENCY_KEY_REQUIRED') idem.regenerate();
          // Kunci TIDAK diregenerasi untuk kode lain (termasuk 5xx) — retry manual harus memakai kunci yang sama.
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      {error && <InlineErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CashAccountSelect label="Akun Kas" required value={cashAccountId} onChange={(v) => { setCashAccountId(v); idem.regenerate(); }} accounts={cashAccounts} loading={cashLoading} />
        <DateField label="Tanggal Bayar" required value={paidAt} onChange={(v) => { setPaidAt(v); idem.regenerate(); }} />
        <NumericField label="Nominal" required value={amount} onChange={(v) => { setAmount(v); idem.regenerate(); }} prefix="Rp" max={remaining} wrapClass="sm:col-span-2" />
        <TextField label="Keterangan (opsional)" wrapClass="sm:col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
      </div>
      <p className="text-[11px] font-medium text-muted">Sisa kewajiban: <span className="font-bold text-ink">{formatCurrency(remaining)}</span></p>
      <Button icon={<Receipt size={15} />} disabled={!valid} onClick={() => setConfirmOpen(true)} block>Bayar Kewajiban</Button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        closeOnConfirm={false}
        loading={m.pay.isPending}
        tone="primary"
        icon={Receipt}
        title="Konfirmasi Pembayaran"
        message={`Bayar ${formatCurrency(amount)} untuk kewajiban ini dari akun kas terpilih? Tindakan ini akan langsung terposting ke kas.`}
        confirmLabel="Ya, Bayar"
      />
    </div>
  );
};

const PaymentRow = ({
  payment, obligationId, branchKey, headers, canReverse,
}: { payment: InvestorPayment; obligationId: string; branchKey: string; headers: BranchHeaders; canReverse: boolean }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState(today());
  const [description, setDescription] = useState('');
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const m = useInvestorObligationMutations(branchKey);
  const qc = useQueryClient();

  const reversible = payment.postingStatus === 'POSTED' && !payment.reversalOfId;

  return (
    <div className="px-4 py-3 border-b border-divider last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-ink text-[13px]">{formatCurrency(payment.amount)}</p>
          <p className="text-[11px] font-medium text-muted">{formatDate(payment.paidAt)} · {payment.cashAccount?.name}</p>
          {payment.description && <p className="text-[11px] text-muted mt-0.5">{payment.description}</p>}
          {payment.reversalOfId && <p className="text-[10px] font-bold text-semantic-error mt-0.5">Reversal dari #{payment.reversalOfId.slice(-6)}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${payment.postingStatus === 'POSTED' ? 'bg-accent-green/10 text-accent-green' : payment.postingStatus === 'REVERSED' ? 'bg-semantic-error/10 text-semantic-error' : 'bg-muted/10 text-muted'}`}>
            {POSTING_STATUS_LABEL[payment.postingStatus]}
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
        message={`Pembayaran ${formatCurrency(payment.amount)} akan dibalik dan mengurangi jumlah dibayar pada kewajiban ini. Tindakan ini tercatat sebagai transaksi kas baru, bukan penghapusan. Lanjutkan?`}
        confirmLabel="Ya, Balik"
        onConfirm={() => m.reverse.mutate(
          { id: obligationId, paymentId: payment.id, data: { transactionDate, description: description || undefined }, headers },
          {
            onSuccess: () => { setConfirmOpen(false); setError(null); },
            onError: (e: unknown) => {
              const code = getApiErrorCode(e);
              setError({ code, message: getApiErrorMessage(e) });
              if (code === 'INVESTOR_PAYMENT_NOT_REVERSIBLE') {
                qc.invalidateQueries({ queryKey: ['investor-obligation-payments', branchKey, obligationId] });
              }
            },
          },
        )}
      >
        <div className="space-y-2.5">
          <DateField label="Tanggal Transaksi" value={transactionDate} onChange={(v) => setTransactionDate(v)} />
          <TextField label="Keterangan (opsional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
        </div>
      </ConfirmDialog>
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  id: string | null;
  branchKey: string;
  branchHeader: BranchHeaders;
  mutationBlocked: boolean;
}

export const InvestorObligationDetailModal = ({ open, onClose, id, branchKey, branchHeader, mutationBlocked }: Props) => {
  const { can } = usePermissions();
  const { data, isLoading } = useInvestorObligation(branchKey, id ?? undefined, branchHeader);
  const { data: paymentsRes, isLoading: paymentsLoading } = useInvestorObligationPayments(branchKey, id ?? undefined, branchHeader);
  const obligation = data?.data;
  const payments = paymentsRes?.data ?? [];

  const payable = obligation && PAYABLE_STATUSES.includes(obligation.status) && !mutationBlocked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<PiggyBank size={20} />}
      title="Detail Kewajiban Investor"
      subtitle={obligation ? `${obligation.investor?.name} · ${OBLIGATION_TYPE_LABEL[obligation.type]}` : undefined}
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      {isLoading || !obligation ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-soft rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase text-muted">Nominal</p>
              <p className="text-[13px] font-extrabold text-ink mt-0.5">{formatCurrency(obligation.amount)}</p>
            </div>
            <div className="bg-surface-soft rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase text-muted">Dibayar</p>
              <p className="text-[13px] font-extrabold text-accent-green mt-0.5">{formatCurrency(obligation.paidAmount)}</p>
            </div>
            <div className="bg-surface-soft rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase text-muted">Sisa</p>
              <p className="text-[13px] font-extrabold text-ink mt-0.5">{formatCurrency(obligation.amount - obligation.paidAmount)}</p>
            </div>
            <div className="bg-surface-soft rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase text-muted">Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mt-1 ${OBLIGATION_STATUS_COLOR[obligation.status]}`}>
                {OBLIGATION_STATUS_LABEL[obligation.status]}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] font-medium text-muted">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> Siklus {formatDate(obligation.cycleStart)} – {formatDate(obligation.cycleEnd)}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> Jatuh tempo {formatDate(obligation.dueDate)}</span>
            <span className="inline-flex items-center gap-1.5"><Landmark size={13} /> {obligation.branch?.nama} ({obligation.branch?.code})</span>
          </div>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Bayar Kewajiban</p>
            {mutationBlocked ? (
              <p className="text-[12px] font-semibold text-accent-amber">Pilih cabang konkret terlebih dahulu untuk melakukan pembayaran.</p>
            ) : payable ? (
              <PayForm key={obligation.id} obligation={obligation} branchKey={branchKey} headers={branchHeader} onNotPayable={onClose} />
            ) : (
              <p className="text-[12px] font-semibold text-muted">Kewajiban berstatus {OBLIGATION_STATUS_LABEL[obligation.status]} — tidak dapat dibayar.</p>
            )}
          </section>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Histori Pembayaran</p>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-muted" /></div>
            ) : payments.length === 0 ? (
              <p className="text-center py-6 text-[12px] text-muted border border-dashed border-border rounded-xl">Belum ada pembayaran.</p>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                {payments.map((p) => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    obligationId={obligation.id}
                    branchKey={branchKey}
                    headers={branchHeader}
                    canReverse={can('INVESTOR_OBLIGATION_REVERSE') && !mutationBlocked}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
};
