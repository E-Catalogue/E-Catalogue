import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import {
  ChevronRight, Calendar, Gauge, Fuel, Cog, Palette, Hash, ShieldCheck,
  Phone, ArrowLeft, BadgeCheck, MapPin, ChevronLeft, ChevronRight as ChevronRightIcon,
  Percent, Wallet, Info, Calculator, Car, Loader2, CheckCircle2,
} from 'lucide-react';
import { PublicUnitCard } from './PublicUnitCard';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { WHATSAPP_URL as DEFAULT_WA } from './publicNav';
import { usePublicCatalogUnit, usePublicRelatedUnits, usePublicCreditConfig, usePublicSiteSettings } from './landing.hooks';
import type { CatalogCard, CatalogDetail, CreditSimConfig } from './public.types';

const Spec = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-soft border border-border">
    <div className="w-9 h-9 rounded-lg bg-surface text-primary flex items-center justify-center shrink-0 border border-border"><Icon size={16} strokeWidth={2.2} /></div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[13px] font-extrabold text-ink truncate">{value}</p>
    </div>
  </div>
);

/* ── Inline credit simulator (params dari config API) ── */
const SimulasiInline = ({ price, config }: { price: number; config?: CreditSimConfig }) => {
  const c = config;
  const [dpPercent, setDpPercent] = useState(c?.dpDefaultPercent ?? 20);
  const [tenor, setTenor] = useState((c?.tenorOptions ?? [12, 24, 36, 48, 60])[2] ?? 36);
  const [rate, setRate] = useState(c?.rateDefault ?? 4.5);

  const calc = useMemo(() => {
    const dp = Math.round((price * dpPercent) / 100);
    const pokok = price - dp;
    const totalBunga = Math.round((pokok * (rate / 100) * tenor) / 12);
    const cicilan = Math.round((pokok + totalBunga) / tenor);
    return { dp, pokok, totalBunga, cicilan };
  }, [price, dpPercent, tenor, rate]);

  const tenors = c?.tenorOptions ?? [12, 24, 36, 48, 60];

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center"><Calculator size={16} className="text-primary" /></div>
        <h3 className="text-[14px] font-extrabold text-ink">Simulasi Kredit</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-[12px] font-bold text-ink"><Wallet size={13} className="text-primary" /> Uang Muka</label>
              <span className="text-[13px] font-extrabold text-primary">{dpPercent}% · {formatCurrency(calc.dp, { compact: true })}</span>
            </div>
            <input type="range" min={c?.dpMinPercent ?? 10} max={c?.dpMaxPercent ?? 70} step={c?.dpStep ?? 5} value={dpPercent} onChange={(e) => setDpPercent(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
            <div className="flex justify-between text-[10px] text-muted font-semibold mt-1"><span>{c?.dpMinPercent ?? 10}%</span><span>{c?.dpMaxPercent ?? 70}%</span></div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-ink mb-2.5"><Calendar size={13} className="text-primary" /> Tenor (bulan)</label>
            <div className="grid grid-cols-5 gap-1.5">
              {tenors.map((t) => (
                <button key={t} onClick={() => setTenor(t)} className={`py-2 rounded-xl text-[12px] font-bold transition-colors ${tenor === t ? 'bg-primary text-white shadow-glow' : 'bg-surface-soft border border-border text-ink-soft hover:border-primary'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-[12px] font-bold text-ink"><Percent size={13} className="text-primary" /> Bunga / Tahun (flat)</label>
              <span className="text-[13px] font-extrabold text-primary">{rate}%</span>
            </div>
            <input type="range" min={c?.rateMin ?? 2} max={c?.rateMax ?? 9} step={c?.rateStep ?? 0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
            <div className="flex justify-between text-[10px] text-muted font-semibold mt-1"><span>{c?.rateMin ?? 2}%</span><span>{c?.rateMax ?? 9}%</span></div>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
            <p className="relative text-[11px] font-bold uppercase tracking-wide text-white/80">Estimasi Cicilan / Bulan</p>
            <p className="relative text-3xl font-extrabold mt-1.5">{formatCurrency(calc.cicilan)}</p>
            <p className="relative text-white/75 text-[12px] font-medium mt-1">{tenor} bulan · DP {dpPercent}%</p>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Harga Mobil', value: formatCurrency(price) },
              { label: `Uang Muka (${dpPercent}%)`, value: formatCurrency(calc.dp) },
              { label: 'Pokok Kredit', value: formatCurrency(calc.pokok) },
              { label: `Bunga (${rate}%/th)`, value: formatCurrency(calc.totalBunga) },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-[12px]"><span className="font-semibold text-muted">{r.label}</span><span className="font-extrabold text-ink">{r.value}</span></div>
            ))}
          </div>
          <div className="flex items-start gap-2 text-[11px] text-muted font-medium bg-surface-soft border border-border rounded-xl p-3 mt-auto">
            <Info size={13} className="text-primary shrink-0 mt-0.5" />
            {c?.disclaimer ?? 'Estimasi ilustrasi, angka final mengikuti ketentuan leasing.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const KatalogDetailPage = () => {
  const { id } = useParams({ from: '/_public/katalog/$id' as never });
  const navigate = useNavigate();
  const { data: unit, isLoading, isError } = usePublicCatalogUnit(id as string);
  const { data: related } = usePublicRelatedUnits(id as string, 4);
  const { data: config } = usePublicCreditConfig();
  const { data: settings } = usePublicSiteSettings();
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) return <div className="flex items-center justify-center py-40 text-muted"><Loader2 size={30} className="animate-spin" /></div>;

  if (isError || !unit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Car size={48} className="text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold text-ink">Unit tidak ditemukan</h1>
        <p className="text-muted font-medium mt-2">Mobil yang Anda cari mungkin sudah terjual atau dihapus.</p>
        <Link to="/katalog" className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-3 shadow-glow"><ArrowLeft size={16} /> Kembali ke Katalog</Link>
      </div>
    );
  }

  const d = unit as CatalogDetail;
  const gallery = d.images?.length ? d.images.map((i) => cmsImageUrl('unit', i.filename) ?? DEFAULT_CAR_IMAGE) : [DEFAULT_CAR_IMAGE];
  const title = `${d.merek?.name ?? ''} ${d.tipe?.name ?? ''}`.trim();
  const waBase = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : DEFAULT_WA;
  const waText = encodeURIComponent(`Halo, saya tertarik dengan ${title} (${d.tahun}) seharga ${formatCurrency(d.harga)}. Apakah masih tersedia?`);
  const waUrl = `${waBase}?text=${waText}`;
  const installmentFrom = Math.round(d.harga * (config?.installmentFromFactor ?? 0.022));

  const prevImg = () => setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % gallery.length);
  const openDetail = (u: CatalogCard) => { setActiveImg(0); navigate({ to: '/katalog/$id', params: { id: u.id } }); };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <nav className="flex items-center gap-1.5 text-[12px] font-semibold text-muted mb-5 flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
        <ChevronRight size={13} />
        <Link to="/katalog" className="hover:text-primary transition-colors">Katalog</Link>
        <ChevronRight size={13} />
        <span className="text-ink font-bold truncate">{title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* GALLERY */}
        <div className="animate-fade-in">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-surface-soft border border-border group">
            <img src={gallery[activeImg]} alt={title} onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }} className="w-full h-full object-cover transition-opacity duration-200" />
            <div className="absolute top-3 left-3 flex gap-2">
              {d.isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
              <span className="bg-surface/90 backdrop-blur text-ink text-[10px] font-bold px-2.5 py-1 rounded-lg">{d.code}</span>
            </div>
            <div className="absolute top-3 right-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${d.statusKatalog === 'READY' ? 'bg-accent-green text-white' : 'bg-accent-amber text-white'}`}>{d.statusKatalog === 'READY' ? 'Ready Stock' : 'Booked'}</span>
            </div>
            {gallery.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/90 backdrop-blur text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface shadow-md"><ChevronLeft size={18} /></button>
                <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/90 backdrop-blur text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface shadow-md"><ChevronRightIcon size={18} /></button>
              </>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {gallery.map((_, i) => <button key={i} onClick={() => setActiveImg(i)} className={`h-1.5 rounded-full transition-all ${i === activeImg ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />)}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-2.5">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all ${activeImg === i ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                  <img src={img} alt="" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="animate-float-up space-y-5">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-primary mb-1.5"><BadgeCheck size={14} /> Unit Terverifikasi · 150+ Titik Inspeksi</div>
            <h1 className="text-2xl md:text-[28px] font-extrabold text-ink leading-tight">{title}</h1>
            <p className="text-muted font-semibold mt-1">{d.variant ? `${d.variant} · ` : ''}{d.tahun}</p>
          </div>
          <div className="p-4 rounded-2xl bg-primary-light/60 border border-primary/15">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Harga</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{formatCurrency(d.harga)}</p>
            <p className="text-[12px] text-ink-soft font-semibold mt-1">Cicilan mulai {formatCurrency(installmentFrom, { compact: true })}/bln*</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Spec icon={Calendar} label="Tahun" value={`${d.tahun}`} />
            <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(d.kilometer)} KM`} />
            <Spec icon={Fuel} label="BBM" value={d.bahanBakar ?? '-'} />
            <Spec icon={Cog} label="Transmisi" value={d.transmisi} />
          </div>
          <div className="flex flex-col gap-2.5">
            <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3.5 shadow-glow hover:bg-primary-dark transition-colors w-full"><Phone size={17} /> Tanya / Booking Unit Ini</a>
            <a href="#simulasi-kredit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3.5 hover:border-primary hover:text-primary transition-colors w-full"><Calculator size={17} /> Hitung Cicilan</a>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold text-ink-soft pt-1">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent-green" /> Garansi Mesin 1 Bulan</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-accent-green" /> Surat Lengkap</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-accent-green" /> Bisa Test Drive</span>
          </div>
        </div>
      </div>

      {/* Specs + Contact */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 mt-8">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-[15px] font-extrabold text-ink mb-4">Spesifikasi Lengkap</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <Spec icon={Hash} label="Kode Unit" value={d.code} />
            <Spec icon={Palette} label="Warna" value={d.warna || '-'} />
            <Spec icon={Hash} label="Plat" value={d.plat || '-'} />
            <Spec icon={Calendar} label="Tahun" value={`${d.tahun}`} />
            <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(d.kilometer)} KM`} />
            <Spec icon={Cog} label="Transmisi" value={d.transmisi} />
            <Spec icon={Fuel} label="Bahan Bakar" value={d.bahanBakar ?? '-'} />
            <Spec icon={Palette} label="Status" value={d.statusKatalog === 'READY' ? 'Ready Stock' : 'Booked'} />
          </div>
          <h3 className="text-[14px] font-extrabold text-ink mt-5 mb-2">Deskripsi</h3>
          <p className="text-[13px] text-muted font-medium leading-relaxed">{d.description}</p>
          {(d.perlengkapan?.length || d.dokumen?.length) ? (
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              {d.perlengkapan?.length ? (
                <div><h4 className="text-[13px] font-extrabold text-ink mb-2">Kelengkapan</h4>
                  <ul className="space-y-1">{d.perlengkapan.map((p) => <li key={p} className="flex items-center gap-2 text-[12px] text-muted font-medium"><CheckCircle2 size={13} className="text-accent-green" /> {p}</li>)}</ul></div>
              ) : null}
              {d.dokumen?.length ? (
                <div><h4 className="text-[13px] font-extrabold text-ink mb-2">Dokumen</h4>
                  <ul className="space-y-1">{d.dokumen.map((p) => <li key={p} className="flex items-center gap-2 text-[12px] text-muted font-medium"><CheckCircle2 size={13} className="text-accent-green" /> {p}</li>)}</ul></div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white h-fit">
          <h3 className="text-lg font-extrabold">Tertarik dengan unit ini?</h3>
          <p className="text-white/85 text-[13px] font-medium mt-1.5 leading-relaxed">Hubungi sales kami untuk info lebih lanjut, negosiasi harga, atau jadwalkan test drive.</p>
          <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 w-full mt-5 rounded-xl bg-white text-primary font-bold text-[14px] px-5 py-3 hover:bg-white/90 transition-colors"><Phone size={17} /> Chat WhatsApp Sekarang</a>
          {settings?.phone && <p className="text-center text-white/70 text-[12px] font-medium mt-4">atau call {settings.phone}</p>}
        </div>
      </div>

      {/* Simulasi */}
      <div id="simulasi-kredit" className="mt-8 scroll-mt-20"><SimulasiInline price={d.harga} config={config} /></div>

      {/* Related */}
      {related && related.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-xl font-extrabold text-ink">{related.some((r) => r.merek?.id === d.merek?.id) ? `Unit ${d.merek?.name} Lainnya` : 'Unit Serupa'}</h2>
            <Link to="/katalog" className="text-[13px] font-bold text-primary hover:underline inline-flex items-center gap-1">Lihat Semua <ChevronRightIcon size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((u) => <PublicUnitCard key={u.id} card={u} onView={openDetail} />)}
          </div>
        </div>
      )}
    </div>
  );
};
