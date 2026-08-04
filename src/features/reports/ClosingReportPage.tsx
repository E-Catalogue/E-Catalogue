import { useMemo, useState } from 'react';
import { BarChart3, Download, ReceiptText } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { DateField } from '@/shared/components/ui/DateField';
import { SelectField } from '@/shared/components/ui/Field';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Pagination } from '@/shared/components/ui/Pagination';
import { RequirePermission } from '@/features/auth/permissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useLeadOrderFormLookup } from '@/features/crm/crm.hooks';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { notifyApiError } from '@/core/api/notify';
import { reportApi } from './report.api';
import { useClosingOrders, useClosingReport } from './report.hooks';
import type { ClosingFilters, ClosingMetric, ClosingOrder } from './report.types';

const monthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { dateFrom: iso(first), dateTo: iso(last) };
};

const METRICS: Array<{ key: ClosingMetric; field: keyof NonNullable<ReturnType<typeof useClosingReport>['data']>['summary']; label: string; tone?: string }> = [
  { key: 'APPLICATION', field: 'totalApplications', label: 'Total Aplikasi' },
  { key: 'SLIK_PASSED', field: 'slikPassed', label: 'Lolos SLIK', tone: 'text-accent-green' },
  { key: 'SLIK_REJECTED', field: 'slikRejected', label: 'Reject SLIK', tone: 'text-semantic-error' },
  { key: 'SURVEY_REJECTED', field: 'surveyRejected', label: 'Reject Survei', tone: 'text-semantic-error' },
  { key: 'APPROVED', field: 'approved', label: 'Approved', tone: 'text-accent-green' },
  { key: 'CANCELLED', field: 'cancelled', label: 'Batal', tone: 'text-semantic-error' },
  { key: 'DEAL', field: 'deals', label: 'Deal', tone: 'text-primary' },
  { key: 'DEAL_CASH', field: 'cashDeals', label: 'Deal Cash' },
  { key: 'DEAL_KREDIT', field: 'creditDeals', label: 'Deal Kredit' },
];

const ClosingReportPageInner = () => {
  const initial = useMemo(monthRange, []);
  const [filters, setFilters] = useState<ClosingFilters>(initial);
  const [metric, setMetric] = useState<ClosingMetric>('APPLICATION');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { branchKey, branchHeader } = useBranchScope();
  const report = useClosingReport(branchKey, filters, branchHeader);
  const details = useClosingOrders(branchKey, { ...filters, metric, page, limit: 15 }, branchHeader);
  const lookup = useLeadOrderFormLookup(branchKey, branchHeader);
  const data = report.data;

  const columns: Column<ClosingOrder>[] = [
    { header: 'No. Order', cell: (row) => <span className="font-bold text-ink">{row.nomorOrder}</span> },
    { header: 'Tanggal', cell: (row) => row.tanggalOrder ? formatDate(row.tanggalOrder) : '-' },
    { header: 'Customer', cell: (row) => row.lead?.nama ?? '-' },
    { header: 'Sales', cell: (row) => row.sales?.name ?? '-' },
    { header: 'Pembayaran', cell: (row) => row.paymentType ?? '-' },
    { header: 'Leasing', cell: (row) => row.leasing?.name ?? '-' },
    { header: 'Status', cell: (row) => row.status },
    { header: 'Harga', align: 'right', cell: (row) => formatCurrency(row.hargaFinal ?? 0) },
  ];

  const doExport = async () => {
    setExporting(true);
    try { await reportApi.exportClosing(filters, branchHeader); } catch (error) { notifyApiError(error); } finally { setExporting(false); }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-12">
      <PageHeader title="Laporan Closing" description="Funnel aplikasi, hasil kredit, penjualan per sales, leasing, dan refund" action={<Button icon={<Download size={16} />} onClick={doExport} disabled={exporting}>{exporting ? 'Menyiapkan...' : 'Export XLSX'}</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-2xl border border-border bg-surface">
        <DateField label="Dari" value={filters.dateFrom ?? ''} onChange={(dateFrom) => { setFilters((v) => ({ ...v, dateFrom })); setPage(1); }} />
        <DateField label="Sampai" value={filters.dateTo ?? ''} onChange={(dateTo) => { setFilters((v) => ({ ...v, dateTo })); setPage(1); }} />
        <SelectField label="Pembayaran" value={filters.paymentType ?? ''} onChange={(e) => setFilters((v) => ({ ...v, paymentType: (e.target.value || undefined) as ClosingFilters['paymentType'] }))} options={[{ value: '', label: 'Semua' }, { value: 'CASH', label: 'Cash' }, { value: 'KREDIT', label: 'Kredit' }]} />
        <SelectField label="Sales" value={filters.salesId ?? ''} onChange={(e) => setFilters((v) => ({ ...v, salesId: e.target.value || undefined }))} options={[{ value: '', label: 'Semua Sales' }, ...(lookup.data?.sales ?? []).map((row) => ({ value: row.id, label: row.name }))]} />
        <SelectField label="Leasing" value={filters.leasingId ?? ''} onChange={(e) => setFilters((v) => ({ ...v, leasingId: e.target.value || undefined }))} options={[{ value: '', label: 'Semua Leasing' }, ...(lookup.data?.leasings ?? []).map((row) => ({ value: row.id, label: row.name }))]} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-3">
        {METRICS.map((item) => <button key={item.key} onClick={() => { setMetric(item.key); setPage(1); }} className={`text-left rounded-2xl border p-4 bg-surface transition-colors ${metric === item.key ? 'border-primary ring-2 ring-primary-light' : 'border-border'}`}><p className="text-[10px] uppercase font-bold text-muted">{item.label}</p><p className={`text-2xl font-extrabold mt-1 ${item.tone ?? 'text-ink'}`}>{data?.summary[item.field] ?? 0}</p></button>)}
      </div>

      {(data?.legacy.slikWithoutTimestamp || data?.legacy.surveyWithoutTimestamp || data?.legacy.approvalWithoutTimestamp) ? <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-[12px] font-semibold text-accent-amber">Data lama tanpa tanggal milestone tidak dimasukkan ke metrik kejadian: SLIK {data.legacy.slikWithoutTimestamp}, survei {data.legacy.surveyWithoutTimestamp}, approval {data.legacy.approvalWithoutTimestamp}.</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Per Sales" icon={<BarChart3 size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={[{ header: 'Sales', cell: (r) => r.sales.name }, { header: 'Aplikasi', align: 'right', cell: (r) => r.totalApplications }, { header: 'Deal', align: 'right', cell: (r) => r.totalDeals }, { header: 'Cash', align: 'right', cell: (r) => r.cashDeals }, { header: 'Kredit', align: 'right', cell: (r) => r.creditDeals }]} data={data?.bySales ?? []} rowKey={(r) => r.sales.id} loading={report.isLoading} /></SectionCard>
        <SectionCard title="Per Leasing" icon={<ReceiptText size={16} />} bodyClassName="p-0 md:p-0"><DataTable columns={[{ header: 'Leasing', cell: (r) => r.leasing?.name ?? 'Belum dipilih' }, { header: 'Aplikasi Kredit', align: 'right', cell: (r) => r.totalApplications }]} data={data?.byLeasing ?? []} rowKey={(r) => r.leasing?.id ?? 'unassigned'} loading={report.isLoading} /></SectionCard>
      </div>

      <SectionCard title={`Detail ${METRICS.find((item) => item.key === metric)?.label ?? metric}`} bodyClassName="p-0 md:p-0"><DataTable columns={columns} data={details.data?.data ?? []} rowKey={(row) => row.id} loading={details.isLoading} error={details.isError} onRetry={() => details.refetch()} /><div className="p-4"><Pagination meta={details.data?.meta} page={page} onChange={setPage} /></div></SectionCard>
      <SectionCard title="Refund Penjualan" bodyClassName="p-0 md:p-0"><DataTable columns={[{ header: 'Kategori', cell: (r) => r.category }, { header: 'Arah Kas', cell: (r) => r.direction }, { header: 'Transaksi', align: 'right', cell: (r) => r.transactionCount }, { header: 'Order', align: 'right', cell: (r) => r.orderCount }, { header: 'Nominal', align: 'right', cell: (r) => formatCurrency(r.amount) }]} data={data?.refunds ?? []} rowKey={(r) => r.category} loading={report.isLoading} /></SectionCard>
    </div>
  );
};

export const ClosingReportPage = () => <RequirePermission code="CLOSING_REPORT_READ"><ClosingReportPageInner /></RequirePermission>;
