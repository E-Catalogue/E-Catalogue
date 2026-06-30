import { useState } from 'react';
import {
  Image, Save, Eye, BarChart3, Type, MousePointerClick, ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';

/* ── Dummy data (akan diganti API) ────────────────────────── */
interface HeroData {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageUrl: string;
}

interface StatItem {
  id: string;
  value: string;
  label: string;
}

const INITIAL_HERO: HeroData = {
  badge: 'Used Car Specialist #1',
  title: 'Mobil Bekas',
  highlight: 'Berkualitas',
  subtitle: 'Ratusan unit terinspeksi, bergaransi, dan sudah direkondisi. Harga transparan, proses kredit mudah — temukan mobil impian Anda hari ini.',
  ctaPrimary: 'Jelajahi Katalog',
  ctaSecondary: 'Simulasi Kredit',
  imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1400&auto=format&fit=crop',
};

const INITIAL_STATS: StatItem[] = [
  { id: '1', value: '100+', label: 'Unit Tersedia' },
  { id: '2', value: '4.9', label: 'Rating Pelanggan' },
  { id: '3', value: '10+', label: 'Tahun Pengalaman' },
];

export const BannerPage = () => {
  const [hero, setHero] = useState<HeroData>(INITIAL_HERO);
  const [stats, setStats] = useState<StatItem[]>(INITIAL_STATS);
  const [saved, setSaved] = useState(false);

  const updateHero = (key: keyof HeroData, value: string) => {
    setHero(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateStat = (id: string, field: 'value' | 'label', value: string) => {
    setStats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Kirim ke API backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
            <Button icon={<Save size={16} />} onClick={handleSave}>
              {saved ? '✓ Tersimpan' : 'Simpan'}
            </Button>
          </div>
        }
      />

      {/* ── Hero Text ──────────────────────────────────────── */}
      <SectionCard title="Teks Hero Section" icon={<Type size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Badge Text"
            value={hero.badge}
            onChange={e => updateHero('badge', e.target.value)}
            placeholder="Used Car Specialist #1"
          />
          <TextField
            label="Judul Utama"
            value={hero.title}
            onChange={e => updateHero('title', e.target.value)}
            placeholder="Mobil Bekas"
          />
          <TextField
            label="Kata Highlight (Warna Primary)"
            value={hero.highlight}
            onChange={e => updateHero('highlight', e.target.value)}
            placeholder="Berkualitas"
          />
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
              Subtitle / Deskripsi
            </label>
            <textarea
              value={hero.subtitle}
              onChange={e => updateHero('subtitle', e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
              placeholder="Deskripsi singkat..."
            />
          </div>
        </div>
      </SectionCard>

      {/* ── CTA Buttons ────────────────────────────────────── */}
      <SectionCard title="Tombol CTA" icon={<MousePointerClick size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Tombol Utama (Primary)"
            value={hero.ctaPrimary}
            onChange={e => updateHero('ctaPrimary', e.target.value)}
            placeholder="Jelajahi Katalog"
          />
          <TextField
            label="Tombol Kedua (Secondary)"
            value={hero.ctaSecondary}
            onChange={e => updateHero('ctaSecondary', e.target.value)}
            placeholder="Simulasi Kredit"
          />
        </div>
      </SectionCard>

      {/* ── Hero Image ─────────────────────────────────────── */}
      <SectionCard title="Gambar Hero" icon={<Image size={16} />}>
        <div className="space-y-4">
          <TextField
            label="URL Gambar"
            value={hero.imageUrl}
            onChange={e => updateHero('imageUrl', e.target.value)}
            placeholder="https://..."
          />
          {hero.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-border bg-surface-soft max-w-md">
              <img
                src={hero.imageUrl}
                alt="Hero preview"
                className="w-full aspect-[4/3] object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Statistics ──────────────────────────────────────── */}
      <SectionCard title="Statistik Ringkasan" icon={<BarChart3 size={16} />}>
        <div className="space-y-4">
          {stats.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-soft border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 size={16} className="text-primary" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  value={s.value}
                  onChange={e => updateStat(s.id, 'value', e.target.value)}
                  className="h-9 px-3 rounded-lg bg-surface border border-border text-sm font-bold focus:outline-none focus:border-primary"
                  placeholder="100+"
                />
                <input
                  value={s.label}
                  onChange={e => updateStat(s.id, 'label', e.target.value)}
                  className="h-9 px-3 rounded-lg bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="Unit Tersedia"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Live Preview ───────────────────────────────────── */}
      <SectionCard title="Preview Hero" icon={<Eye size={16} />}>
        <div className="relative overflow-hidden rounded-2xl bg-background border border-border p-6 md:p-8">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light text-primary text-[10px] font-bold px-2.5 py-1">
                {hero.badge}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-ink leading-tight mt-3">
                {hero.title} <span className="text-primary">{hero.highlight}</span>
              </h2>
              <p className="text-muted font-medium text-[12px] mt-2 leading-relaxed line-clamp-3">
                {hero.subtitle}
              </p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold">{hero.ctaPrimary}</span>
                <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-ink-soft text-[11px] font-bold">{hero.ctaSecondary}</span>
              </div>
              <div className="flex gap-5 mt-4">
                {stats.map(s => (
                  <div key={s.id}>
                    <p className="text-lg font-extrabold text-ink">{s.value}</p>
                    <p className="text-[9px] font-semibold text-muted uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {hero.imageUrl && (
              <div className="rounded-2xl overflow-hidden">
                <img src={hero.imageUrl} alt="Preview" className="w-full aspect-[4/3] object-cover rounded-2xl" />
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
