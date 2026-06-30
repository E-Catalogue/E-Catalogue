import { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
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

  // Extra filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [txFilter, setTxFilter] = useState<'ALL' | 'MANUAL' | 'AUTOMATIC'>('ALL');
  const [tahunMin, setTahunMin] = useState('');
  const [tahunMax, setTahunMax] = useState('');
  const [merekFilter, setMerekFilter] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  const { data, isLoading, isError } = useUnits({
    page: 1,
    limit: 100,
    search: debouncedQuery || undefined,
  });

  const units = data?.data || [];
  const total = data?.meta?.total || 0;

  // Unique merek list from loaded units
  const merkList = [...new Set(units.map((u: any) => u.merek?.name).filter(Boolean))].sort() as string[];

  // Client-side filtering chain
  let displayUnits: any[] = filter !== 'all' ? units.filter((u: any) => u.statusUnit === filter) : [...units];
  if (txFilter !== 'ALL') displayUnits = displayUnits.filter((u: any) => u.transmisi === txFilter);
  if (merekFilter) displayUnits = displayUnits.filter((u: any) => u.merek?.name === merekFilter);
  if (tahunMin) displayUnits = displayUnits.filter((u: any) => u.tahun >= Number(tahunMin));
  if (tahunMax) displayUnits = displayUnits.filter((u: any) => u.tahun <= Number(tahunMax));

  const activeExtraFilters = [txFilter !== 'ALL', !!merekFilter, !!tahunMin || !!tahunMax].filter(Boolean).length;
  const resetExtraFilters = () => { setTxFilter('ALL'); setMerekFilter(''); setTahunMin(''); setTahunMax(''); };

  const m = useUnitModals();

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader
        title="Inventori"
        description={`${displayUnits.length} unit ditampilkan dari total ${total} unit`}
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={m.openCreate}>Tambah Unit</Button>}
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.key === 'all' ? units.length : units.filter((u: any) => u.statusUnit === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-colors ${
                  filter === f.key
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-surface border border-border text-ink-soft hover:border-primary'
                }`}
              >
                {f.label}
                {!isLoading && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    filter === f.key ? 'bg-white/20 text-white' : 'bg-surface-soft text-muted'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-2 md:ml-auto">
          <div className="relative md:w-72">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari plat nomor..."
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>

          {/* Filter button with dropdown */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center justify-center gap-2 h-11 px-4 rounded-xl border font-bold text-[12px] transition-colors ${
                filterOpen || activeExtraFilters > 0
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface border-border text-ink-soft hover:border-primary'
              }`}
            >
              <Filter size={16} />
              Filter
              {activeExtraFilters > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                  {activeExtraFilters}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl z-50 p-4 space-y-4">
                {/* Panel header */}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-ink">Filter Lanjutan</span>
                  <div className="flex items-center gap-2">
                    {activeExtraFilters > 0 && (
                      <button onClick={resetExtraFilters} className="text-[11px] text-primary font-bold hover:underline">
                        Reset
                      </button>
                    )}
                    <button onClick={() => setFilterOpen(false)}>
                      <X size={14} className="text-muted hover:text-ink" />
                    </button>
                  </div>
                </div>

                {/* Transmisi */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Transmisi</p>
                  <div className="flex gap-1.5">
                    {(['ALL', 'AUTOMATIC', 'MANUAL'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTxFilter(t)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                          txFilter === t
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface-soft border-border text-ink-soft hover:border-primary'
                        }`}
                      >
                        {t === 'ALL' ? 'Semua' : t === 'AUTOMATIC' ? 'AT' : 'MT'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tahun */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Tahun</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={tahunMin}
                      onChange={(e) => setTahunMin(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg bg-surface-soft border border-border text-[12px] font-medium focus:outline-none focus:border-primary"
                    />
                    <span className="text-muted text-[12px] shrink-0">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={tahunMax}
                      onChange={(e) => setTahunMax(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg bg-surface-soft border border-border text-[12px] font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Merek */}
                {merkList.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Merek</p>
                    <select
                      value={merekFilter}
                      onChange={(e) => setMerekFilter(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-soft border border-border text-[12px] font-medium focus:outline-none focus:border-primary"
                    >
                      <option value="">Semua Merek</option>
                      {merkList.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted font-semibold animate-pulse">Memuat data...</div>
      ) : isError ? (
        <div className="text-center py-20 text-semantic-error font-semibold">Gagal memuat data.</div>
      ) : displayUnits.length === 0 ? (
        <div className="text-center py-20 text-muted font-semibold">Tidak ada unit yang cocok.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {displayUnits.map((u: any) => (
            <UnitCard key={u.id} unit={u} onView={m.openDetail} onEdit={m.openEdit} onDelete={m.openDelete} />
          ))}
        </div>
      )}

      {m.modals}
    </div>
  );
};
