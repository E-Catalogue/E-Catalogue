import { useState } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import {
  ChevronRight, Calendar, Gauge, Fuel, Cog, Palette, Hash, ShieldCheck,
  Phone, HandCoins, ArrowLeft, BadgeCheck, MapPin,
} from 'lucide-react';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { useAppSelector } from '@/app/store';
import { getGallery } from '@/data/gallery';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { DEFAULT_CAR_IMAGE, APP_NAME } from '@/shared/constants';
import { WHATSAPP_URL } from './publicNav';
import type { Unit } from '@/data/types';

const Spec = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-soft border border-border">
    <div className="w-10 h-10 rounded-lg bg-surface text-primary flex items-center justify-center shrink-0 border border-border">
      <Icon size={18} strokeWidth={2.2} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[14px] font-extrabold text-ink truncate">{value}</p>
    </div>
  </div>
);

export const KatalogDetailPage = () => {
  const { id } = useParams({ from: '/_public/katalog/$id' });
  const navigate = useNavigate();
  const unit = useAppSelector((s) => s.data.units.find((u) => u.id === id));
  const related = useAppSelector((s) =>
    s.data.units.filter((u) => u.id !== id && (u.status === 'ready' || u.status === 'booked')),
  );
  const [active, setActive] = useState(0);

  if (!unit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Unit tidak ditemukan</h1>
        <p className="text-muted font-medium mt-2">Mobil yang Anda cari mungkin sudah terjual atau dihapus.</p>
        <Link to="/katalog" className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-3 shadow-glow">
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const gallery = getGallery(unit);
  const margin = unit.buyPrice ? unit.price - unit.buyPrice : null;
  const relatedSameBrand = [...related].sort((a) => (a.brand === unit.brand ? -1 : 1)).slice(0, 3);
  const openDetail = (u: Unit) => { setActive(0); navigate({ to: '/katalog/$id', params: { id: u.id } }); };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] font-semibold text-muted mb-5 flex-wrap">
        <Link to="/" className="hover:text-primary">Beranda</Link>
        <ChevronRight size={13} />
        <Link to="/katalog" className="hover:text-primary">Katalog</Link>
        <ChevronRight size={13} />
        <span className="text-ink font-bold truncate">{unit.brand} {unit.model}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* GALLERY */}
        <div className="animate-fade-in">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-soft border border-border">
            <img
              src={gallery[active]}
              alt={`${unit.brand} ${unit.model}`}
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {unit.isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
              <span className="bg-surface/90 backdrop-blur text-ink text-[10px] font-bold px-2.5 py-1 rounded-lg">{unit.code}</span>
            </div>
            <div className="absolute top-3 right-3"><StatusBadge status={unit.status} /></div>
          </div>
          <div className="grid grid-cols-5 gap-2.5 mt-3">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${active === i ? 'border-primary ring-2 ring-primary-light' : 'border-border hover:border-primary/50'}`}
              >
                <img src={img} alt="" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="animate-float-up">
          <div className="flex items-center gap-2 text-[12px] font-bold text-primary">
            <BadgeCheck size={15} /> Unit Terverifikasi
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink mt-2 leading-tight">{unit.brand} {unit.model}</h1>
          <p className="text-muted font-semibold mt-1">{unit.variant} • {unit.year}</p>

          <div className="mt-4 p-4 rounded-2xl bg-primary-light/60 border border-primary/15">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Harga</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{formatCurrency(unit.price)}</p>
            <p className="text-[12px] text-ink-soft font-semibold mt-1">Cicilan mulai {formatCurrency(Math.round(unit.price * 0.022), { compact: true })}/bln*</p>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <Spec icon={Calendar} label="Tahun" value={`${unit.year}`} />
            <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(unit.km)} KM`} />
            <Spec icon={Fuel} label="Bahan Bakar" value={unit.fuel} />
            <Spec icon={Cog} label="Transmisi" value={unit.transmission} />
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3.5 shadow-glow hover:bg-primary-dark transition-colors">
              <Phone size={17} /> Tanya / Booking Unit
            </a>
            <Link to="/simulasi" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3.5 hover:border-primary hover:text-primary transition-colors">
              <HandCoins size={17} /> Simulasi Kredit
            </Link>
          </div>

          {/* trust badges */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-[12px] font-semibold text-ink-soft">
            <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-accent-green" /> Garansi Mesin</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={15} className="text-accent-green" /> Surat Lengkap</span>
            <span className="flex items-center gap-1.5"><MapPin size={15} className="text-accent-green" /> Bisa Test Drive</span>
          </div>
        </div>
      </div>

      {/* FULL SPECS + DESC */}
      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-[15px] font-extrabold text-ink mb-4">Spesifikasi Lengkap</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <Spec icon={Hash} label="Kode Unit" value={unit.code} />
            <Spec icon={Palette} label="Warna" value={unit.color || '-'} />
            <Spec icon={Hash} label="Plat" value={unit.plate || '-'} />
            <Spec icon={Calendar} label="Tahun" value={`${unit.year}`} />
            <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(unit.km)} KM`} />
            <Spec icon={Cog} label="Transmisi" value={unit.transmission} />
            <Spec icon={Fuel} label="Bahan Bakar" value={unit.fuel} />
            {margin !== null && <Spec icon={HandCoins} label="Tukar Tambah" value="Tersedia" />}
          </div>
          <h3 className="text-[15px] font-extrabold text-ink mt-6 mb-2">Deskripsi</h3>
          <p className="text-[14px] text-muted font-medium leading-relaxed">
            {unit.brand} {unit.model} {unit.variant} tahun {unit.year} warna {unit.color.toLowerCase()} dengan
            kilometer {formatNumber(unit.km)} KM. Unit terawat, sudah melalui inspeksi 150+ titik dan proses
            rekondisi di {APP_NAME}. Surat-surat lengkap dan siap pakai. Tersedia opsi kredit dengan DP ringan.
          </p>
        </div>

        {/* Contact card */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white h-fit">
          <h3 className="text-lg font-extrabold">Tertarik dengan unit ini?</h3>
          <p className="text-white/85 text-[13px] font-medium mt-1.5">Hubungi sales kami untuk info lebih lanjut, nego harga, atau jadwal test drive.</p>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 w-full mt-5 rounded-xl bg-white text-primary font-bold text-[14px] px-5 py-3 hover:bg-white/90 transition-colors">
            <Phone size={17} /> Chat Sekarang
          </a>
          <p className="text-center text-white/70 text-[12px] font-medium mt-3">atau telepon 021-1500-888</p>
        </div>
      </div>

      {/* RELATED */}
      {relatedSameBrand.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-extrabold text-ink mb-5">Unit Serupa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedSameBrand.map((u) => <UnitCard key={u.id} unit={u} onView={openDetail} />)}
          </div>
        </div>
      )}
    </div>
  );
};
