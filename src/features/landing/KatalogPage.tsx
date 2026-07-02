import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, SlidersHorizontal, X, Car, RotateCcw } from 'lucide-react';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { PublicHeader } from './PublicHeader';
import { PriceRangeSlider } from './PriceRangeSlider';
import { useAppSelector } from '@/app/store';
import { formatCurrency } from '@/core/utils/format';
import type { Unit, Transmission, FuelType } from '@/data/types';

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'km_asc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Tahun Terbaru' },
  { key: 'price_asc', label: 'Harga Termurah' },
  { key: 'price_desc', label: 'Harga Termahal' },
  { key: 'km_asc', label: 'KM Terendah' },
];

const PRICE_STEP = 5_000_000;
const roundUp = (n: number, step: number) => Math.ceil(n / step) * step;

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
      active ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
    }`}
  >
    {children}
  </button>
);

const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2.5">{label}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export const KatalogPage = () => {
  const units = useAppSelector((s) => s.data.units.filter((u) => u.status === 'ready' || u.status === 'booked'));
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('Semua');
  const [trans, setTrans] = useState<'Semua' | Transmission>('Semua');
  const [fuel, setFuel] = useState<'Semua' | FuelType>('Semua');
  const [price, setPrice] = useState<{ min: number; max: number } | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');
  const [showFilter, setShowFilter] = useState(false);

  const brands = ['Semua', ...Array.from(new Set(units.map((u) => u.brand)))];

  const priceBounds = useMemo(() => {
    const prices = units.map((u) => u.price);
    const hi = prices.length ? roundUp(Math.max(...prices), PRICE_STEP) : 1_000_000_000;
    return { min: 0, max: hi };
  }, [units]);
  const pMin = price?.min ?? priceBounds.min;
  const pMax = price?.max ?? priceBounds.max;

  const result = useMemo(() => {
    const list = units.filter((u) => {
      const mb = brand === 'Semua' || u.brand === brand;
      const mt = trans === 'Semua' || u.transmission === trans;
      const mf = fuel === 'Semua' || u.fuel === fuel;
      const mp = u.price >= pMin && u.price <= pMax;
      const text = `${u.brand} ${u.model} ${u.variant}`.toLowerCase();
      return mb && mt && mf && mp && text.includes(query.toLowerCase());
    });
    return [...list].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'km_asc') return a.km - b.km;
      return b.year - a.year;
    });
  }, [units, brand, trans, fuel, pMin, pMax, sort, query]);

  const reset = () => { setBrand('Semua'); setTrans('Semua'); setFuel('Semua'); setPrice(null); setQuery(''); };
  const openDetail = (u: Unit) => navigate({ to: '/katalog/$id', params: { id: u.id } });

  const priceActive = price !== null && (pMin > priceBounds.min || pMax < priceBounds.max);
  const activeFilters = [
    brand !== 'Semua' && { label: brand, clear: () => setBrand('Semua') },
    trans !== 'Semua' && { label: trans, clear: () => setTrans('Semua') },
    fuel !== 'Semua' && { label: fuel, clear: () => setFuel('Semua') },
    priceActive && { label: `${formatCurrency(pMin, { compact: true })} – ${formatCurrency(pMax, { compact: true })}`, clear: () => setPrice(null) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const FilterPanel = (
    <div className="space-y-6">
      <FilterGroup label="Merek">
        {brands.map((b) => <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</Chip>)}
      </FilterGroup>
      <FilterGroup label="Rentang Harga">
        <div className="w-full">
          <PriceRangeSlider
            min={priceBounds.min} max={priceBounds.max} step={PRICE_STEP}
            valueMin={pMin} valueMax={pMax}
            onChange={(next) => setPrice(next)}
          />
        </div>
      </FilterGroup>
      <FilterGroup label="Transmisi">
        {(['Semua', 'AT', 'MT', 'CVT'] as const).map((t) => <Chip key={t} active={trans === t} onClick={() => setTrans(t)}>{t}</Chip>)}
      </FilterGroup>
      <FilterGroup label="Bahan Bakar">
        {(['Semua', 'Bensin', 'Diesel', 'Hybrid', 'Listrik'] as const).map((f) => <Chip key={f} active={fuel === f} onClick={() => setFuel(f)}>{f}</Chip>)}
      </FilterGroup>
    </div>
  );

  return (
    <>
      <PublicHeader
        eyebrow="Katalog"
        title="Temukan Mobil Impian Anda"
        subtitle="Jelajahi koleksi mobil bekas berkualitas, terinspeksi, dan bergaransi. Gunakan filter untuk mempersempit pilihan."
        breadcrumb={[{ label: 'Beranda', to: '/' }, { label: 'Katalog' }]}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari merek, model, atau varian..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-12 px-4 rounded-2xl bg-surface border border-border text-sm font-bold text-ink-soft cursor-pointer focus:outline-none focus:border-primary"
          >
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilter(true)} className="lg:hidden h-12 px-4 rounded-2xl bg-primary text-white font-bold text-[13px] inline-flex items-center justify-center gap-2">
            <SlidersHorizontal size={17} /> Filter {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* RESULTS */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <p className="text-[13px] font-semibold text-muted">
                Menampilkan <span className="text-ink font-extrabold">{result.length}</span> dari {units.length} unit
              </p>
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {activeFilters.map((f) => (
                    <button key={f.label} onClick={f.clear} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light text-primary text-[11px] font-bold hover:bg-primary hover:text-white transition-colors">
                      {f.label} <X size={12} />
                    </button>
                  ))}
                  <button onClick={reset} className="text-[11px] font-bold text-muted hover:text-primary inline-flex items-center gap-1"><RotateCcw size={12} /> Reset</button>
                </div>
              )}
            </div>

            {result.length === 0 ? (
              <div className="text-center py-24 bg-surface rounded-2xl border border-border">
                <Car size={40} className="text-muted mx-auto mb-3" />
                <p className="text-ink font-bold">Tidak ada unit yang cocok</p>
                <p className="text-muted text-sm font-medium mt-1">Coba ubah atau reset filter pencarian.</p>
                <button onClick={reset} className="mt-4 text-[13px] font-bold text-primary hover:underline">Reset filter</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
                {result.map((u) => <UnitCard key={u.id} unit={u} onView={openDetail} />)}
              </div>
            )}
          </div>

          {/* FILTER SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0 order-last">
            <div className="sticky top-20 bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <h2 className="text-[13px] font-extrabold uppercase tracking-wide text-ink">Filter</h2>
                </div>
                {activeFilters.length > 0 && (
                  <button onClick={reset} className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"><RotateCcw size={12} /> Reset</button>
                )}
              </div>
              {FilterPanel}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilter && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowFilter(false)} />
          <div className="absolute inset-y-0 right-0 w-[85vw] max-w-sm bg-surface shadow-2xl flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h2 className="text-base font-extrabold text-ink">Filter</h2>
              <button onClick={() => setShowFilter(false)} className="p-2 rounded-xl text-muted hover:bg-surface-soft"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-slim p-5">{FilterPanel}</div>
            <div className="p-4 border-t border-border shrink-0 flex gap-2.5">
              <button onClick={reset} className="px-4 h-11 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[13px]">Reset</button>
              <button onClick={() => setShowFilter(false)} className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-[13px]">
                Tampilkan {result.length} unit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
