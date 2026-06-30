import { useState } from 'react';
import {
  Eye, Target, Save, Heart, ShieldCheck, Award, Plus, Pencil, Trash2,
  Car, Users, ExternalLink, BarChart3, Building2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import type { LucideIcon } from 'lucide-react';

/* ── Types & Dummy ────────────────────────────────────────── */
interface VisiMisi {
  visi: string;
  misi: string;
}

interface StatItem {
  id: string;
  iconKey: string;
  value: string;
  label: string;
}

interface ValueItem {
  id: string;
  iconKey: string;
  title: string;
  desc: string;
}

const ICON_OPTIONS: { key: string; icon: LucideIcon; label: string }[] = [
  { key: 'car', icon: Car, label: 'Mobil' },
  { key: 'users', icon: Users, label: 'Pelanggan' },
  { key: 'award', icon: Award, label: 'Penghargaan' },
  { key: 'shield', icon: ShieldCheck, label: 'Shield' },
  { key: 'heart', icon: Heart, label: 'Hati' },
  { key: 'chart', icon: BarChart3, label: 'Chart' },
  { key: 'building', icon: Building2, label: 'Gedung' },
  { key: 'target', icon: Target, label: 'Target' },
];

const resolveIcon = (key: string): LucideIcon => ICON_OPTIONS.find(o => o.key === key)?.icon ?? ShieldCheck;

const INITIAL_VM: VisiMisi = {
  visi: 'Menjadi showroom mobil bekas paling terpercaya dan transparan di Indonesia, pilihan utama setiap keluarga.',
  misi: 'Menyediakan mobil bekas berkualitas yang terinspeksi & bergaransi, dengan harga jujur dan layanan yang memudahkan setiap pelanggan.',
};

const INITIAL_STATS: StatItem[] = [
  { id: '1', iconKey: 'car', value: '2.500+', label: 'Unit Terjual' },
  { id: '2', iconKey: 'users', value: '5.000+', label: 'Pelanggan Puas' },
  { id: '3', iconKey: 'award', value: '10+', label: 'Tahun Pengalaman' },
  { id: '4', iconKey: 'shield', value: '150+', label: 'Titik Inspeksi' },
];

const INITIAL_VALUES: ValueItem[] = [
  { id: '1', iconKey: 'shield', title: 'Transparan', desc: 'Kondisi & riwayat mobil kami sampaikan apa adanya. Tanpa biaya tersembunyi.' },
  { id: '2', iconKey: 'heart', title: 'Mengutamakan Pelanggan', desc: 'Kepuasan dan kepercayaan Anda adalah prioritas utama kami.' },
  { id: '3', iconKey: 'award', title: 'Kualitas Terjamin', desc: 'Setiap unit melalui inspeksi & rekondisi sebelum dipasarkan.' },
];

type EditMode = 'stat' | 'value';
interface FormState {
  mode: EditMode;
  item?: StatItem | ValueItem;
}

export const ProfilPage = () => {
  const [vm, setVm] = useState<VisiMisi>(INITIAL_VM);
  const [stats, setStats] = useState<StatItem[]>(INITIAL_STATS);
  const [values, setValues] = useState<ValueItem[]>(INITIAL_VALUES);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ mode: EditMode; id: string } | null>(null);

  // Form state
  const [fIconKey, setFIconKey] = useState('shield');
  const [fValue, setFValue] = useState('');
  const [fLabel, setFLabel] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openAddStat = () => {
    setFIconKey('car'); setFValue(''); setFLabel('');
    setForm({ mode: 'stat' });
  };

  const openEditStat = (s: StatItem) => {
    setFIconKey(s.iconKey); setFValue(s.value); setFLabel(s.label);
    setForm({ mode: 'stat', item: s });
  };

  const openAddValue = () => {
    setFIconKey('shield'); setFTitle(''); setFDesc('');
    setForm({ mode: 'value' });
  };

  const openEditValue = (v: ValueItem) => {
    setFIconKey(v.iconKey); setFTitle(v.title); setFDesc(v.desc);
    setForm({ mode: 'value', item: v });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    if (form.mode === 'stat') {
      const entry: StatItem = { id: form.item?.id || String(Date.now()), iconKey: fIconKey, value: fValue, label: fLabel };
      if (form.item) {
        setStats(prev => prev.map(s => s.id === entry.id ? entry : s));
      } else {
        setStats(prev => [...prev, entry]);
      }
    } else {
      const entry: ValueItem = { id: form.item?.id || String(Date.now()), iconKey: fIconKey, title: fTitle, desc: fDesc };
      if (form.item) {
        setValues(prev => prev.map(v => v.id === entry.id ? entry : v));
      } else {
        setValues(prev => [...prev, entry]);
      }
    }
    setForm(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.mode === 'stat') setStats(prev => prev.filter(s => s.id !== deleteTarget.id));
    else setValues(prev => prev.filter(v => v.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Profil Perusahaan"
        description="Kelola visi, misi, statistik, dan core values di halaman Tentang Kami."
        action={
          <div className="flex gap-2">
            <a href="/tentang" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button>
            </a>
            <Button icon={<Save size={16} />} onClick={handleSave}>
              {saved ? '✓ Tersimpan' : 'Simpan'}
            </Button>
          </div>
        }
      />

      {/* ── Visi & Misi ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Visi" icon={<Eye size={16} />}>
          <textarea
            value={vm.visi}
            onChange={e => { setVm(prev => ({ ...prev, visi: e.target.value })); setSaved(false); }}
            rows={4}
            className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
            placeholder="Visi perusahaan..."
          />
        </SectionCard>
        <SectionCard title="Misi" icon={<Target size={16} />}>
          <textarea
            value={vm.misi}
            onChange={e => { setVm(prev => ({ ...prev, misi: e.target.value })); setSaved(false); }}
            rows={4}
            className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
            placeholder="Misi perusahaan..."
          />
        </SectionCard>
      </div>

      {/* ── Statistik ──────────────────────────────────────── */}
      <SectionCard
        title="Statistik Perusahaan"
        icon={<BarChart3 size={16} />}
        action={<Button variant="secondary" icon={<Plus size={14} />} onClick={openAddStat}>Tambah</Button>}
      >
        {stats.length === 0 ? (
          <p className="text-center text-muted text-sm py-8 font-semibold">Belum ada statistik.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(s => {
              const Icon = resolveIcon(s.iconKey);
              return (
                <div key={s.id} className="group relative bg-surface-soft rounded-2xl border border-border p-5 text-center hover:shadow-card transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-2.5">
                    <Icon size={20} />
                  </div>
                  <p className="text-xl font-extrabold text-ink">{s.value}</p>
                  <p className="text-[11px] font-semibold text-muted mt-0.5">{s.label}</p>
                  {/* Hover actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditStat(s)} className="p-1.5 rounded-lg bg-surface text-muted hover:text-accent-blue transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => setDeleteTarget({ mode: 'stat', id: s.id })} className="p-1.5 rounded-lg bg-surface text-muted hover:text-semantic-error transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Core Values ────────────────────────────────────── */}
      <SectionCard
        title="Core Values"
        icon={<Heart size={16} />}
        action={<Button variant="secondary" icon={<Plus size={14} />} onClick={openAddValue}>Tambah</Button>}
      >
        {values.length === 0 ? (
          <p className="text-center text-muted text-sm py-8 font-semibold">Belum ada core values.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map(v => {
              const Icon = resolveIcon(v.iconKey);
              return (
                <div key={v.id} className="group relative bg-surface-soft rounded-2xl border border-border p-5 hover:shadow-card transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3">
                    <Icon size={20} />
                  </div>
                  <h4 className="font-extrabold text-ink text-[14px]">{v.title}</h4>
                  <p className="text-[12px] text-muted font-medium mt-1 leading-relaxed line-clamp-3">{v.desc}</p>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditValue(v)} className="p-1.5 rounded-lg bg-surface text-muted hover:text-accent-blue transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => setDeleteTarget({ mode: 'value', id: v.id })} className="p-1.5 rounded-lg bg-surface text-muted hover:text-semantic-error transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Modal ──────────────────────────────────────────── */}
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form ? `${form.item ? 'Edit' : 'Tambah'} ${form.mode === 'stat' ? 'Statistik' : 'Core Value'}` : ''}
        icon={form?.mode === 'stat' ? <BarChart3 size={20} /> : <Heart size={20} />}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Icon picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFIconKey(opt.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                      fIconKey === opt.key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-soft border-border text-ink-soft hover:border-primary'
                    }`}
                  >
                    <Icon size={14} /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {form?.mode === 'stat' ? (
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Nilai" required value={fValue} onChange={e => setFValue(e.target.value)} placeholder="2.500+" />
              <TextField label="Label" required value={fLabel} onChange={e => setFLabel(e.target.value)} placeholder="Unit Terjual" />
            </div>
          ) : (
            <>
              <TextField label="Judul" required value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Transparan" />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Deskripsi</label>
                <textarea
                  required
                  value={fDesc}
                  onChange={e => setFDesc(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
                  placeholder="Deskripsi value..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setForm(null)}>Batal</Button>
            <Button type="submit" icon={<Save size={16} />}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus ${deleteTarget?.mode === 'stat' ? 'Statistik' : 'Core Value'}`}
        message="Yakin ingin menghapus item ini?"
        confirmLabel="Hapus"
        tone="danger"
      />
    </div>
  );
};
