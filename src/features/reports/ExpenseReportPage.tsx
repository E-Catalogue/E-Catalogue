import { useMemo, useState } from 'react';
import { Download, ReceiptText } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { MonthField } from '@/shared/components/ui/MonthField';
import { SelectField } from '@/shared/components/ui/Field';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { RequirePermission } from '@/features/auth/permissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { notifyApiError } from '@/core/api/notify';
import { reportApi } from './report.api';
import { useExpenseDetails, useExpenseReport } from './report.hooks';
import type { ExpenseDetailRow, ExpenseFilters } from './report.types';

const currentPeriod = () => new Date().toISOString().slice(0, 7);
const expenseTypeLabel: Record<string, string> = {
  RECURRING: 'Rutin',
  NON_RECURRING: 'Non-Rutin',
  RECONDITIONING: 'Rekondisi',
  PAYROLL: 'Payroll',
  REFUND: 'Refund',
};

const ExpenseReportPageInner = () => {
  const [filters, setFilters] = useState<ExpenseFilters>({ period: currentPeriod(), status: 'ALL' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const { branchKey, branchHeader } = useBranchScope();
  const report = useExpenseReport(branchKey, filters, branchHeader);
  const details = useExpenseDetails(branchKey, { ...filters, page, limit }, branchHeader);
  const s = report.data?.summary;
  const legacyNotes = [
    report.data?.legacy.completedReconditioningWithoutTimestamp ? `rekondisi tanpa tanggal selesai ${report.data.legacy.completedReconditioningWithoutTimestamp}` : null,
  ].filter(Boolean);

  const cards = [
    ['Beban Periode', s?.totalExpense ?? 0], ['Kas Keluar Aktual', s?.totalCashOut ?? 0],
    ['Rutin Generated', s?.recurringGenerated ?? 0], ['Rutin Dibayar', s?.recurringPaid ?? 0],
    ['Rutin Belum Dibayar', s?.recurringUnpaid ?? 0], ['Operasional Non-Rutin', s?.nonRecurringExpense ?? 0],
    ['Operasional Belum Dibayar', s?.operationalUnpaid ?? 0], ['Payroll Dibayar', s?.payrollPaid ?? 0],
    ['Payroll Belum Dibayar', s?.payrollUnpaid ?? 0], ['Gaji Dibayar', s?.payrollSalaryPaid ?? 0],
    ['Gaji Belum Dibayar', s?.payrollSalaryUnpaid ?? 0], ['Insentif Dibayar', s?.payrollIncentivePaid ?? 0],
    ['Insentif Belum Dibayar', s?.payrollIncentiveUnpaid ?? 0], ['Rekondisi Tambahan', s?.additionalReconditioningExpense ?? 0],
    ['Rekondisi Awal (HPP)', s?.initialReconditioningCapitalized ?? 0], ['Refund Keluar', s?.refundCashOut ?? 0],
  ] as const;

  const rawExpenses = details.data?.data ?? [];
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return rawExpenses;
    const q = searchQuery.toLowerCase();
    return rawExpenses.filter((row) => {
      const typeStr = expenseTypeLabel[row.type] ?? row.type;
      return (
        row.title?.toLowerCase().includes(q) ||
        row.category?.toLowerCase().includes(q) ||
        typeStr?.toLowerCase().includes(q) ||
        row.status?.toLowerCase().includes(q)
      );
    });
  }, [rawExpenses, searchQuery]);

  const columns: Column<ExpenseDetailRow>[] = [
    { header: 'Tanggal', cell: (row) => formatDate(row.date) },
    { header: 'Tipe', cell: (row) => <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-surface-soft border border-border">{expenseTypeLabel[row.type] ?? row.type}</span> },
    { header: 'Keterangan', cell: (row) => <span className="font-bold text-ink">{row.title}</span> },
    { header: 'Kategori', cell: (row) => row.category ?? '-' },
    { header: 'Status', cell: (row) => <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-surface-soft border border-border">{row.status}</span> },
    { header: 'Nominal', align: 'right', cell: (row) => <span className="font-bold text-ink">{formatCurrency(row.amount)}</span> },
  ];

  const doExport = async () => {
    setExporting(true);
    try {
      await reportApi.exportExpenses(filters, branchHeader);
    } catch (error) {
      notifyApiError(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-12">
      <PageHeader
        title="Laporan Pengeluaran"
        description="Beban periode, kas keluar, rutin, payroll, rekondisi, dan refund"
        action={<Button icon={<Download size={16} />} onClick={doExport} disabled={exporting}>{exporting ? 'Menyiapkan...' : 'Export XLSX'}</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-border bg-surface">
        <MonthField label="Periode" value={filters.period} onChange={(period) => { setFilters((v) => ({ ...v, period: period || currentPeriod() })); setPage(1); }} />
        <SelectField label="Jenis" value={filters.type ?? ''} onChange={(e) => { setFilters((v) => ({ ...v, type: (e.target.value || undefined) as ExpenseFilters['type'] })); setPage(1); }} options={[{ value: '', label: 'Semua Jenis' }, { value: 'RECURRING', label: 'Rutin' }, { value: 'NON_RECURRING', label: 'Non-Rutin' }, { value: 'PAYROLL', label: 'Payroll' }, { value: 'RECONDITIONING', label: 'Rekondisi' }, { value: 'REFUND', label: 'Refund' }]} />
        <SelectField label="Status" value={filters.status ?? 'ALL'} onChange={(e) => { setFilters((v) => ({ ...v, status: e.target.value as ExpenseFilters['status'] })); setPage(1); }} options={[{ value: 'ALL', label: 'Semua Status' }, { value: 'DRAFT', label: 'Belum Dibayar' }, { value: 'PAID', label: 'Sudah Dibayar' }]} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[10px] uppercase font-bold text-muted">{label}</p>
            <p className="text-xl font-extrabold text-ink mt-1">{formatCurrency(value, { compact: true })}</p>
          </div>
        ))}
      </div>

      {legacyNotes.length ? (
        <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-[12px] font-semibold text-accent-amber">
          Data legacy di luar metrik bertanggal: {legacyNotes.join(', ')}.
        </div>
      ) : null}

      <SectionCard
        title="Detail Pengeluaran"
        icon={<ReceiptText size={16} />}
        bodyClassName="p-0 md:p-0"
        action={
          <div className="w-64">
            <SearchInput
              size="sm"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari keterangan, kategori..."
            />
          </div>
        }
      >
        {details.isLoading ? (
          <div className="p-4"><DataTable columns={columns} data={[]} rowKey={(row) => `${row.type}-${row.id}`} loading={true} /></div>
        ) : rawExpenses.length === 0 ? (
          <EmptyState
            title="Tidak ada data pengeluaran"
            description="Tidak ada pengeluaran yang sesuai pada rentang filter saat ini."
          />
        ) : filteredExpenses.length === 0 ? (
          <EmptyState
            title="Tidak ada hasil pencarian"
            description={`Tidak ditemukan pengeluaran dengan kata kunci "${searchQuery}".`}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredExpenses}
              rowKey={(row) => `${row.type}-${row.id}`}
              loading={details.isLoading}
              error={details.isError}
              onRetry={() => details.refetch()}
            />
            <div className="p-4">
              <Pagination
                meta={details.data?.meta}
                page={page}
                onChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                itemLabel="pengeluaran"
              />
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Refund Penjualan" bodyClassName="p-0 md:p-0">
        <DataTable
          columns={[
            { header: 'Kategori', cell: (r) => <span className="font-bold text-ink">{r.category}</span> },
            { header: 'Arah Kas', cell: (r) => r.direction },
            { header: 'Transaksi', align: 'right', cell: (r) => r.transactionCount },
            { header: 'Order', align: 'right', cell: (r) => r.orderCount },
            { header: 'Nominal', align: 'right', cell: (r) => <span className="font-bold text-primary">{formatCurrency(r.amount)}</span> },
          ]}
          data={report.data?.refunds ?? []}
          rowKey={(r) => r.category}
          loading={report.isLoading}
        />
      </SectionCard>
    </div>
  );
};

export const ExpenseReportPage = () => <RequirePermission code="EXPENSE_REPORT_READ"><ExpenseReportPageInner /></RequirePermission>;
