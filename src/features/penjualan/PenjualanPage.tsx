import { useState } from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailModal } from '@/shared/components/ui/DetailModal';
import { SaleFormModal } from './SaleFormModal';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { removeSale } from '@/app/store/dataSlice';
import { formatCurrency, formatDate } from '@/core/utils/format';
import type { Sale } from '@/data/types';

export const PenjualanPage = () => {
  const data = useAppSelector((s) => s.data.sales);
  const dispatch = useAppDispatch();
  const total = data.reduce((acc, s) => acc + s.total, 0);

  const [form, setForm] = useState<{ item: Sale | null } | null>(null);
  const [detail, setDetail] = useState<Sale | null>(null);
  const [toDelete, setToDelete] = useState<Sale | null>(null);

  const columns: Column<Sale>[] = [
    { header: 'Invoice', cell: (s) => <span className="font-bold text-ink">{s.invoice}</span> },
    { header: 'Pelanggan', cell: (s) => s.customer },
    { header: 'Unit', cell: (s) => s.unit },
    { header: 'Tanggal', cell: (s) => formatDate(s.date) },
    { header: 'Bayar', cell: (s) => s.paymentType, align: 'center' },
    { header: 'Total', cell: (s) => <span className="font-bold text-ink">{formatCurrency(s.total)}</span>, align: 'right' },
    { header: 'Status', cell: (s) => <StatusBadge status={s.status} />, align: 'center' },
    { header: '', align: 'right', cell: (s) => <RowActions onView={() => setDetail(s)} onEdit={() => setForm({ item: s })} onDelete={() => setToDelete(s)} /> },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Penjualan"
        description={`${data.length} transaksi • total ${formatCurrency(total, { compact: true })}`}
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Buat Penjualan</Button>}
      />
      <SectionCard title="Transaksi Penjualan" icon={<ReceiptText size={16} />} bodyClassName="p-0 md:p-0">
        <DataTable columns={columns} data={data} rowKey={(s) => s.id} />
      </SectionCard>

      <SaleFormModal open={!!form} item={form?.item} onClose={() => setForm(null)} />
      <DetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.invoice ?? ''}
        subtitle="Detail Transaksi Penjualan"
        icon={<ReceiptText size={20} />}
        onEdit={detail ? () => { setForm({ item: detail }); setDetail(null); } : undefined}
        rows={detail ? [
          { label: 'Pelanggan', value: detail.customer },
          { label: 'Unit', value: detail.unit },
          { label: 'Tanggal', value: formatDate(detail.date) },
          { label: 'Tipe Bayar', value: detail.paymentType },
          { label: 'Total', value: formatCurrency(detail.total) },
          { label: 'Status', value: <StatusBadge status={detail.status} /> },
        ] : []}
      />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && dispatch(removeSale(toDelete.id))} title="Hapus Penjualan" message={toDelete ? `Hapus transaksi ${toDelete.invoice}?` : ''} />
    </div>
  );
};
