import { Plus, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { useAppSelector } from '@/app/store';
import { useUnitModals } from '@/features/units/useUnitModals';
import { formatCurrency, formatNumber, formatDate } from '@/core/utils/format';
import type { Unit } from '@/data/types';

export const PembelianPage = () => {
  const units = useAppSelector((s) => s.data.units);
  const m = useUnitModals();

  const incoming = units.filter((u) => u.status === 'pembelian');
  const purchased = units.filter((u) => u.buyPrice);
  const totalSpend = purchased.reduce((acc, u) => acc + (u.buyPrice ?? 0), 0);

  const columns: Column<Unit>[] = [
    { header: 'Kode', cell: (u) => <span className="font-bold text-ink">{u.code}</span> },
    { header: 'Unit', cell: (u) => `${u.brand} ${u.model} ${u.variant}` },
    { header: 'Tahun', cell: (u) => u.year, align: 'center' },
    { header: 'KM', cell: (u) => `${formatNumber(u.km)} KM`, align: 'right' },
    { header: 'Harga Beli', cell: (u) => <span className="font-bold text-ink">{u.buyPrice ? formatCurrency(u.buyPrice) : '-'}</span>, align: 'right' },
    { header: 'Status', cell: (u) => <StatusBadge status={u.status} />, align: 'center' },
    { header: 'Tanggal', cell: () => formatDate('2024-05-21'), align: 'right' },
    { header: '', align: 'right', cell: (u) => <RowActions onView={() => m.openDetail(u as any)} onEdit={() => m.openEdit(u as any)} onDelete={() => m.openDelete(u as any)} /> },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Pembelian Unit"
        description="Akuisisi & sourcing unit mobil bekas"
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={m.openCreate}>Input Pembelian</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ShoppingCart, label: 'Unit Dibeli (Total)', value: `${purchased.length} Unit`, color: 'bg-primary' },
          { icon: TrendingUp, label: 'Dalam Proses', value: `${incoming.length} Unit`, color: 'bg-accent-blue' },
          { icon: Wallet, label: 'Total Modal Beli', value: formatCurrency(totalSpend, { compact: true }), color: 'bg-accent-green' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border shadow-card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.color} text-white flex items-center justify-center`}>
              <s.icon size={22} strokeWidth={2.3} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{s.label}</p>
              <p className="text-xl font-extrabold text-ink mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Daftar Pembelian Unit" bodyClassName="p-0 md:p-0">
        <DataTable columns={columns} data={purchased} rowKey={(u) => u.id} />
      </SectionCard>

      {m.modals}
    </div>
  );
};
