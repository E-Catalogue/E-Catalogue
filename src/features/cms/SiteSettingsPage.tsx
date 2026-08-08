import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Save, Building2, Phone, Share2, Loader2, ExternalLink, Palette, RotateCcw } from 'lucide-react';
import { applyPrimaryColor, isValidHex, DEFAULT_PRIMARY } from '@/core/utils/theme';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import { grantMutationConfirmationLease } from '@/core/api/mutationConfirmation';
import { cmsImageUrl } from './cms.api';
import { useSiteSettings, useSiteSettingsMutations } from './cms.hooks';
import { ImageUpload } from './ImageUpload';
import { TextArea } from './CmsKit';
import type { SiteSettingsRaw, SiteSettingsUpdate } from './cms.types';

const empty: SiteSettingsRaw = {
  companyName: '', tagline: '', logoFilename: null, faviconFilename: null, footerDescription: '',
  navContactLabel: 'Hubungi Kami', primaryColor: null, whatsappNumber: '', phone: '', email: '', address: '',
  businessHours: '', mapEmbedUrl: '', mapLat: null, mapLng: null,
  socialInstagram: '', socialFacebook: '', socialTiktok: '', socialWebsite: '', copyrightText: '',
};

const COLOR_PRESETS = ['#D97757', '#2563EB', '#059669', '#7C3AED', '#DC2626', '#EA580C', '#0891B2', '#DB2777'];

export const SiteSettingsPage = () => {
  const { data, isLoading, isError } = useSiteSettings();
  const { update, uploadLogo, uploadFavicon } = useSiteSettingsMutations();
  const confirmAction = useConfirmedAction();
  const [draft, setDraft] = useState<SiteSettingsRaw | null>(null);
  // Gambar di-stage lokal (pratinjau) dan baru diunggah saat klik Simpan utama — tidak memicu modal saat pilih.
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [pendingFavicon, setPendingFavicon] = useState<File | null>(null);
  const f = draft ?? (data ? { ...empty, ...data } : empty);
  const setF = setDraft;

  const set = <K extends keyof SiteSettingsRaw>(k: K, v: SiteSettingsRaw[K]) => setF((p) => ({ ...(p ?? f), [k]: v }));

  if (isLoading) return <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={24} className="animate-spin" /></div>;
  if (isError) return <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat pengaturan situs.</div>;

  const saving = update.isPending || uploadLogo.isPending || uploadFavicon.isPending;

  const save = () => {
    const body: SiteSettingsUpdate = {
      companyName: f.companyName ?? '', tagline: f.tagline ?? '', footerDescription: f.footerDescription ?? '',
      navContactLabel: f.navContactLabel ?? '',
      whatsappNumber: f.whatsappNumber ?? '', phone: f.phone ?? '', email: f.email ?? '', address: f.address ?? '',
      businessHours: f.businessHours ?? '', mapEmbedUrl: f.mapEmbedUrl || null,
      primaryColor: isValidHex(f.primaryColor ?? '') ? f.primaryColor : null,
      socialInstagram: f.socialInstagram || null, socialFacebook: f.socialFacebook || null,
      socialTiktok: f.socialTiktok || null, socialWebsite: f.socialWebsite || null,
      copyrightText: f.copyrightText || null,
    };
    confirmAction({
      title: 'Simpan Pengaturan Situs',
      message: 'Perubahan akan langsung tayang di website publik. Lanjutkan?',
      confirmLabel: 'Simpan',
      tone: 'primary',
      // Unggah gambar yang di-stage lebih dulu, lalu simpan setelan. Tiap mutation diberi lease agar
      // tidak memunculkan modal konfirmasi transport tambahan (sudah dikonfirmasi lewat dialog Simpan).
      execute: async () => {
        if (pendingLogo) { grantMutationConfirmationLease(); await uploadLogo.mutateAsync(pendingLogo); }
        if (pendingFavicon) { grantMutationConfirmationLease(); await uploadFavicon.mutateAsync(pendingFavicon); }
        grantMutationConfirmationLease();
        await update.mutateAsync(body);
      },
      onSuccess: () => { setDraft(null); setPendingLogo(null); setPendingFavicon(null); },
      onError: (e) => notifyApiError(e),
    });
  };

  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Pengaturan Situs"
        description="Kelola identitas, kontak, dan media sosial yang dipakai di seluruh website."
        action={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>
            <Button icon={<Save size={16} />} onClick={save} loading={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        }
      />

      {/* Identitas */}
      <SectionCard title="Identitas" icon={<Building2 size={16} />} bodyClassName="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUpload label="Logo" aspect="aspect-video" hint={pendingLogo ? 'Siap disimpan · JPG/PNG · maksimal 2 MB per gambar' : 'JPG/PNG · maksimal 2 MB per gambar'} previewUrl={cmsImageUrl('site', f.logoFilename)} isUploading={uploadLogo.isPending}
            onFile={setPendingLogo} />
          <ImageUpload label="Favicon" aspect="aspect-square" hint={pendingFavicon ? 'Siap disimpan · JPG/PNG · maksimal 2 MB per gambar' : 'JPG/PNG · maksimal 2 MB per gambar'} previewUrl={cmsImageUrl('site', f.faviconFilename)} isUploading={uploadFavicon.isPending}
            onFile={setPendingFavicon} />
          <div className="space-y-3">
            <TextField label="Nama Perusahaan" value={f.companyName ?? ''} onChange={(e) => set('companyName', e.target.value)} placeholder="GM Mobilindo" />
            <TextField label="Tagline" value={f.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} placeholder="Used Car Specialist" />
          </div>
        </div>
        <TextArea label="Deskripsi Footer" value={f.footerDescription ?? ''} onChange={(v) => set('footerDescription', v)} rows={2} />
        <TextField label="Teks Copyright" value={f.copyrightText ?? ''} onChange={(e) => set('copyrightText', e.target.value)} placeholder="© 2026 GM Mobilindo" />
      </SectionCard>

      {/* Kontak */}
      <SectionCard title="Kontak" icon={<Phone size={16} />} bodyClassName="space-y-5">
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

      {/* Tema Warna */}
      <SectionCard title="Tema Warna Website" icon={<Palette size={16} />}>
        {(() => {
          const current = isValidHex(f.primaryColor ?? '') ? (f.primaryColor as string) : DEFAULT_PRIMARY;
          // Terapkan langsung ke CSS var untuk pratinjau instan; disimpan permanen saat klik Simpan.
          const pick = (hex: string) => { set('primaryColor', hex); applyPrimaryColor(hex); };
          return (
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="[&_.react-colorful]:w-[200px] [&_.react-colorful]:h-[160px]">
                <HexColorPicker color={current} onChange={pick} />
              </div>
              <div className="space-y-4">
                <p className="text-[12px] text-muted font-medium">Warna utama ini dipakai untuk tombol, aksen, dan highlight di seluruh website (admin &amp; publik). Perubahan langsung terlihat sebagai pratinjau.</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-border shadow-inner shrink-0" style={{ background: current }} />
                  <TextField label="Kode Warna (HEX)" wrapClass="w-40" value={f.primaryColor ?? ''} onChange={(e) => { const v = e.target.value; set('primaryColor', v); if (isValidHex(v)) applyPrimaryColor(v); }} placeholder={DEFAULT_PRIMARY} />
                  <button type="button" onClick={() => pick(DEFAULT_PRIMARY)} className="inline-flex items-center gap-1.5 h-9 mt-5 px-3 rounded-xl text-[12px] font-bold border border-border text-ink-soft hover:border-primary hover:text-primary">
                    <RotateCcw size={13} /> Default
                  </button>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Preset</p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button key={c} type="button" onClick={() => pick(c)} title={c}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${current.toLowerCase() === c.toLowerCase() ? 'border-ink' : 'border-transparent'}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center rounded-xl bg-primary text-white text-[12px] font-bold px-4 py-2 shadow-glow">Tombol Utama</span>
                  <span className="inline-flex items-center rounded-xl bg-primary-light text-primary text-[12px] font-bold px-4 py-2">Aksen</span>
                </div>
              </div>
            </div>
          );
        })()}
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
    </div>
  );
};
