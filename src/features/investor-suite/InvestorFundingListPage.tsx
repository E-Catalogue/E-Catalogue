import { useState } from 'react';
import { HandCoins, Search } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { SelectField } from '@/shared/components/ui/Field';
import { Pagination } from '@/shared/components/ui/Pagination';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { useInvestorFundings } from './investor-suite.hooks';
import { FUNDING_SCHEME_LABEL, FUNDING_STATUS_LABEL, type InvestorFundingRow, type FundingAgreementStatus, type InvestorScheme } from './investor-suite.types';

const STATUS_CLS: Record<FundingAgreementStatus, string> = {
  DRAFT: 'bg-muted/10 text-muted',
  ACTIVE: 'bg-accent-green/10 text-accent-green',
  RELEASED: 'bg-accent-blue/10 text-accent-blue',
  ENDED: 'bg-semantic-error/10 text-semantic-error',
};

export const InvestorFundingListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [scheme, setScheme] = useState<'' | InvestorScheme>('');
  const [status, setStatus] = useState<'' | FundingAgreementStatus>('');
  const debounced = useDebouncedValue(search, 400);

  const { data, isLoading, isError } = useInvestorFundings({
    page, limit: 15, search: debounced || undefined, scheme: scheme || undefined, status: status || undefined,
  });
  const rows = data?.data ?? [];

  const columns: Column<InvestorFundingRow>[] = [
    {
      header: 'Unit',
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-bold text-ink text-[13px] truncate">{r.unit?.name || [r.unit?.merek?.name, r.unit?.tipe?.name].filter(Boolean).join(' ') || '—'}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5 truncate">{r.unit?.platNomor ?? '—'}</p>
        </div>
      ),
    },
    { header: 'Investor', cell: (r) => <div><p className="font-bold text-ink text-[12px]">{r.investor?.name ?? '—'}</p><p className="text-[11px] text-muted font-medium">{r.investor?.code ?? ''}</p></div> },
    { header: 'Skema', cell: (r) => <span className="text-[12px] font-semibold text-ink-soft">{r.scheme ? FUNDING_SCHEME_LABEL[r.scheme] : '—'}{r.scheme === 'FIXED_MONTHLY' && r.fixedReturnRate != null ? ` ${r.fixedReturnRate}%` : r.scheme === 'PROFIT_SHARE' && r.profitShareRate != null ? ` ${r.profitShareRate}%` : ''}</span> },
    { header: 'Modal', align: 'right', cell: (r) => <span className="font-bold text-ink text-[13px]">{formatCurrency(r.principalAmount, { compact: true })}</span> },
    { header: 'Jatuh Tempo', align: 'right', cell: (r) => <span className="text-[12px] font-semibold text-muted">{r.nextDueDate ? formatDate(r.nextDueDate) : '—'}</span> },
    { header: 'Cabang', cell: (r) => <span className="text-[12px] font-semibold text-muted">{r.branch?.nama ?? '—'}</span> },
    { header: 'Status', align: 'center', cell: (r) => <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${STATUS_CLS[r.status]}`}>{FUNDING_STATUS_LABEL[r.status]}</span> },
  ];

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Pendanaan Unit" description="Monitoring agreement pendanaan unit oleh investor. Perubahan pendanaan dilakukan dari detail unit." />

      <SectionCard title="Daftar Pendanaan" icon={<HandCoins size={16} />} bodyClassName="p-0 md:p-0">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 border-b border-divider">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari unit / plat / investor..."
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
          </div>
          <SelectField label="" wrapClass="w-40" value={scheme} onChange={(e) => { setScheme(e.target.value as InvestorScheme | ''); setPage(1); }}
            options={[{ value: '', label: 'Semua Skema' }, { value: 'FIXED_MONTHLY', label: 'Fixed Monthly' }, { value: 'PROFIT_SHARE', label: 'Profit Share' }]} />
          <SelectField label="" wrapClass="w-40" value={status} onChange={(e) => { setStatus(e.target.value as FundingAgreementStatus | ''); setPage(1); }}
            options={[{ value: '', label: 'Semua Status' }, { value: 'DRAFT', label: 'Draft' }, { value: 'ACTIVE', label: 'Aktif' }, { value: 'RELEASED', label: 'Lunas' }, { value: 'ENDED', label: 'Berakhir' }]} />
        </div>
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data pendanaan.</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={HandCoins} title="Belum ada pendanaan" description="Pendanaan unit oleh investor akan tampil di sini." />
        ) : (
          <>
            <DataTable columns={columns} data={rows} rowKey={(r) => r.id} />
            <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
          </>
        )}
      </SectionCard>
    </div>
  );
};
