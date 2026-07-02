import { useState, useEffect } from 'react';
import {
  Eye, Target, Save, Heart, ShieldCheck, Award, Plus, Pencil, Trash2,
  Car, Users, ExternalLink, BarChart3, Building2, Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { notifyApiError } from '@/core/api/notify';
import { useCmsSection, useUpdateCmsSection } from './cms.hooks';
import type { AboutStats, AboutValues, AboutVisiMisi, CmsStat, CmsIconItem } from './cms.types';
import type { LucideIcon } from 'lucide-react';

const ICON_OPTIONS: { key: string; icon: LucideIcon; label: string }[] = [
  { key: 'car', icon: Car, label: 'Mobil' },
  { key: 'users', icon: Users, label: 'Pelanggan' },
  { key: 'award', icon: Award, label: 'Penghargaan' },
  { key: 'shield-check', icon: ShieldCheck, label: 'Shield' },
  { key: 'heart', icon: Heart, label: 'Hati' },
  { key: 'bar-chart-3', icon: BarChart3, label: 'Chart' },
  { key: 'building-2', icon: Building2, label: 'Gedung' },
  { key: 'target', icon: Target, label: 'Target' },
];
const resolveIcon = (key?: string): LucideIcon => ICON_OPTIONS.find((o) => o.key === key)?.icon ?? ShieldCheck;

type EditMode = 'stat' | 'value';
interface FormState { mode: EditMode; index: number | null; }

export const ProfilPage = () => {
  const vmQ = useCmsSection<AboutVisiMisi>('about', 'visi-misi');
  const statsQ = useCmsSection<AboutStats>('about', 'stats');
  const valuesQ = useCmsSection<AboutValues>('about', 'values');
  const vmM = useUpdateCmsSection<AboutVisiMisi>('about', 'visi-misi');
  const statsM = useUpdateCmsSection<AboutStats>('about', 'stats');
  const valuesM = useUpdateCmsSection<AboutValues>('about', 'values');

  const [vm, setVm] = useState<AboutVisiMisi | null>(null);
  const [stats, setStats] = useState<CmsStat[]>([]);
  const [values, setValues] = useState<CmsIconItem[]>([]);
  const [seeded, setSeeded] = useState(false);

  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ mode: EditMode; index: number } | null>(null);
  const [fIconKey, setFIconKey] = useState('shield-check');
  const [fValue, setFValue] = useState('');
  const [fLabel, setFLabel] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');

  useEffect(() => {
    if (!seeded && vmQ.data && statsQ.data && valuesQ.data) {
      setVm(structuredClone(vmQ.data));
      setStats(structuredClone(statsQ.data.items));
      setValues(structuredClone(valuesQ.data.items));
      setSeeded(true);
    }
  }, [seeded, vmQ.data, statsQ.data, valuesQ.data]);

  const loading = vmQ.isLoading || statsQ.isLoading || valuesQ.isLoading || !vm;
  const error = vmQ.isError || statsQ.isError || valuesQ.isError;
  if (loading) {
    if (error) return <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat halaman Tentang.</div>;
    return <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={24} className="animate-spin" /></div>;
  }

  const handleSave = () => {
    if (vm) vmM.mutate(vm, { onError: (e) => notifyApiError(e) });
    statsM.mutate({ items: stats }, { onError: (e) => notifyApiError(e) });
    valuesM.mutate({ ...valuesQ.data, items: values }, { onError: (e) => notifyApiError(e) });
  };
  const saving = vmM.isPending || statsM.isPending || valuesM.isPending;

  const openAddStat = () => { setFIconKey('car'); setFValue(''); setFLabel(''); setForm({ mode: 'stat', index: null }); };
  const openEditStat = (i: number) => { const s = stats[i]; setFIconKey(s.icon ?? 'car'); setFValue(s.value); setFLabel(s.label); setForm({ mode: 'stat', index: i }); };
  const openAddValue = () => { setFIconKey('shield-check'); setFTitle(''); setFDesc(''); setForm({ mode: 'value', index: null }); };
  const openEditValue = (i: number) => { const v = values[i]; setFIconKey(v.icon); setFTitle(v.title); setFDesc(v.desc); setForm({ mode: 'value', index: i }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (form.mode === 'stat') {
      const entry: CmsStat = { icon: fIconKey, value: fValue, label: fLabel };
      setStats((p) => (form.index === null ? [...p, entry] : p.map((s, i) => (i === form.index ? entry : s))));
    } else {
      const entry: CmsIconItem = { icon: fIconKey, title: fTitle, desc: fDesc };
      setValues((p) => (form.index === null ? [...p, entry] : p.map((v, i) => (i === form.index ? entry : v))));
    }
    setForm(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.mode === 'stat') setStats((p) => p.filter((_, i) => i !== deleteTarget.index));
    else setValues((p) => p.filter((_, i) => i !== deleteTarget.index));
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Profil Perusahaan"
        description="Kelola visi, misi, statistik, dan core values di halaman Tentang Kami."
        action={
          <div className="flex gap-2">
            <a href="/tentang" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>
            <Button icon={<Save size={16} />} onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        }
      />

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Visi" icon={<Eye size={16} />}>
          <textarea value={vm.visi} onChange={(e) => setVm((p) => (p ? { ...p, visi: e.target.value } : p))} rows={4}
            className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y" placeholder="Visi perusahaan..." />
        </SectionCard>
        <SectionCard title="Misi" icon={<Target size={16} />}>
          <textarea value={vm.misi} onChange={(e) => setVm((p) => (p ? { ...p, misi: e.target.value } : p))} rows={4}
            className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y" placeholder="Misi perusahaan..." />
        </SectionCard>
      </div>

      {/* Statistik */}
      <SectionCard title="Statistik Perusahaan" icon={<BarChart3 size={16} />}
        action={<Button variant="secondary" icon={<Plus size={14} />} onClick={openAddStat}>Tambah</Button>}>
        {stats.length === 0 ? (
          <p className="text-center text-muted text-sm py-8 font-semibold">Belum ada statistik.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s, i) => {
              const Icon = resolveIcon(s.icon);
              return (
                <div key={i} className="group relative bg-surface-soft rounded-2xl border border-border p-5 text-center hover:shadow-card transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-2.5"><Icon size={20} /></div>
                  <p className="text-xl font-extrabold text-ink">{s.value}</p>
                  <p className="text-[11px] font-semibold text-muted mt-0.5">{s.label}</p>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditStat(i)} className="p-1.5 rounded-lg bg-surface text-muted hover:text-accent-blue transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => setDeleteTarget({ mode: 'stat', index: i })} className="p-1.5 rounded-lg bg-surface text-muted hover:text-semantic-error transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Core Values */}
      <SectionCard title="Core Values" icon={<Heart size={16} />}
        action={<Button variant="secondary" icon={<Plus size={14} />} onClick={openAddValue}>Tambah</Button>}>
        {values.length === 0 ? (
          <p className="text-center text-muted text-sm py-8 font-semibold">Belum ada core values.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map((v, i) => {
              const Icon = resolveIcon(v.icon);
              return (
                <div key={i} className="group relative bg-surface-soft rounded-2xl border border-border p-5 hover:shadow-card transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3"><Icon size={20} /></div>
                  <h4 className="font-extrabold text-ink text-[14px]">{v.title}</h4>
                  <p className="text-[12px] text-muted font-medium mt-1 leading-relaxed line-clamp-3">{v.desc}</p>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditValue(i)} className="p-1.5 rounded-lg bg-surface text-muted hover:text-accent-blue transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => setDeleteTarget({ mode: 'value', index: i })} className="p-1.5 rounded-lg bg-surface text-muted hover:text-semantic-error transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Modal */}
      <Modal open={!!form} onClose={() => setForm(null)}
        title={form ? `${form.index !== null ? 'Edit' : 'Tambah'} ${form.mode === 'stat' ? 'Statistik' : 'Core Value'}` : ''}
        icon={form?.mode === 'stat' ? <BarChart3 size={20} /> : <Heart size={20} />}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button key={opt.key} type="button" onClick={() => setFIconKey(opt.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors ${fIconKey === opt.key ? 'bg-primary text-white border-primary' : 'bg-surface-soft border-border text-ink-soft hover:border-primary'}`}>
                    <Icon size={14} /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          {form?.mode === 'stat' ? (
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Nilai" required value={fValue} onChange={(e) => setFValue(e.target.value)} placeholder="2.500+ / auto" />
              <TextField label="Label" required value={fLabel} onChange={(e) => setFLabel(e.target.value)} placeholder="Unit Terjual" />
            </div>
          ) : (
            <>
              <TextField label="Judul" required value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Transparan" />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Deskripsi</label>
                <textarea required value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={3}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y" placeholder="Deskripsi value..." />
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setForm(null)}>Batal</Button>
            <Button type="submit" icon={<Save size={16} />}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus ${deleteTarget?.mode === 'stat' ? 'Statistik' : 'Core Value'}`}
        message="Yakin ingin menghapus item ini? Perubahan tersimpan setelah klik Simpan."
        confirmLabel="Hapus"
        tone="danger"
      />
    </div>
  );
};
