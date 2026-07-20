import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Building2, Landmark, Plus, Repeat, SlidersHorizontal, Undo2, Wallet } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Can, RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useIdempotencyKey } from '@/shared/hooks/useIdempotencyKey';
import { useBranches } from '@/features/master/master.hooks';
import { Power } from 'lucide-react';
import { getApiErrorCode, getApiErrorMessage } from '@/core/api/apiError';
import { notifyApiError } from '@/core/api/notify';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { CashAccountSelect, CurrencyField, FinanceErrorBanner } from '@/features/finance/components';
import { useCashAccountMutations, useCashAccounts, useCashDashboard, useCashTransactionMutations, useCashTransactions } from '@/features/finance/finance.hooks';
import { toIsoDate } from '@/features/finance/finance.utils';
import { isConsolidatedCashDashboard, type CashAccount, type CashAccountType, type CashTransaction } from '@/features/finance/types';

type Tab = 'dashboard' | 'accounts' | 'ledger';
type TxModal = 'manual-in' | 'manual-out' | 'transfer' | 'adjustment' | 'inter-branch-transfer';
type BranchHeaders = Record<string, string> | undefined;

const today = () => new Date().toISOString().slice(0, 10);

const AccountForm = ({ item, onClose, headers, mutationBlocked }: { item: CashAccount | null; onClose: () => void; headers: BranchHeaders; mutationBlocked: boolean }) => {
  const mutations = useCashAccountMutations();
  const [form, setForm] = useState({
    name: item?.name ?? '',
    code: item?.code ?? '',
    type: item?.type ?? 'CASH',
    accountNumber: item?.accountNumber ?? '',
    bankName: item?.bankName ?? '',
    openingBalance: String(item?.openingBalance ?? 0),
    defaultPayment: item?.defaultPayment ?? false,
    isActive: item?.isActive ?? true,
  });
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const set = (key: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const pending = mutations.create.isPending || mutations.update.isPending;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = { ...form, code: form.code.toUpperCase(), openingBalance: Number(form.openingBalance || 0) };
    const opts = {
      onSuccess: () => onClose(),
      onError: (err: unknown) => setError({ code: getApiErrorCode(err), message: getApiErrorMessage(err) }),
    };
    if (item) mutations.update.mutate({ id: item.id, body, headers }, opts);
    else mutations.create.mutate({ body, headers }, opts);
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Akun Kas' : 'Tambah Akun Kas'} icon={<Landmark size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="cash-account-form" disabled={mutationBlocked || pending} title={mutationBlocked ? 'Pilih cabang konkret terlebih dahulu' : undefined}>Simpan</Button></>}>
      <div className="space-y-3">
        {mutationBlocked && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 text-[12px] font-semibold text-accent-amber">
            <AlertTriangle size={16} className="shrink-0" /> Pilih cabang konkret pada filter halaman untuk {item ? 'mengubah' : 'menambah'} akun kas.
          </div>
        )}
        {error && <FinanceErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} />}
        <form id="cash-account-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Nama" required disabled={mutationBlocked} value={form.name} onChange={(e) => set('name', e.target.value)} />
          <TextField label="Kode" required disabled={mutationBlocked} value={form.code} onChange={(e) => set('code', e.target.value)} />
          <SelectField label="Tipe" disabled={mutationBlocked} value={form.type} onChange={(e) => set('type', e.target.value as CashAccountType)} options={[{ value: 'CASH', label: 'Cash' }, { value: 'BANK', label: 'Bank' }, { value: 'OTHER', label: 'Lainnya' }]} />
          <CurrencyField label="Saldo Awal" disabled={mutationBlocked} value={form.openingBalance} onChange={(e) => set('openingBalance', e.target.value)} />
          <TextField label="Nomor Rekening" disabled={mutationBlocked} value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} />
          <TextField label="Nama Bank" disabled={mutationBlocked} value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
          <label className="sm:col-span-2 flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
            <input type="checkbox" disabled={mutationBlocked} checked={form.defaultPayment} onChange={(e) => set('defaultPayment', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" /> Default pembayaran penjualan
          </label>
          <label className="sm:col-span-2 flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
            <input type="checkbox" disabled={mutationBlocked} checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" /> Aktif
          </label>
        </form>
      </div>
    </Modal>
  );
};

const TransactionForm = ({ mode, onClose, branchKey, headers, mutationBlocked }: { mode: TxModal; onClose: () => void; branchKey: string; headers: BranchHeaders; mutationBlocked: boolean }) => {
  const mutations = useCashTransactionMutations();
  const idem = useIdempotencyKey();
  const [form, setForm] = useState({
    cashAccountId: '',
    fromCashAccountId: '',
    toCashAccountId: '',
    type: 'IN',
    amount: '',
    transactionDate: today(),
    description: '',
    proofUrl: '',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  /** Field yang mengubah dampak finansial (amount/akun/tanggal/tipe) memicu regenerate key (README §14 poin 5). */
  const set = (key: keyof typeof form, value: string) => { setForm((f) => ({ ...f, [key]: value })); idem.regenerate(); };
  const title = mode === 'manual-in' ? 'Kas Masuk' : mode === 'manual-out' ? 'Kas Keluar' : mode === 'transfer' ? 'Transfer Antar Kas' : mode === 'inter-branch-transfer' ? 'Transfer Antar Cabang' : 'Penyesuaian Saldo';
  const pending = mutations.manualIn.isPending || mutations.manualOut.isPending || mutations.transfer.isPending || mutations.adjustment.isPending || mutations.interBranchTransfer.isPending;
  const needsConfirm = mode === 'manual-in' || mode === 'manual-out' || mode === 'transfer' || mode === 'inter-branch-transfer';
  const doSubmit = () => {
    const common = { amount: Number(form.amount || 0), transactionDate: toIsoDate(form.transactionDate), description: form.description, proofUrl: form.proofUrl || null };
    const opts = {
      onSuccess: () => { setConfirmOpen(false); setError(null); idem.regenerate(); onClose(); },
      onError: (err: unknown) => {
        const code = getApiErrorCode(err);
        setError({ code, message: getApiErrorMessage(err) });
        // Kunci TIDAK diregenerasi di sini (termasuk 5xx) — retry manual harus memakai kunci yang sama
        // supaya request pertama yang mungkin sudah terposting tidak dobel (README §14).
      },
    };
    if (mode === 'manual-in') mutations.manualIn.mutate({ body: { ...common, cashAccountId: form.cashAccountId }, headers, idempotencyKey: idem.key }, opts);
    if (mode === 'manual-out') mutations.manualOut.mutate({ body: { ...common, cashAccountId: form.cashAccountId }, headers, idempotencyKey: idem.key }, opts);
    if (mode === 'transfer') mutations.transfer.mutate({ body: { ...common, fromCashAccountId: form.fromCashAccountId, toCashAccountId: form.toCashAccountId }, headers, idempotencyKey: idem.key }, opts);
    if (mode === 'adjustment') mutations.adjustment.mutate({ body: { ...common, cashAccountId: form.cashAccountId, type: form.type as 'IN' | 'OUT' }, headers, idempotencyKey: idem.key }, opts);
    if (mode === 'inter-branch-transfer') mutations.interBranchTransfer.mutate({ body: { ...common, fromCashAccountId: form.fromCashAccountId, toCashAccountId: form.toCashAccountId }, headers, idempotencyKey: idem.key }, opts);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (needsConfirm) setConfirmOpen(true);
    else doSubmit();
  };
  const confirmMessage = mode === 'manual-in'
    ? `Catat kas masuk sebesar ${formatCurrency(Number(form.amount || 0))}?`
    : mode === 'manual-out'
    ? `Catat kas keluar sebesar ${formatCurrency(Number(form.amount || 0))}?`
    : mode === 'inter-branch-transfer'
    ? `Transfer ${formatCurrency(Number(form.amount || 0))} ke akun kas di cabang lain? Akun sumber harus milik cabang yang sedang dipilih.`
    : `Transfer ${formatCurrency(Number(form.amount || 0))} antar akun kas? Tindakan ini akan mengubah saldo kedua akun.`;
  return (
    <Modal open onClose={onClose} title={title} icon={<Wallet size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="cash-tx-form" disabled={mutationBlocked || pending} title={mutationBlocked ? 'Pilih cabang konkret terlebih dahulu' : undefined}>Simpan</Button></>}>
      <div className="space-y-3">
        {mutationBlocked && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 text-[12px] font-semibold text-accent-amber">
            <AlertTriangle size={16} className="shrink-0" /> Pilih cabang konkret pada filter halaman untuk melakukan transaksi kas.
          </div>
        )}
        {error && <FinanceErrorBanner code={error.code} message={error.message} onDismiss={() => setError(null)} />}
        <form id="cash-tx-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mode === 'transfer' ? (
            <>
              <CashAccountSelect label="Dari Akun" required disabled={mutationBlocked} branchKey={branchKey} headers={headers} value={form.fromCashAccountId} onChange={(v) => set('fromCashAccountId', v)} />
              <CashAccountSelect label="Ke Akun" required disabled={mutationBlocked} branchKey={branchKey} headers={headers} value={form.toCashAccountId} onChange={(v) => set('toCashAccountId', v)} />
            </>
          ) : mode === 'inter-branch-transfer' ? (
            <>
              <CashAccountSelect label="Dari Akun (cabang terpilih)" required disabled={mutationBlocked} branchKey={branchKey} headers={headers} value={form.fromCashAccountId} onChange={(v) => set('fromCashAccountId', v)} />
              <CashAccountSelect label="Ke Akun (cabang lain)" required disabled={mutationBlocked} value={form.toCashAccountId} onChange={(v) => set('toCashAccountId', v)} />
            </>
          ) : (
            <CashAccountSelect required disabled={mutationBlocked} branchKey={branchKey} headers={headers} value={form.cashAccountId} onChange={(v) => set('cashAccountId', v)} />
          )}
          {mode === 'adjustment' && <SelectField label="Tipe" disabled={mutationBlocked} value={form.type} onChange={(e) => set('type', e.target.value)} options={[{ value: 'IN', label: 'Tambah Saldo' }, { value: 'OUT', label: 'Kurangi Saldo' }]} />}
          <CurrencyField label="Nominal" required disabled={mutationBlocked} value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          <TextField label="Tanggal" required type="date" disabled={mutationBlocked} value={form.transactionDate} onChange={(e) => set('transactionDate', e.target.value)} />
          <TextField label="Keterangan" wrapClass="sm:col-span-2" disabled={mutationBlocked} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <TextField label="URL Bukti" wrapClass="sm:col-span-2" disabled={mutationBlocked} value={form.proofUrl} onChange={(e) => setForm((f) => ({ ...f, proofUrl: e.target.value }))} />
        </form>
      </div>
      {needsConfirm && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={doSubmit}
          loading={pending}
          closeOnConfirm={false}
          tone="primary"
          icon={Wallet}
          title={`Konfirmasi ${title}`}
          message={confirmMessage}
          confirmLabel="Ya, Simpan"
        />
      )}
    </Modal>
  );
};

const CashFlowPageInner = () => {
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, setSelectedBranchId, branchHeader, branchKey } = useBranchScope();
  const { data: branchesRes } = useBranches({ page: 1, limit: 100 });
  const branches = branchesRes?.data ?? [];
  const mutationBlocked = isOwner && !selectedBranchId;

  const [tab, setTab] = useState<Tab>('dashboard');
  const [accountForm, setAccountForm] = useState<CashAccount | null | undefined>();
  const [txForm, setTxForm] = useState<TxModal | null>(null);
  const [toDelete, setToDelete] = useState<CashAccount | null>(null);
  const [toReverse, setToReverse] = useState<CashTransaction | null>(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', type: '', cashAccountId: '' });

  const dashboardParams = { dateFrom: filters.dateFrom ? toIsoDate(filters.dateFrom) : undefined, dateTo: filters.dateTo ? toIsoDate(filters.dateTo) : undefined };
  const dashboard = useCashDashboard(branchKey, dashboardParams, branchHeader);
  const accounts = useCashAccounts(branchKey, { page: 1, limit: 100 }, branchHeader, { enabled: can('CASH_ACCOUNT_READ') });
  const ledger = useCashTransactions(branchKey, { page: 1, limit: 50, type: filters.type || undefined, cashAccountId: filters.cashAccountId || undefined, dateFrom: filters.dateFrom ? toIsoDate(filters.dateFrom) : undefined, dateTo: filters.dateTo ? toIsoDate(filters.dateTo) : undefined }, branchHeader);
  const accountMutations = useCashAccountMutations();
  const txMutations = useCashTransactionMutations();

  const dashboardData = dashboard.data;
  const isConsolidated = dashboardData ? isConsolidatedCashDashboard(dashboardData) : false;
  const summary = dashboardData ? (isConsolidatedCashDashboard(dashboardData) ? dashboardData.consolidated : dashboardData.summary) : undefined;
  const dashboardAccounts = dashboardData?.accounts ?? [];

  const accountColumns: Column<CashAccount>[] = [
    { header: 'Nama', cell: (a) => <span className="font-bold text-ink">{a.name}</span> },
    { header: 'Kode', cell: (a) => a.code },
    { header: 'Tipe', cell: (a) => a.type },
    { header: 'Bank/Rekening', cell: (a) => [a.bankName, a.accountNumber].filter(Boolean).join(' / ') || '-' },
    { header: 'Saldo Awal', align: 'right', cell: (a) => formatCurrency(a.openingBalance) },
    { header: 'Default', align: 'center', cell: (a) => a.defaultPayment ? <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent-green/10 text-accent-green">Penjualan</span> : '-' },
    { header: 'Status', cell: (a) => a.isActive ? 'Aktif' : 'Nonaktif' },
    { header: '', align: 'right', cell: (a) => (
      <RowActions
        onEdit={can('CASH_ACCOUNT_UPDATE') ? () => setAccountForm(a) : undefined}
        extra={can('CASH_ACCOUNT_DELETE') ? [{ label: 'Nonaktifkan', icon: <Power size={13} />, onClick: () => setToDelete(a), variant: 'danger' }] : undefined}
      />
    ) },
  ];
  const ledgerColumns: Column<CashTransaction>[] = [
    { header: 'Tanggal', cell: (t) => formatDate(t.transactionDate) },
    { header: 'Akun', cell: (t) => t.cashAccount?.name ?? t.cashAccountId },
    { header: 'Sumber', cell: (t) => t.sourceType },
    { header: 'Keterangan', cell: (t) => <span className="font-bold text-ink">{t.description || '-'}{t.reversedAt && <span className="ml-1.5 text-[10px] font-bold text-semantic-error">(Dibalik)</span>}</span> },
    { header: 'Tipe', align: 'center', cell: (t) => <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${t.type === 'IN' ? 'bg-accent-green/10 text-accent-green' : 'bg-semantic-error/10 text-semantic-error'}`}>{t.type}</span> },
    { header: 'Nominal', align: 'right', cell: (t) => <span className={t.type === 'IN' ? 'text-accent-green font-bold' : 'text-semantic-error font-bold'}>{t.type === 'IN' ? '+' : '-'} {formatCurrency(t.amount)}</span> },
    { header: '', align: 'right', cell: (t) => (
      // Backend hanya izinkan reverse untuk transaksi sumber MANUAL_ADJUSTMENT yang belum dibalik
      // (409 SOURCE_REVERSAL_REQUIRED untuk sumber lain — harus dibalik dari modul asalnya).
      t.sourceType === 'MANUAL_ADJUSTMENT' && !t.reversedAt ? (
        <Can code="CASH_TRANSACTION_REVERSE">
          <RowActions extra={[{ label: 'Balik Transaksi', icon: <Undo2 size={13} />, onClick: () => setToReverse(t), variant: 'danger' }]} />
        </Can>
      ) : null
    ) },
  ];
  const cards = useMemo(() => [
    { icon: Landmark, label: 'Saldo Awal', value: summary?.openingBalance ?? 0, color: 'bg-accent-blue' },
    { icon: ArrowDownLeft, label: 'Kas Masuk', value: summary?.totalIn ?? 0, color: 'bg-accent-green' },
    { icon: ArrowUpRight, label: 'Kas Keluar', value: summary?.totalOut ?? 0, color: 'bg-semantic-error' },
    { icon: Wallet, label: 'Saldo Akhir', value: summary?.endingBalance ?? 0, color: 'bg-primary' },
  ], [summary]);

  return (
    <div className="max-w-[1600px] mx-auto  space-y-5">
      <PageHeader
        title="Cash Flow"
        description="Akun kas, ledger, dan transaksi kas showroom"
        action={<Can code="CASH_TRANSACTION_CREATE"><div className="flex flex-wrap gap-2"><Button icon={<ArrowDownLeft size={16} />} onClick={() => setTxForm('manual-in')} disabled={mutationBlocked} title={mutationBlocked ? 'Pilih cabang terlebih dahulu' : undefined}>Kas Masuk</Button><Button variant="secondary" icon={<ArrowUpRight size={16} />} onClick={() => setTxForm('manual-out')} disabled={mutationBlocked} title={mutationBlocked ? 'Pilih cabang terlebih dahulu' : undefined}>Kas Keluar</Button><Button variant="secondary" icon={<Repeat size={16} />} onClick={() => setTxForm('transfer')} disabled={mutationBlocked} title={mutationBlocked ? 'Pilih cabang terlebih dahulu' : undefined}>Transfer</Button><Can code="CASH_TRANSACTION_INTER_BRANCH_TRANSFER"><Button variant="secondary" icon={<Building2 size={16} />} onClick={() => setTxForm('inter-branch-transfer')} disabled={mutationBlocked} title={mutationBlocked ? 'Pilih cabang terlebih dahulu' : undefined}>Transfer Cabang</Button></Can><Button variant="secondary" icon={<SlidersHorizontal size={16} />} onClick={() => setTxForm('adjustment')} disabled={mutationBlocked} title={mutationBlocked ? 'Pilih cabang terlebih dahulu' : undefined}>Adjustment</Button></div></Can>}
      />
      {mutationBlocked && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 text-[12px] font-semibold text-accent-amber">
          <AlertTriangle size={16} className="shrink-0" />
          Pilih cabang konkret di filter untuk mencatat transaksi kas atau mengelola akun kas.
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {[{ id: 'dashboard', label: 'Dashboard' }, { id: 'ledger', label: 'Buku Kas' }, ...(can('CASH_ACCOUNT_READ') ? [{ id: 'accounts', label: 'Akun Kas' }] : [])].map((x) => (
          <button key={x.id} onClick={() => setTab(x.id as Tab)} className={`px-4 py-2 rounded-xl text-[13px] font-bold border ${tab === x.id ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border'}`}>{x.label}</button>
        ))}
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isOwner ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {isOwner && (
          <SelectField
            label="Cabang"
            value={selectedBranchId ?? ''}
            onChange={(e) => setSelectedBranchId(e.target.value || null)}
            options={[{ value: '', label: 'Semua Cabang' }, ...branches.map((b) => ({ value: b.id, label: b.nama }))]}
          />
        )}
        <TextField label="Dari Tanggal" type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
        <TextField label="Sampai Tanggal" type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
        <SelectField label="Tipe Ledger" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} options={[{ value: '', label: 'Semua' }, { value: 'IN', label: 'IN' }, { value: 'OUT', label: 'OUT' }, { value: 'TRANSFER', label: 'TRANSFER' }]} />
        <CashAccountSelect label="Filter Akun" branchKey={branchKey} headers={branchHeader} value={filters.cashAccountId} onChange={(v) => setFilters((f) => ({ ...f, cashAccountId: v }))} />
      </div>
      {tab === 'dashboard' && (
        <>
          {isConsolidated && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-blue/10 border border-accent-blue/30 text-[12px] font-semibold text-accent-blue">
              <Landmark size={16} className="shrink-0" /> Menampilkan konsolidasi seluruh cabang. Pilih satu cabang untuk melihat saldo per cabang.
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return <div key={c.label} className="bg-surface rounded-2xl border border-border shadow-card p-5"><div className={`w-11 h-11 rounded-xl ${c.color} text-white flex items-center justify-center mb-3`}><Icon size={21} /></div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{c.label}</p><p className="text-xl font-extrabold text-ink mt-1">{formatCurrency(c.value, { compact: true })}</p></div>;
            })}
          </div>
          <SectionCard title="Saldo per Akun Kas" icon={<Landmark size={16} />} bodyClassName="p-0 md:p-0">
            <DataTable columns={[
              { header: 'Akun', cell: (a) => <span className="font-bold text-ink">{a.name}</span> },
              { header: 'Kode', cell: (a) => a.code },
              { header: 'Tipe', cell: (a) => a.type },
              ...(isConsolidated ? [{ header: 'Cabang', cell: (a: (typeof dashboardAccounts)[number]) => a.branch?.nama ?? '-' }] : []),
              { header: 'Default', align: 'center' as const, cell: (a) => a.defaultPayment ? <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent-green/10 text-accent-green">Penjualan</span> : '-' },
              { header: 'Masuk', align: 'right' as const, cell: (a) => formatCurrency(a.totalIn) },
              { header: 'Keluar', align: 'right' as const, cell: (a) => formatCurrency(a.totalOut) },
              { header: 'Saldo Akhir', align: 'right' as const, cell: (a) => <span className="font-bold">{formatCurrency(a.endingBalance)}</span> },
            ]} data={dashboardAccounts} rowKey={(a) => a.id} />
          </SectionCard>
        </>
      )}
      {tab === 'ledger' && <SectionCard title="Buku Kas / Ledger" icon={<Wallet size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={ledgerColumns} data={ledger.data?.data ?? []} rowKey={(t) => t.id} /></SectionCard>}
      {tab === 'accounts' && <SectionCard title="Akun Kas" icon={<Landmark size={16} />} action={<Can code="CASH_ACCOUNT_CREATE"><Button icon={<Plus size={16} />} onClick={() => setAccountForm(null)} disabled={mutationBlocked} title={mutationBlocked ? 'Pilih cabang terlebih dahulu' : undefined}>Tambah Akun</Button></Can>} bodyClassName="p-0 md:p-0"><DataTable columns={accountColumns} data={accounts.data?.data ?? []} rowKey={(a) => a.id} /></SectionCard>}
      {accountForm !== undefined && <AccountForm item={accountForm} onClose={() => setAccountForm(undefined)} headers={branchHeader} mutationBlocked={mutationBlocked} />}
      {txForm && <TransactionForm mode={txForm} onClose={() => setTxForm(null)} branchKey={branchKey} headers={branchHeader} mutationBlocked={mutationBlocked} />}
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && accountMutations.remove.mutate({ id: toDelete.id, headers: branchHeader }, { onError: (e) => notifyApiError(e), onSuccess: () => setToDelete(null) })} loading={accountMutations.remove.isPending} closeOnConfirm={false} title="Nonaktifkan Akun Kas" message={toDelete ? `Nonaktifkan akun kas "${toDelete.name}"?` : ''} />
      <ConfirmDialog
        open={!!toReverse}
        onClose={() => setToReverse(null)}
        onConfirm={() => toReverse && txMutations.reverse.mutate(
          { id: toReverse.id, body: { transactionDate: toIsoDate(today()), description: `Reversal ${toReverse.description || toReverse.id}` }, headers: branchHeader },
          { onError: (e) => notifyApiError(e), onSuccess: () => setToReverse(null) },
        )}
        loading={txMutations.reverse.isPending}
        closeOnConfirm={false}
        tone="danger"
        icon={Undo2}
        title="Balik Transaksi Kas"
        message={toReverse ? `Balik transaksi penyesuaian sebesar ${formatCurrency(toReverse.amount)}? Entri baru akan dibuat untuk membatalkan efeknya pada saldo — transaksi asli tidak dihapus.` : ''}
        confirmLabel="Ya, Balik"
      />
    </div>
  );
};

export const CashFlowPage = () => (
  <RequirePermission any={['CASH_TRANSACTION_READ', 'CASH_ACCOUNT_READ']}>
    <CashFlowPageInner />
  </RequirePermission>
);
