import { useState } from 'react';
import {
  Plus, Search, Star, Quote, Pencil, Trash2, Eye, EyeOff, Save, ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

/* ── Types & Dummy Data ───────────────────────────────────── */
interface Testimoni {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  isActive: boolean;
}

const DUMMY: Testimoni[] = [
  { id: '1', name: 'Andre P.', role: 'Karyawan Swasta', text: 'Pelayanan ramah, mobil sesuai deskripsi, surat lengkap. Proses kredit cepat banget!', rating: 5, isActive: true },
  { id: '2', name: 'Sinta W.', role: 'Wiraswasta', text: 'Sudah direkondisi jadi tinggal pakai. Harga transparan, nggak ada biaya tersembunyi.', rating: 5, isActive: true },
  { id: '3', name: 'Budi H.', role: 'PNS', text: 'Test drive dulu sebelum beli bikin tenang. Recommended banget buat beli mobil bekas.', rating: 5, isActive: true },
  { id: '4', name: 'Rina K.', role: 'Ibu Rumah Tangga', text: 'Cari mobil keluarga dan dapet yang sesuai budget. Terima kasih GM Mobilindo!', rating: 4, isActive: false },
];

type FormData = Omit<Testimoni, 'id'>;
const emptyForm: FormData = { name: '', role: '', text: '', rating: 5, isActive: true };

export const TestimoniPage = () => {
  const [data, setData] = useState<Testimoni[]>(DUMMY);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<{ item?: Testimoni } | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Testimoni | null>(null);

  const filtered = data.filter(t => {
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.text.toLowerCase().includes(q);
  });

  const activeCount = data.filter(t => t.isActive).length;

  const openCreate = () => { setFormData(emptyForm); setForm({}); };
  const openEdit = (t: Testimoni) => {
    setFormData({ name: t.name, role: t.role, text: t.text, rating: t.rating, isActive: t.isActive });
    setForm({ item: t });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form?.item) {
      setData(prev => prev.map(t => t.id === form.item!.id ? { ...t, ...formData } : t));
    } else {
      setData(prev => [...prev, { ...formData, id: String(Date.now()) }]);
    }
    setForm(null);
  };

  const handleDelete = () => {
    if (deleteTarget) setData(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleActive = (id: string) => {
    setData(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

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

      {/* ── Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Quote size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Total Testimoni</p>
            <p className="text-xl font-extrabold text-ink">{data.length}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0">
            <Eye size={20} className="text-accent-green" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Ditampilkan</p>
            <p className="text-xl font-extrabold text-accent-green">{activeCount}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-amber/10 flex items-center justify-center shrink-0">
            <Star size={20} className="text-accent-amber" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Rating Rata-rata</p>
            <p className="text-xl font-extrabold text-accent-amber">
              {data.length > 0 ? (data.reduce((a, t) => a + t.rating, 0) / data.length).toFixed(1) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari testimoni..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* ── Testimoni Cards ────────────────────────────────── */}
      <SectionCard title="Daftar Testimoni" icon={<Quote size={16} />} bodyClassName="p-0 md:p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Tidak ada testimoni ditemukan.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(t => (
              <div key={t.id} className={`flex items-start gap-4 p-4 transition-colors ${t.isActive ? 'bg-surface' : 'bg-surface-soft/40'} hover:bg-primary/[0.02]`}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm shrink-0">
                  {t.name[0]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-ink text-[13px]">{t.name}</h4>
                    <span className="text-[11px] font-semibold text-muted">• {t.role}</span>
                    {!t.isActive && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-muted/10 px-1.5 py-0.5 rounded">Hidden</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < t.rating ? 'fill-accent-amber text-accent-amber' : 'text-muted/30'} />
                    ))}
                  </div>
                  <p className="text-[13px] text-ink-soft font-medium mt-1.5 leading-relaxed line-clamp-2">"{t.text}"</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(t.id)}
                    className={`p-2 rounded-lg transition-colors ${t.isActive ? 'text-accent-green hover:bg-accent-green/10' : 'text-muted hover:bg-surface-soft'}`}
                    title={t.isActive ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {t.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors" title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10 transition-colors" title="Hapus">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Form Modal ─────────────────────────────────────── */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.item ? 'Edit Testimoni' : 'Tambah Testimoni'} icon={<Quote size={20} />}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Nama" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Andre P." />
            <TextField label="Profesi / Role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Karyawan Swasta" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Testimoni</label>
            <textarea
              required
              value={formData.text}
              onChange={e => setFormData({ ...formData, text: e.target.value })}
              rows={4}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
              placeholder="Tulis testimoni pelanggan..."
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: r })}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star size={22} className={r <= formData.rating ? 'fill-accent-amber text-accent-amber' : 'text-muted/30'} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm font-semibold text-ink">Tampilkan di website</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setForm(null)}>Batal</Button>
            <Button type="submit" icon={<Save size={16} />}>{form?.item ? 'Simpan Perubahan' : 'Tambah Testimoni'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ─────────────────────────────────── */}
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
