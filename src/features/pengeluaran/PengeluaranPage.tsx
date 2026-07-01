import { useMemo, useState, type FormEvent } from 'react';
import { CalendarClock, Plus, ReceiptText, Wallet } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Can } from '@/features/auth/permissions';
import { notifyApiError } from '@/core/api/notify';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { CashAccountSelect, CurrencyField, ExpenseCategorySelect, FinanceStatusBadge } from '@/features/finance/components';
import { useLookupRecurringExpenses, useOperationalExpenseMutations, useOperationalExpenses, useRecurringExpenseMutations, useRecurringExpenses } from '@/features/finance/finance.hooks';
import { fromIsoDate, toIsoDate } from '@/features/finance/finance.utils';
import type { LookupRecurringExpense, OperationalExpense, OperationalExpenseType, RecurringExpense } from '@/features/finance/types';

type Tab = 'expenses' | 'recurring';

const today = () => new Date().toISOString().slice(0, 10);
const month = () => new Date().toISOString().slice(0, 7);

const ExpenseForm = ({ item, onClose }: { item: OperationalExpense | null; onClose: () => void }) => {
  const mutations = useOperationalExpenseMutations();
  const locked = item?.status === 'PAID' || !!item?.cashTransactionId;
  const [form, setForm] = useState({
    type: item?.type ?? 'NORMAL',
    title: item?.title ?? '',
    kategoriPengeluaranId: item?.kategoriPengeluaranId ?? '',
    amount: String(item?.amount ?? ''),
    expenseDate: fromIsoDate(item?.expenseDate) || today(),
    expensePeriodStart: fromIsoDate(item?.expensePeriodStart),
    expensePeriodEnd: fromIsoDate(item?.expensePeriodEnd),
    dueDate: fromIsoDate(item?.dueDate),
    description: item?.description ?? '',
    proofUrl: item?.proofUrl ?? '',
  });
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      type: form.type as OperationalExpenseType,
      amount: Number(form.amount || 0),
      expenseDate: toIsoDate(form.expenseDate),
      expensePeriodStart: form.type === 'BACKDATE' && form.expensePeriodStart ? toIsoDate(form.expensePeriodStart) : null,
      expensePeriodEnd: form.type === 'BACKDATE' && form.expensePeriodEnd ? toIsoDate(form.expensePeriodEnd) : null,
      dueDate: form.type === 'BACKDATE' && form.dueDate ? toIsoDate(form.dueDate) : null,
      proofUrl: form.proofUrl || null,
    };
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => onClose() };
    if (item) mutations.update.mutate({ id: item.id, body }, opts);
    else mutations.create.mutate(body, opts);
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Pengeluaran' : 'Catat Pengeluaran'} icon={<ReceiptText size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="expense-form" disabled={locked || mutations.create.isPending || mutations.update.isPending}>Simpan Draft</Button></>}>
      <form id="expense-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Tipe" value={form.type} disabled={!!locked} onChange={(e) => set('type', e.target.value)} options={[{ value: 'NORMAL', label: 'Normal' }, { value: 'BACKDATE', label: 'Backdate' }]} />
        <TextField label="Judul" required disabled={!!locked} value={form.title} onChange={(e) => set('title', e.target.value)} />
        <ExpenseCategorySelect required disabled={!!locked} value={form.kategoriPengeluaranId} onChange={(value) => set('kategoriPengeluaranId', value)} />
        <CurrencyField label="Nominal" required disabled={!!locked} value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        <TextField label={form.type === 'BACKDATE' ? 'Tanggal Pencatatan' : 'Tanggal Pengeluaran'} required type="date" disabled={!!locked} value={form.expenseDate} onChange={(e) => set('expenseDate', e.target.value)} />
        {form.type === 'BACKDATE' && (
          <>
            <TextField label="Periode Dari" required type="date" disabled={!!locked} value={form.expensePeriodStart} onChange={(e) => set('expensePeriodStart', e.target.value)} />
            <TextField label="Periode Sampai" required type="date" disabled={!!locked} value={form.expensePeriodEnd} onChange={(e) => set('expensePeriodEnd', e.target.value)} />
            <TextField label="Jatuh Tempo" type="date" disabled={!!locked} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </>
        )}
        <TextField label="Keterangan" wrapClass="sm:col-span-2" disabled={!!locked} value={form.description} onChange={(e) => set('description', e.target.value)} />
        <TextField label="URL Bukti" wrapClass="sm:col-span-2" disabled={!!locked} value={form.proofUrl} onChange={(e) => set('proofUrl', e.target.value)} />
      </form>
    </Modal>
  );
};

const PayExpenseForm = ({ item, onClose }: { item: OperationalExpense; onClose: () => void }) => {
  const mutations = useOperationalExpenseMutations();
  const [form, setForm] = useState({ cashAccountId: '', paidDate: today(), description: item.description ?? '' });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutations.pay.mutate({ id: item.id, body: { ...form, paidDate: toIsoDate(form.paidDate) } }, { onError: (e) => notifyApiError(e), onSuccess: () => onClose() });
  };
  return (
    <Modal open onClose={onClose} title="Bayar Pengeluaran" icon={<Wallet size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="pay-expense-form" disabled={mutations.pay.isPending}>Bayar</Button></>}>
      <form id="pay-expense-form" onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-surface-soft border border-border p-4">
          <p className="text-[11px] font-bold uppercase text-muted">{item.title}</p>
          <p className="text-lg font-extrabold text-semantic-error mt-1">{formatCurrency(item.amount)}</p>
        </div>
        <CashAccountSelect required value={form.cashAccountId} onChange={(v) => setForm((f) => ({ ...f, cashAccountId: v }))} />
        <TextField label="Tanggal Bayar" required type="date" value={form.paidDate} onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))} />
        <TextField label="Keterangan" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </form>
    </Modal>
  );
};

const RecurringForm = ({ item, onClose }: { item: RecurringExpense | null; onClose: () => void }) => {
  const mutations = useRecurringExpenseMutations();
  const [form, setForm] = useState({ name: item?.name ?? '', kategoriPengeluaranId: item?.kategoriPengeluaranId ?? '', defaultAmount: String(item?.defaultAmount ?? ''), description: item?.description ?? '', isActive: item?.isActive ?? true });
  const set = (key: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = { ...form, defaultAmount: Number(form.defaultAmount || 0) };
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => onClose() };
    if (item) mutations.update.mutate({ id: item.id, body }, opts);
    else mutations.create.mutate(body, opts);
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Pengeluaran Rutin' : 'Tambah Pengeluaran Rutin'} icon={<CalendarClock size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="recurring-form" disabled={mutations.create.isPending || mutations.update.isPending}>Simpan</Button></>}>
      <form id="recurring-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        <ExpenseCategorySelect required value={form.kategoriPengeluaranId} onChange={(value) => set('kategoriPengeluaranId', value)} />
        <CurrencyField label="Nominal Default" required value={form.defaultAmount} onChange={(e) => set('defaultAmount', e.target.value)} />
        <TextField label="Keterangan" value={form.description} onChange={(e) => set('description', e.target.value)} />
        <label className="sm:col-span-2 flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" /> Aktif</label>
      </form>
    </Modal>
  );
};

const GenerateRecurringForm = ({ onClose }: { onClose: () => void }) => {
  const mutations = useRecurringExpenseMutations();
  const { data, isLoading, isError, refetch } = useLookupRecurringExpenses({ isActive: 'true' });
  const items = data?.data ?? [];
  const [period, setPeriod] = useState(month());
  const [selected, setSelected] = useState<Record<string, { checked: boolean; amount: string }>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const chosen = items
      .filter((item) => selected[item.id]?.checked ?? true)
      .map((item) => ({ recurringExpenseId: item.id, amount: Number(selected[item.id]?.amount || item.defaultAmount || 0) }));
    mutations.generate.mutate({ period, items: chosen }, { onError: (e) => notifyApiError(e), onSuccess: () => onClose() });
  };
  const rowAmount = (item: LookupRecurringExpense) => selected[item.id]?.amount ?? String(item.defaultAmount);
  return (
    <Modal open onClose={onClose} title="Generate Pengeluaran Rutin" icon={<CalendarClock size={20} />} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="generate-recurring-form" disabled={mutations.generate.isPending}>Generate</Button></>}>
      <form id="generate-recurring-form" onSubmit={submit} className="space-y-4">
        <TextField label="Periode" required type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
        {isError ? (
          <div className="rounded-xl border border-border bg-surface-soft p-4 text-sm font-semibold text-muted">
            Gagal memuat template. <button type="button" className="font-bold text-primary" onClick={() => refetch()}>Coba lagi</button>
          </div>
        ) : (
        <div className="divide-y divide-divider border border-border rounded-2xl overflow-hidden">
          {isLoading && <div className="px-4 py-6 text-center text-sm font-semibold text-muted">Memuat template...</div>}
          {!isLoading && items.length === 0 && <div className="px-4 py-6 text-center text-sm font-semibold text-muted">Data tidak ditemukan.</div>}
          {!isLoading && items.map((item) => (
            <div key={item.id} className="grid grid-cols-[auto_1fr_160px] gap-3 items-center px-4 py-3">
              <input type="checkbox" checked={selected[item.id]?.checked ?? true} onChange={(e) => setSelected((s) => ({ ...s, [item.id]: { checked: e.target.checked, amount: s[item.id]?.amount ?? String(item.defaultAmount) } }))} className="w-4 h-4 accent-[color:var(--color-primary)]" />
              <div><p className="font-bold text-ink text-[13px]">{item.name}</p><p className="text-[11px] text-muted">{item.kategoriName}</p></div>
              <input type="number" min={0} value={rowAmount(item)} onChange={(e) => setSelected((s) => ({ ...s, [item.id]: { checked: s[item.id]?.checked ?? true, amount: e.target.value } }))} className="h-10 px-3 rounded-xl bg-surface-soft border border-border text-sm font-semibold" />
            </div>
          ))}
        </div>
        )}
      </form>
    </Modal>
  );
};

export const PengeluaranPage = () => {
  const [tab, setTab] = useState<Tab>('expenses');
  const [status, setStatus] = useState('');
  const [expenseForm, setExpenseForm] = useState<OperationalExpense | null | undefined>();
  const [payExpense, setPayExpense] = useState<OperationalExpense | null>(null);
  const [cancelExpense, setCancelExpense] = useState<OperationalExpense | null>(null);
  const [recurringForm, setRecurringForm] = useState<RecurringExpense | null | undefined>();
  const [removeRecurring, setRemoveRecurring] = useState<RecurringExpense | null>(null);
  const [generate, setGenerate] = useState(false);
  const expenses = useOperationalExpenses({ page: 1, limit: 50, status: status || undefined });
  const recurring = useRecurringExpenses({ page: 1, limit: 100 });
  const expenseMutations = useOperationalExpenseMutations();
  const recurringMutations = useRecurringExpenseMutations();
  const totalDraft = useMemo(() => (expenses.data?.data ?? []).filter((x) => x.status === 'DRAFT').reduce((s, x) => s + x.amount, 0), [expenses.data]);
  const expenseColumns: Column<OperationalExpense>[] = [
    { header: 'Tanggal', cell: (e) => formatDate(e.expenseDate) },
    { header: 'Judul', cell: (e) => <span className="font-bold text-ink">{e.title}</span> },
    { header: 'Kategori', cell: (e) => e.kategoriPengeluaran?.name ?? '-' },
    { header: 'Tipe', cell: (e) => e.type },
    { header: 'Status', cell: (e) => <FinanceStatusBadge status={e.status} /> },
    { header: 'Nominal', align: 'right', cell: (e) => <span className="font-bold text-semantic-error">{formatCurrency(e.amount)}</span> },
    { header: '', align: 'right', cell: (e) => <div className="flex justify-end gap-2"><Can code="OPERATIONAL_EXPENSE_PAY">{e.status === 'DRAFT' && <button className="font-bold text-accent-green" onClick={() => setPayExpense(e)}>Bayar</button>}</Can><RowActions onEdit={() => setExpenseForm(e)} onDelete={e.status === 'DRAFT' ? () => setCancelExpense(e) : undefined} /></div> },
  ];
  const recurringColumns: Column<RecurringExpense>[] = [
    { header: 'Nama', cell: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: 'Kategori', cell: (r) => r.kategoriPengeluaran?.name ?? '-' },
    { header: 'Nominal Default', align: 'right', cell: (r) => formatCurrency(r.defaultAmount) },
    { header: 'Status', cell: (r) => r.isActive ? 'Aktif' : 'Nonaktif' },
    { header: '', align: 'right', cell: (r) => <RowActions onEdit={() => setRecurringForm(r)} onDelete={() => setRemoveRecurring(r)} /> },
  ];
  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Operational" description="Pengeluaran aktual dan template rutin" action={tab === 'expenses' ? <Can code="OPERATIONAL_EXPENSE_CREATE"><Button icon={<Plus size={17} />} onClick={() => setExpenseForm(null)}>Catat Pengeluaran</Button></Can> : <Can code="RECURRING_EXPENSE_CREATE"><div className="flex gap-2"><Button variant="secondary" icon={<CalendarClock size={17} />} onClick={() => setGenerate(true)}>Generate</Button><Button icon={<Plus size={17} />} onClick={() => setRecurringForm(null)}>Tambah Template</Button></div></Can>} />
      <div className="flex flex-wrap gap-2"><button onClick={() => setTab('expenses')} className={`px-4 py-2 rounded-xl text-[13px] font-bold border ${tab === 'expenses' ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border'}`}>Pengeluaran</button><button onClick={() => setTab('recurring')} className={`px-4 py-2 rounded-xl text-[13px] font-bold border ${tab === 'recurring' ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border'}`}>Pengeluaran Rutin</button></div>
      {tab === 'expenses' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-2xl border border-border shadow-card p-5"><p className="text-[10px] font-bold uppercase text-muted">Draft Belum Dibayar</p><p className="text-xl font-extrabold text-semantic-error mt-1">{formatCurrency(totalDraft, { compact: true })}</p></div>
            <SelectField label="Filter Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'Semua' }, { value: 'DRAFT', label: 'Draft' }, { value: 'PAID', label: 'Sudah Dibayar' }, { value: 'CANCELLED', label: 'Dibatalkan' }]} />
          </div>
          <SectionCard title="Daftar Pengeluaran" icon={<ReceiptText size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={expenseColumns} data={expenses.data?.data ?? []} rowKey={(e) => e.id} /></SectionCard>
        </>
      )}
      {tab === 'recurring' && <SectionCard title="Template Pengeluaran Rutin" icon={<CalendarClock size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={recurringColumns} data={recurring.data?.data ?? []} rowKey={(r) => r.id} /></SectionCard>}
      {expenseForm !== undefined && <ExpenseForm item={expenseForm} onClose={() => setExpenseForm(undefined)} />}
      {payExpense && <PayExpenseForm item={payExpense} onClose={() => setPayExpense(null)} />}
      {recurringForm !== undefined && <RecurringForm item={recurringForm} onClose={() => setRecurringForm(undefined)} />}
      {generate && <GenerateRecurringForm onClose={() => setGenerate(false)} />}
      <ConfirmDialog open={!!cancelExpense} onClose={() => setCancelExpense(null)} onConfirm={() => cancelExpense && expenseMutations.remove.mutate(cancelExpense.id, { onError: (e) => notifyApiError(e), onSuccess: () => setCancelExpense(null) })} title="Batalkan Pengeluaran" message={cancelExpense ? `Batalkan pengeluaran "${cancelExpense.title}"?` : ''} />
      <ConfirmDialog open={!!removeRecurring} onClose={() => setRemoveRecurring(null)} onConfirm={() => removeRecurring && recurringMutations.remove.mutate(removeRecurring.id, { onError: (e) => notifyApiError(e), onSuccess: () => setRemoveRecurring(null) })} title="Nonaktifkan Pengeluaran Rutin" message={removeRecurring ? `Nonaktifkan template "${removeRecurring.name}"?` : ''} />
    </div>
  );
};
