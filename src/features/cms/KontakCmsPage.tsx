import { useState, useEffect } from 'react';
import {
  MapPin, Phone, Mail, Clock, MessageCircle, Save, ExternalLink, Globe, Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { useSiteSettings, useSiteSettingsMutations } from './cms.hooks';
import type { SiteSettingsUpdate } from './cms.types';

type FormState = {
  address: string; phone: string; email: string; businessHours: string;
  whatsappNumber: string; mapEmbedUrl: string;
  socialInstagram: string; socialFacebook: string;
};

const EMPTY: FormState = {
  address: '', phone: '', email: '', businessHours: '',
  whatsappNumber: '', mapEmbedUrl: '', socialInstagram: '', socialFacebook: '',
};

export const KontakCmsPage = () => {
  const { data, isLoading, isError } = useSiteSettings();
  const { update } = useSiteSettingsMutations();
  const [form, setForm] = useState<FormState>(EMPTY);

  // Seed form saat data pertama kali dimuat.
  useEffect(() => {
    if (!data) return;
    setForm({
      address: data.address ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      businessHours: data.businessHours ?? '',
      whatsappNumber: data.whatsappNumber ?? '',
      mapEmbedUrl: data.mapEmbedUrl ?? '',
      socialInstagram: data.social?.instagram ?? '',
      socialFacebook: data.social?.facebook ?? '',
    });
  }, [data]);

  const set = (key: keyof FormState, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    const body: SiteSettingsUpdate = {
      address: form.address,
      phone: form.phone,
      email: form.email,
      businessHours: form.businessHours,
      whatsappNumber: form.whatsappNumber,
      mapEmbedUrl: form.mapEmbedUrl || null,
      socialInstagram: form.socialInstagram || null,
      socialFacebook: form.socialFacebook || null,
    };
    update.mutate(body, { onError: (err) => notifyApiError(err) });
  };

  const INFO_ICONS = [
    { key: 'address' as const, icon: MapPin, label: 'Alamat', color: 'text-primary bg-primary/10' },
    { key: 'phone' as const, icon: Phone, label: 'Telepon', color: 'text-accent-green bg-accent-green/10' },
    { key: 'email' as const, icon: Mail, label: 'Email', color: 'text-accent-blue bg-accent-blue/10' },
    { key: 'businessHours' as const, icon: Clock, label: 'Jam Buka', color: 'text-accent-amber bg-accent-amber/10' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={24} className="animate-spin" /></div>;
  }
  if (isError) {
    return <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat pengaturan situs.</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Info Kontak"
        description="Kelola informasi kontak, WhatsApp, dan lokasi yang ditampilkan di halaman Kontak."
        action={
          <div className="flex gap-2">
            <a href="/kontak" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button>
            </a>
            <Button icon={<Save size={16} />} onClick={handleSave} disabled={update.isPending}>
              {update.isPending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </div>
        }
      />

      {/* Preview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {INFO_ICONS.map((info) => {
          const Icon = info.icon;
          return (
            <div key={info.key} className="bg-surface rounded-2xl border border-border p-4">
              <div className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center mb-3`}><Icon size={18} /></div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{info.label}</p>
              <p className="text-[13px] font-bold text-ink mt-0.5 leading-snug line-clamp-2">{form[info.key] || '—'}</p>
            </div>
          );
        })}
      </div>

      {/* Contact info */}
      <SectionCard title="Informasi Utama" icon={<Globe size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TextField label="Alamat Lengkap" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Jl. Raya..." />
          </div>
          <TextField label="Nomor Telepon" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="021-xxx" />
          <TextField label="Email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@domain.com" />
          <TextField label="Jam Operasional" value={form.businessHours} onChange={(e) => set('businessHours', e.target.value)} placeholder="Senin–Sabtu, 09.00–18.00" />
        </div>
      </SectionCard>

      {/* WhatsApp */}
      <SectionCard title="WhatsApp" icon={<MessageCircle size={16} />}>
        <div className="space-y-4">
          <TextField label="Nomor WhatsApp (tanpa +)" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="628xxx" />
          {form.whatsappNumber && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/5 border border-accent-green/20">
              <MessageCircle size={18} className="text-accent-green shrink-0" />
              <div className="text-[12px]">
                <span className="font-bold text-ink">Link WA: </span>
                <a href={`https://wa.me/${form.whatsappNumber}`} target="_blank" rel="noreferrer" className="text-accent-green font-semibold hover:underline break-all">
                  wa.me/{form.whatsappNumber}
                </a>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Social */}
      <SectionCard title="Media Sosial" icon={<Globe size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Instagram (URL)" value={form.socialInstagram} onChange={(e) => set('socialInstagram', e.target.value)} placeholder="https://instagram.com/..." />
          <TextField label="Facebook (URL)" value={form.socialFacebook} onChange={(e) => set('socialFacebook', e.target.value)} placeholder="https://facebook.com/..." />
        </div>
      </SectionCard>

      {/* Map */}
      <SectionCard title="Peta Lokasi" icon={<MapPin size={16} />}>
        <div className="space-y-4">
          <TextField label="URL Embed Peta (OpenStreetMap / Google Maps)" value={form.mapEmbedUrl} onChange={(e) => set('mapEmbedUrl', e.target.value)} placeholder="https://..." />
          {form.mapEmbedUrl && (
            <div className="rounded-2xl overflow-hidden border border-border h-64 bg-surface-soft">
              <iframe title="Preview Lokasi" src={form.mapEmbedUrl} className="w-full h-full" loading="lazy" />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};
