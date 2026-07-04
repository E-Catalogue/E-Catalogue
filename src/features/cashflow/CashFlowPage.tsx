import { useMemo, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, Landmark, Plus, Repeat, SlidersHorizontal, Wallet } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Can } from '@/features/auth/permissions';
import { notifyApiError } from '@/core/api/notify';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { CashAccountSelect, CurrencyField } from '@/features/finance/components';
import { useCashAccountMutations, useCashAccounts, useCashDashboard, useCashTransactionMutations, useCashTransactions } from '@/features/finance/finance.hooks';
import { toIsoDate } from '@/features/finance/finance.utils';
import type { CashAccount, CashAccountType, CashTransaction } from '@/features/finance/types';

type Tab = 'dashboard' | 'accounts' | 'ledger';
type TxModal = 'manual-in' | 'manual-out' | 'transfer' | 'adjustment';

const today = () => new Date().toISOString().slice(0, 10);

const AccountForm = ({ item, onClose }: { item: CashAccount | null; onClose: () => void }) => {
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
  const set = (key: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = { ...form, code: form.code.toUpperCase(), openingBalance: Number(form.openingBalance || 0) };
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => onClose() };
    if (item) mutations.update.mutate({ id: item.id, body }, opts);
    else mutations.create.mutate(body, opts);
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Akun Kas' : 'Tambah Akun Kas'} icon={<Landmark size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="cash-account-form" disabled={mutations.create.isPending || mutations.update.isPending}>Simpan</Button></>}>
      <form id="cash-account-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        <TextField label="Kode" required value={form.code} onChange={(e) => set('code', e.target.value)} />
        <SelectField label="Tipe" value={form.type} onChange={(e) => set('type', e.target.value as CashAccountType)} options={[{ value: 'CASH', label: 'Cash' }, { value: 'BANK', label: 'Bank' }, { value: 'OTHER', label: 'Lainnya' }]} />
        <CurrencyField label="Saldo Awal" value={form.openingBalance} onChange={(e) => set('openingBalance', e.target.value)} />
        <TextField label="Nomor Rekening" value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} />
        <TextField label="Nama Bank" value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
        <label className="sm:col-span-2 flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
          <input type="checkbox" checked={form.defaultPayment} onChange={(e) => set('defaultPayment', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" /> Default pembayaran penjualan
        </label>
        <label className="sm:col-span-2 flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" /> Aktif
        </label>
      </form>
    </Modal>
  );
};

const TransactionForm = ({ mode, onClose }: { mode: TxModal; onClose: () => void }) => {
  const mutations = useCashTransactionMutations();
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
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const title = mode === 'manual-in' ? 'Kas Masuk' : mode === 'manual-out' ? 'Kas Keluar' : mode === 'transfer' ? 'Transfer Antar Kas' : 'Penyesuaian Saldo';
  const pending = mutations.manualIn.isPending || mutations.manualOut.isPending || mutations.transfer.isPending || mutations.adjustment.isPending;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const common = { amount: Number(form.amount || 0), transactionDate: toIsoDate(form.transactionDate), description: form.description, proofUrl: form.proofUrl || null };
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => onClose() };
    if (mode === 'manual-in') mutations.manualIn.mutate({ ...common, cashAccountId: form.cashAccountId }, opts);
    if (mode === 'manual-out') mutations.manualOut.mutate({ ...common, cashAccountId: form.cashAccountId }, opts);
    if (mode === 'transfer') mutations.transfer.mutate({ ...common, fromCashAccountId: form.fromCashAccountId, toCashAccountId: form.toCashAccountId }, opts);
    if (mode === 'adjustment') mutations.adjustment.mutate({ ...common, cashAccountId: form.cashAccountId, type: form.type as 'IN' | 'OUT' }, opts);
  };
  return (
    <Modal open onClose={onClose} title={title} icon={<Wallet size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="cash-tx-form" disabled={pending}>Simpan</Button></>}>
      <form id="cash-tx-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mode === 'transfer' ? (
          <>
            <CashAccountSelect label="Dari Akun" required value={form.fromCashAccountId} onChange={(v) => set('fromCashAccountId', v)} />
            <CashAccountSelect label="Ke Akun" required value={form.toCashAccountId} onChange={(v) => set('toCashAccountId', v)} />
          </>
        ) : (
          <CashAccountSelect required value={form.cashAccountId} onChange={(v) => set('cashAccountId', v)} />
        )}
        {mode === 'adjustment' && <SelectField label="Tipe" value={form.type} onChange={(e) => set('type', e.target.value)} options={[{ value: 'IN', label: 'Tambah Saldo' }, { value: 'OUT', label: 'Kurangi Saldo' }]} />}
        <CurrencyField label="Nominal" required value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        <TextField label="Tanggal" required type="date" value={form.transactionDate} onChange={(e) => set('transactionDate', e.target.value)} />
        <TextField label="Keterangan" wrapClass="sm:col-span-2" value={form.description} onChange={(e) => set('description', e.target.value)} />
        <TextField label="URL Bukti" wrapClass="sm:col-span-2" value={form.proofUrl} onChange={(e) => set('proofUrl', e.target.value)} />
      </form>
    </Modal>
  );
};

export const CashFlowPage = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [accountForm, setAccountForm] = useState<CashAccount | null | undefined>();
  const [txForm, setTxForm] = useState<TxModal | null>(null);
  const [toDelete, setToDelete] = useState<CashAccount | null>(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', type: '', cashAccountId: '' });

  const dashboard = useCashDashboard({ dateFrom: filters.dateFrom ? toIsoDate(filters.dateFrom) : undefined, dateTo: filters.dateTo ? toIsoDate(filters.dateTo) : undefined });
  const accounts = useCashAccounts({ page: 1, limit: 100 });
  const ledger = useCashTransactions({ page: 1, limit: 50, type: filters.type || undefined, cashAccountId: filters.cashAccountId || undefined, dateFrom: filters.dateFrom ? toIsoDate(filters.dateFrom) : undefined, dateTo: filters.dateTo ? toIsoDate(filters.dateTo) : undefined });
  const accountMutations = useCashAccountMutations();

  const accountColumns: Column<CashAccount>[] = [
    { header: 'Nama', cell: (a) => <span className="font-bold text-ink">{a.name}</span> },
    { header: 'Kode', cell: (a) => a.code },
    { header: 'Tipe', cell: (a) => a.type },
    { header: 'Bank/Rekening', cell: (a) => [a.bankName, a.accountNumber].filter(Boolean).join(' / ') || '-' },
    { header: 'Saldo Awal', align: 'right', cell: (a) => formatCurrency(a.openingBalance) },
    { header: 'Default', align: 'center', cell: (a) => a.defaultPayment ? <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent-green/10 text-accent-green">Penjualan</span> : '-' },
    { header: 'Status', cell: (a) => a.isActive ? 'Aktif' : 'Nonaktif' },
    { header: '', align: 'right', cell: (a) => <div className="flex justify-end gap-2"><Can code="CASH_ACCOUNT_UPDATE"><button className="text-accent-blue font-bold" onClick={() => setAccountForm(a)}>Edit</button></Can><Can code="CASH_ACCOUNT_DELETE"><button className="text-semantic-error font-bold" onClick={() => setToDelete(a)}>Nonaktif</button></Can></div> },
  ];
  const ledgerColumns: Column<CashTransaction>[] = [
    { header: 'Tanggal', cell: (t) => formatDate(t.transactionDate) },
    { header: 'Akun', cell: (t) => t.cashAccount?.name ?? t.cashAccountId },
    { header: 'Sumber', cell: (t) => t.sourceType },
    { header: 'Keterangan', cell: (t) => <span className="font-bold text-ink">{t.description || '-'}</span> },
    { header: 'Tipe', align: 'center', cell: (t) => <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${t.type === 'IN' ? 'bg-accent-green/10 text-accent-green' : 'bg-semantic-error/10 text-semantic-error'}`}>{t.type}</span> },
    { header: 'Nominal', align: 'right', cell: (t) => <span className={t.type === 'IN' ? 'text-accent-green font-bold' : 'text-semantic-error font-bold'}>{t.type === 'IN' ? '+' : '-'} {formatCurrency(t.amount)}</span> },
  ];
  const cards = useMemo(() => [
    { icon: Landmark, label: 'Saldo Awal', value: dashboard.data?.summary.openingBalance ?? 0, color: 'bg-accent-blue' },
    { icon: ArrowDownLeft, label: 'Kas Masuk', value: dashboard.data?.summary.totalIn ?? 0, color: 'bg-accent-green' },
    { icon: ArrowUpRight, label: 'Kas Keluar', value: dashboard.data?.summary.totalOut ?? 0, color: 'bg-semantic-error' },
    { icon: Wallet, label: 'Saldo Akhir', value: dashboard.data?.summary.endingBalance ?? 0, color: 'bg-primary' },
  ], [dashboard.data]);

  return (
    <div className="max-w-[1600px] mx-auto  space-y-5">
      <PageHeader
        title="Cash Flow"
        description="Akun kas, ledger, dan transaksi kas showroom"
        action={<Can code="CASH_TRANSACTION_CREATE"><div className="flex flex-wrap gap-2"><Button icon={<ArrowDownLeft size={16} />} onClick={() => setTxForm('manual-in')}>Kas Masuk</Button><Button variant="secondary" icon={<ArrowUpRight size={16} />} onClick={() => setTxForm('manual-out')}>Kas Keluar</Button><Button variant="secondary" icon={<Repeat size={16} />} onClick={() => setTxForm('transfer')}>Transfer</Button><Button variant="secondary" icon={<SlidersHorizontal size={16} />} onClick={() => setTxForm('adjustment')}>Adjustment</Button></div></Can>}
      />
      <div className="flex flex-wrap gap-2">
        {[{ id: 'dashboard', label: 'Dashboard' }, { id: 'ledger', label: 'Buku Kas' }, { id: 'accounts', label: 'Akun Kas' }].map((x) => (
          <button key={x.id} onClick={() => setTab(x.id as Tab)} className={`px-4 py-2 rounded-xl text-[13px] font-bold border ${tab === x.id ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border'}`}>{x.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <TextField label="Dari Tanggal" type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
        <TextField label="Sampai Tanggal" type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
        <SelectField label="Tipe Ledger" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} options={[{ value: '', label: 'Semua' }, { value: 'IN', label: 'IN' }, { value: 'OUT', label: 'OUT' }, { value: 'TRANSFER', label: 'TRANSFER' }]} />
        <CashAccountSelect label="Filter Akun" value={filters.cashAccountId} onChange={(v) => setFilters((f) => ({ ...f, cashAccountId: v }))} />
      </div>
      {tab === 'dashboard' && (
        <>
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
              { header: 'Default', align: 'center', cell: (a) => a.defaultPayment ? <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent-green/10 text-accent-green">Penjualan</span> : '-' },
              { header: 'Masuk', align: 'right', cell: (a) => formatCurrency(a.totalIn) },
              { header: 'Keluar', align: 'right', cell: (a) => formatCurrency(a.totalOut) },
              { header: 'Saldo Akhir', align: 'right', cell: (a) => <span className="font-bold">{formatCurrency(a.endingBalance)}</span> },
            ]} data={dashboard.data?.accounts ?? []} rowKey={(a) => a.id} />
          </SectionCard>
        </>
      )}
      {tab === 'ledger' && <SectionCard title="Buku Kas / Ledger" icon={<Wallet size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={ledgerColumns} data={ledger.data?.data ?? []} rowKey={(t) => t.id} /></SectionCard>}
      {tab === 'accounts' && <SectionCard title="Akun Kas" icon={<Landmark size={16} />} action={<Can code="CASH_ACCOUNT_CREATE"><Button icon={<Plus size={16} />} onClick={() => setAccountForm(null)}>Tambah Akun</Button></Can>} bodyClassName="p-0 md:p-0"><DataTable columns={accountColumns} data={accounts.data?.data ?? []} rowKey={(a) => a.id} /></SectionCard>}
      {accountForm !== undefined && <AccountForm item={accountForm} onClose={() => setAccountForm(undefined)} />}
      {txForm && <TransactionForm mode={txForm} onClose={() => setTxForm(null)} />}
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && accountMutations.remove.mutate(toDelete.id, { onError: (e) => notifyApiError(e), onSuccess: () => setToDelete(null) })} title="Nonaktifkan Akun Kas" message={toDelete ? `Nonaktifkan akun kas "${toDelete.name}"?` : ''} />
    </div>
  );
};
