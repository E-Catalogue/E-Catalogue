import { useState, useEffect } from 'react';
import {
  Save, Eye, BarChart3, Type, MousePointerClick, ExternalLink, Loader2, ImageIcon, Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { cmsImageUrl } from './cms.api';
import { useCmsSection, useUpdateCmsSection, useUploadHeroImage } from './cms.hooks';
import { ImageUpload } from './ImageUpload';
import type { HomepageHero, HomepageCta } from './cms.types';

const renderTitle = (html: string) =>
  html.split(/(<em>.*?<\/em>)/g).filter(Boolean).map((part, i) => {
    const m = part.match(/^<em>(.*?)<\/em>$/);
    return m ? <span key={i} className="text-primary">{m[1]}</span> : <span key={i}>{part}</span>;
  });

export const BannerPage = () => {
  const heroQ = useCmsSection<HomepageHero>('homepage', 'hero');
  const ctaQ  = useCmsSection<HomepageCta>('homepage', 'cta');
  const heroM = useUpdateCmsSection<HomepageHero>('homepage', 'hero');
  const ctaM  = useUpdateCmsSection<HomepageCta>('homepage', 'cta');
  const uploadHero = useUploadHeroImage('homepage');

  const [hero, setHero] = useState<HomepageHero | null>(null);
  const [cta, setCta]   = useState<HomepageCta | null>(null);

  useEffect(() => { if (heroQ.data && !hero) setHero(structuredClone(heroQ.data)); }, [heroQ.data, hero]);
  useEffect(() => { if (ctaQ.data && !cta) setCta(structuredClone(ctaQ.data)); }, [ctaQ.data, cta]);

  const loading = heroQ.isLoading || ctaQ.isLoading || !hero || !cta;
  const error = heroQ.isError || ctaQ.isError;

  if (loading) {
    if (error) return <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat data beranda.</div>;
    return <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={24} className="animate-spin" /></div>;
  }

  const setH = <K extends keyof HomepageHero>(k: K, v: HomepageHero[K]) => setHero((p) => (p ? { ...p, [k]: v } : p));
  const setC = <K extends keyof HomepageCta>(k: K, v: HomepageCta[K]) => setCta((p) => (p ? { ...p, [k]: v } : p));
  const setStat = (i: number, f: 'value' | 'label', v: string) =>
    setHero((p) => (p ? { ...p, stats: p.stats.map((s, idx) => (idx === i ? { ...s, [f]: v } : s)) } : p));
  const setFloat = (f: 'icon' | 'title' | 'subtitle', v: string) =>
    setHero((p) => (p ? { ...p, floatingCard: { ...p.floatingCard, [f]: v } } : p));

  const handleSave = () => {
    if (hero) heroM.mutate(hero, { onError: (e) => notifyApiError(e) });
    if (cta) ctaM.mutate(cta, { onError: (e) => notifyApiError(e) });
  };

  const heroImg = cmsImageUrl('page', hero.imageFilename);
  const saving = heroM.isPending || ctaM.isPending;

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Hero Beranda"
        description="Kelola hero section, statistik, dan ajakan (CTA) di halaman utama website."
        action={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>
            <Button icon={<Save size={16} />} onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        }
      />

      {/* Hero text */}
      <SectionCard title="Teks Hero Section" icon={<Type size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Badge Text" value={hero.badgeText} onChange={(e) => setH('badgeText', e.target.value)} placeholder="Used Car Specialist #1" />
          <TextField label="Judul (pakai <em>…</em> untuk highlight)" value={hero.titleHtml} onChange={(e) => setH('titleHtml', e.target.value)} placeholder="Mobil Bekas <em>Berkualitas</em>" />
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Subtitle / Deskripsi</label>
            <textarea value={hero.subtitle} onChange={(e) => setH('subtitle', e.target.value)} rows={3}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y" />
          </div>
        </div>
      </SectionCard>

      {/* CTA hero */}
      <SectionCard title="Tombol CTA Hero" icon={<MousePointerClick size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Tombol Utama — Label" value={hero.primaryCtaLabel} onChange={(e) => setH('primaryCtaLabel', e.target.value)} placeholder="Jelajahi Katalog" />
          <TextField label="Tombol Utama — Link" value={hero.primaryCtaLink} onChange={(e) => setH('primaryCtaLink', e.target.value)} placeholder="/katalog" />
          <TextField label="Tombol Kedua — Label" value={hero.secondaryCtaLabel} onChange={(e) => setH('secondaryCtaLabel', e.target.value)} placeholder="Simulasi Kredit" />
          <TextField label="Tombol Kedua — Link" value={hero.secondaryCtaLink} onChange={(e) => setH('secondaryCtaLink', e.target.value)} placeholder="/simulasi" />
        </div>
      </SectionCard>

      {/* Hero image + floating card */}
      <SectionCard title="Gambar Hero & Kartu Badge" icon={<ImageIcon size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            label="Gambar Hero"
            previewUrl={heroImg}
            isUploading={uploadHero.isPending}
            onFile={(file) => uploadHero.mutate(file, { onSuccess: (res) => setH('imageFilename', res.filename), onError: (e) => notifyApiError(e) })}
          />
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Kartu Badge Mengambang</p>
            <TextField label="Ikon (nama lucide)" value={hero.floatingCard.icon} onChange={(e) => setFloat('icon', e.target.value)} placeholder="shield-check" />
            <TextField label="Judul" value={hero.floatingCard.title} onChange={(e) => setFloat('title', e.target.value)} placeholder="Garansi Mesin" />
            <TextField label="Subjudul" value={hero.floatingCard.subtitle} onChange={(e) => setFloat('subtitle', e.target.value)} placeholder="Inspeksi 150+ titik" />
          </div>
        </div>
      </SectionCard>

      {/* Stats */}
      <SectionCard title="Statistik Ringkasan" icon={<BarChart3 size={16} />}>
        <div className="space-y-4">
          {hero.stats.map((s, i) => (
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

      {/* CTA bawah */}
      <SectionCard title="Ajakan Bawah Halaman (CTA)" icon={<MousePointerClick size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Judul" wrapClass="md:col-span-2" value={cta.title} onChange={(e) => setC('title', e.target.value)} placeholder="Siap Membawa Pulang Mobil Idaman?" />
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Subjudul</label>
            <textarea value={cta.subtitle} onChange={(e) => setC('subtitle', e.target.value)} rows={2}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y" />
          </div>
          <TextField label="Tombol 1 — Label" value={cta.primaryLabel} onChange={(e) => setC('primaryLabel', e.target.value)} />
          <TextField label="Tombol 1 — Link" value={cta.primaryLink} onChange={(e) => setC('primaryLink', e.target.value)} />
          <TextField label="Tombol 2 — Label" value={cta.secondaryLabel} onChange={(e) => setC('secondaryLabel', e.target.value)} />
          <TextField label="Tombol 2 — Link (isi 'whatsapp' untuk WA)" value={cta.secondaryLink} onChange={(e) => setC('secondaryLink', e.target.value)} />
        </div>
      </SectionCard>

      {/* Live preview */}
      <SectionCard title="Preview Hero" icon={<Eye size={16} />}>
        <div className="relative overflow-hidden rounded-2xl bg-background border border-border p-6 md:p-8">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light text-primary text-[10px] font-bold px-2.5 py-1"><Sparkles size={11} /> {hero.badgeText}</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-ink leading-tight mt-3">{renderTitle(hero.titleHtml)}</h2>
              <p className="text-muted font-medium text-[12px] mt-2 leading-relaxed line-clamp-3">{hero.subtitle}</p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold">{hero.primaryCtaLabel}</span>
                <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-ink-soft text-[11px] font-bold">{hero.secondaryCtaLabel}</span>
              </div>
              <div className="flex gap-5 mt-4">
                {hero.stats.map((s, i) => (
                  <div key={i}><p className="text-lg font-extrabold text-ink">{s.value}</p><p className="text-[9px] font-semibold text-muted uppercase tracking-wide">{s.label}</p></div>
                ))}
              </div>
            </div>
            {heroImg && <div className="rounded-2xl overflow-hidden"><img src={heroImg} alt="Preview" className="w-full aspect-[4/3] object-cover rounded-2xl" /></div>}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
