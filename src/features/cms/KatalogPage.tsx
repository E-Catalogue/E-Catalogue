import { useState } from 'react';
import {
  BookOpen, Car, Eye, EyeOff, Globe, Filter, Image as ImageIcon, ExternalLink, Sparkles, Star, Tag, Images, Trash2, ChevronDown, Save, Plus, AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { NumericField, TextField } from '@/shared/components/ui/Field';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { useCmsCatalog, useCmsCatalogMutations, useCatalogPage, useUpdateCatalogPage } from './cms.hooks';
import { UnitGalleryManager } from '@/features/units/UnitGalleryManager';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import type { CmsCatalogRow, CatalogPage as CatalogPageType, PriceRange } from './cms.types';
import { unitDisplayName } from '@/features/units/unit.display';

type ViewFilter = 'all' | 'published' | 'hidden' | 'featured';

const idr = (n?: number | null) => (n == null ? '—' : formatCurrency(n, { compact: true }));

/* ── Header halaman katalog + price ranges ── */
const CatalogHeaderEditor = () => {
  const { data, isLoading } = useCatalogPage();
  const update = useUpdateCatalogPage();
  const confirmAction = useConfirmedAction();
  const [draft, setDraft] = useState<CatalogPageType | null>(null);
  const f = draft ?? data ?? null;
  const setF = setDraft;
  const [open, setOpen] = useState(false);
  if (isLoading || !f) return null;

  const save = () => confirmAction({
    title: 'Simpan Header Katalog',
    message: 'Perubahan akan langsung tayang di halaman katalog publik. Lanjutkan?',
    confirmLabel: 'Simpan',
    tone: 'primary',
    execute: () => update.mutateAsync(f),
    onSuccess: () => setDraft(null),
    onError: (e) => notifyApiError(e),
  });

  const setRange = (i: number, patch: Partial<PriceRange>) => setF({ ...f, priceRanges: f.priceRanges.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

  return (
    <div className="bg-surface rounded-2xl border border-border">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center"><BookOpen size={16} className="text-primary" /></div>
          <div><p className="text-[13px] font-extrabold text-ink">Header & Filter Harga Halaman Katalog</p><p className="text-[11px] text-muted font-medium">Judul halaman + rentang harga filter</p></div>
        </div>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField label="Eyebrow" value={f.eyebrow} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} />
            <TextField label="Judul" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <TextField label="Subtitle" value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Rentang Harga (tombol filter)</p>
            <div className="space-y-2">
              {f.priceRanges.map((r, i) => (
                <div key={i} className="flex items-end gap-2 rounded-xl border border-border bg-surface-soft p-2.5">
                  <TextField label="Label" wrapClass="flex-1" value={r.label} onChange={(e) => setRange(i, { label: e.target.value })} placeholder="< 100 Juta" />
                  <NumericField label="Min" wrapClass="w-36" prefix="Rp" value={r.min} onChange={(value) => setRange(i, { min: value })} />
                  <NumericField label="Max (0=∞)" wrapClass="w-36" prefix="Rp" value={r.max ?? 0} onChange={(value) => setRange(i, { max: value || null })} />
                  <button onClick={() => setF({ ...f, priceRanges: f.priceRanges.filter((_, idx) => idx !== i) })} className="p-2 mb-0.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setF({ ...f, priceRanges: [...f.priceRanges, { label: '', min: 0, max: null }] })} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"><Plus size={14} /> Tambah Rentang</button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button icon={<Save size={15} />} onClick={save} loading={update.isPending}>{update.isPending ? 'Menyimpan…' : 'Simpan Header'}</Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Modal kelola galeri foto ── */
const GalleryModal = ({ row, onClose }: { row: CmsCatalogRow; onClose: () => void }) => {
  const m = useCmsCatalogMutations();
  const confirmAction = useConfirmedAction();
  const deleteImage = (imageId: string) => confirmAction({
    title: 'Hapus Foto',
    message: 'Foto ini akan dihapus permanen dari galeri unit. Lanjutkan?',
    confirmLabel: 'Hapus Foto',
    tone: 'danger',
    execute: () => m.deleteImage.mutateAsync({ id: row.id, imageId }),
    onError: notifyApiError,
  });
  return (
    <Modal open onClose={onClose} title="Kelola Foto Unit" subtitle={`${unitDisplayName(row)} · ${row.platNomor}`} icon={<Images size={18} />} size="lg"
      busy={m.uploadImages.isPending || m.reorderImages.isPending || m.deleteImage.isPending || m.setMainImage.isPending}
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}>
      <UnitGalleryManager
        images={row.images ?? []}
        uploading={m.uploadImages.isPending}
        reordering={m.reorderImages.isPending}
        deleting={m.deleteImage.isPending}
        settingMain={m.setMainImage.isPending}
        onUpload={(files, mainIndex) => m.uploadImages.mutateAsync({ id: row.id, files, mainIndex }).catch((e) => { notifyApiError(e); throw e; })}
        onReorder={(next) => m.reorderImages.mutate({ id: row.id, orderedIds: next.map((i) => i.id) }, { onError: (e) => notifyApiError(e) })}
        onSetMain={(imageId) => m.setMainImage.mutate({ id: row.id, imageId }, { onError: (e) => notifyApiError(e) })}
        onDelete={deleteImage}
        emptyHint="Belum ada foto."
      />
    </Modal>
  );
};

export const KatalogPage = () => {
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(15);
  const [search, setSearch]         = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const debounced = useDebouncedValue(search, 400);

  const params = {
    page,
    limit,
    search: debounced || undefined,
    isPublished: viewFilter === 'published' ? true : viewFilter === 'hidden' ? false : undefined,
    isFeatured: viewFilter === 'featured' ? true : undefined,
  };
  const { data, isLoading, isError } = useCmsCatalog(params);
  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? rows.length;
  const m = useCmsCatalogMutations();
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [unfinalizedUnit, setUnfinalizedUnit] = useState<CmsCatalogRow | null>(null);
  const galleryRow = rows.find((r) => r.id === galleryId) ?? null;

  const publishedCount = rows.filter((u) => u.isPublished).length;
  const featuredCount = rows.filter((u) => u.isFeatured).length;

  const isUnitPricingFinalized = (u: CmsCatalogRow) =>
    Boolean(u.isPricingFinalized || u.pricingFinalizedAt);

  const patch = (id: string, body: Parameters<typeof m.publish.mutate>[0]['body']) =>
    m.publish.mutate({ id, body }, { onError: (err) => notifyApiError(err) });

  const handleTogglePublish = (u: CmsCatalogRow) => {
    if (!u.isPublished && !isUnitPricingFinalized(u)) {
      setUnfinalizedUnit(u);
      return;
    }
    m.publish.mutate(
      { id: u.id, body: { isPublished: !u.isPublished } },
      {
        onError: (error: any) => {
          if (error?.response?.data?.error?.code === 'UNIT_PRICING_NOT_FINALIZED') {
            setUnfinalizedUnit(u);
          } else {
            notifyApiError(error);
          }
        },
      },
    );
  };

  const handleToggleFeatured = (u: CmsCatalogRow) => {
    if (!u.isFeatured && !isUnitPricingFinalized(u)) {
      setUnfinalizedUnit(u);
      return;
    }
    m.patchFeatured.mutate(
      { id: u.id, isFeatured: !u.isFeatured },
      {
        onError: (error: any) => {
          if (error?.response?.data?.error?.code === 'UNIT_PRICING_NOT_FINALIZED') {
            setUnfinalizedUnit(u);
          } else {
            notifyApiError(error);
          }
        },
      },
    );
  };

  const VIEW_FILTERS: { key: ViewFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all',       label: 'Semua',        icon: <Filter size={13} /> },
    { key: 'published', label: 'Ditampilkan',  icon: <Eye size={13} /> },
    { key: 'hidden',    label: 'Disembunyikan', icon: <EyeOff size={13} /> },
    { key: 'featured',  label: 'Unggulan',      icon: <Star size={13} /> },
  ];

  const columns: Column<CmsCatalogRow>[] = [
    {
      header: 'Unit',
      cell: (u) => (
        <div className="min-w-0">
          <p className="font-bold text-ink text-[13px] truncate" title={unitDisplayName(u)}>{unitDisplayName(u)}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5 truncate">
            {[u.merek?.name, u.tipe?.name].filter(Boolean).join(' ') || '—'}{u.variant ? ` ${u.variant}` : ''} · {u.platNomor}
          </p>
        </div>
      ),
    },
    {
      header: 'Tahun / Transmisi',
      cell: (u) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink text-[13px]">{u.tahun}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${u.transmisi === 'AUTOMATIC' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted/10 text-muted'}`}>
            {u.transmisi === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
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
          <StatusBadge status={u.statusUnit} />
          {u.isNew && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary"><Sparkles size={9} /> BARU</span>}
        </div>
      ),
    },
    {
      header: 'Tayang',
      align: 'center',
      cell: (u) => (
        <div className="flex flex-col gap-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold w-fit ${u.isPublished ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>
            {u.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}{u.isPublished ? 'Tayang' : 'Hidden'}
          </span>
          {u.isFeatured && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold w-fit bg-accent-amber/10 text-accent-amber">
              <Star size={12} className="fill-current" /> Unggulan
            </span>
          )}
        </div>
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
            onClick: () => handleTogglePublish(u),
            variant: u.isPublished ? 'danger' : 'primary',
          },
          {
            icon: <Star size={13} className={u.isFeatured ? "text-accent-amber fill-accent-amber" : ""} />,
            label: u.isFeatured ? 'Hapus dari Unggulan' : 'Jadikan Unit Unggulan',
            onClick: () => handleToggleFeatured(u),
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
            dividerAfter: true,
          },
          {
            icon: <Images size={13} />,
            label: `Kelola Foto (${u.imageCount})`,
            onClick: () => setGalleryId(u.id),
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Katalog Publik"
        description="Kelola visibilitas unit yang ditampilkan ke halaman katalog pelanggan."
        action={
          <a href="/katalog" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" icon={<ExternalLink size={15} />}>Lihat Katalog</Button>
          </a>
        }
      />

      <CatalogHeaderEditor />

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { icon: <Car size={18} className="text-primary" />, bg: 'bg-primary/10', label: 'Total Unit', value: total },
          { icon: <Globe size={18} className="text-accent-green" />, bg: 'bg-accent-green/10', label: 'Tayang di Katalog', value: publishedCount, color: 'text-accent-green' },
          { icon: <EyeOff size={18} className="text-muted" />, bg: 'bg-muted/10', label: 'Disembunyikan', value: Math.max(0, total - publishedCount), color: 'text-muted' },
          { icon: <Star size={18} className="text-accent-amber fill-accent-amber" />, bg: 'bg-accent-amber/10', label: 'Unit Unggulan', value: featuredCount, color: 'text-accent-amber' },
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
              onClick={() => {
                setViewFilter(f.key);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
                viewFilter === f.key ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
              }`}
            >
              {f.icon}{f.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72 sm:ml-auto">
          <SearchInput
            placeholder="Cari merek, tipe, plat..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <SectionCard title={`Daftar Unit (${total})`} icon={<BookOpen size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <Car size={32} className="text-muted mx-auto mb-3" />
            <p className="font-bold text-ink text-[14px]">Tidak ada unit ditemukan.</p>
            <p className="text-muted text-[12px] font-medium mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={rows} rowKey={(u) => u.id} />
            <div className="px-4 pb-4">
              <Pagination
                meta={data?.meta}
                page={page}
                onChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                itemLabel="unit"
              />
            </div>
          </>
        )}
      </SectionCard>

      {galleryRow && <GalleryModal row={galleryRow} onClose={() => setGalleryId(null)} />}

      {unfinalizedUnit && (
        <Modal
          open={!!unfinalizedUnit}
          onClose={() => setUnfinalizedUnit(null)}
          title="Harga Belum Difinalisasi"
          icon={<AlertTriangle size={20} className="text-semantic-error" />}
          size="md"
          footer={<Button onClick={() => setUnfinalizedUnit(null)}>Saya Mengerti</Button>}
        >
          <div className="space-y-3 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-semantic-error/10 text-semantic-error mx-auto flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-extrabold text-ink text-[15px]">Unit Belum Siap Ditampilkan</h3>
            <p className="text-muted text-[13px] leading-relaxed">
              Unit <strong className="text-ink">{unitDisplayName(unfinalizedUnit)}</strong> ({unfinalizedUnit.platNomor}) belum menyelesaikan <strong>Finalisasi Harga</strong>.
            </p>
            <div className="text-left text-muted text-[12px] bg-surface-soft p-3.5 rounded-xl border border-border space-y-1.5">
              <p className="font-bold text-ink text-[12px]">Ketentuan Katalog Publik:</p>
              <p>• Unit hanya dapat ditampilkan di katalog publik atau dijadikan unit unggulan setelah harga OTR difinalisasi.</p>
              <p>• Silakan buka menu <strong>Inventori &gt; Detail Unit</strong> untuk memfinalisasi harga OTR unit ini terlebih dahulu.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
