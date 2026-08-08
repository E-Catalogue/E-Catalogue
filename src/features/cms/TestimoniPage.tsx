import { useState } from 'react';
import {
  Plus, Star, Quote, Pencil, Trash2, Eye, EyeOff, Save, ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { DateField } from '@/shared/components/ui/DateField';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { useTestimonials, useTestimonialMutations, useTestimonialSoldUnits, useUploadCmsImage } from './cms.hooks';
import { cmsImageUrl } from './cms.api';
import { ImageUpload } from './ImageUpload';
import type { Testimonial, TestimonialForm } from './cms.types';

const emptyForm: TestimonialForm = {
  name: '', role: '', title: '', city: '', text: '', rating: 5, avatarFilename: null, imageFilename: null,
  videoUrl: '', handoverDate: null, unitId: null, isPublished: false, sortOrder: 0,
};

export const TestimoniPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<{ item?: Testimonial } | null>(null);
  const [formData, setFormData] = useState<TestimonialForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [publishTarget, setPublishTarget] = useState<Testimonial | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const debounced = useDebouncedValue(search, 400);

  const { data, isLoading, isError } = useTestimonials({ page, limit, search: debounced || undefined });
  const rows = data?.data ?? [];
  const m = useTestimonialMutations();
  const upload = useUploadCmsImage('testimoni');
  const { data: soldUnits = [], isLoading: unitsLoading } = useTestimonialSoldUnits(!!form);

  const activeCount = rows.filter((t) => t.isPublished).length;
  const avgRating = rows.length ? (rows.reduce((a, t) => a + t.rating, 0) / rows.length).toFixed(1) : '—';

  const clearFiles = () => { setPendingAvatar(null); setPendingImage(null); };
  const closeForm = () => { setForm(null); setFormData(emptyForm); clearFiles(); };
  const openCreate = () => { setFormData({ ...emptyForm }); clearFiles(); setForm({}); };
  const openEdit = (t: Testimonial) => {
    setFormData({ name: t.name, role: t.role ?? '', title: t.title ?? '', city: t.city ?? '', text: t.text, rating: t.rating, avatarFilename: t.avatarFilename, imageFilename: t.imageFilename, videoUrl: t.videoUrl ?? '', handoverDate: t.handoverDate, unitId: t.unitId, isPublished: t.isPublished, sortOrder: t.sortOrder });
    clearFiles();
    setForm({ item: t });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let body = { ...formData };
      if (pendingAvatar) body = { ...body, avatarFilename: (await upload.mutateAsync(pendingAvatar)).filename };
      if (pendingImage) body = { ...body, imageFilename: (await upload.mutateAsync(pendingImage)).filename };
      if (form?.item) await m.update.mutateAsync({ id: form.item.id, body });
      else await m.create.mutateAsync(body);
      closeForm();
    } catch (err) { notifyApiError(err); }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    m.remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null), onError: (err) => notifyApiError(err) });
  };

  const confirmTogglePublish = () => {
    if (!publishTarget) return;
    m.setPublish.mutate(
      { id: publishTarget.id, isPublished: !publishTarget.isPublished },
      { onSuccess: () => setPublishTarget(null), onError: (err) => notifyApiError(err) },
    );
  };

  const saving = m.create.isPending || m.update.isPending;
  const unitOptions = soldUnits.map((unit) => ({ value: unit.id, label: unit.name, sublabel: `${unit.tahun} · ${unit.platNomor}` }));

  const columns: Column<Testimonial>[] = [
    {
      header: 'Nama',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm shrink-0">
            {r.name[0]}
          </div>
          <div>
            <p className="font-extrabold text-ink text-[13px]">{r.name}</p>
            {r.role && <p className="text-[11px] font-medium text-muted mt-0.5">{r.role}</p>}
          </div>
        </div>
      ),
    },
    {
      header: 'Rating',
      cell: (r) => (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} className={i < r.rating ? 'fill-accent-amber text-accent-amber' : 'text-muted/30'} />
          ))}
        </div>
      ),
    },
    { header: 'Unit Terjual', cell: (r) => <span className="text-[12px] font-semibold text-ink-soft">{r.unit?.name ?? 'Belum dipilih'}</span> },
    {
      header: 'Testimoni',
      cell: (r) => <p className="text-[12px] font-medium text-ink-soft max-w-xs truncate" title={r.text}>"{r.text}"</p>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (r) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${r.isPublished ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>
          {r.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
          {r.isPublished ? 'Tampil' : 'Sembunyi'}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (r) => (
        <ActionMenu items={[
          {
            icon: r.isPublished ? <EyeOff size={14} /> : <Eye size={14} />,
            label: r.isPublished ? 'Sembunyikan' : 'Tampilkan',
            onClick: () => setPublishTarget(r),
          },
          {
            icon: <Pencil size={14} />,
            label: 'Edit',
            onClick: () => openEdit(r),
          },
          {
            icon: <Trash2 size={14} />,
            label: 'Hapus',
            onClick: () => setDeleteTarget(r),
            variant: 'danger' as const,
            dividerAfter: true,
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Testimoni"
        description="Kelola testimoni pelanggan yang ditampilkan di halaman utama website."
        action={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button>
            </a>
            <Button icon={<Plus size={16} />} onClick={openCreate}>Tambah Testimoni</Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Quote size={20} className="text-primary" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Total Testimoni</p>
            <p className="text-xl font-extrabold text-ink">{isLoading ? '—' : rows.length}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0"><Eye size={20} className="text-accent-green" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Ditampilkan</p>
            <p className="text-xl font-extrabold text-accent-green">{isLoading ? '—' : activeCount}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-amber/10 flex items-center justify-center shrink-0"><Star size={20} className="text-accent-amber" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Rating Rata-rata</p>
            <p className="text-xl font-extrabold text-accent-amber">{isLoading ? '—' : avgRating}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <SectionCard
        title="Daftar Testimoni"
        icon={<Quote size={16} />}
        bodyClassName="p-0 md:p-0"
        action={
          <div className="w-56">
            <SearchInput
              placeholder="Cari testimoni..."
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
        }
      >
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat testimoni.</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Quote} title="Testimoni tidak ditemukan" description="Tambahkan testimoni baru atau ubah filter pencarian." />
        ) : (
          <>
            <DataTable columns={columns} data={rows} rowKey={(r) => r.id} />
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
                itemLabel="testimoni"
              />
            </div>
          </>
        )}
      </SectionCard>

      {/* Form Modal */}
      <Modal open={!!form} onClose={closeForm} title={form?.item ? 'Edit Testimoni' : 'Tambah Testimoni'} icon={<Quote size={20} />} size="lg">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-32 shrink-0">
              <ImageUpload label="Avatar (opsional)" aspect="aspect-square" previewUrl={cmsImageUrl('testimoni', formData.avatarFilename)} isUploading={upload.isPending} onFile={setPendingAvatar} />
              {pendingAvatar && <p className="mt-1 text-[10px] font-semibold text-primary">Dipilih: {pendingAvatar.name}</p>}
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4">
              <TextField label="Nama" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Andre P." />
              <TextField label="Profesi / Role" value={formData.role ?? ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="Karyawan Swasta" />
              <TextField label="Kota" value={formData.city ?? ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Tangerang" />
            </div>
          </div>
          <SearchableSelect label="Unit yang Dibeli" required value={formData.unitId ?? ''} onChange={(unitId) => setFormData({ ...formData, unitId })} options={unitOptions} loading={unitsLoading} placeholder="Pilih unit terjual" searchPlaceholder="Cari nama / plat unit..." />
          <div className="grid sm:grid-cols-2 gap-4"><TextField label="Judul Cerita" value={formData.title ?? ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Pelayanan jelas dari awal" /><DateField label="Tanggal Serah Terima" required value={formData.handoverDate?.slice(0, 10) ?? ''} onChange={(value) => setFormData({ ...formData, handoverDate: value })} /></div>
          <ImageUpload label="Foto Bukti Serah Terima" aspect="aspect-video" previewUrl={cmsImageUrl('testimoni', formData.imageFilename)} isUploading={upload.isPending} onFile={setPendingImage} />
          {pendingImage && <p className="-mt-3 text-[10px] font-semibold text-primary">Dipilih: {pendingImage.name}</p>}
          <TextField label="URL Video (opsional)" type="url" value={formData.videoUrl ?? ''} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="https://youtube.com/..." />
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Testimoni</label>
            <textarea required value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} rows={4}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
              placeholder="Tulis testimoni pelanggan..." />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setFormData({ ...formData, rating: r })} className="p-1 transition-transform hover:scale-110">
                  <Star size={22} className={r <= formData.rating ? 'fill-accent-amber text-accent-amber' : 'text-muted/30'} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="text-sm font-semibold text-ink">Tampilkan di website</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={closeForm}>Batal</Button>
            <Button type="submit" icon={<Save size={16} />} loading={saving || upload.isPending}>
              {saving ? 'Menyimpan…' : form?.item ? 'Simpan Perubahan' : 'Tambah Testimoni'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Testimoni"
        message={`Yakin ingin menghapus testimoni dari "${deleteTarget?.name}"?`}
        confirmLabel="Hapus"
        tone="danger"
        loading={m.remove.isPending}
        closeOnConfirm={false}
      />

      <ConfirmDialog
        open={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        onConfirm={confirmTogglePublish}
        title={publishTarget?.isPublished ? 'Sembunyikan Testimoni' : 'Tampilkan Testimoni'}
        message={publishTarget ? `${publishTarget.isPublished ? 'Sembunyikan' : 'Tampilkan'} testimoni dari "${publishTarget.name}" di halaman utama website?` : ''}
        confirmLabel={publishTarget?.isPublished ? 'Ya, Sembunyikan' : 'Ya, Tampilkan'}
        tone="primary"
        loading={m.setPublish.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};
