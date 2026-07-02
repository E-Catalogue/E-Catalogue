import { useState } from 'react';
import { Plus, Search, Loader2, ReceiptText, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SelectField } from '@/shared/components/ui/Field';
import { SalesOrderFormModal } from './SalesOrderFormModal';
import { OrderDetailModal } from './OrderDetailModal';
import { OrderStatusModal } from './OrderStatusModal';
import { useLeadOrders, useLeadOrderMutations } from '@/features/crm/crm.hooks';
import { notifyApiError } from '@/core/api/notify';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type LeadOrder, type OrderStatus } from '@/features/crm/crm.types';

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Semua Status' },
  ...Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => ({ value: k, label: v })),
];

export const PenjualanPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const debounced = useDebouncedValue(search, 350);

  const { data, isLoading, isError } = useLeadOrders({
    page, limit: 15,
    search: debounced || undefined,
    status: (filterStatus as OrderStatus) || undefined,
  });
  const m = useLeadOrderMutations();

  const [form, setForm] = useState<{ item: LeadOrder | null } | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<LeadOrder | null>(null);

  const orders = data?.data ?? [];

  const handleSubmit = (values: Partial<LeadOrder>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values as never, opts);
  };

  const columns: Column<LeadOrder>[] = [
    {
      header: 'No. Order',
      cell: (r) => <span className="font-bold text-ink text-[13px]">{r.nomorOrder ?? '-'}</span>,
    },
    {
      header: 'Customer',
      cell: (r) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{r.lead?.nama ?? '-'}</p>
          {r.lead?.noHp && <p className="text-[11px] text-muted">{r.lead.noHp}</p>}
        </div>
      ),
    },
    {
      header: 'Unit',
      cell: (r) => {
        const u = r.unit;
        return <span className="text-[12px] font-medium text-ink-soft">{u ? [u.merek?.name, u.tipe?.name, u.platNomor].filter(Boolean).join(' ') : '-'}</span>;
      },
    },
    { header: 'Tipe', cell: (r) => <span className="text-[12px] font-semibold">{r.paymentType}</span>, align: 'center' },
    {
      header: 'Status',
      align: 'center',
      cell: (r) => (
        <button
          onClick={() => setStatusModal(r)}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70 ${ORDER_STATUS_COLOR[r.status]}`}
          title="Klik untuk ubah status"
        >
          {ORDER_STATUS_LABEL[r.status]}
        </button>
      ),
    },
    {
      header: 'Harga Final',
      align: 'right',
      cell: (r) => <span className="font-bold text-ink text-[13px]">{idr(r.hargaFinal)}</span>,
    },
    {
      header: 'Bayar',
      align: 'center',
      cell: (r) => (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {r.isPaid ? 'Lunas' : 'Belum'}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (r) => (
        <RowActions
          onView={() => setDetail(r.id)}
          onEdit={() => setForm({ item: r })}
          extra={[{ label: 'Ubah Status', icon: <RefreshCw size={13} />, onClick: () => setStatusModal(r) }]}
        />
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto  space-y-5">
      <PageHeader
        title="Penjualan"
        description="Sales order & manajemen transaksi"
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Buat Order</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari no. order / customer..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <SelectField
          label=""
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          options={STATUS_FILTER_OPTIONS}
          wrapClass="min-w-[180px]"
        />
      </div>

      <SectionCard title={`Daftar Order (${data?.meta?.total ?? 0})`} icon={<ReceiptText size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada order.</div>
        ) : (
          <>
            <DataTable columns={columns} data={orders} rowKey={(r) => r.id} />
            <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
          </>
        )}
      </SectionCard>

      <SalesOrderFormModal
        open={!!form}
        onClose={() => setForm(null)}
        item={form?.item}
        submitting={m.create.isPending || m.update.isPending}
        onSubmit={handleSubmit}
      />

      <OrderDetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        orderId={detail}
        onEdit={() => {
          const o = orders.find((r) => r.id === detail);
          if (o) { setForm({ item: o }); setDetail(null); }
        }}
      />

      <OrderStatusModal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        order={statusModal}
        submitting={m.updateStatus.isPending}
        onSubmit={(status) =>
          statusModal &&
          m.updateStatus.mutate(
            { id: statusModal.id, status },
            { onError: (e) => notifyApiError(e), onSuccess: () => setStatusModal(null) },
          )
        }
      />
    </div>
  );
};
