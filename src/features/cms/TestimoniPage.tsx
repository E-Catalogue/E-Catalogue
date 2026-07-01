import { useState } from 'react';
import {
  Plus, Search, Star, Quote, Pencil, Trash2, Eye, EyeOff, Save, ExternalLink, Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { cmsImageUrl } from './cms.api';
import { useTestimonials, useTestimonialMutations } from './cms.hooks';
import type { Testimonial, TestimonialForm } from './cms.types';

const emptyForm: TestimonialForm = {
  name: '', role: '', text: '', rating: 5, avatarFilename: null, isPublished: true, sortOrder: 0,
};

export const TestimoniPage = () => {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<{ item?: Testimonial } | null>(null);
  const [formData, setFormData] = useState<TestimonialForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const debounced = useDebouncedValue(search, 400);

  const { data, isLoading, isError } = useTestimonials({ page: 1, limit: 100, search: debounced || undefined });
  const rows = data?.data ?? [];
  const m = useTestimonialMutations();

  const activeCount = rows.filter((t) => t.isPublished).length;
  const avgRating = rows.length ? (rows.reduce((a, t) => a + t.rating, 0) / rows.length).toFixed(1) : '—';

  const openCreate = () => { setFormData(emptyForm); setForm({}); };
  const openEdit = (t: Testimonial) => {
    setFormData({ name: t.name, role: t.role ?? '', text: t.text, rating: t.rating, avatarFilename: t.avatarFilename, isPublished: t.isPublished, sortOrder: t.sortOrder });
    setForm({ item: t });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onDone = { onSuccess: () => setForm(null), onError: (err: unknown) => notifyApiError(err) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: formData }, onDone);
    else m.create.mutate(formData, onDone);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    m.remove.mutate(deleteTarget.id, { onError: (err) => notifyApiError(err) });
    setDeleteTarget(null);
  };

  const togglePublish = (t: Testimonial) =>
    m.setPublish.mutate({ id: t.id, isPublished: !t.isPublished }, { onError: (err) => notifyApiError(err) });

  const saving = m.create.isPending || m.update.isPending;

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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari testimoni..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* List */}
      <SectionCard title="Daftar Testimoni" icon={<Quote size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={22} className="animate-spin" /></div>
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat testimoni.</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Tidak ada testimoni ditemukan.</div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((t) => {
              const avatar = cmsImageUrl('testimoni', t.avatarFilename);
              return (
                <div key={t.id} className={`flex items-start gap-4 p-4 transition-colors ${t.isPublished ? 'bg-surface' : 'bg-surface-soft/40'} hover:bg-primary/[0.02]`}>
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm shrink-0 overflow-hidden">
                    {avatar ? <img src={avatar} alt={t.name} className="w-full h-full object-cover" /> : t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-ink text-[13px]">{t.name}</h4>
                      {t.role && <span className="text-[11px] font-semibold text-muted">• {t.role}</span>}
                      {!t.isPublished && <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-muted/10 px-1.5 py-0.5 rounded">Hidden</span>}
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < t.rating ? 'fill-accent-amber text-accent-amber' : 'text-muted/30'} />
                      ))}
                    </div>
                    <p className="text-[13px] text-ink-soft font-medium mt-1.5 leading-relaxed line-clamp-2">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => togglePublish(t)} className={`p-2 rounded-lg transition-colors ${t.isPublished ? 'text-accent-green hover:bg-accent-green/10' : 'text-muted hover:bg-surface-soft'}`} title={t.isPublished ? 'Sembunyikan' : 'Tampilkan'}>
                      {t.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10 transition-colors" title="Hapus"><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Form Modal */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.item ? 'Edit Testimoni' : 'Tambah Testimoni'} icon={<Quote size={20} />}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Nama" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Andre P." />
            <TextField label="Profesi / Role" value={formData.role ?? ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="Karyawan Swasta" />
          </div>
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
            <Button variant="secondary" type="button" onClick={() => setForm(null)}>Batal</Button>
            <Button type="submit" icon={<Save size={16} />} disabled={saving}>
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
      />
    </div>
  );
};
