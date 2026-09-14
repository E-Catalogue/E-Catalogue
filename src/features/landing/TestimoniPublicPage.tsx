import { useState } from 'react';
import { Search, Star, Quote, RotateCcw, X } from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { TestimonialCard } from './TestimonialCard';
import { TestimonialDetailModal } from './TestimonialDetailModal';
import { CustomerLoader, CustomerServerError } from './CustomerStates';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { usePublicTestimonials } from './landing.hooks';
import { useSeo } from '@/core/utils/seo';

const RATING_OPTIONS = [
  { value: undefined, label: 'Semua Rating' },
  { value: 5, label: '5 Bintang' },
  { value: 4, label: '4 Bintang' },
  { value: 3, label: '3 Bintang' },
];

export const TestimoniPublicPage = () => {
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useSeo({
    title: 'Testimoni & Pengalaman Beli Mobil Bekas Subang — GM Mobilindo',
    description:
      'Lihat cerita dan ulasan nyata pelanggan yang telah membeli mobil bekas berkualitas di GM Mobilindo Subang. Kepuasan layanan, proses kredit cepat, dan unit bergaransi.',
    keywords: [
      'testimoni gm mobilindo',
      'ulasan showroom mobil bekas subang',
      'pengalaman beli mobil bekas subang',
    ],
  });

  const debounced = useDebouncedValue(search, 400);

  const { data, isLoading, isError, refetch } = usePublicTestimonials({
    page,
    limit,
    search: debounced || undefined,
    rating,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  const resetFilters = () => {
    setSearch('');
    setRating(undefined);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || rating !== undefined);

  return (
    <div className="animate-float-up pb-16">
      <PublicHeader
        eyebrow="Cerita Pelanggan"
        title="Testimoni & Pengalaman Serah Terima"
        subtitle="Kepuasan dan cerita nyata dari para pelanggan yang telah mempercayakan mobil impian mereka bersama kami."
        breadcrumb={[{ label: 'Beranda', to: '/' }, { label: 'Testimoni' }]}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {/* Toolbar Pencarian & Filter */}
        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Input Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama pembeli, judul cerita, kota, atau unit mobil..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-soft border border-border text-[13px] font-medium text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Rating Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {RATING_OPTIONS.map((opt) => {
                const isActive = rating === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setRating(opt.value);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-glow'
                        : 'bg-surface-soft border border-border text-ink-soft hover:border-primary/40'
                    }`}
                  >
                    {opt.value && <Star size={13} className={isActive ? 'fill-white text-white' : 'fill-accent-amber text-accent-amber'} />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-bold text-muted hover:text-primary transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Info Hasil Filter */}
          <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between text-[12px] text-muted font-medium flex-wrap gap-2">
            <p>
              Menampilkan <span className="font-extrabold text-ink">{meta?.total ?? items.length}</span> cerita serah terima pelanggan
            </p>
            {hasActiveFilters && (
              <span className="text-primary font-bold">Filter aktif</span>
            )}
          </div>
        </div>

        {/* Konten Utama */}
        {isLoading ? (
          <div className="py-20">
            <CustomerLoader />
          </div>
        ) : isError ? (
          <CustomerServerError onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border">
            <div className="w-14 h-14 rounded-2xl bg-primary-light/60 text-primary flex items-center justify-center mx-auto mb-4">
              <Quote size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-ink">Belum Ada Testimoni yang Sesuai</h3>
            <p className="text-[13px] text-muted font-medium mt-1 max-w-sm mx-auto">
              Cobalah gunakan kata kunci lain atau ubah filter rating untuk melihat testimoni lainnya.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-bold shadow-glow hover:bg-primary-dark transition-colors"
              >
                <RotateCcw size={14} /> Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((t) => (
                <TestimonialCard
                  key={t.id}
                  testimonial={t}
                  onView={() => setSelectedId(t.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 bg-surface p-4 sm:p-5 rounded-2xl border border-border/80 shadow-xs">
              <Pagination
                meta={meta}
                page={page}
                onChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 260, behavior: 'smooth' });
                }}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                itemLabel="testimoni"
              />
            </div>
          </>
        )}
      </div>

      {/* Modal Detail Testimoni */}
      <TestimonialDetailModal
        id={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};
