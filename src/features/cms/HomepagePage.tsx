import { useState } from 'react';
import { Home, Loader2, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { cmsImageUrl } from './cms.api';
import { useSectionForm, useUploadHeroImage } from './cms.hooks';
import { ImageUpload } from './ImageUpload';
import { SectionBar, SectionCardShell, TextArea, IconItemsEditor, AutoValueField, ModeSelect } from './CmsKit';
import type {
  HomepageHero, HomepageBrands, HomepageWhyUs, HomepageHowItWorks,
  HomepageFeatured, HomepageTestimonialsHeader, HomepageCta,
} from './cms.types';

const Spinner = () => <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={22} className="animate-spin" /></div>;

/* ── Hero ── */
const HeroEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageHero>('homepage', 'hero');
  const uploadHero = useUploadHeroImage('homepage');
  if (isLoading || !form) return <Spinner />;
  const setStat = (i: number, k: 'value' | 'label', v: string) => patch({ stats: form.stats.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) });
  return (
    <SectionCardShell>
      <SectionBar title="Hero" hint="Bagian paling atas beranda" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Badge" value={form.badgeText} onChange={(e) => patch({ badgeText: e.target.value })} />
        <TextField label="Judul (pakai <em>…</em>)" value={form.titleHtml} onChange={(e) => patch({ titleHtml: e.target.value })} />
      </div>
      <TextArea label="Subtitle" value={form.subtitle} onChange={(v) => patch({ subtitle: v })} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="CTA Utama — Label" value={form.primaryCtaLabel} onChange={(e) => patch({ primaryCtaLabel: e.target.value })} />
        <TextField label="CTA Utama — Link" value={form.primaryCtaLink} onChange={(e) => patch({ primaryCtaLink: e.target.value })} />
        <TextField label="CTA Kedua — Label" value={form.secondaryCtaLabel} onChange={(e) => patch({ secondaryCtaLabel: e.target.value })} />
        <TextField label="CTA Kedua — Link" value={form.secondaryCtaLink} onChange={(e) => patch({ secondaryCtaLink: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUpload label="Gambar Hero" previewUrl={cmsImageUrl('page', form.imageFilename)} isUploading={uploadHero.isPending}
          onFile={(file) => uploadHero.mutate(file, { onSuccess: (r) => patch({ imageFilename: r.filename }), onError: (e) => notifyApiError(e) })} />
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

/* ── Brands ── */
const BrandsEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageBrands>('homepage', 'brands');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Merek Populer" hint="Chip merek di bawah hero" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Label" value={form.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Merek populer:" />
        <TextField label="Jumlah Merek Ditampilkan" type="number" value={String(form.limit)} onChange={(e) => patch({ limit: Number(e.target.value) })} />
      </div>
      <ModeSelect value={form.mode} onChange={(v) => patch({ mode: v })}
        autoLabel="Otomatis (terpopuler)" manualLabel="Pilih Sendiri"
        hint={form.mode === 'auto' ? 'Menampilkan merek terbanyak dari unit yang tayang secara otomatis.' : 'Pilih merek tertentu untuk ditampilkan (pengaturan daftar merek via API/menu Merek).'} />
    </SectionCardShell>
  );
};

/* ── Why Us / How It Works (pola eyebrow+title+subtitle+items) ── */
const IconListSection = ({ section, title, hint, field }: {
  section: 'why-us' | 'how-it-works'; title: string; hint: string; field: 'items' | 'steps';
}) => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageWhyUs & HomepageHowItWorks>('homepage', section);
  if (isLoading || !form) return <Spinner />;
  const list = (field === 'items' ? form.items : form.steps) ?? [];
  return (
    <SectionCardShell>
      <SectionBar title={title} hint={hint} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
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
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Unit Unggulan" hint="Kartu unit pilihan di beranda" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
        <TextField label="Label 'Lihat Semua'" value={form.seeAllLabel} onChange={(e) => patch({ seeAllLabel: e.target.value })} />
        <TextField label="Link 'Lihat Semua'" value={form.seeAllLink} onChange={(e) => patch({ seeAllLink: e.target.value })} />
        <TextField label="Jumlah Unit Ditampilkan" type="number" value={String(form.limit)} onChange={(e) => patch({ limit: Number(e.target.value) })} />
      </div>
      <ModeSelect value={form.mode} onChange={(v) => patch({ mode: v })}
        autoLabel="Otomatis (terbaru)" manualLabel="Pilih Sendiri"
        hint={form.mode === 'auto' ? 'Menampilkan unit tayang terbaru secara otomatis.' : 'Pilih unit tertentu untuk ditonjolkan (atur di halaman Katalog / via API).'} />
    </SectionCardShell>
  );
};

/* ── Testimonials header ── */
const TestimonialsHeaderEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<HomepageTestimonialsHeader>('homepage', 'testimonials');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Judul Section Testimoni" hint="Isi testimoni dikelola di menu Testimoni" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
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
      <SectionBar title="Ajakan (CTA) Bawah" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
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
  { key: 'hero', label: 'Hero' },
  { key: 'brands', label: 'Merek' },
  { key: 'why-us', label: 'Keunggulan' },
  { key: 'how-it-works', label: 'Cara Kerja' },
  { key: 'featured', label: 'Unit Unggulan' },
  { key: 'testimonials', label: 'Testimoni' },
  { key: 'cta', label: 'CTA' },
] as const;
type TabKey = typeof TABS[number]['key'];

export const HomepagePage = () => {
  const [tab, setTab] = useState<TabKey>('hero');
  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Beranda" description="Kelola seluruh section halaman utama website — tiap section disimpan terpisah."
        action={<a href="/" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>} />

      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
              tab === t.key ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
            }`}>
            <Home size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' && <HeroEditor />}
      {tab === 'brands' && <BrandsEditor />}
      {tab === 'why-us' && <IconListSection section="why-us" title="Keunggulan" hint="Kenapa memilih kami" field="items" />}
      {tab === 'how-it-works' && <IconListSection section="how-it-works" title="Cara Kerja" hint="Langkah-langkah" field="steps" />}
      {tab === 'featured' && <FeaturedEditor />}
      {tab === 'testimonials' && <TestimonialsHeaderEditor />}
      {tab === 'cta' && <CtaEditor />}
    </div>
  );
};
