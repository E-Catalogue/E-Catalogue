import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { Button } from '@/shared/components/ui/Button';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useUnits } from '@/features/units/unit.hooks';
import type { StatusUnit } from '@/features/units/unit.types';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';

const FILTERS: { key: StatusUnit | 'all'; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'INVENTORY', label: 'Inventory' },
  { key: 'READY_STOCK', label: 'Ready Stock' },
  { key: 'HOLD', label: 'Hold' },
  { key: 'SOLD', label: 'Terjual' },
];

export const InventoryPage = () => {
  const [filter, setFilter] = useState<StatusUnit | 'all'>('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 500);

  const { data, isLoading, isError } = useUnits({
    page: 1,
    limit: 50, // Temporarily fixed limit, can add pagination later
    search: debouncedQuery || undefined,
    statusUnit: filter !== 'all' ? filter : undefined,
  });

  const units = data?.data || [];
  const total = data?.meta?.total || 0;

  const m = useUnitModals();

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader
        title="Inventori"
        description={`${units.length} unit ditampilkan dari total ${total} unit`}
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={m.openCreate}>Tambah Unit</Button>}
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-colors ${filter === f.key ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative md:ml-auto md:w-72">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari plat nomor..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <button className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[12px] hover:border-primary">
          <Filter size={16} /> Filter
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted font-semibold animate-pulse">Memuat data...</div>
      ) : isError ? (
        <div className="text-center py-20 text-semantic-error font-semibold">Gagal memuat data.</div>
      ) : units.length === 0 ? (
        <div className="text-center py-20 text-muted font-semibold">Tidak ada unit yang cocok.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {units.map((u: any) => (
            <UnitCard key={u.id} unit={u} onView={m.openDetail} onEdit={m.openEdit} onDelete={m.openDelete} />
          ))}
        </div>
      )}

      {m.modals}
    </div>
  );
};
