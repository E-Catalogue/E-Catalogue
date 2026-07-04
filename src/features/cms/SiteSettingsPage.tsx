import { useState, useEffect } from 'react';
import { Settings, Save, Building2, Phone, Share2, Link2, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { cmsImageUrl } from './cms.api';
import { useSiteSettings, useSiteSettingsMutations } from './cms.hooks';
import { ImageUpload } from './ImageUpload';
import { TextArea } from './CmsKit';
import type { SiteSettingsRaw, SiteSettingsUpdate, NavLink } from './cms.types';

const empty: SiteSettingsRaw = {
  companyName: '', tagline: '', logoFilename: null, faviconFilename: null, footerDescription: '',
  navContactLabel: 'Hubungi Kami', navLinks: [], whatsappNumber: '', phone: '', email: '', address: '',
  businessHours: '', mapEmbedUrl: '', mapLat: null, mapLng: null,
  socialInstagram: '', socialFacebook: '', socialTiktok: '', socialWebsite: '', copyrightText: '',
};

export const SiteSettingsPage = () => {
  const { data, isLoading, isError } = useSiteSettings();
  const { update, uploadLogo, uploadFavicon } = useSiteSettingsMutations();
  const [f, setF] = useState<SiteSettingsRaw>(empty);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (data && !seeded) {
      setF({ ...empty, ...data, navLinks: data.navLinks ?? [] });
      setSeeded(true);
    }
  }, [data, seeded]);

  const set = <K extends keyof SiteSettingsRaw>(k: K, v: SiteSettingsRaw[K]) => setF((p) => ({ ...p, [k]: v }));
  const setLink = (i: number, patch: Partial<NavLink>) => set('navLinks', (f.navLinks ?? []).map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  if (isLoading) return <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={24} className="animate-spin" /></div>;
  if (isError) return <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat pengaturan situs.</div>;

  const save = () => {
    const body: SiteSettingsUpdate = {
      companyName: f.companyName ?? '', tagline: f.tagline ?? '', footerDescription: f.footerDescription ?? '',
      navContactLabel: f.navContactLabel ?? '', navLinks: f.navLinks ?? [],
      whatsappNumber: f.whatsappNumber ?? '', phone: f.phone ?? '', email: f.email ?? '', address: f.address ?? '',
      businessHours: f.businessHours ?? '', mapEmbedUrl: f.mapEmbedUrl || null,
      socialInstagram: f.socialInstagram || null, socialFacebook: f.socialFacebook || null,
      socialTiktok: f.socialTiktok || null, socialWebsite: f.socialWebsite || null,
      copyrightText: f.copyrightText || null,
    };
    update.mutate(body, { onError: (e) => notifyApiError(e) });
  };

  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Pengaturan Situs"
        description="Identitas, kontak, menu navigasi, dan media sosial yang dipakai di seluruh website."
        action={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>
            <Button icon={<Save size={16} />} onClick={save} disabled={update.isPending}>{update.isPending ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        }
      />

      {/* Identitas */}
      <SectionCard title="Identitas" icon={<Building2 size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUpload label="Logo" aspect="aspect-video" previewUrl={cmsImageUrl('site', f.logoFilename)} isUploading={uploadLogo.isPending}
            onFile={(file) => uploadLogo.mutate(file, { onSuccess: (r) => set('logoFilename', r.filename), onError: (e) => notifyApiError(e) })} />
          <ImageUpload label="Favicon" aspect="aspect-square" previewUrl={cmsImageUrl('site', f.faviconFilename)} isUploading={uploadFavicon.isPending}
            onFile={(file) => uploadFavicon.mutate(file, { onSuccess: (r) => set('faviconFilename', r.filename), onError: (e) => notifyApiError(e) })} />
          <div className="space-y-3">
            <TextField label="Nama Perusahaan" value={f.companyName ?? ''} onChange={(e) => set('companyName', e.target.value)} placeholder="GM Mobilindo" />
            <TextField label="Tagline" value={f.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} placeholder="Used Car Specialist" />
          </div>
        </div>
        <TextArea label="Deskripsi Footer" value={f.footerDescription ?? ''} onChange={(v) => set('footerDescription', v)} rows={2} />
        <TextField label="Teks Copyright" value={f.copyrightText ?? ''} onChange={(e) => set('copyrightText', e.target.value)} placeholder="© 2026 GM Mobilindo" />
      </SectionCard>

      {/* Kontak */}
      <SectionCard title="Kontak" icon={<Phone size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Nomor WhatsApp (tanpa +)" value={f.whatsappNumber ?? ''} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="628xxx" />
          <TextField label="Telepon" value={f.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="021-xxx" />
          <TextField label="Email" value={f.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="halo@domain.com" />
          <TextField label="Jam Operasional" value={f.businessHours ?? ''} onChange={(e) => set('businessHours', e.target.value)} placeholder="Senin–Sabtu, 09.00–18.00" />
          <TextField label="Label Tombol Navbar" value={f.navContactLabel ?? ''} onChange={(e) => set('navContactLabel', e.target.value)} placeholder="Hubungi Kami" />
          <TextField label="Alamat" wrapClass="md:col-span-1" value={f.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="Jl. Raya..." />
        </div>
        <TextField label="URL Embed Peta" value={f.mapEmbedUrl ?? ''} onChange={(e) => set('mapEmbedUrl', e.target.value)} placeholder="https://..." />
      </SectionCard>

      {/* Menu navigasi */}
      <SectionCard title="Menu Navigasi (Header/Footer)" icon={<Link2 size={16} />}>
        <div className="space-y-2.5">
          {(f.navLinks ?? []).map((l, i) => (
            <div key={i} className="flex items-end gap-2 rounded-xl border border-border bg-surface-soft p-2.5">
              <TextField label="Label" wrapClass="flex-1" value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Beranda" />
              <TextField label="Path" wrapClass="flex-1" value={l.path} onChange={(e) => setLink(i, { path: e.target.value })} placeholder="/katalog" />
              <button onClick={() => set('navLinks', (f.navLinks ?? []).filter((_, idx) => idx !== i))} className="p-2 mb-0.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => set('navLinks', [...(f.navLinks ?? []), { label: '', path: '/' }])} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"><Plus size={14} /> Tambah Menu</button>
        </div>
      </SectionCard>

      {/* Sosial */}
      <SectionCard title="Media Sosial" icon={<Share2 size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Instagram (URL)" value={f.socialInstagram ?? ''} onChange={(e) => set('socialInstagram', e.target.value)} placeholder="https://instagram.com/..." />
          <TextField label="Facebook (URL)" value={f.socialFacebook ?? ''} onChange={(e) => set('socialFacebook', e.target.value)} placeholder="https://facebook.com/..." />
          <TextField label="TikTok (URL)" value={f.socialTiktok ?? ''} onChange={(e) => set('socialTiktok', e.target.value)} placeholder="https://tiktok.com/@..." />
          <TextField label="Website (URL)" value={f.socialWebsite ?? ''} onChange={(e) => set('socialWebsite', e.target.value)} placeholder="https://..." />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button icon={<Settings size={15} />} onClick={save} disabled={update.isPending}>{update.isPending ? 'Menyimpan…' : 'Simpan Semua'}</Button>
      </div>
    </div>
  );
};
