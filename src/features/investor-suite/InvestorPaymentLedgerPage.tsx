import { useMemo, useState } from 'react';
import { Banknote, Undo2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { SelectField } from '@/shared/components/ui/Field';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { useInvestorPayments } from './investor-suite.hooks';
import type { InvestorPaymentRow } from './investor-suite.types';

type StatusFilter = '' | 'POSTED' | 'REVERSED';

export const InvestorPaymentLedgerPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading, isError } = useInvestorPayments({
    page, limit, status: status || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined,
  });
  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      (r.obligation?.investor?.name?.toLowerCase().includes(q)) ||
      (r.obligation?.investor?.code?.toLowerCase().includes(q)) ||
      (r.obligation?.type?.toLowerCase().includes(q)) ||
      (r.cashAccount?.name?.toLowerCase().includes(q)) ||
      (r.branch?.nama?.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const columns: Column<InvestorPaymentRow>[] = [
    { header: 'Tanggal', cell: (r) => <span className="text-[12px] font-semibold text-ink-soft">{formatDate(r.paidAt)}</span> },
    { header: 'Investor', cell: (r) => <div><p className="font-bold text-ink text-[12px]">{r.obligation?.investor?.name ?? '—'}</p><p className="text-[11px] text-muted font-medium">{r.obligation?.investor?.code ?? ''}</p></div> },
    { header: 'Kewajiban', cell: (r) => <span className="text-[12px] font-semibold text-muted">{r.obligation ? `${r.obligation.type} · ${r.obligation.cycleKey}` : '—'}</span> },
    { header: 'Akun Kas', cell: (r) => <span className="text-[12px] font-semibold text-muted">{r.cashAccount?.name ?? '—'}</span> },
    { header: 'Cabang', cell: (r) => <span className="text-[12px] font-semibold text-muted">{r.branch?.nama ?? '—'}</span> },
    {
      header: 'Nominal', align: 'right',
      cell: (r) => <span className={`font-bold text-[13px] ${r.postingStatus === 'REVERSED' ? 'text-semantic-error line-through' : 'text-accent-green'}`}>{formatCurrency(r.amount, { compact: true })}</span>,
    },
    {
      header: 'Status', align: 'center',
      cell: (r) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${r.postingStatus === 'REVERSED' ? 'bg-semantic-error/10 text-semantic-error' : 'bg-accent-green/10 text-accent-green'}`}>
          {r.postingStatus === 'REVERSED' && <Undo2 size={11} />}
          {r.postingStatus === 'REVERSED' ? (r.reversalOfId ? 'Reversal' : 'Dibalik') : 'Posted'}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Pembayaran Investor" description="Ledger seluruh pembayaran kewajiban investor (termasuk reversal). Aksi bayar/reversal dilakukan dari halaman Kewajiban Investor." />

      <SectionCard
        title="Ledger Pembayaran"
        icon={<Banknote size={16} />}
        bodyClassName="p-0 md:p-0"
        action={
          <div className="w-56">
            <SearchInput
              placeholder="Cari pembayaran..."
              value={search}
              onChange={setSearch}
            />
          </div>
        }
      >
        <div className="p-4 grid grid-cols-1 sm:grid-cols-[auto_auto_auto_1fr] gap-3 border-b border-divider">
          <SelectField label="Status" wrapClass="w-40" value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }}
            options={[{ value: '', label: 'Semua' }, { value: 'POSTED', label: 'Posted' }, { value: 'REVERSED', label: 'Reversed' }]} />
          <div><label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Dari</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-11 px-3 rounded-xl bg-surface border border-border text-[13px] font-semibold focus:outline-none focus:border-primary" /></div>
          <div><label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Sampai</label>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-11 px-3 rounded-xl bg-surface border border-border text-[13px] font-semibold focus:outline-none focus:border-primary" /></div>
        </div>
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat ledger pembayaran.</div>
        ) : filteredRows.length === 0 ? (
          <EmptyState icon={Banknote} title="Belum ada pembayaran" description="Pembayaran kewajiban investor akan tampil di sini." />
        ) : (
          <>
            <DataTable columns={columns} data={filteredRows} rowKey={(r) => r.id} />
            <div className="px-4 pb-4">
              <Pagination
                meta={data?.meta}
                page={page}
                onChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                itemLabel="pembayaran"
              />
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
};
