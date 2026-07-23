import { Plus, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { useUnitModals } from '@/features/units/useUnitModals';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useUnits } from '@/features/units/unit.hooks';
import { unitDisplayName } from '@/features/units/unit.display';
import { formatCurrency, formatNumber, formatDate } from '@/core/utils/format';
import type { Unit } from '@/features/units/unit.types';

/**
 * "Pembelian Unit" bukan endpoint terpisah di backend — akuisisi unit ADALAH `POST /units`
 * (setiap unit wajib punya `purchaseCost`+`tanggalPembelian` sejak dibuat, lihat `create_unit`
 * PRD). Halaman ini pakai `useUnits`/`useUnitModals` yang sama dengan Inventory, hanya
 * fokus tampilan ke sisi akuisisi (harga beli, tanggal beli, sumber dana) dan menyorot unit
 * yang masih berstatus `INVENTORY` (baru dibeli, belum naik ke Ready Stock).
 */
const PembelianPageInner = () => {
  const { can } = usePermissions();
  const { data, isLoading, isFetching, isError, refetch } = useUnits({ page: 1, limit: 100 });
  const m = useUnitModals();

  const units: Unit[] = data?.data ?? [];
  const incoming = units.filter((u) => u.statusUnit === 'INVENTORY');
  const totalSpend = units.reduce((acc, u) => acc + (u.purchaseCost ?? 0), 0);

  const columns: Column<Unit>[] = [
    {
      header: 'Nama Unit',
      cell: (u) => (
        <div className="min-w-0">
          <p className="font-bold text-ink truncate" title={unitDisplayName(u)}>{unitDisplayName(u)}</p>
          <p className="text-[11px] text-muted font-medium truncate">{[u.merek?.name, u.tipe?.name].filter(Boolean).join(' ') || '—'} · {u.platNomor}</p>
        </div>
      ),
    },
    { header: 'Tahun', cell: (u) => u.tahun, align: 'center' },
    { header: 'KM', cell: (u) => `${formatNumber(u.kilometer)} KM`, align: 'right' },
    { header: 'Harga Beli', cell: (u) => <span className="font-bold text-ink">{formatCurrency(u.purchaseCost)}</span>, align: 'right' },
    { header: 'Sumber Dana', cell: (u) => u.fundingAgreement?.fundingSource === 'INVESTOR' ? (u.fundingAgreement.investor?.name ?? 'Investor') : 'Perusahaan' },
    { header: 'Status', cell: (u) => <StatusBadge status={u.statusUnit} />, align: 'center' },
    { header: 'Tanggal Beli', cell: (u) => formatDate(u.tanggalPembelian), align: 'right' },
    { header: '', align: 'right', cell: (u) => (
      <RowActions
        onView={() => m.openDetail(u)}
        onEdit={can('UNIT_UPDATE') ? () => m.openEdit(u) : undefined}
        onDelete={can('UNIT_DELETE') ? () => m.openDelete(u) : undefined}
      />
    ) },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <PageHeader
        title="Pembelian Unit"
        description="Akuisisi & sourcing unit mobil bekas"
        action={can('UNIT_CREATE') ? <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={m.openCreate}>Input Pembelian</Button> : undefined}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ShoppingCart, label: 'Unit Dibeli (Total)', value: `${units.length} Unit`, color: 'bg-primary' },
          { icon: TrendingUp, label: 'Dalam Proses (Inventory)', value: `${incoming.length} Unit`, color: 'bg-accent-blue' },
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
        <DataTable columns={columns} data={units} rowKey={(u) => u.id} loading={isLoading} refreshing={isFetching && !isLoading}
          error={isError} onRetry={() => refetch()} emptyState={{ icon: ShoppingCart, title: 'Belum ada unit yang dibeli', description: 'Input pembelian unit agar riwayat akuisisi tampil di sini.' }} />
      </SectionCard>

      {m.modals}
    </div>
  );
};

export const PembelianPage = () => (
  <RequirePermission code="UNIT_READ">
    <PembelianPageInner />
  </RequirePermission>
);
