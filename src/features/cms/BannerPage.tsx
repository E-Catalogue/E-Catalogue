import { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Save, Eye, BarChart3, Type, MousePointerClick, ExternalLink,
  Upload, Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { cmsImageUrl } from './cms.api';
import { useHomepage, useHomepageMutations } from './cms.hooks';
import type { Homepage } from './cms.types';

/** Render titleHtml (<em> = warna primary) aman tanpa dangerouslySetInnerHTML. */
const renderTitle = (html: string) =>
  html.split(/(<em>.*?<\/em>)/g).filter(Boolean).map((part, i) => {
    const m = part.match(/^<em>(.*?)<\/em>$/);
    return m ? <span key={i} className="text-primary">{m[1]}</span> : <span key={i}>{part}</span>;
  });

export const BannerPage = () => {
  const { data, isLoading, isError } = useHomepage();
  const { update, uploadHeroImage } = useHomepageMutations();
  const [hp, setHp] = useState<Homepage | null>(null);

  useEffect(() => { if (data && !hp) setHp(structuredClone(data)); }, [data, hp]);

  if (isLoading || !hp) {
    if (isError) return <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat data beranda.</div>;
    return <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={24} className="animate-spin" /></div>;
  }

  const setHero = <K extends keyof Homepage['hero']>(key: K, value: Homepage['hero'][K]) =>
    setHp((p) => (p ? { ...p, hero: { ...p.hero, [key]: value } } : p));
  const setCta = <K extends keyof Homepage['cta']>(key: K, value: Homepage['cta'][K]) =>
    setHp((p) => (p ? { ...p, cta: { ...p.cta, [key]: value } } : p));
  const setStat = (i: number, field: 'value' | 'label', value: string) =>
    setHp((p) => {
      if (!p) return p;
      const stats = p.hero.stats.map((s, idx) => (idx === i ? { ...s, [field]: value } : s));
      return { ...p, hero: { ...p.hero, stats } };
    });

  const handleSave = () => hp && update.mutate(hp, { onError: (err) => notifyApiError(err) });

  const handleUpload = (file: File) =>
    uploadHeroImage.mutate(file, {
      onSuccess: (res) => setHero('imageFilename', res.filename),
      onError: (err) => notifyApiError(err),
    });

  const heroImg = cmsImageUrl('page', hp.hero.imageFilename);

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Banner & Hero"
        description="Kelola tampilan hero section dan statistik yang muncul di halaman utama website."
        action={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button>
            </a>
            <Button icon={<Save size={16} />} onClick={handleSave} disabled={update.isPending}>
              {update.isPending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </div>
        }
      />

      {/* Hero text */}
      <SectionCard title="Teks Hero Section" icon={<Type size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Badge Text" value={hp.hero.badgeText} onChange={(e) => setHero('badgeText', e.target.value)} placeholder="Used Car Specialist #1" />
          <TextField label="Judul (pakai <em>...</em> untuk highlight)" value={hp.hero.titleHtml} onChange={(e) => setHero('titleHtml', e.target.value)} placeholder="Mobil Bekas <em>Berkualitas</em>" />
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Subtitle / Deskripsi</label>
            <textarea value={hp.hero.subtitle} onChange={(e) => setHero('subtitle', e.target.value)} rows={3}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
              placeholder="Deskripsi singkat..." />
          </div>
        </div>
      </SectionCard>

      {/* CTA */}
      <SectionCard title="Tombol CTA" icon={<MousePointerClick size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Tombol Utama — Label" value={hp.hero.primaryCtaLabel} onChange={(e) => setHero('primaryCtaLabel', e.target.value)} placeholder="Jelajahi Katalog" />
          <TextField label="Tombol Utama — Link" value={hp.hero.primaryCtaLink} onChange={(e) => setHero('primaryCtaLink', e.target.value)} placeholder="/katalog" />
          <TextField label="Tombol Kedua — Label" value={hp.hero.secondaryCtaLabel} onChange={(e) => setHero('secondaryCtaLabel', e.target.value)} placeholder="Simulasi Kredit" />
          <TextField label="Tombol Kedua — Link" value={hp.hero.secondaryCtaLink} onChange={(e) => setHero('secondaryCtaLink', e.target.value)} placeholder="/simulasi" />
        </div>
      </SectionCard>

      {/* Hero image */}
      <SectionCard title="Gambar Hero" icon={<ImageIcon size={16} />}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[13px] px-4 py-2.5 cursor-pointer hover:border-primary hover:text-primary transition-colors">
              {uploadHeroImage.isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploadHeroImage.isPending ? 'Mengunggah…' : 'Unggah Gambar'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadHeroImage.isPending}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
            </label>
            {hp.hero.imageFilename && <span className="text-[12px] text-muted font-medium truncate">{hp.hero.imageFilename}</span>}
          </div>
          {heroImg && (
            <div className="rounded-2xl overflow-hidden border border-border bg-surface-soft max-w-md">
              <img src={heroImg} alt="Hero preview" className="w-full aspect-[4/3] object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Stats */}
      <SectionCard title="Statistik Ringkasan" icon={<BarChart3 size={16} />}>
        <div className="space-y-4">
          {hp.hero.stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-soft border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><BarChart3 size={16} className="text-primary" /></div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input value={s.value} onChange={(e) => setStat(i, 'value', e.target.value)} className="h-9 px-3 rounded-lg bg-surface border border-border text-sm font-bold focus:outline-none focus:border-primary" placeholder="100+ / auto" />
                <input value={s.label} onChange={(e) => setStat(i, 'label', e.target.value)} className="h-9 px-3 rounded-lg bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary" placeholder="Unit Tersedia" />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted font-medium">Tip: isi nilai <span className="font-bold">auto</span> agar dihitung otomatis dari jumlah unit tayang.</p>
        </div>
      </SectionCard>

      {/* CTA section (bawah beranda) */}
      <SectionCard title="Ajakan Bawah Halaman (CTA)" icon={<MousePointerClick size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Judul" wrapClass="md:col-span-2" value={hp.cta.title} onChange={(e) => setCta('title', e.target.value)} placeholder="Siap Membawa Pulang Mobil Idaman?" />
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Subjudul</label>
            <textarea value={hp.cta.subtitle} onChange={(e) => setCta('subtitle', e.target.value)} rows={2}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y" />
          </div>
          <TextField label="Tombol 1 — Label" value={hp.cta.primaryLabel} onChange={(e) => setCta('primaryLabel', e.target.value)} />
          <TextField label="Tombol 1 — Link" value={hp.cta.primaryLink} onChange={(e) => setCta('primaryLink', e.target.value)} />
          <TextField label="Tombol 2 — Label" value={hp.cta.secondaryLabel} onChange={(e) => setCta('secondaryLabel', e.target.value)} />
          <TextField label="Tombol 2 — Link (isi 'whatsapp' untuk WA)" value={hp.cta.secondaryLink} onChange={(e) => setCta('secondaryLink', e.target.value)} />
        </div>
      </SectionCard>

      {/* Live preview */}
      <SectionCard title="Preview Hero" icon={<Eye size={16} />}>
        <div className="relative overflow-hidden rounded-2xl bg-background border border-border p-6 md:p-8">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light text-primary text-[10px] font-bold px-2.5 py-1">{hp.hero.badgeText}</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-ink leading-tight mt-3">{renderTitle(hp.hero.titleHtml)}</h2>
              <p className="text-muted font-medium text-[12px] mt-2 leading-relaxed line-clamp-3">{hp.hero.subtitle}</p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold">{hp.hero.primaryCtaLabel}</span>
                <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-ink-soft text-[11px] font-bold">{hp.hero.secondaryCtaLabel}</span>
              </div>
              <div className="flex gap-5 mt-4">
                {hp.hero.stats.map((s, i) => (
                  <div key={i}>
                    <p className="text-lg font-extrabold text-ink">{s.value}</p>
                    <p className="text-[9px] font-semibold text-muted uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {heroImg && (
              <div className="rounded-2xl overflow-hidden">
                <img src={heroImg} alt="Preview" className="w-full aspect-[4/3] object-cover rounded-2xl" />
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
