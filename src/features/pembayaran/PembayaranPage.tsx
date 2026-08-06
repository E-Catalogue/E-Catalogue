import { useState } from 'react';
import {
  Wallet, AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { SelectField } from '@/shared/components/ui/Field';
import { RequirePermission } from '@/features/auth/permissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { OrderDetailModal } from '@/features/penjualan/OrderDetailModal';
import { useLeadOrders } from '@/features/crm/crm.hooks';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type LeadOrder } from '@/features/crm/crm.types';

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const PAID_OPTIONS = [
  { value: '', label: 'Semua Status Bayar' },
  { value: 'false', label: 'Belum Lunas' },
  { value: 'true', label: 'Lunas' },
];

const SummaryCard = ({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) => (
  <div className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${icon}`}>
      <Wallet size={18} />
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
    </div>
  </div>
);

export const PembayaranPage = () => {
  const { isOwner, selectedBranchId, branchHeader, branchKey } = useBranchScope();
  const mutationBlocked = isOwner && !selectedBranchId;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [filterPaid, setFilterPaid] = useState('');
  const debounced = useDebouncedValue(search, 350);

  const { data, isLoading, isError, refetch } = useLeadOrders(branchKey, {
    page,
    limit,
    search: debounced || undefined,
    isPaid: filterPaid === '' ? undefined : filterPaid === 'true',
  }, branchHeader);

  const [detail, setDetail] = useState<string | null>(null);
  const orders = data?.data ?? [];

  const totalTerbayar = orders.reduce((s, o) => s + (o.totalPaid ?? 0), 0);
  const totalSisa = orders.reduce((s, o) => s + (o.remainingPayment ?? 0), 0);
  const lunas = orders.filter((o) => o.isPaid).length;

  const columns: Column<LeadOrder>[] = [
    {
      header: 'No. Order',
      cell: (r) => <span className="font-bold text-ink text-[13px]">{r.nomorOrder ?? '-'}</span>,
    },
    {
      header: 'Customer',
      cell: (r) => (
        <div>
          <p className="font-semibold text-ink text-[13px]">{r.lead?.nama ?? '-'}</p>
          {r.unit && (
            <p className="text-[11px] text-muted">{[r.unit.merek?.name, r.unit.tipe?.name].filter(Boolean).join(' ')}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Status Order',
      align: 'center',
      cell: (r) => (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${ORDER_STATUS_COLOR[r.status]}`}>
          {ORDER_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      header: 'Harga Final',
      align: 'right',
      cell: (r) => <span className="font-semibold text-ink">{idr(r.hargaFinal)}</span>,
    },
    {
      header: 'Terbayar',
      align: 'right',
      cell: (r) => <span className="font-semibold text-accent-green">{idr(r.totalPaid)}</span>,
    },
    {
      header: 'Sisa',
      align: 'right',
      cell: (r) => <span className="font-semibold text-semantic-error">{idr(r.remainingPayment)}</span>,
    },
    {
      header: 'Status Bayar',
      align: 'center',
      cell: (r) => (
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${r.isPaid ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'}`}>
          {r.isPaid ? 'Lunas' : 'Belum Lunas'}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (r) => <RowActions onView={() => setDetail(r.id)} />,
    },
  ];

  return (
    <RequirePermission code="LEAD_PAYMENT_READ">
      <div className="max-w-[1600px] mx-auto space-y-5">
        <PageHeader
          title="Pembayaran"
          description="Riwayat pembayaran per sales order"
        />

        {mutationBlocked && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 text-[12px] font-semibold text-accent-amber">
            <AlertTriangle size={16} className="shrink-0" />
            Pilih cabang aktif di header (pojok kanan atas) untuk mencatat pembayaran atau reversal.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Total Terbayar (halaman ini)" value={idr(totalTerbayar)} color="text-accent-green" icon="text-white bg-accent-green" />
          <SummaryCard label="Total Sisa Tagihan" value={idr(totalSisa)} color="text-semantic-error" icon="text-white bg-semantic-error" />
          <SummaryCard label="Sudah Lunas" value={`${lunas} dari ${orders.length} order`} color="text-ink" icon="text-white bg-primary" />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px] max-w-xs">
            <SearchInput
              value={search}
              onChange={(val) => { setSearch(val); setPage(1); }}
              placeholder="Cari no. order / customer..."
            />
          </div>
          <SelectField
            label=""
            value={filterPaid}
            onChange={(e) => { setFilterPaid(e.target.value); setPage(1); }}
            options={PAID_OPTIONS}
            wrapClass="min-w-[180px]"
          />
        </div>

        <SectionCard title={`Riwayat Pembayaran (${data?.meta?.total ?? 0})`} icon={<Wallet size={16} />} bodyClassName="p-0 md:p-0">
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : isError ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada data pembayaran.</div>
          ) : (
            <>
              <DataTable columns={columns} data={orders} rowKey={(r) => r.id} error={isError} onRetry={() => refetch()} />
              <div className="p-4">
                <Pagination
                  meta={data?.meta}
                  page={page}
                  onChange={setPage}
                  limit={limit}
                  onLimitChange={(l) => { setLimit(l); setPage(1); }}
                  itemLabel="pembayaran"
                />
              </div>
            </>
          )}
        </SectionCard>

        <OrderDetailModal
          open={!!detail}
          onClose={() => setDetail(null)}
          orderId={detail}
          branchKey={branchKey}
          branchHeader={branchHeader}
          mutationBlocked={mutationBlocked}
        />
      </div>
    </RequirePermission>
  );
};
