import { useState, useEffect, useMemo } from 'react';
import {
  Search, BookOpen, Car, Eye, EyeOff, Globe, Filter,
  Image as ImageIcon, Calendar, Gauge, GitMerge, ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { useUnits } from '@/features/units/unit.hooks';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import type { Unit } from '@/features/units/unit.types';

type ViewFilter = 'all' | 'published' | 'hidden';

export const KatalogPage = () => {
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const { data, isLoading, isError } = useUnits({ page: 1, limit: 100 });
  const units = useMemo(() => data?.data || [], [data]);

  // Mock published state (nanti ganti ke API field `isPublished`)
  const [publishedState, setPublishedState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (units.length > 0 && Object.keys(publishedState).length === 0) {
      const initial: Record<string, boolean> = {};
      units.forEach(u => {
        initial[u.id] = u.statusUnit === 'READY_STOCK';
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPublishedState(initial);
    }
  }, [units, publishedState]);

  const togglePublish = (id: string) => {
    setPublishedState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Derived data
  const filteredUnits = useMemo(() => {
    let list = units.filter(u => {
      const text = `${u.merek?.name || ''} ${u.tipe?.name || ''} ${u.platNomor || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
    if (viewFilter === 'published') list = list.filter(u => publishedState[u.id]);
    if (viewFilter === 'hidden') list = list.filter(u => !publishedState[u.id]);
    return list;
  }, [units, search, viewFilter, publishedState]);

  const publishedCount = units.filter(u => publishedState[u.id]).length;
  const hiddenCount = units.length - publishedCount;

  const getImageUrl = (u: Unit) => {
    const img = u.unitImages?.[0];
    return img
      ? `${import.meta.env.VITE_API_URL}/public/unit/${img.filename}`
      : DEFAULT_CAR_IMAGE;
  };

  const VIEW_FILTERS: { key: ViewFilter; label: string; count: number; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Semua Unit', count: units.length, icon: <Filter size={14} /> },
    { key: 'published', label: 'Ditampilkan', count: publishedCount, icon: <Eye size={14} /> },
    { key: 'hidden', label: 'Disembunyikan', count: hiddenCount, icon: <EyeOff size={14} /> },
  ];

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Katalog Publik"
        description="Pilih unit kendaraan yang akan ditampilkan ke website E-Catalogue pelanggan."
        action={
          <a href="/katalog" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" icon={<ExternalLink size={16} />}>
              Lihat Katalog
            </Button>
          </a>
        }
      />

      {/* ── Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Car size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Total Unit</p>
            <p className="text-xl font-extrabold text-ink">{isLoading ? '—' : units.length}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0">
            <Globe size={20} className="text-accent-green" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Tayang di Katalog</p>
            <p className="text-xl font-extrabold text-accent-green">{isLoading ? '—' : publishedCount}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted/10 flex items-center justify-center shrink-0">
            <EyeOff size={20} className="text-muted" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Disembunyikan</p>
            <p className="text-xl font-extrabold text-muted">{isLoading ? '—' : hiddenCount}</p>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {VIEW_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setViewFilter(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-colors ${
                viewFilter === f.key
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-surface border border-border text-ink-soft hover:border-primary'
              }`}
            >
              {f.icon}
              {f.label}
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                viewFilter === f.key ? 'bg-white/20 text-white' : 'bg-surface-soft text-muted'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-72">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari merek, tipe, plat..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>
      </div>

      {/* ── Unit List ─────────────────────────────────────────── */}
      <SectionCard title="Kelola Visibilitas Unit" icon={<BookOpen size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <Car size={32} className="text-muted/50" />
              <span className="font-semibold text-sm">Memuat data unit...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-muted font-semibold text-sm">
            Gagal memuat data unit dari server.
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-20 text-muted font-semibold text-sm flex flex-col items-center gap-2">
            <Car size={32} className="text-muted/40" />
            Tidak ada unit yang ditemukan.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUnits.map(u => {
              const isPub = publishedState[u.id];
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    isPub ? 'bg-surface' : 'bg-surface-soft/40'
                  } hover:bg-primary/[0.02]`}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-surface-soft shrink-0 border border-border">
                    <img
                      src={getImageUrl(u)}
                      alt={`${u.merek?.name} ${u.tipe?.name}`}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-ink text-[13px] leading-tight truncate">
                        {u.merek?.name} {u.tipe?.name}
                      </h4>
                      <StatusBadge status={u.statusUnit as never} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-muted">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {u.tahun}</span>
                      <span className="flex items-center gap-1"><GitMerge size={11} /> {u.transmisi === 'AUTOMATIC' ? 'AT' : 'MT'}</span>
                      <span className="flex items-center gap-1"><Gauge size={11} /> {formatNumber(u.kilometer)} KM</span>
                      {u.unitImages && u.unitImages.length > 0 && (
                        <span className="flex items-center gap-1"><ImageIcon size={11} /> {u.unitImages.length} foto</span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wide">Harga OTR</p>
                    <p className="text-[14px] font-extrabold text-primary mt-0.5">
                      {u.hargaOtrSaatIni ? formatCurrency(u.hargaOtrSaatIni) : <span className="text-muted">—</span>}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <button
                      onClick={() => togglePublish(u.id)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        isPub
                          ? 'bg-accent-green focus:ring-accent-green/30'
                          : 'bg-muted/25 focus:ring-muted/20'
                      }`}
                      title={isPub ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                    >
                      <span
                        className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                          isPub ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      >
                        {isPub
                          ? <Eye size={10} className="text-accent-green" />
                          : <EyeOff size={10} className="text-muted" />
                        }
                      </span>
                    </button>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isPub ? 'text-accent-green' : 'text-muted'}`}>
                      {isPub ? 'Tayang' : 'Hidden'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
