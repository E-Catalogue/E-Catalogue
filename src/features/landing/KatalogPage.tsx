import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, SlidersHorizontal, X, Car, RotateCcw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PublicUnitCard } from './PublicUnitCard';
import { PublicHeader } from './PublicHeader';
import { PriceRangeSlider } from './PriceRangeSlider';
import { formatCurrency } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { usePublicCatalog, usePublicCatalogBrands, usePublicCatalogPage } from './landing.hooks';
import type { CatalogCard, CatalogQuery, PublicTransmisi } from './public.types';

type SortKey = NonNullable<CatalogQuery['sort']>;

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Tahun Terbaru' },
  { key: 'price_asc', label: 'Harga Termurah' },
  { key: 'price_desc', label: 'Harga Termahal' },
  { key: 'km_asc', label: 'KM Terendah' },
];
const TRANS: PublicTransmisi[] = ['AT', 'MT', 'CVT'];
const FUELS = ['BENSIN', 'DIESEL', 'HYBRID', 'LISTRIK'];
const FUEL_LABEL: Record<string, string> = { BENSIN: 'Bensin', DIESEL: 'Diesel', HYBRID: 'Hybrid', LISTRIK: 'Listrik' };
const PRICE_STEP = 5_000_000;

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${active ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'}`}>
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
  const navigate = useNavigate();
  const { data: pageData } = usePublicCatalogPage();
  const { data: brands } = usePublicCatalogBrands();

  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');            // brand id, '' = semua
  const [trans, setTrans] = useState<PublicTransmisi | ''>('');
  const [fuel, setFuel] = useState('');
  const [price, setPrice] = useState<{ min: number; max: number } | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const debounced = useDebouncedValue(query, 400);

  const priceBounds = useMemo(() => {
    const maxes = (pageData?.priceRanges ?? []).map((r) => r.max ?? 0);
    const hi = maxes.length ? Math.max(...maxes) : 0;
    return { min: 0, max: hi > 0 ? hi : 1_000_000_000 };
  }, [pageData]);
  const pMin = price?.min ?? priceBounds.min;
  const pMax = price?.max ?? priceBounds.max;
  const priceActive = price !== null && (pMin > priceBounds.min || pMax < priceBounds.max);

  const params: CatalogQuery = {
    page, limit: 12, sort,
    search: debounced || undefined,
    merek: brand || undefined,
    transmisi: trans || undefined,
    bahanBakar: fuel || undefined,
    hargaMin: priceActive ? pMin : undefined,
    hargaMax: priceActive ? pMax : undefined,
  };
  const { data, isLoading, isError } = usePublicCatalog(params);
  const units = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const openDetail = (u: CatalogCard) => navigate({ to: '/katalog/$id', params: { id: u.id } });
  const reset = () => { setBrand(''); setTrans(''); setFuel(''); setPrice(null); setQuery(''); setPage(1); };

  const activeFilters = [
    brand && { label: brands?.find((b) => b.id === brand)?.name ?? 'Merek', clear: () => setBrand('') },
    trans && { label: trans, clear: () => setTrans('') },
    fuel && { label: FUEL_LABEL[fuel], clear: () => setFuel('') },
    priceActive && { label: `${formatCurrency(pMin, { compact: true })} – ${formatCurrency(pMax, { compact: true })}`, clear: () => setPrice(null) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  // Reset ke page 1 saat filter berubah
  const withReset = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); };

  const FilterPanel = (
    <div className="space-y-6">
      <FilterGroup label="Merek">
        <Chip active={brand === ''} onClick={() => withReset(setBrand)('')}>Semua</Chip>
        {(brands ?? []).map((b) => <Chip key={b.id} active={brand === b.id} onClick={() => withReset(setBrand)(b.id)}>{b.name} ({b.count})</Chip>)}
      </FilterGroup>
      <FilterGroup label="Rentang Harga">
        <div className="w-full">
          <PriceRangeSlider min={priceBounds.min} max={priceBounds.max} step={PRICE_STEP} valueMin={pMin} valueMax={pMax} onChange={(next) => { setPrice(next); setPage(1); }} />
        </div>
      </FilterGroup>
      <FilterGroup label="Transmisi">
        <Chip active={trans === ''} onClick={() => withReset(setTrans)('')}>Semua</Chip>
        {TRANS.map((t) => <Chip key={t} active={trans === t} onClick={() => withReset(setTrans)(t)}>{t}</Chip>)}
      </FilterGroup>
      <FilterGroup label="Bahan Bakar">
        <Chip active={fuel === ''} onClick={() => withReset(setFuel)('')}>Semua</Chip>
        {FUELS.map((f) => <Chip key={f} active={fuel === f} onClick={() => withReset(setFuel)(f)}>{FUEL_LABEL[f]}</Chip>)}
      </FilterGroup>
    </div>
  );

  return (
    <>
      <PublicHeader
        eyebrow={pageData?.eyebrow ?? 'Katalog'}
        title={pageData?.title ?? 'Temukan Mobil Impian Anda'}
        subtitle={pageData?.subtitle ?? 'Jelajahi koleksi mobil bekas berkualitas, terinspeksi, dan bergaransi.'}
        breadcrumb={[{ label: 'Beranda', to: '/' }, { label: 'Katalog' }]}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Cari merek, model, atau varian..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
          </div>
          <select value={sort} onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
            className="h-12 px-4 rounded-2xl bg-surface border border-border text-sm font-bold text-ink-soft cursor-pointer focus:outline-none focus:border-primary">
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilter(true)} className="lg:hidden h-12 px-4 rounded-2xl bg-primary text-white font-bold text-[13px] inline-flex items-center justify-center gap-2">
            <SlidersHorizontal size={17} /> Filter {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
        </div>

        <div className="flex gap-6 lg:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <p className="text-[13px] font-semibold text-muted">
                Menampilkan <span className="text-ink font-extrabold">{units.length}</span>{meta ? ` dari ${meta.total}` : ''} unit
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

            {isLoading ? (
              <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={26} className="animate-spin" /></div>
            ) : isError ? (
              <div className="text-center py-24 bg-surface rounded-2xl border border-border text-muted font-semibold">Gagal memuat katalog.</div>
            ) : units.length === 0 ? (
              <div className="text-center py-24 bg-surface rounded-2xl border border-border">
                <Car size={40} className="text-muted mx-auto mb-3" />
                <p className="text-ink font-bold">Tidak ada unit yang cocok</p>
                <button onClick={reset} className="mt-4 text-[13px] font-bold text-primary hover:underline">Reset filter</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {units.map((u) => <PublicUnitCard key={u.id} card={u} onView={openDetail} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center disabled:opacity-40 hover:border-primary"><ChevronLeft size={18} /></button>
                    <span className="text-[13px] font-bold text-ink-soft px-3">Halaman {page} / {totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center disabled:opacity-40 hover:border-primary"><ChevronRight size={18} /></button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar filter (desktop) */}
          <aside className="hidden lg:block w-72 shrink-0 order-last">
            <div className="sticky top-20 bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-primary" /><h2 className="text-[13px] font-extrabold uppercase tracking-wide text-ink">Filter</h2></div>
                {activeFilters.length > 0 && <button onClick={reset} className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"><RotateCcw size={12} /> Reset</button>}
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
              <button onClick={() => setShowFilter(false)} className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-[13px]">Tampilkan{meta ? ` ${meta.total}` : ''} unit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
