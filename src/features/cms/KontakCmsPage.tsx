import { useState } from 'react';
import {
  MapPin, Phone, Mail, Clock, MessageCircle, Save, ExternalLink, Globe,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';

/* ── Dummy data (akan diganti API) ────────────────────────── */
interface KontakData {
  alamat: string;
  telepon: string;
  email: string;
  jamBuka: string;
  whatsappNumber: string;
  whatsappMessage: string;
  mapsEmbedUrl: string;
  instagram: string;
  facebook: string;
}

const INITIAL: KontakData = {
  alamat: 'Jl. Raya Otomotif No. 88, Jakarta Selatan',
  telepon: '021-1500-888',
  email: 'halo@gmmobilindo.id',
  jamBuka: 'Senin–Sabtu, 09.00–18.00 WIB',
  whatsappNumber: '628000000000',
  whatsappMessage: 'Halo GM Mobilindo, saya tertarik dengan unit...',
  mapsEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=106.78%2C-6.30%2C106.86%2C-6.22&layer=mapnik',
  instagram: '@gmmobilindo',
  facebook: 'GM Mobilindo',
};

const INFO_ICONS = [
  { key: 'alamat' as const, icon: MapPin, label: 'Alamat', color: 'text-primary bg-primary/10' },
  { key: 'telepon' as const, icon: Phone, label: 'Telepon', color: 'text-accent-green bg-accent-green/10' },
  { key: 'email' as const, icon: Mail, label: 'Email', color: 'text-accent-blue bg-accent-blue/10' },
  { key: 'jamBuka' as const, icon: Clock, label: 'Jam Buka', color: 'text-accent-amber bg-accent-amber/10' },
];

export const KontakCmsPage = () => {
  const [data, setData] = useState<KontakData>(INITIAL);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof KontakData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
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
        title="Info Kontak"
        description="Kelola informasi kontak, WhatsApp, dan lokasi yang ditampilkan di halaman Kontak."
        action={
          <div className="flex gap-2">
            <a href="/kontak" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button>
            </a>
            <Button icon={<Save size={16} />} onClick={handleSave}>
              {saved ? '✓ Tersimpan' : 'Simpan'}
            </Button>
          </div>
        }
      />

      {/* ── Preview Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {INFO_ICONS.map(info => {
          const Icon = info.icon;
          return (
            <div key={info.key} className="bg-surface rounded-2xl border border-border p-4">
              <div className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{info.label}</p>
              <p className="text-[13px] font-bold text-ink mt-0.5 leading-snug line-clamp-2">{data[info.key]}</p>
            </div>
          );
        })}
      </div>

      {/* ── Contact Info ───────────────────────────────────── */}
      <SectionCard title="Informasi Utama" icon={<Globe size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TextField label="Alamat Lengkap" value={data.alamat} onChange={e => update('alamat', e.target.value)} placeholder="Jl. Raya..." />
          </div>
          <TextField label="Nomor Telepon" value={data.telepon} onChange={e => update('telepon', e.target.value)} placeholder="021-xxx" />
          <TextField label="Email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="email@domain.com" />
          <TextField label="Jam Operasional" value={data.jamBuka} onChange={e => update('jamBuka', e.target.value)} placeholder="Senin–Sabtu, 09.00–18.00" />
        </div>
      </SectionCard>

      {/* ── WhatsApp ───────────────────────────────────────── */}
      <SectionCard title="WhatsApp" icon={<MessageCircle size={16} />}>
        <div className="space-y-4">
          <TextField
            label="Nomor WhatsApp (tanpa +)"
            value={data.whatsappNumber}
            onChange={e => update('whatsappNumber', e.target.value)}
            placeholder="628xxx"
          />
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Pesan Default</label>
            <textarea
              value={data.whatsappMessage}
              onChange={e => update('whatsappMessage', e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y"
              placeholder="Halo, saya tertarik..."
            />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/5 border border-accent-green/20">
            <MessageCircle size={18} className="text-accent-green shrink-0" />
            <div className="text-[12px]">
              <span className="font-bold text-ink">Link WA: </span>
              <a
                href={`https://wa.me/${data.whatsappNumber}?text=${encodeURIComponent(data.whatsappMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="text-accent-green font-semibold hover:underline break-all"
              >
                wa.me/{data.whatsappNumber}
              </a>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Social Media ───────────────────────────────────── */}
      <SectionCard title="Media Sosial" icon={<Globe size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Instagram" value={data.instagram} onChange={e => update('instagram', e.target.value)} placeholder="@username" />
          <TextField label="Facebook" value={data.facebook} onChange={e => update('facebook', e.target.value)} placeholder="Nama Page" />
        </div>
      </SectionCard>

      {/* ── Maps ───────────────────────────────────────────── */}
      <SectionCard title="Peta Lokasi" icon={<MapPin size={16} />}>
        <div className="space-y-4">
          <TextField
            label="URL Embed Peta (OpenStreetMap / Google Maps)"
            value={data.mapsEmbedUrl}
            onChange={e => update('mapsEmbedUrl', e.target.value)}
            placeholder="https://..."
          />
          {data.mapsEmbedUrl && (
            <div className="rounded-2xl overflow-hidden border border-border h-64 bg-surface-soft">
              <iframe
                title="Preview Lokasi"
                src={data.mapsEmbedUrl}
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};
