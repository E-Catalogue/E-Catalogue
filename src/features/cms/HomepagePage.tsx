import { useMemo, useState, type ReactNode } from 'react';
import { LayoutTemplate, Tags, ShieldCheck, ListChecks, Star, Quote, Megaphone, Loader2, ExternalLink, Search, Check, MapPin, CircleHelp, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { grantMutationConfirmationLease } from '@/core/api/mutationConfirmation';
import { cmsImageUrl } from './cms.api';
import { useSectionForm, useUploadHeroImage, useHomepageLookup } from './cms.hooks';
import { unitOptionLabel } from '@/features/units/unit.display';
import { ImageUpload } from './ImageUpload';
import { SectionBar, SectionCardShell, TextArea, IconItemsEditor, AutoValueField, ModeSelect, CmsTabs } from './CmsKit';
import type {
  HomepageHero, HomepageBrands, HomepageWhyUs, HomepageHowItWorks,
  HomepageFeatured, HomepageTestimonialsHeader, HomepageLocations, HomepageFaq, HomepageCta,
} from './cms.types';

const Spinner = () => <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={22} className="animate-spin" /></div>;

/** Checklist multi-pilih dengan input pencarian — untuk memilih merek/unit unggulan manual (PRD §4.20). */
const ManualPicker = ({ options, selected, onChange, loading, searchPlaceholder }: {
  options: { id: string; label: string; sublabel?: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  loading?: boolean;
  searchPlaceholder: string;
}) => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q));
  }, [options, search]);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-3.5 mt-3">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Pilih Manual</p>
        <span className="text-[10px] font-extrabold text-muted bg-surface px-2 py-1 rounded-full">{selected.length} dipilih</span>
      </div>
      <div className="relative mb-2.5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface border border-border text-[12px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
      </div>
      {loading ? (
        <p className="text-[12px] font-semibold text-muted py-4 text-center">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[12px] font-semibold text-muted py-4 text-center">Tidak ada hasil.</p>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-slim">
          {filtered.map((o) => {
            const on = selected.includes(o.id);
            return (
              <button key={o.id} type="button" onClick={() => toggle(o.id)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[12px] font-semibold transition-colors ${on ? 'border-primary bg-primary/8 text-primary' : 'border-border bg-surface text-ink-soft hover:border-primary/60'}`}>
                <span className="min-w-0"><span className="block truncate">{o.label}</span>{o.sublabel && <span className="block truncate text-[11px] font-medium text-muted">{o.sublabel}</span>}</span>
                {on && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Hero ── */
const HeroEditor = () => {
  const uploadHero = useUploadHeroImage('homepage');
  const [pendingHero, setPendingHero] = useState<File | null>(null);
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageHero>('homepage', 'hero', {
    onBeforeSave: async () => {
      if (!pendingHero) return;
      grantMutationConfirmationLease();
      const r = await uploadHero.mutateAsync(pendingHero);
      setPendingHero(null);
      return { imageFilename: r.filename } as Partial<HomepageHero>;
    },
  });
  const { data: lookup } = useHomepageLookup(!!form);
  if (isLoading || !form) return <Spinner />;
  const setStat = (i: number, k: 'value' | 'label', v: string) => patch({ stats: form.stats.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) });
  return (
    <SectionCardShell>
      <SectionBar title="Hero" icon={<LayoutTemplate size={17} />} hint="Bagian paling atas beranda" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving || uploadHero.isPending} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Badge" value={form.badgeText} onChange={(e) => patch({ badgeText: e.target.value })} />
        <TextField label="Judul (pakai <em>…</em>)" value={form.titleHtml} onChange={(e) => patch({ titleHtml: e.target.value })} />
      </div>
      <TextArea label="Subtitle" value={form.subtitle} onChange={(v) => patch({ subtitle: v })} />
      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-light to-surface p-5"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Preview hero</p><h4 className="mt-2 text-2xl font-extrabold leading-tight text-ink">{form.titleHtml.replace(/<\/?em>/g, '') || 'Judul hero'}</h4><p className="mt-2 max-w-2xl text-[12px] font-medium leading-5 text-muted">{form.subtitle || 'Deskripsi showroom akan tampil di sini.'}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><TextField label="Placeholder Pencarian" value={form.searchPlaceholder ?? ''} onChange={(e) => patch({ searchPlaceholder: e.target.value })} /><TextField label="Label Tombol Pencarian" value={form.searchButtonLabel ?? ''} onChange={(e) => patch({ searchButtonLabel: e.target.value })} /></div>
      <SearchableSelect label="Cabang Utama Hero" value={form.primaryBranchId ?? ''} onChange={(value) => patch({ primaryBranchId: value || null })} clearable options={(lookup?.branches ?? []).map((branch) => ({ value: branch.id, label: branch.nama, sublabel: `${branch.lokasi} · ${branch.isPublic ? 'Tayang' : 'Belum publik'}` }))} placeholder="Gunakan cabang publik pertama" searchPlaceholder="Cari cabang..." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="CTA Utama — Label" value={form.primaryCtaLabel} onChange={(e) => patch({ primaryCtaLabel: e.target.value })} />
        <TextField label="CTA Utama — Link" value={form.primaryCtaLink} onChange={(e) => patch({ primaryCtaLink: e.target.value })} />
        <TextField label="CTA Kedua — Label" value={form.secondaryCtaLabel} onChange={(e) => patch({ secondaryCtaLabel: e.target.value })} />
        <TextField label="CTA Kedua — Link" value={form.secondaryCtaLink} onChange={(e) => patch({ secondaryCtaLink: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUpload label="Gambar Hero" hint={pendingHero ? 'Siap disimpan · JPG/PNG · maksimal 2 MB per gambar' : 'JPG/PNG · maksimal 2 MB per gambar'} previewUrl={cmsImageUrl('page', form.imageFilename)} isUploading={uploadHero.isPending} onFile={setPendingHero} />
        <div className="space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Kartu Badge Mengambang</p>
          <TextField label="Ikon" value={form.floatingCard.icon} onChange={(e) => patch({ floatingCard: { ...form.floatingCard, icon: e.target.value } })} placeholder="shield-check" />
          <TextField label="Judul" value={form.floatingCard.title} onChange={(e) => patch({ floatingCard: { ...form.floatingCard, title: e.target.value } })} />
          <TextField label="Subjudul" value={form.floatingCard.subtitle} onChange={(e) => patch({ floatingCard: { ...form.floatingCard, subtitle: e.target.value } })} />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Statistik Hero</p>
        <div className="space-y-2.5">
          {form.stats.map((s, i) => (
            <div key={i} className="flex items-end gap-2 rounded-xl border border-border bg-surface-soft p-2.5">
              <div className="w-52 shrink-0"><AutoValueField value={s.value} onChange={(v) => setStat(i, 'value', v)} /></div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Label</label>
                <input value={s.label} onChange={(e) => setStat(i, 'label', e.target.value)} className="w-full h-10 px-2.5 rounded-lg bg-surface border border-border text-[13px] font-semibold focus:outline-none focus:border-primary" placeholder="Unit Tersedia" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCardShell>
  );
};

const LocationsEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageLocations>('homepage', 'locations');
  if (isLoading || !form) return <Spinner />;
  return <SectionCardShell><SectionBar title="Lokasi Showroom" icon={<MapPin size={17} />} hint="Data cabang diambil dari Master Cabang yang ditandai publik" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} /><div className="grid md:grid-cols-2 gap-4"><TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /></div><TextArea label="Subtitle" value={form.subtitle} onChange={(subtitle) => patch({ subtitle })} /><TextField label="Jumlah Cabang" type="number" value={String(form.limit)} onChange={(e) => patch({ limit: Number(e.target.value) })} /></SectionCardShell>;
};

const FaqEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageFaq>('homepage', 'faq');
  if (isLoading || !form) return <Spinner />;
  const items = form.items ?? [];
  const change = (index: number, key: 'question' | 'answer', value: string) => patch({ items: items.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  return <SectionCardShell><SectionBar title="FAQ Beranda" icon={<CircleHelp size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} /><div className="grid md:grid-cols-2 gap-4"><TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /></div><div className="space-y-3">{items.map((item, index) => <div key={index} className="rounded-2xl border border-border bg-surface-soft p-4"><div className="flex justify-between gap-3"><p className="text-[11px] font-extrabold uppercase text-muted">Pertanyaan {index + 1}</p><button type="button" onClick={() => patch({ items: items.filter((_, i) => i !== index) })} className="text-semantic-error"><Trash2 size={15} /></button></div><div className="mt-3 space-y-3"><TextField label="Pertanyaan" value={item.question} onChange={(e) => change(index, 'question', e.target.value)} /><TextArea label="Jawaban" value={item.answer} onChange={(value) => change(index, 'answer', value)} rows={3} /></div></div>)}<Button variant="secondary" icon={<Plus size={14} />} onClick={() => patch({ items: [...items, { question: '', answer: '' }] })}>Tambah Pertanyaan</Button></div></SectionCardShell>;
};

/* ── Brands ── */
const BrandsEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageBrands>('homepage', 'brands');
  const { data: lookup, isLoading: lookupLoading } = useHomepageLookup(!!form && form.mode === 'manual');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Merek Populer" icon={<Tags size={17} />} hint="Chip merek di bawah hero" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Label" value={form.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Merek populer:" />
        <TextField label="Jumlah Merek Ditampilkan" type="number" value={String(form.limit)} onChange={(e) => patch({ limit: Number(e.target.value) })} />
      </div>
      <ModeSelect value={form.mode} onChange={(v) => patch({ mode: v })}
        autoLabel="Otomatis (terpopuler)" manualLabel="Pilih Sendiri"
        hint={form.mode === 'auto' ? 'Menampilkan merek terbanyak dari unit yang tayang secara otomatis.' : 'Pilih merek tertentu untuk ditampilkan di beranda.'} />
      {form.mode === 'manual' && (
        <ManualPicker
          loading={lookupLoading}
          options={(lookup?.brands ?? []).map((b) => ({ id: b.id, label: b.name }))}
          selected={form.brandIds ?? []}
          onChange={(next) => patch({ brandIds: next })}
          searchPlaceholder="Cari merek..."
        />
      )}
    </SectionCardShell>
  );
};

/* ── Why Us / How It Works (pola eyebrow+title+subtitle+items) ── */
const IconListSection = ({ section, title, hint, field, icon }: {
  section: 'why-us' | 'how-it-works'; title: string; hint: string; field: 'items' | 'steps'; icon: ReactNode;
}) => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageWhyUs & HomepageHowItWorks>('homepage', section);
  if (isLoading || !form) return <Spinner />;
  const list = (field === 'items' ? form.items : form.steps) ?? [];
  return (
    <SectionCardShell>
      <SectionBar title={title} icon={icon} hint={hint} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
        <TextField label="Subtitle" value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
      </div>
      <IconItemsEditor items={list} onChange={(next) => patch(field === 'items' ? { items: next } : { steps: next })} itemLabel={field === 'steps' ? 'Langkah' : 'Item'} />
    </SectionCardShell>
  );
};

/* ── Featured ── */
const FeaturedEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageFeatured>('homepage', 'featured');
  const { data: lookup, isLoading: lookupLoading } = useHomepageLookup(!!form && form.mode === 'manual');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Unit Unggulan" icon={<Star size={17} />} hint="Kartu unit pilihan di beranda" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
        <TextField label="Label 'Lihat Semua'" value={form.seeAllLabel} onChange={(e) => patch({ seeAllLabel: e.target.value })} />
        <TextField label="Link 'Lihat Semua'" value={form.seeAllLink} onChange={(e) => patch({ seeAllLink: e.target.value })} />
        <TextField label="Jumlah Unit Ditampilkan" type="number" value={String(form.limit)} onChange={(e) => patch({ limit: Number(e.target.value) })} />
      </div>
      <ModeSelect value={form.mode} onChange={(v) => patch({ mode: v })}
        options={[
          { value: 'auto', label: 'Otomatis (terbaru)' },
          { value: 'manual', label: 'Pilih Sendiri' },
          { value: 'flagged', label: 'Unit Unggulan' },
        ]}
        hint={
          form.mode === 'auto' ? 'Menampilkan unit tayang terbaru secara otomatis.' :
          form.mode === 'flagged' ? 'Menampilkan unit yang ditandai sebagai unggulan secara otomatis.' :
          'Pilih unit tertentu untuk ditonjolkan di beranda.'
        } />
      {form.mode === 'manual' && (
        <ManualPicker
          loading={lookupLoading}
          options={(lookup?.units ?? []).map((u) => ({ id: u.id, label: unitOptionLabel(u), sublabel: `${[u.merek?.name, u.tipe?.name].filter(Boolean).join(' ')} · ${u.isPublished ? 'Tayang' : 'Belum tayang'}` }))}
          selected={form.unitIds ?? []}
          onChange={(next) => patch({ unitIds: next })}
          searchPlaceholder="Cari plat / merek / tipe..."
        />
      )}
    </SectionCardShell>
  );
};

/* ── Testimonials header ── */
const TestimonialsHeaderEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageTestimonialsHeader>('homepage', 'testimonials');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Judul Section Testimoni" icon={<Quote size={17} />} hint="Isi testimoni dikelola di menu Testimoni" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
        <TextField label="Subtitle" value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
        <TextField label="Jumlah tampil (limit)" type="number" value={String(form.limit)} onChange={(e) => patch({ limit: Number(e.target.value) })} />
      </div>
    </SectionCardShell>
  );
};

/* ── CTA ── */
const CtaEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageCta>('homepage', 'cta');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Ajakan (CTA) Bawah" icon={<Megaphone size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
      <TextArea label="Subtitle" value={form.subtitle} onChange={(v) => patch({ subtitle: v })} rows={2} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Tombol 1 — Label" value={form.primaryLabel} onChange={(e) => patch({ primaryLabel: e.target.value })} />
        <TextField label="Tombol 1 — Link" value={form.primaryLink} onChange={(e) => patch({ primaryLink: e.target.value })} />
        <TextField label="Tombol 2 — Label" value={form.secondaryLabel} onChange={(e) => patch({ secondaryLabel: e.target.value })} />
        <TextField label="Tombol 2 — Link (isi 'whatsapp')" value={form.secondaryLink} onChange={(e) => patch({ secondaryLink: e.target.value })} />
      </div>
    </SectionCardShell>
  );
};

const TABS = [
  { key: 'hero', label: 'Hero', icon: <LayoutTemplate size={14} /> },
  { key: 'brands', label: 'Merek', icon: <Tags size={14} /> },
  { key: 'why-us', label: 'Keunggulan', icon: <ShieldCheck size={14} /> },
  { key: 'how-it-works', label: 'Cara Kerja', icon: <ListChecks size={14} /> },
  { key: 'featured', label: 'Unit Unggulan', icon: <Star size={14} /> },
  { key: 'testimonials', label: 'Testimoni', icon: <Quote size={14} /> },
  { key: 'locations', label: 'Lokasi', icon: <MapPin size={14} /> },
  { key: 'faq', label: 'FAQ', icon: <CircleHelp size={14} /> },
  { key: 'cta', label: 'CTA', icon: <Megaphone size={14} /> },
] as const;
type TabKey = typeof TABS[number]['key'];

export const HomepagePage = () => {
  const [tab, setTab] = useState<TabKey>('hero');
  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Beranda" description="Kelola seluruh section halaman utama website — tiap section disimpan terpisah."
        action={<a href="/" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>} />

      <CmsTabs tabs={TABS.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))} active={tab} onChange={setTab} />

      {tab === 'hero' && <HeroEditor />}
      {tab === 'brands' && <BrandsEditor />}
      {tab === 'why-us' && <IconListSection section="why-us" title="Keunggulan" hint="Kenapa memilih kami" field="items" icon={<ShieldCheck size={17} />} />}
      {tab === 'how-it-works' && <IconListSection section="how-it-works" title="Cara Kerja" hint="Langkah-langkah" field="steps" icon={<ListChecks size={17} />} />}
      {tab === 'featured' && <FeaturedEditor />}
      {tab === 'testimonials' && <TestimonialsHeaderEditor />}
      {tab === 'locations' && <LocationsEditor />}
      {tab === 'faq' && <FaqEditor />}
      {tab === 'cta' && <CtaEditor />}
    </div>
  );
};
