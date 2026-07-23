import { useState } from 'react';
import {
  Search, BookOpen, Car, Eye, EyeOff, Globe, Filter, Image as ImageIcon, ExternalLink, Sparkles, Tag, Images, Trash2, ArrowLeft, ArrowRight, ChevronDown, Save, Plus,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { cmsImageUrl } from './cms.api';
import { useCmsCatalog, useCmsCatalogMutations, useCatalogPage, useUpdateCatalogPage } from './cms.hooks';
import { ImageUpload } from './ImageUpload';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import type { CmsCatalogRow, CatalogPage as CatalogPageType, PriceRange } from './cms.types';
import { unitDisplayName } from '@/features/units/unit.display';

type ViewFilter = 'all' | 'published' | 'hidden';

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
                  <TextField label="Min" wrapClass="w-32" type="number" value={String(r.min)} onChange={(e) => setRange(i, { min: Number(e.target.value) })} />
                  <TextField label="Max (kosong=∞)" wrapClass="w-32" type="number" value={r.max == null ? '' : String(r.max)} onChange={(e) => setRange(i, { max: e.target.value === '' ? null : Number(e.target.value) })} />
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
  const [imgs, setImgs] = useState(() => row.images ?? []);
  const orderDirty = (row.images ?? []).map((image) => image.id).join(',') !== imgs.map((image) => image.id).join(',');
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...imgs];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setImgs(next);
  };
  const saveOrder = () => confirmAction({
    title: 'Simpan Urutan Foto',
    message: 'Simpan urutan foto katalog sesuai susunan saat ini?',
    confirmLabel: 'Simpan Urutan',
    execute: () => m.reorderImages.mutateAsync({ id: row.id, orderedIds: imgs.map((image) => image.id) }),
    onError: notifyApiError,
  });
  return (
    <Modal open onClose={onClose} title="Kelola Foto Unit" subtitle={`${unitDisplayName(row)} · ${row.platNomor}`} icon={<Images size={18} />} size="lg"
      busy={m.uploadImage.isPending || m.reorderImages.isPending || m.deleteImage.isPending}
      footer={<><Button variant="secondary" onClick={onClose}>Tutup</Button>{orderDirty && <Button onClick={saveOrder} loading={m.reorderImages.isPending}>Simpan Urutan</Button>}</>}>
      <div className="space-y-4">
        <ImageUpload label="Tambah Foto" aspect="aspect-[16/7]" previewUrl={null} isUploading={m.uploadImage.isPending}
          onFile={(file) => m.uploadImage.mutate({ id: row.id, file }, { onError: (e) => notifyApiError(e) })} />
        {imgs.length === 0 ? (
          <p className="text-center py-8 text-[12px] text-muted border border-dashed border-border rounded-xl">Belum ada foto.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imgs.map((img, i) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3] bg-surface-soft">
                <img src={cmsImageUrl('unit', img.filename) ?? ''} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">UTAMA</span>}
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-lg bg-white/90 text-ink flex items-center justify-center disabled:opacity-30"><ArrowLeft size={13} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === imgs.length - 1} className="w-7 h-7 rounded-lg bg-white/90 text-ink flex items-center justify-center disabled:opacity-30"><ArrowRight size={13} /></button>
                  <button
                    onClick={() => confirmAction({
                      title: 'Hapus Foto',
                      message: 'Foto ini akan dihapus permanen dari galeri unit. Lanjutkan?',
                      confirmLabel: 'Hapus Foto',
                      tone: 'danger',
                      execute: () => m.deleteImage.mutateAsync({ id: row.id, imageId: img.id }),
                      onError: notifyApiError,
                    })}
                    className="w-7 h-7 rounded-lg bg-semantic-error text-white flex items-center justify-center"
                  ><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

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
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const galleryRow = rows.find((r) => r.id === galleryId) ?? null;

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

      <CatalogHeaderEditor />

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
          <DataTable columns={columns} data={rows} rowKey={(u) => u.id} />
        )}
      </SectionCard>

      {galleryRow && <GalleryModal row={galleryRow} onClose={() => setGalleryId(null)} />}
    </div>
  );
};
