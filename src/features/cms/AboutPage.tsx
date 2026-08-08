import { useState } from 'react';
import { LayoutTemplate, BarChart3, Target, Gem, Megaphone, Loader2, ExternalLink, BookOpen, ShieldCheck, Milestone, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { grantMutationConfirmationLease } from '@/core/api/mutationConfirmation';
import { cmsImageUrl } from './cms.api';
import { useSectionForm, useUploadHeroImage, useUploadCmsImage } from './cms.hooks';
import { ImageUpload } from './ImageUpload';
import { SectionBar, SectionCardShell, TextArea, IconItemsEditor, StatsEditor, CmsTabs } from './CmsKit';
import type { AboutHero, AboutStory, AboutStats, AboutVisiMisi, AboutValues, AboutJourney, AboutCta } from './cms.types';

const Spinner = () => <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={22} className="animate-spin" /></div>;
const StringList = ({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) => <div className="space-y-2"><p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>{items.map((item, index) => <div key={index} className="flex gap-2"><textarea value={item} onChange={(e) => onChange(items.map((value, i) => i === index ? e.target.value : value))} rows={2} className="flex-1 rounded-xl border border-border bg-surface-soft p-3 text-sm font-medium focus:outline-none focus:border-primary" /><button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="text-semantic-error"><Trash2 size={16} /></button></div>)}<Button variant="secondary" icon={<Plus size={14} />} onClick={() => onChange([...items, ''])}>Tambah Baris</Button></div>;

const HeroEditor = () => {
  const uploadHero = useUploadHeroImage('about');
  const [pendingHero, setPendingHero] = useState<File | null>(null);
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutHero>('about', 'hero', {
    onBeforeSave: async () => {
      if (!pendingHero) return;
      grantMutationConfirmationLease();
      const r = await uploadHero.mutateAsync(pendingHero);
      setPendingHero(null);
      return { imageFilename: r.filename } as Partial<AboutHero>;
    },
  });
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Hero" icon={<LayoutTemplate size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving || uploadHero.isPending} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
      </div>
      <TextArea label="Subtitle" value={form.subtitle} onChange={(v) => patch({ subtitle: v })} />
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-light to-surface p-5"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Preview hero Tentang</p><h4 className="mt-2 text-2xl font-extrabold text-ink">{form.title || 'Judul halaman Tentang'}</h4><p className="mt-2 text-[12px] font-medium leading-5 text-muted">{form.subtitle || 'Narasi pengantar showroom akan tampil di sini.'}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="CTA — Label" value={form.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} />
        <TextField label="CTA — Link" value={form.ctaLink} onChange={(e) => patch({ ctaLink: e.target.value })} />
      </div>
      <ImageUpload label="Gambar Hero" hint={pendingHero ? 'Siap disimpan · JPG/PNG · maksimal 2 MB per gambar' : 'JPG/PNG · maksimal 2 MB per gambar'} previewUrl={cmsImageUrl('page', form.imageFilename)} isUploading={uploadHero.isPending} onFile={setPendingHero} />
    </SectionCardShell>
  );
};

const StatsSection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutStats>('about', 'stats');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Statistik" icon={<BarChart3 size={17} />} hint="Isi 'auto' untuk total terjual otomatis" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <StatsEditor items={form.items} onChange={(items) => patch({ items })} withIcon />
    </SectionCardShell>
  );
};

const StorySection = () => {
  const upload = useUploadCmsImage('page'); const [pending, setPending] = useState<File | null>(null);
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutStory>('about', 'story', { onBeforeSave: async () => pending ? { imageFilename: (await upload.mutateAsync(pending)).filename } : undefined });
  if (isLoading || !form) return <Spinner />;
  return <SectionCardShell><SectionBar title="Cerita Showroom" icon={<BookOpen size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving || upload.isPending} /><div className="grid md:grid-cols-2 gap-4"><TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /></div><StringList label="Paragraf Cerita" items={form.paragraphs ?? []} onChange={(paragraphs) => patch({ paragraphs })} /><ImageUpload label="Foto Cerita" previewUrl={cmsImageUrl('page', form.imageFilename)} isUploading={upload.isPending} onFile={setPending} /></SectionCardShell>;
};

const VisiMisiSection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutVisiMisi>('about', 'visi-misi');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Visi & Misi" icon={<Target size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Judul Visi" value={form.visiTitle} onChange={(e) => patch({ visiTitle: e.target.value })} />
        <TextField label="Ikon Visi" value={form.visiIcon} onChange={(e) => patch({ visiIcon: e.target.value })} placeholder="eye" />
      </div>
      <StringList label="Poin Visi" items={form.visiItems ?? []} onChange={(visiItems) => patch({ visiItems })} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Judul Misi" value={form.misiTitle} onChange={(e) => patch({ misiTitle: e.target.value })} />
        <TextField label="Ikon Misi" value={form.misiIcon} onChange={(e) => patch({ misiIcon: e.target.value })} placeholder="target" />
      </div>
      <StringList label="Poin Misi" items={form.misiItems ?? []} onChange={(misiItems) => patch({ misiItems })} />
    </SectionCardShell>
  );
};

const ValuesSection = ({ section = 'values' }: { section?: 'values' | 'standards' }) => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutValues>('about', section);
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title={section === 'values' ? 'Nilai (Core Values)' : 'Standar Kualitas'} icon={section === 'values' ? <Gem size={17} /> : <ShieldCheck size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
      </div>
      <IconItemsEditor items={form.items} onChange={(items) => patch({ items })} itemLabel="Nilai" />
    </SectionCardShell>
  );
};

const JourneySection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutJourney>('about', 'journey'); if (isLoading || !form) return <Spinner />;
  const items = form.items ?? [];
  return <SectionCardShell><SectionBar title="Perjalanan Showroom" icon={<Milestone size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} /><div className="grid md:grid-cols-2 gap-4"><TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /></div><div className="space-y-3">{items.map((item, index) => <div key={index} className="grid gap-3 rounded-2xl border border-border bg-surface-soft p-4 md:grid-cols-[8rem_1fr_auto]"><TextField label="Tahun" value={item.year} onChange={(e) => patch({ items: items.map((v, i) => i === index ? { ...v, year: e.target.value } : v) })} /><div className="space-y-3"><TextField label="Judul" value={item.title} onChange={(e) => patch({ items: items.map((v, i) => i === index ? { ...v, title: e.target.value } : v) })} /><TextArea label="Deskripsi" value={item.desc} onChange={(desc) => patch({ items: items.map((v, i) => i === index ? { ...v, desc } : v) })} rows={2} /></div><button type="button" onClick={() => patch({ items: items.filter((_, i) => i !== index) })} className="text-semantic-error"><Trash2 size={16} /></button></div>)}<Button variant="secondary" icon={<Plus size={14} />} onClick={() => patch({ items: [...items, { year: '', title: '', desc: '' }] })}>Tambah Milestone</Button></div></SectionCardShell>;
};

const CtaSection = () => {
  const { form, patch, save, toggleVisible, saving, isLoading } = useSectionForm<AboutCta>('about', 'cta');
  if (isLoading || !form) return <Spinner />;
  return (
    <SectionCardShell>
      <SectionBar title="Ajakan (CTA)" icon={<Megaphone size={17} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} />
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
  { key: 'hero', label: 'Hero', icon: <LayoutTemplate size={14} /> },
  { key: 'stats', label: 'Statistik', icon: <BarChart3 size={14} /> },
  { key: 'story', label: 'Cerita', icon: <BookOpen size={14} /> },
  { key: 'visi-misi', label: 'Visi & Misi', icon: <Target size={14} /> },
  { key: 'values', label: 'Nilai', icon: <Gem size={14} /> },
  { key: 'standards', label: 'Standar', icon: <ShieldCheck size={14} /> },
  { key: 'journey', label: 'Perjalanan', icon: <Milestone size={14} /> },
  { key: 'cta', label: 'CTA', icon: <Megaphone size={14} /> },
] as const;
type TabKey = typeof TABS[number]['key'];

export const AboutPage = () => {
  const [tab, setTab] = useState<TabKey>('hero');
  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Tentang" description="Kelola seluruh section halaman Tentang Kami — tiap section disimpan terpisah."
        action={<a href="/tentang" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>} />

      <CmsTabs tabs={TABS.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))} active={tab} onChange={setTab} />

      {tab === 'hero' && <HeroEditor />}
      {tab === 'stats' && <StatsSection />}
      {tab === 'story' && <StorySection />}
      {tab === 'visi-misi' && <VisiMisiSection />}
      {tab === 'values' && <ValuesSection />}
      {tab === 'standards' && <ValuesSection section="standards" />}
      {tab === 'journey' && <JourneySection />}
      {tab === 'cta' && <CtaSection />}
    </div>
  );
};
