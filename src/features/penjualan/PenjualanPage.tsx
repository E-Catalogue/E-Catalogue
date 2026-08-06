import { useState } from 'react';
import {
  Plus, ReceiptText, RefreshCw, AlertTriangle, ClipboardCheck,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { SelectField } from '@/shared/components/ui/Field';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { SalesOrderFormModal } from './SalesOrderFormModal';
import { OrderDetailModal } from './OrderDetailModal';
import { OrderStatusModal } from './OrderStatusModal';
import { CreditStageModal } from './CreditStageModal';
import { DateField } from '@/shared/components/ui/DateField';
import { useLeadOrders, useLeadOrderMutations, useLeadOrderFormLookup } from '@/features/crm/crm.hooks';
import { PendingDealFinalizationNotice } from '@/features/crm/PendingDealFinalizationNotice';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { useAppSelector } from '@/app/store';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type LeadOrder, type OrderStatus } from '@/features/crm/crm.types';
import { unitDisplayName } from '@/features/units/unit.display';

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Semua Status' },
  ...Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => ({ value: k, label: v })),
];

export const PenjualanPage = () => {
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const roleCode = useAppSelector((s) => s.auth.user?.role?.code);
  const isSales = roleCode === 'SALES';
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, branchHeader, branchKey } = useBranchScope();
  const mutationBlocked = isOwner && !selectedBranchId;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSales, setFilterSales] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [statusSlik, setStatusSlik] = useState('');
  const [surveyStatus, setSurveyStatus] = useState('');
  const [statusApproval, setStatusApproval] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debounced = useDebouncedValue(search, 350);

  const { data, isLoading, isError, refetch } = useLeadOrders(branchKey, {
    page,
    limit,
    search: debounced || undefined,
    status: (filterStatus as OrderStatus) || undefined,
    salesId: isSales ? undefined : filterSales || undefined,
    paymentType: paymentType || undefined,
    statusSlik: statusSlik || undefined,
    surveyStatus: surveyStatus || undefined,
    statusApproval: statusApproval || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }, branchHeader);
  const { data: lookup } = useLeadOrderFormLookup(branchKey, branchHeader);
  const m = useLeadOrderMutations(branchKey);

  const [form, setForm] = useState<{ item: LeadOrder | null } | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<LeadOrder | null>(null);
  const [creditModal, setCreditModal] = useState<LeadOrder | null>(null);

  const orders = data?.data ?? [];
  const salesFilterOptions = [
    { value: '', label: 'Semua Sales' },
    ...(lookup?.sales ?? []).map((s) => ({ value: s.id, label: s.name })),
  ];

  const handleSubmit = (values: Partial<LeadOrder>) => {
    if (form?.item) m.update.mutate({ id: form.item.id, body: values, headers: branchHeader }, { onSuccess: () => setForm(null) });
    else m.create.mutate({ body: values as never, headers: branchHeader }, { onSuccess: () => setForm(null) });
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
        if (!u) return <span className="text-[12px] font-medium text-ink-soft">-</span>;
        return (
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink-soft truncate" title={unitDisplayName(u)}>{unitDisplayName(u)}</p>
            <p className="text-[11px] text-muted truncate">{[u.merek?.name, u.tipe?.name].filter(Boolean).join(' ')} · {u.platNomor}</p>
          </div>
        );
      },
    },
    {
      header: 'Sales',
      cell: (r) => <span className="text-[12px] font-semibold text-ink-soft">{r.sales?.name ?? '-'}</span>,
    },
    { header: 'Tipe', cell: (r) => <span className="text-[12px] font-semibold">{r.paymentType}</span>, align: 'center' },
    {
      header: 'Status',
      align: 'center',
      cell: (r) => (
        r.status === 'BOOKING' ? (
          <button
            onClick={() => setStatusModal(r)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70 ${ORDER_STATUS_COLOR[r.status]}`}
            title="Klik untuk proses DEAL / batalkan"
          >
            {ORDER_STATUS_LABEL[r.status]}
          </button>
        ) : (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${ORDER_STATUS_COLOR[r.status]}`}>
            {ORDER_STATUS_LABEL[r.status]}
          </span>
        )
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
          onEdit={r.status === 'BOOKING' && can('LEAD_ORDER_UPDATE') ? () => setForm({ item: r }) : undefined}
          extra={r.status === 'BOOKING' && can('LEAD_ORDER_UPDATE') ? [
            ...(r.paymentType === 'KREDIT' ? [{ label: 'Proses Kredit', icon: <ClipboardCheck size={13} />, onClick: () => setCreditModal(r) }] : []),
            { label: 'Ubah Status', icon: <RefreshCw size={13} />, onClick: () => setStatusModal(r) },
          ] : []}
        />
      ),
    },
  ];

  return (
    <RequirePermission code="LEAD_ORDER_READ">
      <div className="max-w-[1600px] mx-auto space-y-5">
        <PageHeader
          title={isSales ? 'Penjualan Saya' : 'Penjualan'}
          description={isSales ? 'Riwayat aplikasi dan penjualan milik Anda' : 'Sales order & manajemen transaksi'}
          action={can('LEAD_ORDER_CREATE') && (
            <Button
              icon={<Plus size={17} strokeWidth={2.5} />}
              onClick={() => setForm({ item: null })}
              disabled={mutationBlocked}
              title={mutationBlocked ? 'Pilih cabang terlebih dahulu untuk membuat order' : undefined}
            >
              Buat Order
            </Button>
          )}
        />

        <PendingDealFinalizationNotice branchKey={branchKey} headers={branchHeader} />

        {mutationBlocked && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 text-[12px] font-semibold text-accent-amber">
            <AlertTriangle size={16} className="shrink-0" />
            Pilih cabang aktif di header (pojok kanan atas) untuk membuat order, mengubah status, atau mencatat pembayaran.
          </div>
        )}

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
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            options={STATUS_FILTER_OPTIONS}
            wrapClass="min-w-[180px]"
          />
          <SelectField label="" value={paymentType} onChange={(e) => { setPaymentType(e.target.value); setPage(1); }} options={[{ value: '', label: 'Cash & Kredit' }, { value: 'CASH', label: 'Cash' }, { value: 'KREDIT', label: 'Kredit' }]} wrapClass="min-w-[150px]" />
          <SelectField label="" value={statusSlik} onChange={(e) => { setStatusSlik(e.target.value); setPage(1); }} options={[{ value: '', label: 'Semua SLIK' }, { value: 'BI_CHECKING', label: 'BI Checking' }, { value: 'LOLOS', label: 'SLIK Lolos' }, { value: 'REJECT', label: 'SLIK Reject' }]} wrapClass="min-w-[150px]" />
          <SelectField label="" value={surveyStatus} onChange={(e) => { setSurveyStatus(e.target.value); setPage(1); }} options={[{ value: '', label: 'Semua Survei' }, { value: 'PENDING', label: 'Survei Pending' }, { value: 'SCHEDULED', label: 'Survei Terjadwal' }, { value: 'PASSED', label: 'Survei Lolos' }, { value: 'REJECTED', label: 'Survei Reject' }]} wrapClass="min-w-[160px]" />
          <SelectField label="" value={statusApproval} onChange={(e) => { setStatusApproval(e.target.value); setPage(1); }} options={[{ value: '', label: 'Semua Approval' }, { value: 'PENDING', label: 'Approval Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Approval Reject' }]} wrapClass="min-w-[160px]" />
          <DateField value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} placeholder="Dari tanggal" clearable wrapClass="w-40" />
          <DateField value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} placeholder="Sampai tanggal" clearable wrapClass="w-40" />
          {!isSales && <SelectField
            label=""
            value={filterSales}
            onChange={(e) => { setFilterSales(e.target.value); setPage(1); }}
            options={salesFilterOptions}
            wrapClass="min-w-[180px]"
          />}
        </div>

        <SectionCard title={`Daftar Order (${data?.meta?.total ?? 0})`} icon={<ReceiptText size={16} />} bodyClassName="p-0 md:p-0">
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : isError ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada order.</div>
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
                  itemLabel="order"
                />
              </div>
            </>
          )}
        </SectionCard>

        <SalesOrderFormModal
          open={!!form}
          onClose={() => setForm(null)}
          item={form?.item}
          submitting={m.create.isPending || m.update.isPending}
          currentUserId={currentUserId}
          branchKey={branchKey}
          branchHeader={branchHeader}
          onSubmit={handleSubmit}
        />

        <OrderDetailModal
          open={!!detail}
          onClose={() => setDetail(null)}
          orderId={detail}
          branchKey={branchKey}
          branchHeader={branchHeader}
          mutationBlocked={mutationBlocked}
          onEdit={can('LEAD_ORDER_UPDATE') ? () => {
            const o = orders.find((r) => r.id === detail);
            if (o && o.status === 'BOOKING') { setForm({ item: o }); setDetail(null); }
          } : undefined}
        />

        <OrderStatusModal
          open={!!statusModal}
          onClose={() => setStatusModal(null)}
          order={statusModal}
          submitting={m.updateStatus.isPending}
          onSubmit={(status, cancellation) => {
            if (!statusModal) return Promise.reject(new Error('Order tidak ditemukan'));
            return m.updateStatus.mutateAsync({
              id: statusModal.id,
              status,
              cancellation,
              headers: statusModal.branchId ? { 'X-Branch-Id': statusModal.branchId } : branchHeader,
            });
          }}
        />
        <CreditStageModal
          open={!!creditModal}
          onClose={() => setCreditModal(null)}
          order={creditModal}
          submitting={m.updateCreditStage.isPending}
          onSubmit={(body) => creditModal && m.updateCreditStage.mutate(
            { id: creditModal.id, body, headers: creditModal.branchId ? { 'X-Branch-Id': creditModal.branchId } : branchHeader },
            { onSuccess: () => setCreditModal(null) },
          )}
        />
      </div>
    </RequirePermission>
  );
};
