import { useState } from 'react';
import { Plus, Wallet, TrendingDown } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ExpenseFormModal } from './ExpenseFormModal';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { removeExpense } from '@/app/store/dataSlice';
import { formatCurrency, formatDate } from '@/core/utils/format';
import type { Expense, ExpenseCategory } from '@/data/types';

const CAT_COLOR: Record<ExpenseCategory, string> = {
  Investor: 'bg-accent-purple/10 text-accent-purple',
  'Operasional Showroom': 'bg-accent-blue/10 text-accent-blue',
  'Operasional Kendaraan': 'bg-accent-amber/10 text-accent-amber',
  Lainnya: 'bg-muted/10 text-muted',
};

export const PengeluaranPage = () => {
  const expenses = useAppSelector((s) => s.data.expenses);
  const dispatch = useAppDispatch();
  const total = expenses.reduce((a, e) => a + e.amount, 0);

  const [form, setForm] = useState<{ item: Expense | null } | null>(null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);

  // Ringkasan per kategori
  const byCat = (['Investor', 'Operasional Showroom', 'Operasional Kendaraan', 'Lainnya'] as ExpenseCategory[])
    .map((c) => ({ cat: c, total: expenses.filter((e) => e.category === c).reduce((a, e) => a + e.amount, 0) }))
    .filter((x) => x.total > 0);

  const columns: Column<Expense>[] = [
    { header: 'Tanggal', cell: (e) => formatDate(e.date) },
    { header: 'Kategori', cell: (e) => <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${CAT_COLOR[e.category]}`}>{e.category}</span> },
    { header: 'Keterangan', cell: (e) => <span className="font-bold text-ink">{e.name}</span> },
    { header: 'Catatan', cell: (e) => e.note || '-' },
    { header: 'Nominal', cell: (e) => <span className="font-bold text-semantic-error">{formatCurrency(e.amount)}</span>, align: 'right' },
    { header: '', align: 'right', cell: (e) => <RowActions onEdit={() => setForm({ item: e })} onDelete={() => setToDelete(e)} /> },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Pengeluaran"
        description="Biaya operasional showroom, investor, dan kendaraan"
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Catat Pengeluaran</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-border shadow-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-semantic-error text-white flex items-center justify-center"><TrendingDown size={22} /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Total Pengeluaran</p>
            <p className="text-xl font-extrabold text-ink mt-0.5">{formatCurrency(total, { compact: true })}</p>
          </div>
        </div>
        {byCat.slice(0, 3).map((c) => (
          <div key={c.cat} className="bg-surface rounded-2xl border border-border shadow-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted truncate">{c.cat}</p>
            <p className="text-xl font-extrabold text-ink mt-1">{formatCurrency(c.total, { compact: true })}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Daftar Pengeluaran" icon={<Wallet size={16} />} bodyClassName="p-0 md:p-0">
        <DataTable columns={columns} data={expenses} rowKey={(e) => e.id} />
      </SectionCard>

      <ExpenseFormModal open={!!form} item={form?.item} onClose={() => setForm(null)} />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && dispatch(removeExpense(toDelete.id))} title="Hapus Pengeluaran" message={toDelete ? `Hapus pengeluaran "${toDelete.name}"?` : ''} />
    </div>
  );
};
