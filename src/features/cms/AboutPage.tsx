import { useState } from 'react';
import { Info, Loader2, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { cmsImageUrl } from './cms.api';
import { useSectionForm, useUploadHeroImage } from './cms.hooks';
import { ImageUpload } from './ImageUpload';
import { SectionBar, SectionCardShell, TextArea, IconItemsEditor, StatsEditor } from './CmsKit';
import type { AboutHero, AboutStats, AboutVisiMisi, AboutValues, AboutCta } from './cms.types';

const Spinner = () => <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={22} className="animate-spin" /></div>;

const HeroEditor = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutHero>('about', 'hero');
  const uploadHero = useUploadHeroImage('about');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Hero" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
      </div>
      <TextArea label="Subtitle" value={form.subtitle} onChange={(v) => patch({ subtitle: v })} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="CTA — Label" value={form.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} />
        <TextField label="CTA — Link" value={form.ctaLink} onChange={(e) => patch({ ctaLink: e.target.value })} />
      </div>
      <ImageUpload label="Gambar Hero" previewUrl={cmsImageUrl('page', form.imageFilename)} isUploading={uploadHero.isPending}
        onFile={(file) => uploadHero.mutate(file, { onSuccess: (r) => patch({ imageFilename: r.filename }), onError: (e) => notifyApiError(e) })} />
    </SectionCardShell>
  );
};

const StatsSection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutStats>('about', 'stats');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Statistik" hint="Isi 'auto' untuk total terjual otomatis" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <StatsEditor items={form.items} onChange={(items) => patch({ items })} withIcon />
    </SectionCardShell>
  );
};

const VisiMisiSection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutVisiMisi>('about', 'visi-misi');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Visi & Misi" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Judul Visi" value={form.visiTitle} onChange={(e) => patch({ visiTitle: e.target.value })} />
        <TextField label="Ikon Visi" value={form.visiIcon} onChange={(e) => patch({ visiIcon: e.target.value })} placeholder="eye" />
      </div>
      <TextArea label="Visi" value={form.visi} onChange={(v) => patch({ visi: v })} rows={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Judul Misi" value={form.misiTitle} onChange={(e) => patch({ misiTitle: e.target.value })} />
        <TextField label="Ikon Misi" value={form.misiIcon} onChange={(e) => patch({ misiIcon: e.target.value })} placeholder="target" />
      </div>
      <TextArea label="Misi" value={form.misi} onChange={(v) => patch({ misi: v })} rows={3} />
    </SectionCardShell>
  );
};

const ValuesSection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutValues>('about', 'values');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Nilai (Core Values)" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
      </div>
      <IconItemsEditor items={form.items} onChange={(items) => patch({ items })} itemLabel="Nilai" />
    </SectionCardShell>
  );
};

const CtaSection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutCta>('about', 'cta');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Ajakan (CTA)" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
      <TextArea label="Subtitle" value={form.subtitle} onChange={(v) => patch({ subtitle: v })} rows={2} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Tombol 1 — Label" value={form.primaryLabel} onChange={(e) => patch({ primaryLabel: e.target.value })} />
        <TextField label="Tombol 1 — Link" value={form.primaryLink} onChange={(e) => patch({ primaryLink: e.target.value })} />
        <TextField label="Tombol 2 — Label" value={form.secondaryLabel} onChange={(e) => patch({ secondaryLabel: e.target.value })} />
        <TextField label="Tombol 2 — Link" value={form.secondaryLink} onChange={(e) => patch({ secondaryLink: e.target.value })} />
      </div>
    </SectionCardShell>
  );
};

const TABS = [
  { key: 'hero', label: 'Hero' },
  { key: 'stats', label: 'Statistik' },
  { key: 'visi-misi', label: 'Visi & Misi' },
  { key: 'values', label: 'Nilai' },
  { key: 'cta', label: 'CTA' },
] as const;
type TabKey = typeof TABS[number]['key'];

export const AboutPage = () => {
  const [tab, setTab] = useState<TabKey>('hero');
  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Tentang" description="Kelola seluruh section halaman Tentang Kami — tiap section disimpan terpisah."
        action={<a href="/tentang" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>} />

      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
              tab === t.key ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
            }`}>
            <Info size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' && <HeroEditor />}
      {tab === 'stats' && <StatsSection />}
      {tab === 'visi-misi' && <VisiMisiSection />}
      {tab === 'values' && <ValuesSection />}
      {tab === 'cta' && <CtaSection />}
    </div>
  );
};
