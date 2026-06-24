import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailModal } from '@/shared/components/ui/DetailModal';
import { PaymentFormModal } from './PaymentFormModal';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { removePayment } from '@/app/store/dataSlice';
import { formatCurrency, formatDate } from '@/core/utils/format';
import type { Payment } from '@/data/types';

export const PembayaranPage = () => {
  const data = useAppSelector((s) => s.data.payments);
  const dispatch = useAppDispatch();
  const masuk = data.filter((p) => p.status === 'Sukses').reduce((a, p) => a + p.amount, 0);
  const pending = data.filter((p) => p.status === 'Pending').reduce((a, p) => a + p.amount, 0);

  const [form, setForm] = useState<{ item: Payment | null } | null>(null);
  const [detail, setDetail] = useState<Payment | null>(null);
  const [toDelete, setToDelete] = useState<Payment | null>(null);

  const columns: Column<Payment>[] = [
    { header: 'Invoice', cell: (p) => <span className="font-bold text-ink">{p.invoice}</span> },
    { header: 'Pelanggan', cell: (p) => p.customer },
    { header: 'Metode', cell: (p) => p.method },
    { header: 'Tanggal', cell: (p) => formatDate(p.date) },
    { header: 'Jumlah', cell: (p) => <span className="font-bold text-ink">{formatCurrency(p.amount)}</span>, align: 'right' },
    { header: 'Status', cell: (p) => <StatusBadge status={p.status} />, align: 'center' },
    { header: '', align: 'right', cell: (p) => <RowActions onView={() => setDetail(p)} onEdit={() => setForm({ item: p })} onDelete={() => setToDelete(p)} /> },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Pembayaran"
        description="Riwayat transaksi pembayaran & cicilan"
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Catat Pembayaran</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface rounded-2xl border border-border shadow-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-green text-white flex items-center justify-center"><Wallet size={22} /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Total Pembayaran Masuk</p>
            <p className="text-xl font-extrabold text-ink mt-0.5">{formatCurrency(masuk, { compact: true })}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border shadow-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-amber text-white flex items-center justify-center"><Wallet size={22} /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Pending</p>
            <p className="text-xl font-extrabold text-ink mt-0.5">{formatCurrency(pending, { compact: true })}</p>
          </div>
        </div>
      </div>

      <SectionCard title="Riwayat Pembayaran" icon={<Wallet size={16} />} bodyClassName="p-0 md:p-0">
        <DataTable columns={columns} data={data} rowKey={(p) => p.id} />
      </SectionCard>

      <PaymentFormModal open={!!form} item={form?.item} onClose={() => setForm(null)} />
      <DetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.invoice ?? ''}
        subtitle="Detail Pembayaran"
        icon={<Wallet size={20} />}
        onEdit={detail ? () => { setForm({ item: detail }); setDetail(null); } : undefined}
        rows={detail ? [
          { label: 'Pelanggan', value: detail.customer },
          { label: 'Metode', value: detail.method },
          { label: 'Tanggal', value: formatDate(detail.date) },
          { label: 'Jumlah', value: formatCurrency(detail.amount) },
          { label: 'Status', value: <StatusBadge status={detail.status} /> },
        ] : []}
      />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && dispatch(removePayment(toDelete.id))} title="Hapus Pembayaran" message={toDelete ? `Hapus pembayaran ${toDelete.invoice}?` : ''} />
    </div>
  );
};
