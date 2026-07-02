import { useState } from 'react';
import { Wrench, Search, Loader2, Eye, Pencil } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { useUnits } from '@/features/units/unit.hooks';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { RekondisiDetailModal } from './RekondisiDetailModal';
import type { Unit } from '@/features/units/unit.types';

const idr = (n?: number | null) => (n == null ? '—' : formatCurrency(n, { compact: true }));

const hppColor = (hpp?: number | null, beli?: number) => {
  if (!hpp || !beli) return 'text-ink font-bold';
  const pct = (hpp - beli) / beli;
  if (pct > 0.15) return 'text-semantic-error font-extrabold';
  if (pct > 0.08) return 'text-accent-amber font-bold';
  return 'text-ink font-bold';
};

/* ── Main Page ── */
export const RekondisiPage = () => {
  const [query, setQuery]             = useState('');
  const [rekondisiUnit, setRekondisiUnit] = useState<Unit | null>(null);
  const debounced = useDebouncedValue(query, 400);

  const { data, isLoading, isError } = useUnits({
    page: 1, limit: 100,
    statusUnit: 'INVENTORY',
    search: debounced || undefined,
  });

  const units: Unit[] = data?.data ?? [];
  const total         = data?.meta?.total ?? 0;
  const m             = useUnitModals();

  const columns: Column<Unit>[] = [
    {
      header: 'Unit',
      cell: (u) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{u.platNomor}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5">
            {u.merek?.name ?? '—'} {u.tipe?.name ?? ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Tahun / KM',
      align: 'right',
      cell: (u) => (
        <div className="text-right">
          <p className="font-bold text-ink text-[13px]">{u.tahun}</p>
          <p className="text-[11px] text-muted font-medium">{formatNumber(u.kilometer)} KM</p>
        </div>
      ),
    },
    {
      header: 'Transmisi',
      align: 'center',
      cell: (u) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
          u.transmisi === 'AUTOMATIC' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted/10 text-muted'
        }`}>
          {u.transmisi === 'AUTOMATIC' ? 'AT' : 'MT'}
        </span>
      ),
    },
    {
      header: 'Harga Beli',
      align: 'right',
      cell: (u) => <span className="font-bold text-ink text-[13px]">{idr(u.hargaBeli)}</span>,
    },
    {
      header: 'HPP (Akumulasi)',
      align: 'right',
      cell: (u) => {
        const hpp = u.hpp;
        const delta = hpp && u.hargaBeli ? hpp - u.hargaBeli : null;
        return hpp ? (
          <div className="text-right">
            <span className={`text-[13px] ${hppColor(hpp, u.hargaBeli)}`}>{idr(hpp)}</span>
            {delta !== null && (
              <p className="text-[10px] text-muted font-medium mt-0.5">+{idr(delta)} rekondisi</p>
            )}
          </div>
        ) : (
          <span className="text-[12px] text-muted/50 font-medium italic">Belum ada</span>
        );
      },
    },
    {
      header: '',
      align: 'right',
      cell: (u) => (
        <ActionMenu items={[
          {
            icon: <Wrench size={13} />,
            label: 'Kelola Rekondisi',
            onClick: () => setRekondisiUnit(u),
            variant: 'primary',
            dividerAfter: true,
          },
          {
            icon: <Eye size={13} />,
            label: 'Lihat Detail Unit',
            onClick: () => m.openDetail(u),
          },
          {
            icon: <Pencil size={13} />,
            label: 'Edit Unit',
            onClick: () => m.openEdit(u),
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Rekondisi"
        description={`${total} unit dalam tahap inventori`}
      />

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari plat / merek / tipe…"
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* Table */}
      <SectionCard
        title={`Daftar Unit (${units.length})`}
        icon={<Wrench size={16} />}
        bodyClassName="p-0 md:p-0"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : units.length === 0 ? (
          <div className="text-center py-16">
            <Wrench size={32} className="text-muted mx-auto mb-3" />
            <p className="font-bold text-ink text-[14px]">
              {query ? 'Tidak ada unit yang cocok.' : 'Belum ada unit dalam rekondisi.'}
            </p>
            <p className="text-muted text-[12px] font-medium mt-1">
              Unit berstatus Inventory akan muncul di sini.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={units} rowKey={(u) => u.id} />
        )}
      </SectionCard>

      {m.modals}

      {/* Kelola rekondisi modal (stepper — termasuk buat rekondisi baru) */}
      <RekondisiDetailModal
        open={!!rekondisiUnit}
        onClose={() => setRekondisiUnit(null)}
        unitId={rekondisiUnit?.id ?? null}
        unitLabel={
          rekondisiUnit
            ? `${rekondisiUnit.platNomor} · ${rekondisiUnit.merek?.name ?? ''} ${rekondisiUnit.tipe?.name ?? ''}`
            : undefined
        }
      />
    </div>
  );
};
