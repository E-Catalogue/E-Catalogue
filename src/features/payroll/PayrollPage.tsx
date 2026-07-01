import { useState, type FormEvent } from 'react';
import { Banknote, CalendarDays, Plus, ReceiptText, Users } from 'lucide-react';
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
import { CashAccountSelect, CurrencyField, DealOrderSelect, FinanceStatusBadge, PayrollUserSelect, SalesSelect } from '@/features/finance/components';
import { usePayrollBaseSalaries, usePayrollBaseSalaryMutations, usePayrollRun, usePayrollRunMutations, usePayrollRuns, useSalesIncentiveMutations, useSalesIncentives } from '@/features/finance/finance.hooks';
import { fromIsoDate, showName, toIsoDate } from '@/features/finance/finance.utils';
import type { PayrollBaseSalary, PayrollItem, PayrollRun, SalesIncentive } from '@/features/finance/types';

type Tab = 'base' | 'incentives' | 'runs';

const today = () => new Date().toISOString().slice(0, 10);
const month = () => new Date().toISOString().slice(0, 7);

const BaseSalaryForm = ({ item, onClose }: { item: PayrollBaseSalary | null; onClose: () => void }) => {
  const mutations = usePayrollBaseSalaryMutations();
  const [form, setForm] = useState({ userId: item?.userId ?? '', amount: String(item?.amount ?? ''), effectiveStart: fromIsoDate(item?.effectiveStart) || today(), effectiveEnd: fromIsoDate(item?.effectiveEnd), isActive: item?.isActive ?? true });
  const set = (key: keyof typeof form, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = { ...form, amount: Number(form.amount || 0), effectiveStart: toIsoDate(form.effectiveStart), effectiveEnd: form.effectiveEnd ? toIsoDate(form.effectiveEnd) : null };
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => onClose() };
    if (item) mutations.update.mutate({ id: item.id, body }, opts);
    else mutations.create.mutate(body, opts);
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Master Gapok' : 'Tambah Master Gapok'} icon={<Users size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="base-salary-form" disabled={mutations.create.isPending || mutations.update.isPending}>Simpan</Button></>}>
      <form id="base-salary-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PayrollUserSelect required value={form.userId} onChange={(value) => set('userId', value)} />
        <CurrencyField label="Gapok" required value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        <TextField label="Berlaku Mulai" required type="date" value={form.effectiveStart} onChange={(e) => set('effectiveStart', e.target.value)} />
        <TextField label="Berlaku Sampai" type="date" value={form.effectiveEnd} onChange={(e) => set('effectiveEnd', e.target.value)} />
        <label className="sm:col-span-2 flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" /> Aktif</label>
      </form>
    </Modal>
  );
};

const IncentiveForm = ({ item, onClose }: { item: SalesIncentive | null; onClose: () => void }) => {
  const mutations = useSalesIncentiveMutations();
  const readonly = item?.status === 'INCLUDED' || item?.status === 'PAID';
  const [form, setForm] = useState({ salesId: item?.salesId ?? '', leadOrderId: item?.leadOrderId ?? '', amount: String(item?.amount ?? ''), period: item?.period ?? month(), description: item?.description ?? '', status: item?.status ?? 'DRAFT' });
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = { ...form, amount: Number(form.amount || 0) };
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => onClose() };
    if (item) mutations.update.mutate({ id: item.id, body }, opts);
    else mutations.create.mutate(body, opts);
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Insentif Sales' : 'Tambah Insentif Sales'} icon={<ReceiptText size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="incentive-form" disabled={readonly || mutations.create.isPending || mutations.update.isPending}>Simpan</Button></>}>
      <form id="incentive-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SalesSelect required disabled={readonly} value={form.salesId} onChange={(value) => setForm((f) => ({ ...f, salesId: value, leadOrderId: '' }))} />
        <DealOrderSelect required disabled={readonly || !form.salesId} value={form.leadOrderId} salesId={form.salesId} period={form.period} onChange={(value) => set('leadOrderId', value)} />
        <CurrencyField label="Nominal" required disabled={readonly} value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        <TextField label="Periode" required type="month" disabled={readonly} value={form.period} onChange={(e) => set('period', e.target.value)} />
        {item && <SelectField label="Status" disabled={readonly} value={form.status} onChange={(e) => set('status', e.target.value)} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'CANCELLED', label: 'Dibatalkan' }]} />}
        <TextField label="Keterangan" wrapClass="sm:col-span-2" disabled={readonly} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </form>
    </Modal>
  );
};

const GeneratePayrollForm = ({ onClose }: { onClose: () => void }) => {
  const mutations = usePayrollRunMutations();
  const [period, setPeriod] = useState(month());
  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutations.generate.mutate({ period }, { onError: (e) => notifyApiError(e), onSuccess: () => onClose() });
  };
  return (
    <Modal open onClose={onClose} title="Generate Payroll" icon={<CalendarDays size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="generate-payroll-form" disabled={mutations.generate.isPending}>Generate</Button></>}>
      <form id="generate-payroll-form" onSubmit={submit}><TextField label="Periode" required type="month" value={period} onChange={(e) => setPeriod(e.target.value)} /></form>
    </Modal>
  );
};

const PayPayrollForm = ({ item, onClose }: { item: PayrollRun; onClose: () => void }) => {
  const mutations = usePayrollRunMutations();
  const [form, setForm] = useState({ cashAccountId: '', paidDate: today(), description: `Pembayaran payroll ${item.period}` });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutations.pay.mutate({ id: item.id, body: { ...form, paidDate: toIsoDate(form.paidDate) } }, { onError: (e) => notifyApiError(e), onSuccess: () => onClose() });
  };
  return (
    <Modal open onClose={onClose} title="Bayar Payroll" icon={<Banknote size={20} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="pay-payroll-form" disabled={mutations.pay.isPending}>Bayar Payroll</Button></>}>
      <form id="pay-payroll-form" onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-surface-soft border border-border p-4"><p className="text-[11px] font-bold uppercase text-muted">Total Dibayar</p><p className="text-lg font-extrabold text-semantic-error mt-1">{formatCurrency(item.totalPaid)}</p></div>
        <CashAccountSelect required value={form.cashAccountId} onChange={(v) => setForm((f) => ({ ...f, cashAccountId: v }))} />
        <TextField label="Tanggal Bayar" required type="date" value={form.paidDate} onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))} />
        <TextField label="Keterangan" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </form>
    </Modal>
  );
};

const PayrollDetail = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const { data } = usePayrollRun(id);
  const mutations = usePayrollRunMutations();
  const [pay, setPay] = useState<PayrollRun | null>(null);
  const updateItem = (item: PayrollItem, key: 'allowance' | 'deduction', value: string) => {
    mutations.updateItem.mutate({ id, itemId: item.id, body: { allowance: key === 'allowance' ? Number(value || 0) : item.allowance, deduction: key === 'deduction' ? Number(value || 0) : item.deduction } }, { onError: (e) => notifyApiError(e) });
  };
  const run = data;
  return (
    <Modal open onClose={onClose} title={`Payroll ${run?.period ?? ''}`} icon={<Banknote size={20} />} size="xl" footer={<><Button variant="secondary" onClick={onClose}>Tutup</Button>{run?.status === 'DRAFT' && <Can code="PAYROLL_PAY"><Button onClick={() => setPay(run)}>Bayar Payroll</Button></Can>}</>}>
      {run && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Gapok', run.totalBaseSalary],
              ['Insentif', run.totalIncentive],
              ['Tunjangan', run.totalAllowance],
              ['Potongan', run.totalDeduction],
              ['Total', run.totalPaid],
            ].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-surface-soft border border-border p-3"><p className="text-[10px] font-bold uppercase text-muted">{label}</p><p className="font-extrabold text-ink mt-1">{formatCurrency(Number(value), { compact: true })}</p></div>)}
          </div>
          <DataTable columns={[
            { header: 'User', cell: (i: PayrollItem) => <span className="font-bold text-ink">{showName(i.user)}</span> },
            { header: 'Gapok', align: 'right' as const, cell: (i: PayrollItem) => formatCurrency(i.baseSalary) },
            { header: 'Insentif', align: 'right' as const, cell: (i: PayrollItem) => formatCurrency(i.incentive) },
            { header: 'Tunjangan', align: 'right' as const, cell: (i: PayrollItem) => run.status === 'DRAFT' ? <input type="number" min={0} defaultValue={i.allowance} onBlur={(e) => updateItem(i, 'allowance', e.target.value)} className="w-28 h-9 px-2 rounded-lg bg-surface border border-border text-right" /> : formatCurrency(i.allowance) },
            { header: 'Potongan', align: 'right' as const, cell: (i: PayrollItem) => run.status === 'DRAFT' ? <input type="number" min={0} defaultValue={i.deduction} onBlur={(e) => updateItem(i, 'deduction', e.target.value)} className="w-28 h-9 px-2 rounded-lg bg-surface border border-border text-right" /> : formatCurrency(i.deduction) },
            { header: 'Total', align: 'right' as const, cell: (i: PayrollItem) => <span className="font-bold">{formatCurrency(i.total)}</span> },
          ]} data={run.items ?? []} rowKey={(i) => i.id} />
        </div>
      )}
      {pay && <PayPayrollForm item={pay} onClose={() => setPay(null)} />}
    </Modal>
  );
};

export const PayrollPage = () => {
  const [tab, setTab] = useState<Tab>('base');
  const [baseForm, setBaseForm] = useState<PayrollBaseSalary | null | undefined>();
  const [baseDelete, setBaseDelete] = useState<PayrollBaseSalary | null>(null);
  const [incentiveForm, setIncentiveForm] = useState<SalesIncentive | null | undefined>();
  const [incentiveDelete, setIncentiveDelete] = useState<SalesIncentive | null>(null);
  const [generate, setGenerate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const base = usePayrollBaseSalaries({ page: 1, limit: 50 });
  const incentives = useSalesIncentives({ page: 1, limit: 50 });
  const runs = usePayrollRuns({ page: 1, limit: 50 });
  const baseMutations = usePayrollBaseSalaryMutations();
  const incentiveMutations = useSalesIncentiveMutations();
  const baseColumns: Column<PayrollBaseSalary>[] = [
    { header: 'User', cell: (x) => <span className="font-bold text-ink">{showName(x.user) || x.userId}</span> },
    { header: 'Gapok', align: 'right', cell: (x) => formatCurrency(x.amount) },
    { header: 'Mulai', cell: (x) => formatDate(x.effectiveStart) },
    { header: 'Sampai', cell: (x) => x.effectiveEnd ? formatDate(x.effectiveEnd) : 'Sekarang' },
    { header: 'Status', cell: (x) => x.isActive ? 'Aktif' : 'Nonaktif' },
    { header: '', align: 'right', cell: (x) => <RowActions onEdit={() => setBaseForm(x)} onDelete={() => setBaseDelete(x)} /> },
  ];
  const incentiveColumns: Column<SalesIncentive>[] = [
    { header: 'Sales', cell: (x) => <span className="font-bold text-ink">{showName(x.sales) || x.salesId}</span> },
    { header: 'Order', cell: (x) => x.leadOrder?.nomorOrder ?? x.leadOrderId },
    { header: 'Periode', cell: (x) => x.period },
    { header: 'Status', cell: (x) => <FinanceStatusBadge status={x.status} /> },
    { header: 'Nominal', align: 'right', cell: (x) => formatCurrency(x.amount) },
    { header: '', align: 'right', cell: (x) => <RowActions onEdit={() => setIncentiveForm(x)} onDelete={x.status === 'DRAFT' ? () => setIncentiveDelete(x) : undefined} /> },
  ];
  const runColumns: Column<PayrollRun>[] = [
    { header: 'Periode', cell: (x) => <span className="font-bold text-ink">{x.period}</span> },
    { header: 'Status', cell: (x) => <FinanceStatusBadge status={x.status} /> },
    { header: 'Gapok', align: 'right', cell: (x) => formatCurrency(x.totalBaseSalary) },
    { header: 'Insentif', align: 'right', cell: (x) => formatCurrency(x.totalIncentive) },
    { header: 'Total Dibayar', align: 'right', cell: (x) => <span className="font-bold">{formatCurrency(x.totalPaid)}</span> },
    { header: '', align: 'right', cell: (x) => <RowActions onView={() => setDetailId(x.id)} /> },
  ];
  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Payroll" description="Master gapok, insentif sales, dan pembayaran payroll" action={tab === 'base' ? <Can code="PAYROLL_CREATE"><Button icon={<Plus size={17} />} onClick={() => setBaseForm(null)}>Tambah Gapok</Button></Can> : tab === 'incentives' ? <Can code="PAYROLL_CREATE"><Button icon={<Plus size={17} />} onClick={() => setIncentiveForm(null)}>Tambah Insentif</Button></Can> : <Can code="PAYROLL_CREATE"><Button icon={<Plus size={17} />} onClick={() => setGenerate(true)}>Generate Payroll</Button></Can>} />
      <div className="flex flex-wrap gap-2">{[{ id: 'base', label: 'Master Gapok' }, { id: 'incentives', label: 'Insentif Sales' }, { id: 'runs', label: 'Pembayaran Payroll' }].map((x) => <button key={x.id} onClick={() => setTab(x.id as Tab)} className={`px-4 py-2 rounded-xl text-[13px] font-bold border ${tab === x.id ? 'bg-primary text-white border-primary' : 'bg-surface text-ink-soft border-border'}`}>{x.label}</button>)}</div>
      {tab === 'base' && <SectionCard title="Master Gapok" icon={<Users size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={baseColumns} data={base.data?.data ?? []} rowKey={(x) => x.id} /></SectionCard>}
      {tab === 'incentives' && <SectionCard title="Insentif Sales" icon={<ReceiptText size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={incentiveColumns} data={incentives.data?.data ?? []} rowKey={(x) => x.id} /></SectionCard>}
      {tab === 'runs' && <SectionCard title="Pembayaran Payroll" icon={<Banknote size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={runColumns} data={runs.data?.data ?? []} rowKey={(x) => x.id} /></SectionCard>}
      {baseForm !== undefined && <BaseSalaryForm item={baseForm} onClose={() => setBaseForm(undefined)} />}
      {incentiveForm !== undefined && <IncentiveForm item={incentiveForm} onClose={() => setIncentiveForm(undefined)} />}
      {generate && <GeneratePayrollForm onClose={() => setGenerate(false)} />}
      {detailId && <PayrollDetail id={detailId} onClose={() => setDetailId(null)} />}
      <ConfirmDialog open={!!baseDelete} onClose={() => setBaseDelete(null)} onConfirm={() => baseDelete && baseMutations.remove.mutate(baseDelete.id, { onError: (e) => notifyApiError(e), onSuccess: () => setBaseDelete(null) })} title="Nonaktifkan Gapok" message={baseDelete ? `Nonaktifkan gapok ${showName(baseDelete.user)}?` : ''} />
      <ConfirmDialog open={!!incentiveDelete} onClose={() => setIncentiveDelete(null)} onConfirm={() => incentiveDelete && incentiveMutations.remove.mutate(incentiveDelete.id, { onError: (e) => notifyApiError(e), onSuccess: () => setIncentiveDelete(null) })} title="Batalkan Insentif" message={incentiveDelete ? `Batalkan insentif ${formatCurrency(incentiveDelete.amount)}?` : ''} />
    </div>
  );
};
