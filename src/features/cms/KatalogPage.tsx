import { useState } from 'react';
import {
  Search, BookOpen, Car, Eye, EyeOff, Globe, Filter,
  Image as ImageIcon, ExternalLink, Loader2, Sparkles, Tag,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { useCmsCatalog, useCmsCatalogMutations } from './cms.hooks';
import type { CmsCatalogRow } from './cms.types';

type ViewFilter = 'all' | 'published' | 'hidden';

const idr = (n?: number | null) => (n == null ? '—' : formatCurrency(n, { compact: true }));

export const KatalogPage = () => {
  const [search, setSearch]         = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const debounced = useDebouncedValue(search, 400);

  const params = {
    page: 1, limit: 100,
    search: debounced || undefined,
    isPublished: viewFilter === 'all' ? undefined : viewFilter === 'published',
  };
  const { data, isLoading, isError } = useCmsCatalog(params);
  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? rows.length;
  const m = useCmsCatalogMutations();

  const publishedCount = rows.filter((u) => u.isPublished).length;

  const patch = (id: string, body: Parameters<typeof m.publish.mutate>[0]['body']) =>
    m.publish.mutate({ id, body }, { onError: (err) => notifyApiError(err) });

  const VIEW_FILTERS: { key: ViewFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all',       label: 'Semua',        icon: <Filter size={13} /> },
    { key: 'published', label: 'Ditampilkan',  icon: <Eye size={13} /> },
    { key: 'hidden',    label: 'Disembunyikan', icon: <EyeOff size={13} /> },
  ];

  const columns: Column<CmsCatalogRow>[] = [
    {
      header: 'Unit',
      cell: (u) => (
        <div>
          <p className="font-bold text-ink text-[13px]">
            {u.merek?.name ?? '—'} {u.tipe?.name ?? ''} {u.variant ? <span className="text-muted font-medium">{u.variant}</span> : null}
          </p>
          <p className="text-[11px] text-muted font-medium mt-0.5">{u.platNomor}</p>
        </div>
      ),
    },
    {
      header: 'Tahun / Transmisi',
      cell: (u) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink text-[13px]">{u.tahun}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${u.transmisi === 'AUTOMATIC' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted/10 text-muted'}`}>
            {u.transmisi === 'AUTOMATIC' ? 'AT' : 'MT'}
          </span>
        </div>
      ),
    },
    {
      header: 'KM',
      align: 'right',
      cell: (u) => <span className="font-semibold text-muted text-[12px]">{formatNumber(u.kilometer)}</span>,
    },
    {
      header: 'Foto',
      align: 'center',
      cell: (u) => (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${u.imageCount > 0 ? 'text-muted' : 'text-semantic-error'}`}>
          <ImageIcon size={12} />{u.imageCount}
        </span>
      ),
    },
    {
      header: 'Harga',
      align: 'right',
      cell: (u) => <span className="font-bold text-primary text-[13px]">{idr(u.harga)}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (u) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${u.statusKatalog === 'READY' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'}`}>
            {u.statusKatalog}
          </span>
          {u.isNew && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary"><Sparkles size={9} /> BARU</span>}
        </div>
      ),
    },
    {
      header: 'Tayang',
      align: 'center',
      cell: (u) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${u.isPublished ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>
          {u.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}{u.isPublished ? 'Tayang' : 'Hidden'}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (u) => (
        <ActionMenu items={[
          {
            icon: u.isPublished ? <EyeOff size={13} /> : <Eye size={13} />,
            label: u.isPublished ? 'Sembunyikan dari Katalog' : 'Tampilkan di Katalog',
            onClick: () => patch(u.id, { isPublished: !u.isPublished }),
            variant: u.isPublished ? 'danger' : 'primary',
            dividerAfter: true,
          },
          {
            icon: <Sparkles size={13} />,
            label: u.isNew ? 'Hapus Badge "Baru"' : 'Tandai "Baru"',
            onClick: () => patch(u.id, { isNew: !u.isNew }),
          },
          {
            icon: <Tag size={13} />,
            label: u.statusKatalog === 'READY' ? 'Tandai Booked' : 'Tandai Ready',
            onClick: () => patch(u.id, { statusKatalog: u.statusKatalog === 'READY' ? 'BOOKED' : 'READY' }),
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto  space-y-5">
      <PageHeader
        title="Katalog Publik"
        description="Kelola visibilitas unit yang ditampilkan ke halaman katalog pelanggan."
        action={
          <a href="/katalog" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" icon={<ExternalLink size={15} />}>Lihat Katalog</Button>
          </a>
        }
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: <Car size={18} className="text-primary" />, bg: 'bg-primary/10', label: 'Total Unit', value: total },
          { icon: <Globe size={18} className="text-accent-green" />, bg: 'bg-accent-green/10', label: 'Tayang di Katalog', value: publishedCount, color: 'text-accent-green' },
          { icon: <EyeOff size={18} className="text-muted" />, bg: 'bg-muted/10', label: 'Disembunyikan', value: rows.length - publishedCount, color: 'text-muted' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{s.label}</p>
              <p className={`text-xl font-extrabold ${s.color ?? 'text-ink'}`}>{isLoading ? '—' : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {VIEW_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setViewFilter(f.key)}
              className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
                viewFilter === f.key ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
              }`}
            >
              {f.icon}{f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari merek, tipe, plat..."
            className="w-full sm:w-72 h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>
      </div>

      {/* Table */}
      <SectionCard title={`Daftar Unit (${rows.length})`} icon={<BookOpen size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted gap-2"><Loader2 size={22} className="animate-spin" /></div>
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <Car size={32} className="text-muted mx-auto mb-3" />
            <p className="font-bold text-ink text-[14px]">Tidak ada unit ditemukan.</p>
            <p className="text-muted text-[12px] font-medium mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={rows} rowKey={(u) => u.id} />
        )}
      </SectionCard>
    </div>
  );
};
