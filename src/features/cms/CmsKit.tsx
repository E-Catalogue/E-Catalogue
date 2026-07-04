import { type ReactNode } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, GripVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import type { CmsIconItem, CmsStat } from './cms.types';

/** Textarea berlabel seragam. */
export const TextArea = ({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y" />
  </div>
);

/** Baris atas kartu section: judul + toggle tampil + tombol simpan. */
export const SectionBar = ({ title, hint, isVisible, onToggleVisible, onSave, saving }: {
  title: string; hint?: string; isVisible?: boolean; onToggleVisible?: () => void; onSave: () => void; saving?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 flex-wrap">
    <div>
      <h3 className="text-[14px] font-extrabold text-ink">{title}</h3>
      {hint && <p className="text-[12px] text-muted font-medium mt-0.5">{hint}</p>}
    </div>
    <div className="flex items-center gap-2">
      {onToggleVisible && (
        <button onClick={onToggleVisible}
          className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12px] font-bold border transition-colors ${
            isVisible ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-muted/10 text-muted border-border'
          }`}>
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />} {isVisible ? 'Tampil' : 'Disembunyikan'}
        </button>
      )}
      <Button icon={<Save size={15} />} onClick={onSave} loading={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
    </div>
  </div>
);

/** Editor daftar item {icon,title,desc} (why-us, how-it-works, values). */
export const IconItemsEditor = ({ items, onChange, itemLabel = 'Item' }: {
  items: CmsIconItem[]; onChange: (next: CmsIconItem[]) => void; itemLabel?: string;
}) => {
  const set = (i: number, patch: Partial<CmsIconItem>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface-soft p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{itemLabel} {i + 1}</span>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={13} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <TextField label="Ikon (lucide)" value={it.icon} onChange={(e) => set(i, { icon: e.target.value })} placeholder="shield-check" />
            <TextField label="Judul" value={it.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="Bergaransi" />
          </div>
          <TextArea label="Deskripsi" value={it.desc} onChange={(v) => set(i, { desc: v })} rows={2} />
        </div>
      ))}
      <button onClick={() => onChange([...items, { icon: 'shield-check', title: '', desc: '' }])}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"><Plus size={14} /> Tambah {itemLabel}</button>
    </div>
  );
};

/** Editor daftar statistik {value,label,icon?}. */
export const StatsEditor = ({ items, onChange, withIcon }: {
  items: CmsStat[]; onChange: (next: CmsStat[]) => void; withIcon?: boolean;
}) => {
  const set = (i: number, patch: Partial<CmsStat>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2.5">
      {items.map((s, i) => (
        <div key={i} className="flex items-end gap-2 rounded-xl border border-border bg-surface-soft p-2.5">
          <GripVertical size={16} className="text-muted/50 mb-2.5 shrink-0" />
          {withIcon && <TextField label="Ikon" wrapClass="w-32" value={s.icon ?? ''} onChange={(e) => set(i, { icon: e.target.value })} placeholder="car" />}
          <TextField label="Nilai" wrapClass="w-32" value={s.value} onChange={(e) => set(i, { value: e.target.value })} placeholder="120+ / auto" />
          <TextField label="Label" wrapClass="flex-1" value={s.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="Unit Tersedia" />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="p-2 mb-0.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, withIcon ? { icon: 'car', value: '', label: '' } : { value: '', label: '' }])}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"><Plus size={14} /> Tambah Statistik</button>
    </div>
  );
};

/** Kartu pembungkus section CMS. */
export const SectionCardShell = ({ children }: { children: ReactNode }) => (
  <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">{children}</div>
);
