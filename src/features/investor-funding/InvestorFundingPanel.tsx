import { useState } from 'react';
import { AlertTriangle, HandCoins, Landmark, PlusCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DateField } from '@/shared/components/ui/DateField';
import { businessToday } from '@/core/utils/businessDate';
import { NumericField, TextField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { CashAccountSelect } from '@/features/finance/components';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { getApiErrorCode, getApiErrorMessage } from '@/core/api/apiError';
import { useIdempotencyKey } from '@/shared/hooks/useIdempotencyKey';
import {
  useInvestorCapitalAccounts, useInvestorFundingCashAccounts,
  useInvestorFundingMutations, useInvestorFundingUsages,
} from './investorFunding.hooks';
import { FUNDING_USAGE_MODE_LABEL, type FundingUsageResourceType } from './investorFunding.types';

type Headers = Record<string, string> | undefined;
type AllocationMode = 'AVAILABLE_CAPITAL' | 'NEW_DEPOSIT';

interface Props {
  resourceType: FundingUsageResourceType;
  resourceId: string;
  branchId?: string;
  paid: boolean;
  paymentStatusKnown: boolean;
  canAllocate: boolean;
  fundingSource?: string | null;
}

const today = businessToday;

export const InvestorFundingPanel = ({ resourceType, resourceId, branchId, paid, paymentStatusKnown, canAllocate, fundingSource }: Props) => {
  const branchKey = branchId ?? 'resource';
  const headers: Headers = branchId ? { 'X-Branch-Id': branchId } : undefined;
  const usageQuery = useInvestorFundingUsages(resourceType, resourceId, branchKey, headers);
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<AllocationMode>('AVAILABLE_CAPITAL');
  const [capitalAccountId, setCapitalAccountId] = useState('');
  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [businessDate, setBusinessDate] = useState(today());
  const [description, setDescription] = useState(resourceType === 'REKONDISI' ? 'Pelunasan talangan rekondisi' : 'Reimbursement biaya pembelian unit');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const idem = useIdempotencyKey();
  const capitalQuery = useInvestorCapitalAccounts(resourceType, branchKey, headers, formOpen);
  const cashQuery = useInvestorFundingCashAccounts(resourceType, branchKey, headers, formOpen && mode === 'NEW_DEPOSIT');
  const mutations = useInvestorFundingMutations(resourceType, resourceId, branchKey);

  const summary = usageQuery.data?.summary;
  const usages = usageQuery.data?.data ?? [];
  const outstanding = Math.max(0, Number(summary?.outstandingAdvanceAmount ?? 0));
  const selectedCapital = capitalQuery.data?.find((account) => account.id === capitalAccountId);
  const exceedsOutstanding = amount > outstanding;
  const exceedsAvailable = mode === 'AVAILABLE_CAPITAL' && !!selectedCapital && amount > Number(selectedCapital.availableBalance);
  const valid = paid && !!capitalAccountId && amount > 0 && !exceedsOutstanding && !exceedsAvailable
    && !!businessDate && (mode === 'AVAILABLE_CAPITAL' || !!cashAccountId);

  const changeDraft = (setter: () => void) => { setter(); setError(null); idem.regenerate(); };
  const submit = () => {
    if (!valid) return;
    const body = { capitalAccountId, amount, businessDate, description: description.trim() || undefined, ...(mode === 'NEW_DEPOSIT' ? { cashAccountId } : {}) };
    const options = {
      onSuccess: () => {
        setConfirmOpen(false); setFormOpen(false); setAmount(0); setCapitalAccountId(''); setCashAccountId(''); setError(null); idem.regenerate();
      },
      onError: (requestError: unknown) => {
        const code = getApiErrorCode(requestError);
        setError({ code, message: getApiErrorMessage(requestError) });
        if (['INSUFFICIENT_INVESTOR_CAPITAL', 'INVESTOR_CAPITAL_ACCOUNT_INACTIVE'].includes(code ?? '')) void capitalQuery.refetch();
        if (code === 'INVESTOR_FUNDING_EXCEEDS_COST') void usageQuery.refetch();
      },
    };
    if (mode === 'NEW_DEPOSIT') mutations.deposit.mutate({ body, headers, idempotencyKey: idem.key }, options);
    else mutations.allocate.mutate({ body, headers }, options);
  };

  return (
    <section className="mt-5 border-t border-divider pt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-extrabold text-ink">Penggunaan Dana Investor</p>
          <p className="text-[11px] font-semibold text-muted">
            {resourceType === 'REKONDISI' && fundingSource === 'INVESTOR' ? 'Alokasi rekondisi menambah principal pendanaan unit.'
              : resourceType === 'UNIT_PURCHASE' && fundingSource === 'COMPANY_OWNED' ? 'Alokasi dicatat sebagai reimbursement biaya perusahaan.'
              : 'Riwayat alokasi modal investor pada biaya ini.'}
          </p>
        </div>
        {paid && canAllocate && outstanding > 0 && <Button size="sm" icon={<PlusCircle size={14} />} onClick={() => setFormOpen((value) => !value)}>Alokasikan Dana Investor</Button>}
      </div>

      {paymentStatusKnown && !paid && <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-3.5 py-3 text-[11px] font-semibold text-ink-soft">Biaya perusahaan belum tercatat pada kas. Aksi alokasi akan tersedia setelah pembayaran dicatat.</div>}

      {summary && (
        <div className="grid grid-cols-3 gap-2">
          {[['Total biaya', summary.costAmount], ['Dana investor', summary.allocatedAmount], ['Sisa talangan', outstanding]].map(([label, value], index) => (
            <div key={String(label)} className={`rounded-xl border p-3 ${index === 2 && Number(value) > 0 ? 'border-accent-amber/30 bg-accent-amber/10' : 'border-border bg-surface-soft'}`}>
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted">{label}</p>
              <p className={`mt-1 text-[12px] font-extrabold ${index === 2 && Number(value) > 0 ? 'text-accent-amber' : 'text-ink'}`}>{formatCurrency(Number(value))}</p>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="rounded-2xl border border-primary/25 bg-primary-light/40 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-1 border border-border">
            <button type="button" onClick={() => changeDraft(() => { setMode('AVAILABLE_CAPITAL'); setCashAccountId(''); })} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${mode === 'AVAILABLE_CAPITAL' ? 'bg-primary text-white' : 'text-muted'}`}>Gunakan saldo tersedia</button>
            <button type="button" onClick={() => changeDraft(() => setMode('NEW_DEPOSIT'))} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${mode === 'NEW_DEPOSIT' ? 'bg-primary text-white' : 'text-muted'}`}>Setor baru & alokasikan</button>
          </div>
          {error && <div className="flex gap-2 rounded-xl border border-semantic-error/30 bg-semantic-error/10 p-3 text-[11px] font-semibold text-semantic-error"><AlertTriangle size={15} className="shrink-0" /><span>{error.message}</span></div>}
          <SearchableSelect label="Akun Modal Investor" required value={capitalAccountId} onChange={(value) => changeDraft(() => setCapitalAccountId(value))}
            options={(capitalQuery.data ?? []).map((account) => ({ value: account.id, label: `${account.investor.code} — ${account.investor.name}`, sublabel: `Tersedia ${formatCurrency(account.availableBalance)}` }))}
            loading={capitalQuery.isLoading} placeholder="Pilih akun modal aktif" />
          {mode === 'NEW_DEPOSIT' && <CashAccountSelect label="Akun Kas Setoran" required value={cashAccountId} onChange={(value) => changeDraft(() => setCashAccountId(value))} accounts={cashQuery.data ?? []} loading={cashQuery.isLoading} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumericField label="Nominal" required prefix="Rp" value={amount} onChange={(value) => changeDraft(() => setAmount(value))} />
            <DateField label="Tanggal Bisnis" required value={businessDate} onChange={(value) => changeDraft(() => setBusinessDate(value))} />
          </div>
          <TextField label="Keterangan" value={description} onChange={(event) => changeDraft(() => setDescription(event.target.value))} maxLength={1000} />
          {exceedsOutstanding && <p className="text-[11px] font-bold text-semantic-error">Nominal melebihi sisa talangan {formatCurrency(outstanding)}.</p>}
          {exceedsAvailable && <p className="text-[11px] font-bold text-semantic-error">Saldo modal tersedia tidak mencukupi.</p>}
          <div className="flex justify-end"><Button icon={<HandCoins size={14} />} disabled={!valid} onClick={() => setConfirmOpen(true)}>Simpan Alokasi</Button></div>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        {usageQuery.isLoading ? <p className="p-4 text-[11px] font-semibold text-muted">Memuat riwayat alokasi…</p>
          : usages.length === 0 ? <p className="p-4 text-[11px] font-semibold text-muted">Belum ada dana investor yang dialokasikan.</p>
          : usages.map((usage) => (
            <div key={usage.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-divider last:border-0 p-3">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-ink flex items-center gap-1.5"><Landmark size={12} className="text-primary" /> {usage.capitalAccount.investor.code} — {usage.capitalAccount.investor.name}</p>
                <p className="mt-1 text-[10px] font-semibold text-muted">{formatDate(usage.businessDate)} · {FUNDING_USAGE_MODE_LABEL[usage.mode]} · {usage.description || '-'}</p>
                <p className="mt-1 truncate text-[9px] font-medium text-muted">Ref: {usage.allocationCapitalTransactionId}{usage.depositCapitalTransactionId ? ` / ${usage.depositCapitalTransactionId}` : ''}</p>
              </div>
              <p className="text-[12px] font-extrabold text-primary">{formatCurrency(usage.amount)}</p>
            </div>
          ))}
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={submit} closeOnConfirm={false}
        loading={mutations.allocate.isPending || mutations.deposit.isPending} tone="primary" icon={HandCoins}
        title={mode === 'NEW_DEPOSIT' ? 'Setor dan Alokasikan Dana' : 'Alokasikan Saldo Investor'}
        message={`${formatCurrency(amount)} akan dialokasikan ke biaya ini. ${mode === 'NEW_DEPOSIT' ? 'Setoran modal dan alokasi diproses sebagai satu aksi.' : 'Saldo tersedia investor akan berkurang.'}`}
        confirmLabel="Ya, Alokasikan" />
    </section>
  );
};
