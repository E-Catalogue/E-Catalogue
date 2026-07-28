import { type ReactNode } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, GripVertical, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import type { CmsIconItem, CmsStat } from './cms.types';

/** Navigasi tab CMS (segmented) dengan ikon berbeda per tab. */
export const CmsTabs = <K extends string>({ tabs, active, onChange }: {
  tabs: { key: K; label: string; icon: ReactNode }[]; active: K; onChange: (k: K) => void;
}) => (
  <div className="flex items-center gap-1 overflow-x-auto scrollbar-slim rounded-2xl border border-border bg-surface p-1.5">
    {tabs.map((t) => (
      <button
        key={t.key}
        type="button"
        onClick={() => onChange(t.key)}
        className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all shrink-0 ${
          active === t.key ? 'bg-primary text-white shadow-glow' : 'text-ink-soft hover:bg-surface-soft'
        }`}
      >
        {t.icon} {t.label}
      </button>
    ))}
  </div>
);

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

/** Baris atas kartu section: ikon + judul + toggle tampil + tombol simpan. */
export const SectionBar = ({ title, hint, icon, isVisible, onToggleVisible, onSave, saving }: {
  title: string; hint?: string; icon?: ReactNode; isVisible?: boolean; onToggleVisible?: () => void; onSave: () => void; saving?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-divider">
    <div className="flex items-center gap-3 min-w-0">
      {icon && <span className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">{icon}</span>}
      <div className="min-w-0">
        <h3 className="text-[14px] font-extrabold text-ink truncate">{title}</h3>
        {hint && <p className="text-[12px] text-muted font-medium mt-0.5 truncate">{hint}</p>}
      </div>
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

/**
 * Field nilai statistik dengan pilihan **Otomatis** (dihitung server dari data)
 * atau **Manual** (ketik sendiri). Menghilangkan kebingungan mengetik "auto".
 */
export const AutoValueField = ({ label = 'Nilai', value, onChange, autoHint = 'Dihitung otomatis dari data' }: {
  label?: string; value: string; onChange: (v: string) => void; autoHint?: string;
}) => {
  const isAuto = value === 'auto';
  return (
    <div className="min-w-0">
      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">{label}</label>
      <div className="space-y-1.5">
        <div className="inline-flex h-9 p-0.5 rounded-lg bg-surface border border-border">
          <button type="button" onClick={() => onChange('')}
            className={`px-3 rounded-md text-[11px] font-bold transition-colors ${!isAuto ? 'bg-primary text-white' : 'text-ink-soft'}`}>Manual</button>
          <button type="button" onClick={() => onChange('auto')}
            className={`px-3 rounded-md text-[11px] font-bold transition-colors ${isAuto ? 'bg-primary text-white' : 'text-ink-soft'}`}>Otomatis</button>
        </div>
        {isAuto ? (
          <span className="w-full h-10 flex items-center gap-1.5 px-2.5 rounded-lg bg-accent-green/8 border border-dashed border-accent-green/30 text-[11px] font-bold text-accent-green">
            <Sparkles size={12} className="shrink-0" /> <span className="truncate">{autoHint}</span>
          </span>
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="mis. 120+"
            className="w-full min-w-0 h-10 px-2.5 rounded-lg bg-surface border border-border text-[13px] font-semibold focus:outline-none focus:border-primary" />
        )}
      </div>
    </div>
  );
};

export const ModeSelect = <T extends string,>({ value, onChange, autoLabel, manualLabel, hint, options }: {
  value: T; onChange: (v: T) => void;
  autoLabel?: string; manualLabel?: string; hint?: string;
  options?: { value: T; label: string }[];
}) => {
  const opts = options ?? ([
    { value: 'auto', label: autoLabel ?? 'Otomatis' },
    { value: 'manual', label: manualLabel ?? 'Pilih Sendiri' },
  ] as { value: T; label: string }[]);
  const gridClass = opts.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Sumber Data</label>
      <div className={`grid grid-cols-1 gap-2 ${gridClass}`}>
        {opts.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left border transition-colors ${
              value === o.value ? 'bg-primary/8 border-primary' : 'bg-surface-soft border-border hover:border-primary/40'
            }`}>
            <span className={`w-4 h-4 rounded-full border-2 shrink-0 grid place-items-center ${value === o.value ? 'border-primary' : 'border-muted/40'}`}>
              {value === o.value && <span className="w-2 h-2 rounded-full bg-primary" />}
            </span>
            <span className={`text-[12px] font-bold ${value === o.value ? 'text-primary' : 'text-ink-soft'}`}>{o.label}</span>
          </button>
        ))}
      </div>
      {hint && <p className="text-[11px] text-muted font-medium mt-1.5">{hint}</p>}
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
          {withIcon && <TextField label="Ikon" wrapClass="w-24 shrink-0" value={s.icon ?? ''} onChange={(e) => set(i, { icon: e.target.value })} placeholder="car" />}
          <div className="w-52 shrink-0"><AutoValueField value={s.value} onChange={(v) => set(i, { value: v })} /></div>
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
  <div className="bg-surface rounded-3xl border border-border shadow-card p-5 md:p-6 space-y-5 animate-float-up">{children}</div>
);
