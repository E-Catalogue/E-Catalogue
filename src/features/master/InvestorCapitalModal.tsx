// Kontrak: ecatalogue-be/.prd/create_investor_20260717_090122.md (API modal investor §6-10)
// + ecatalogue-be/src/modules/investor/capital/*.js (kode backend menang atas prosa PRD).
// Menggantikan InvestorModalModal.tsx lama — endpoint /investors/:id/modals sudah 410 Gone
// (INVESTOR_MODAL_DEPRECATED), diganti API capital account (saldo Available/Allocated) +
// ledger CapitalTransaction immutable (tidak ada edit/hapus transaksi).
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, Landmark, History, AlertTriangle,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, SelectField, NumericField } from '@/shared/components/ui/Field';
import { Pagination } from '@/shared/components/ui/Pagination';
import { CashAccountSelect } from '@/features/finance/components';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useIdempotencyKey } from '@/shared/hooks/useIdempotencyKey';
import { getApiErrorCode, getApiErrorMessage } from '@/core/api/apiError';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { useBranches, useCapitalAccounts, useCapitalMutations, useCapitalTransactions } from './master.hooks';
import {
  CAPITAL_TX_TYPE_LABEL, INVESTOR_SCHEME_LABEL,
  type CapitalAccount, type CapitalAccountsConsolidated, type CapitalTransaction,
  type CapitalTransactionType, type Investor,
} from './types';

type BranchHeaders = Record<string, string> | undefined;

const today = () => new Date().toISOString().slice(0, 10);

/** Pesan banner inline per error code finansial (README §17) — sama pola dengan InvestorObligationDetailModal. */
const ERROR_BANNER: Record<string, { title: string; message: string }> = {
  INSUFFICIENT_INVESTOR_CAPITAL: { title: 'Saldo modal tersedia tidak mencukupi', message: 'Saldo terbaru telah dimuat ulang — periksa kembali nominal penarikan.' },
  IDEMPOTENCY_KEY_REQUIRED: { title: 'Kunci idempotency wajib diisi', message: 'Kunci baru telah dibuat. Silakan konfirmasi ulang untuk mencoba lagi.' },
  INVALID_IDEMPOTENCY_KEY: { title: 'Kunci idempotency tidak valid', message: 'Kunci baru telah dibuat. Silakan konfirmasi ulang.' },
  IDEMPOTENCY_KEY_CONFLICT: { title: 'Kunci idempotency sudah dipakai', message: 'Jangan mencoba ulang otomatis. Periksa histori transaksi — permintaan sebelumnya mungkin sudah terposting.' },
  CASH_ACCOUNT_NOT_FOUND: { title: 'Akun kas tidak ditemukan', message: 'Pilih akun kas lain yang aktif pada cabang ini.' },
  CASH_ACCOUNT_INACTIVE: { title: 'Akun kas tidak aktif', message: 'Pilih akun kas lain yang aktif.' },
  INSUFFICIENT_BALANCE: { title: 'Saldo akun kas tidak mencukupi', message: 'Draft dipertahankan — pilih akun kas lain atau tambah saldo kas.' },
  BOOK_PERIOD_CLOSED: { title: 'Periode pembukuan sudah ditutup', message: 'Pilih tanggal pada periode pembukuan yang masih terbuka.' },
  INVESTOR_INACTIVE: { title: 'Investor tidak aktif', message: 'Aktifkan kembali investor ini sebelum melakukan transaksi modal.' },
  INVESTOR_SCHEME_REQUIRED: { title: 'Skema investor belum dikonfigurasi', message: 'Lengkapi skema & rate default investor terlebih dahulu.' },
  INVESTOR_NOT_FOUND: { title: 'Investor tidak ditemukan', message: 'Data mungkin sudah dihapus. Jendela ini akan ditutup.' },
  BRANCH_CONTEXT_REQUIRED: { title: 'Cabang belum dipilih', message: 'Pilih cabang konkret terlebih dahulu.' },
  BRANCH_SCOPE_FORBIDDEN: { title: 'Cabang tidak sesuai', message: 'Reset selector cabang lalu muat ulang data.' },
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

const BalanceCard = ({ label, value, tone }: { label: string; value: number; tone: 'ink' | 'green' | 'primary' }) => (
  <div className="bg-surface-soft rounded-xl p-3">
    <p className="text-[10px] font-bold uppercase text-muted">{label}</p>
    <p className={`text-[14px] font-extrabold mt-0.5 ${tone === 'green' ? 'text-accent-green' : tone === 'primary' ? 'text-primary' : 'text-ink'}`}>
      {formatCurrency(value)}
    </p>
  </div>
);

interface MutationFormProps {
  investorId: string;
  branchKey: string;
  branchHeader: BranchHeaders;
  availableBalance: number;
  onDone: () => void;
}

const DepositForm = ({ investorId, branchKey, branchHeader, onDone }: MutationFormProps) => {
  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [transactionDate, setTransactionDate] = useState(today());
  const [description, setDescription] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const idem = useIdempotencyKey();
  const m = useCapitalMutations(branchKey, investorId);

  const valid = !!cashAccountId && amount > 0 && !!transactionDate;
  const reset = () => { setCashAccountId(''); setAmount(0); setDescription(''); setTransactionDate(today()); idem.regenerate(); };

  const submit = () => {
    m.deposit.mutate(
      { body: { cashAccountId, amount, transactionDate, description: description || undefined }, headers: branchHeader, idempotencyKey: idem.key },
      {
        onSuccess: () => { setConfirmOpen(false); setError(null); reset(); onDone(); },
        onError: (e: unknown) => {
          const code = getApiErrorCode(e);
          setError({ code, message: getApiErrorMessage(e) });
          if (code === 'IDEMPOTENCY_KEY_REQUIRED' || code === 'INVALID_IDEMPOTENCY_KEY') idem.regenerate();
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      {error && <InlineErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CashAccountSelect label="Akun Kas" required value={cashAccountId} onChange={(v) => { setCashAccountId(v); idem.regenerate(); }} />
        <TextField label="Tanggal" required type="date" value={transactionDate} onChange={(e) => { setTransactionDate(e.target.value); idem.regenerate(); }} />
        <NumericField label="Nominal" required value={amount} onChange={(v) => { setAmount(v); idem.regenerate(); }} prefix="Rp" wrapClass="sm:col-span-2" />
        <TextField label="Keterangan (opsional)" wrapClass="sm:col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="mis. Setoran modal awal" />
      </div>
      <Button icon={<ArrowDownCircle size={15} />} disabled={!valid} onClick={() => setConfirmOpen(true)} block>Setor Modal</Button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        closeOnConfirm={false}
        loading={m.deposit.isPending}
        tone="primary"
        icon={ArrowDownCircle}
        title="Konfirmasi Setoran Modal"
        message={`Setor ${formatCurrency(amount)} ke saldo modal investor dari akun kas terpilih? Kas akan bertambah dan modal tersedia (available) juga bertambah.`}
        confirmLabel="Ya, Setor"
      />
    </div>
  );
};

const WithdrawalForm = ({ investorId, branchKey, branchHeader, availableBalance, onDone }: MutationFormProps) => {
  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [transactionDate, setTransactionDate] = useState(today());
  const [description, setDescription] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const idem = useIdempotencyKey();
  const m = useCapitalMutations(branchKey, investorId);

  // UX guard per PRD "Tombol withdrawal disable bila amount > availableBalance" — backend tetap sumber kebenaran.
  const exceedsAvailable = amount > availableBalance;
  const valid = !!cashAccountId && amount > 0 && !!transactionDate && !exceedsAvailable;
  const reset = () => { setCashAccountId(''); setAmount(0); setDescription(''); setTransactionDate(today()); idem.regenerate(); };

  const submit = () => {
    m.withdraw.mutate(
      { body: { cashAccountId, amount, transactionDate, description: description || undefined }, headers: branchHeader, idempotencyKey: idem.key },
      {
        onSuccess: () => { setConfirmOpen(false); setError(null); reset(); onDone(); },
        onError: (e: unknown) => {
          const code = getApiErrorCode(e);
          setError({ code, message: getApiErrorMessage(e) });
          if (code === 'IDEMPOTENCY_KEY_REQUIRED' || code === 'INVALID_IDEMPOTENCY_KEY') idem.regenerate();
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      {error && <InlineErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CashAccountSelect label="Akun Kas" required value={cashAccountId} onChange={(v) => { setCashAccountId(v); idem.regenerate(); }} />
        <TextField label="Tanggal" required type="date" value={transactionDate} onChange={(e) => { setTransactionDate(e.target.value); idem.regenerate(); }} />
        <NumericField label="Nominal" required value={amount} onChange={(v) => { setAmount(v); idem.regenerate(); }} prefix="Rp" wrapClass="sm:col-span-2" />
        <TextField label="Keterangan (opsional)" wrapClass="sm:col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="mis. Penarikan sebagian modal" />
      </div>
      <p className="text-[11px] font-medium text-muted">Tersedia (available): <span className="font-bold text-ink">{formatCurrency(availableBalance)}</span></p>
      {exceedsAvailable && <p className="text-[11px] font-bold text-semantic-error">Nominal melebihi saldo tersedia.</p>}
      <Button icon={<ArrowUpCircle size={15} />} variant="danger" disabled={!valid} onClick={() => setConfirmOpen(true)} block>Tarik Modal</Button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        closeOnConfirm={false}
        loading={m.withdraw.isPending}
        tone="danger"
        icon={ArrowUpCircle}
        title="Konfirmasi Penarikan Modal"
        message={`Tarik ${formatCurrency(amount)} dari saldo modal tersedia ke akun kas terpilih? Saldo tersedia akan berkurang menjadi ${formatCurrency(availableBalance - amount)}.`}
        confirmLabel="Ya, Tarik"
      />
    </div>
  );
};

const TransactionRow = ({ tx }: { tx: CapitalTransaction }) => {
  const negative = tx.type === 'WITHDRAWAL' || tx.type === 'BRANCH_TRANSFER_OUT';
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-soft/50 transition-colors">
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-ink-soft">{CAPITAL_TX_TYPE_LABEL[tx.type]}</p>
        <p className="text-[11px] font-medium text-muted">{formatDate(tx.businessDate)}{tx.description ? ` · ${tx.description}` : ''}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-bold text-[13px] ${negative ? 'text-semantic-error' : 'text-accent-green'}`}>
          {negative ? '-' : '+'}{formatCurrency(tx.amount)}
        </p>
        <p className="text-[10px] font-semibold text-muted">{tx.postingStatus}</p>
      </div>
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  investor: Investor | null;
}

export const InvestorCapitalModal = ({ open, onClose, investor }: Props) => {
  const investorId = investor?.id ?? '';
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, setSelectedBranchId, branchHeader, branchKey } = useBranchScope();
  const { data: branchesRes } = useBranches({ page: 1, limit: 100 });
  const branches = branchesRes?.data ?? [];

  const [txPage, setTxPage] = useState(1);
  const [txType, setTxType] = useState<CapitalTransactionType | ''>('');

  const qc = useQueryClient();
  const { data: accountsRes, isLoading: accountsLoading } = useCapitalAccounts(branchKey, open ? investorId : null, branchHeader);
  const { data: txRes, isLoading: txLoading } = useCapitalTransactions(branchKey, open ? investorId : null, { page: txPage, limit: 10 }, branchHeader);

  const accountsData = accountsRes?.data;
  const isConsolidated = !!accountsData && !Array.isArray(accountsData);
  const breakdown: CapitalAccount[] = isConsolidated ? (accountsData as CapitalAccountsConsolidated).breakdown : ((accountsData as CapitalAccount[] | undefined) ?? []);
  const consolidated = isConsolidated ? (accountsData as CapitalAccountsConsolidated).consolidated : null;
  const singleAccount = !isConsolidated && breakdown.length > 0 ? breakdown[0] : null;

  const mutationBlocked = isOwner && !selectedBranchId;
  const availableBalance = singleAccount?.availableBalance ?? 0;
  const allocatedBalance = singleAccount?.allocatedBalance ?? 0;

  const transactions = txRes?.data ?? [];
  const filteredTx = txType ? transactions.filter((t) => t.type === txType) : transactions;

  const refetchAfterMutation = () => {
    // capital-accounts sudah diinvalidate oleh useCapitalMutations; reset ke halaman 1 histori supaya transaksi baru terlihat.
    setTxPage(1);
    qc.invalidateQueries({ queryKey: ['capital-transactions', branchKey, investorId] });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Wallet size={20} />}
      title={`Modal Investor — ${investor?.name ?? ''}`}
      subtitle={investor ? `${investor.code} · ${INVESTOR_SCHEME_LABEL[investor.scheme]} · Rate ${investor.defaultRate}%` : undefined}
      size="xl"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      <div className="space-y-5">
        {isOwner && (
          <SelectField
            label="Cabang"
            value={selectedBranchId ?? ''}
            onChange={(e) => setSelectedBranchId(e.target.value || null)}
            options={[{ value: '', label: 'Semua Cabang (ringkasan)' }, ...branches.map((b) => ({ value: b.id, label: b.nama }))]}
          />
        )}

        {mutationBlocked && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 text-[12px] font-semibold text-accent-amber">
            <AlertTriangle size={16} className="shrink-0" />
            Pilih cabang konkret untuk melihat saldo per cabang dan melakukan setor/tarik modal.
          </div>
        )}

        {accountsLoading ? (
          <div className="flex items-center justify-center py-10"><Loader2 size={22} className="animate-spin text-muted" /></div>
        ) : isConsolidated && consolidated ? (
          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Ringkasan Seluruh Cabang</p>
            <div className="grid grid-cols-3 gap-3">
              <BalanceCard label="Available" value={consolidated.availableBalance} tone="primary" />
              <BalanceCard label="Allocated" value={consolidated.allocatedBalance} tone="ink" />
              <BalanceCard label="Total" value={consolidated.totalCapital} tone="green" />
            </div>
            {breakdown.length > 0 && (
              <div className="mt-3 border border-border rounded-xl overflow-hidden divide-y divide-divider">
                {breakdown.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Landmark size={13} className="text-muted shrink-0" />
                      <span className="text-[12px] font-semibold text-ink-soft truncate">{acc.branch.nama}</span>
                    </div>
                    <div className="flex gap-4 text-[11px] font-medium text-muted shrink-0">
                      <span>Available: <span className="font-bold text-ink">{formatCurrency(acc.availableBalance)}</span></span>
                      <span>Allocated: <span className="font-bold text-ink">{formatCurrency(acc.allocatedBalance)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Saldo Modal — {singleAccount?.branch?.nama ?? branches.find((b) => b.id === selectedBranchId)?.nama ?? 'Cabang'}</p>
            <div className="grid grid-cols-3 gap-3">
              <BalanceCard label="Available" value={availableBalance} tone="primary" />
              <BalanceCard label="Allocated" value={allocatedBalance} tone="ink" />
              <BalanceCard label="Total" value={availableBalance + allocatedBalance} tone="green" />
            </div>
          </section>
        )}

        {!mutationBlocked && !isConsolidated && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {can('INVESTOR_CAPITAL_DEPOSIT') && (
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Setor Modal</p>
                <DepositForm investorId={investorId} branchKey={branchKey} branchHeader={branchHeader} availableBalance={availableBalance} onDone={refetchAfterMutation} />
              </section>
            )}
            {can('INVESTOR_CAPITAL_WITHDRAW') && (
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Tarik Modal</p>
                <WithdrawalForm investorId={investorId} branchKey={branchKey} branchHeader={branchHeader} availableBalance={availableBalance} onDone={refetchAfterMutation} />
              </section>
            )}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted inline-flex items-center gap-1.5"><History size={13} /> Histori Transaksi</p>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value as CapitalTransactionType | '')}
              className="h-8 px-2.5 rounded-lg border border-border text-[11px] font-semibold bg-surface focus:outline-none focus:border-primary"
            >
              <option value="">Semua tipe</option>
              {(Object.keys(CAPITAL_TX_TYPE_LABEL) as CapitalTransactionType[]).map((t) => (
                <option key={t} value={t}>{CAPITAL_TX_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </div>
          {txLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-muted" /></div>
          ) : filteredTx.length === 0 ? (
            <p className="text-center py-6 text-[12px] text-muted border border-dashed border-border rounded-xl">Belum ada transaksi modal.</p>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden divide-y divide-divider">
              {filteredTx.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
            </div>
          )}
          <Pagination meta={txRes?.meta} page={txPage} onChange={setTxPage} />
        </section>
      </div>
    </Modal>
  );
};
