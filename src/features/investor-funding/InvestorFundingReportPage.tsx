import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, HandCoins, Landmark } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { SelectField } from '@/shared/components/ui/Field';
import { DateField } from '@/shared/components/ui/DateField';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { RequirePermission } from '@/features/auth/permissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useInvestors } from '@/features/master/master.hooks';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { useInvestorFundingReport } from './investorFunding.hooks';
import { FUNDING_USAGE_MODE_LABEL, type FundingUsageResourceType, type InvestorFundingUsage } from './investorFunding.types';

const Summary = ({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) => (
  <div className={`rounded-2xl border p-4 ${accent ? 'border-primary/30 bg-primary-light' : 'border-border bg-surface'}`}>
    <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
    <p className={`mt-1 text-lg font-extrabold ${accent ? 'text-primary' : 'text-ink'}`}>{formatCurrency(value)}</p>
  </div>
);

const FundingReportInner = () => {
  const { branchKey, branchHeader } = useBranchScope();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [investorId, setInvestorId] = useState('');
  const [resourceType, setResourceType] = useState<FundingUsageResourceType | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data: investorsRes } = useInvestors({ page: 1, limit: 100 });
  const params = { page, limit, resourceType: resourceType || undefined, from: from || undefined, to: to || undefined };
  const report = useInvestorFundingReport(params, branchKey, branchHeader, investorId || undefined);
  const rows = report.data?.data ?? [];
  const summary = report.data?.summary;

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      (row.capitalAccount?.investor?.name?.toLowerCase().includes(q)) ||
      (row.capitalAccount?.investor?.code?.toLowerCase().includes(q)) ||
      (row.description?.toLowerCase().includes(q)) ||
      (row.rekondisiId?.toLowerCase().includes(q)) ||
      (row.unitId?.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const columns: Column<InvestorFundingUsage>[] = [
    { header: 'Tanggal', cell: (row) => formatDate(row.businessDate) },
    { header: 'Investor', cell: (row) => <div><p className="text-[12px] font-bold text-ink">{row.capitalAccount.investor.name}</p><p className="text-[10px] font-semibold text-muted">{row.capitalAccount.investor.code}</p></div> },
    { header: 'Biaya Asal', cell: (row) => <div><p className="text-[12px] font-bold text-ink">{row.resourceType === 'REKONDISI' ? 'Rekondisi' : 'Pembelian Unit'}</p><p className="text-[10px] font-medium text-muted">{row.rekondisiId ?? row.unitId}</p></div> },
    { header: 'Mode', cell: (row) => <span className="rounded-lg bg-primary-light px-2 py-1 text-[10px] font-bold text-primary">{FUNDING_USAGE_MODE_LABEL[row.mode]}</span> },
    { header: 'Nominal', align: 'right', cell: (row) => <span className="text-[12px] font-extrabold text-primary">{formatCurrency(row.amount)}</span> },
    { header: 'Keterangan', cell: (row) => <span className="text-[11px] font-medium text-muted">{row.description || '-'}</span> },
    { header: 'Referensi', cell: (row) => <span className="text-[9px] font-medium text-muted">{row.allocationCapitalTransactionId}{row.depositCapitalTransactionId ? ` / ${row.depositCapitalTransactionId}` : ''}</span> },
  ];

  return (
    <div className="max-w-[1500px] mx-auto space-y-5">
      <PageHeader
        title="Penggunaan Dana Investor"
        description="Jejak alokasi modal ke pembelian unit dan biaya rekondisi"
        action={(
          <Link to="/master/investor">
            <Button variant="secondary" icon={<ArrowLeft size={15} />}>Kembali</Button>
          </Link>
        )}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Summary label="Total Alokasi" value={summary?.allocatedAmount ?? 0} accent />
        <Summary label="Saldo Modal Tersedia" value={summary?.availableBalance ?? 0} />
        <Summary label="Saldo Modal Teralokasi" value={summary?.allocatedBalance ?? 0} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchableSelect label="Investor" value={investorId} onChange={(value) => { setInvestorId(value); setPage(1); }} clearable
          options={(investorsRes?.data ?? []).map((investor) => ({ value: investor.id, label: `${investor.code} — ${investor.name}` }))} placeholder="Semua investor" />
        <SelectField label="Jenis Biaya" value={resourceType} onChange={(event) => { setResourceType(event.target.value as FundingUsageResourceType | ''); setPage(1); }}
          options={[{ value: '', label: 'Semua jenis biaya' }, { value: 'UNIT_PURCHASE', label: 'Pembelian Unit' }, { value: 'REKONDISI', label: 'Rekondisi' }]} />
        <DateField label="Dari Tanggal" value={from} onChange={(value) => { setFrom(value); setPage(1); }} />
        <DateField label="Sampai Tanggal" value={to} onChange={(value) => { setTo(value); setPage(1); }} />
      </div>
      <SectionCard
        title={`Riwayat Alokasi (${report.data?.meta.total ?? 0})`}
        icon={<Landmark size={16} />}
        bodyClassName="p-0 md:p-0"
        action={
          <div className="w-56">
            <SearchInput
              placeholder="Cari alokasi..."
              value={search}
              onChange={setSearch}
            />
          </div>
        }
      >
        <DataTable columns={columns} data={filteredRows} rowKey={(row) => row.id} loading={report.isLoading} refreshing={report.isFetching && !report.isLoading}
          error={report.isError} onRetry={() => report.refetch()} emptyState={{ icon: HandCoins, title: 'Belum ada penggunaan dana', description: 'Alokasi modal investor akan muncul di sini setelah dicatat pada Unit atau Rekondisi.' }} />
        {rows.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination
              meta={report.data?.meta}
              page={page}
              onChange={setPage}
              limit={limit}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
              itemLabel="alokasi"
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export const InvestorFundingReportPage = () => <RequirePermission code="INVESTOR_CAPITAL_READ"><FundingReportInner /></RequirePermission>;
