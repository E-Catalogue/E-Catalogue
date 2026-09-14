import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import {
  ChevronRight, Calendar, Gauge, Fuel, Cog, Palette, Hash, ShieldCheck,
  Phone, ArrowLeft, BadgeCheck, MapPin, ChevronLeft, ChevronRight as ChevronRightIcon,
  Car, Loader2, CheckCircle2, Building2, Share2, Maximize2,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { PublicUnitCard } from './PublicUnitCard';
import { SalesPickerModal } from './SalesPickerModal';
import { UnitDeliverySpotlight } from './UnitDeliverySpotlight';
import { TestimonialDetailModal } from './TestimonialDetailModal';
import { formatCurrency, formatNumber, formatTransmisi } from '@/core/utils/format';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { waMessages } from '@/core/utils/whatsapp';
import { usePublicCatalogUnit, usePublicRelatedUnits, usePublicSiteSettings } from './landing.hooks';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { CatalogCard, CatalogDetail } from './public.types';
import { Reveal } from '@/shared/components/Reveal';
import { trackEvent } from '@/core/utils/tracker';
import { useSeo, buildCarSchema } from '@/core/utils/seo';

const Spec = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-soft border border-border">
    <div className="w-9 h-9 rounded-lg bg-surface text-primary flex items-center justify-center shrink-0 border border-border"><Icon size={16} strokeWidth={2.2} /></div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[13px] font-extrabold text-ink truncate" title={value}>{value}</p>
    </div>
  </div>
);

export const CatalogBenefits = () => (
  <div data-testid="catalog-benefits" className="-mx-1 flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto px-1 pb-1 pt-1 text-[12px] font-semibold text-ink-soft md:mx-0 md:flex-wrap md:gap-x-5 md:gap-y-2 md:overflow-visible md:px-0 md:pb-0">
    <span className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-border bg-surface-soft px-3 py-2 md:rounded-none md:border-0 md:bg-transparent md:p-0"><ShieldCheck size={14} className="text-accent-green" /> Garansi Mesin 1 Bulan</span>
    <span className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-border bg-surface-soft px-3 py-2 md:rounded-none md:border-0 md:bg-transparent md:p-0"><BadgeCheck size={14} className="text-accent-green" /> Surat Lengkap</span>
    <span className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-border bg-surface-soft px-3 py-2 md:rounded-none md:border-0 md:bg-transparent md:p-0"><MapPin size={14} className="text-accent-green" /> Bisa Test Drive</span>
  </div>
);

export const KatalogDetailPage = () => {
  const { id } = useParams({ from: '/_public/katalog/$id' as never });
  const navigate = useNavigate();
  const { data: unit, isLoading, isError } = usePublicCatalogUnit(id as string);
  const { data: related } = usePublicRelatedUnits(id as string, 4);
  const { data: settings } = usePublicSiteSettings();
  const [activeImg, setActiveImg] = useState(0);
  const [salesOpen, setSalesOpen] = useState(false);
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (unit?.id) {
      trackEvent({
        eventType: 'UNIT_VIEW',
        unitId: unit.id,
        pagePath: typeof window !== 'undefined' ? window.location.pathname : `/katalog/${unit.id}`,
        pageTitle: (unit as CatalogDetail).name || 'Detail Unit',
        meta: {
          merek: (unit as CatalogDetail).merek?.name,
          tipe: (unit as CatalogDetail).tipe?.name,
          tahun: (unit as CatalogDetail).tahun,
          harga: (unit as CatalogDetail).harga,
        },
      });
    }
  }, [unit]);

  const detailUnit = unit as CatalogDetail | undefined;
  const seoMerekTipe = `${detailUnit?.merek?.name ?? ''} ${detailUnit?.tipe?.name ?? ''}`.trim();
  const carTitle = detailUnit?.name?.trim() || seoMerekTipe || 'Mobil Bekas';
  const firstImg = (detailUnit?.images?.[0]?.filename
    ? cmsImageUrl('unit', detailUnit.images[0].filename)
    : undefined) ?? undefined;
  const carSchema = useMemo(
    () => (detailUnit ? buildCarSchema(detailUnit, firstImg) : undefined),
    [detailUnit, firstImg],
  );

  useSeo(
    {
      title: detailUnit
        ? `Jual ${carTitle} ${detailUnit.tahun || ''} Bekas Subang — ${formatCurrency(detailUnit.harga)} | ${settings?.companyName || 'GM Mobilindo'}`
        : 'Detail Mobil Bekas Subang | GM Mobilindo',
      description: detailUnit
        ? `Jual ${carTitle} tahun ${detailUnit.tahun || ''} bekas di Subang. Transmisi ${formatTransmisi(detailUnit.transmisi)}, ${detailUnit.kilometer ? `${formatNumber(detailUnit.kilometer)} km` : 'kondisi istimewa'}, garansi mesin 1 bulan, surat lengkap. Melayani kredit DP minim & cash.`
        : 'Detail mobil bekas berkualitas bergaransi di Subang — GM Mobilindo.',
      ogImage: firstImg,
      ogType: 'product',
      keywords: detailUnit
        ? [
            `${carTitle.toLowerCase()} bekas subang`,
            `${detailUnit.merek?.name?.toLowerCase() ?? ''} bekas subang`,
            'kredit mobil bekas subang',
            'jual mobil bekas subang',
            'showroom mobil subang',
          ]
        : ['mobil bekas subang'],
      jsonLd: carSchema,
    },
    [detailUnit, carTitle, firstImg, settings?.companyName, carSchema],
  );

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
  const merekTipe = `${d.merek?.name ?? ''} ${d.tipe?.name ?? ''}`.trim();
  // Judul/breadcrumb/heading/alt/pesan WA memakai nama Unit (PRD §8.6).
  const title = d.name?.trim() || merekTipe || 'Unit';
  const merekTipeSubtitle = title !== merekTipe ? merekTipe : '';
  const waText = waMessages.unitInquiry({ title, tahun: d.tahun, harga: d.harga, unitId: d.id });

  const prevImg = () => setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % gallery.length);
  const openDetail = (u: CatalogCard) => { setActiveImg(0); navigate({ to: '/katalog/$id', params: { id: u.id } }); };

  const handleOpenSales = () => {
    if (unit?.id) {
      trackEvent({
        eventType: 'WHATSAPP_CLICK',
        unitId: unit.id,
        meta: { unitName: (unit as CatalogDetail).name || 'Unit', location: 'unit_detail' },
      });
    }
    setSalesOpen(true);
  };

  const handleCopyDetailUrl = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    } else {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    if (unit?.id) {
      trackEvent({
        eventType: 'SHARE_CLICK',
        unitId: unit.id,
        meta: { unitName: title },
      });
    }
    store.dispatch(
      showToast({
        title: 'Berhasil',
        message: 'URL unit berhasil disalin ke clipboard',
        variant: 'success',
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <nav className="flex items-center gap-1.5 text-[12px] font-semibold text-muted flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
          <ChevronRight size={13} />
          <Link to="/katalog" className="hover:text-primary transition-colors">Katalog</Link>
          <ChevronRight size={13} />
          <span className="text-ink font-bold truncate">{title}</span>
        </nav>
        <button
          type="button"
          onClick={handleCopyDetailUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-[12px] font-bold text-ink hover:text-primary hover:border-primary/50 shadow-sm transition-all"
        >
          <Share2 size={14} /> Bagikan URL
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* GALLERY */}
        <Reveal>
          <div className="relative rounded-2xl overflow-hidden bg-surface-soft border border-border group shadow-sm flex items-center justify-center min-h-[260px]">
            <img
              key={activeImg}
              src={gallery[activeImg]}
              alt={`${title} - Foto ${activeImg + 1}`}
              loading="eager"
              className="w-full h-auto block object-contain max-h-[75vh] mx-auto transition-opacity duration-300 cursor-zoom-in"
              onClick={() => setIsImageModalOpen(true)}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_CAR_IMAGE;
              }}
            />

            {/* Badges Floating di atas Foto */}
            <div className="pointer-events-none absolute top-3 left-3 flex gap-2 z-10">
              {d.isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
              <span className="bg-surface/90 backdrop-blur text-ink text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-border/40">{d.code}</span>
            </div>
            <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-2 z-10">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm ${
                d.statusKatalog === 'SOLD' || d.statusUnit === 'SOLD' || d.isSold
                  ? 'bg-semantic-error text-white'
                  : d.statusUnit === 'INVENTORY'
                  ? 'bg-accent-blue text-white'
                  : d.statusUnit === 'HOLD' || d.statusKatalog === 'BOOKED'
                  ? 'bg-accent-amber text-white'
                  : 'bg-accent-green text-white'
              }`}>
                {d.statusKatalog === 'SOLD' || d.statusUnit === 'SOLD' || d.isSold
                  ? 'Terjual'
                  : d.statusUnit === 'INVENTORY'
                  ? 'Inventory'
                  : d.statusUnit === 'HOLD'
                  ? 'Hold'
                  : d.statusKatalog === 'BOOKED'
                  ? 'Booked'
                  : 'Ready Stock'}
              </span>
            </div>

            {/* Tombol Perbesar Foto (Maximize) */}
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="absolute right-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/85 text-ink shadow-md backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-surface active:scale-95"
              title="Perbesar foto"
              aria-label="Perbesar foto ukuran penuh"
            >
              <Maximize2 size={15} />
            </button>

            {/* Navigation Arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 backdrop-blur text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-surface hover:scale-105 shadow-md active:scale-95"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 backdrop-blur text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-surface hover:scale-105 shadow-md active:scale-95"
                  aria-label="Foto berikutnya"
                >
                  <ChevronRightIcon size={18} />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-sm">
                {gallery.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-1.5 rounded-full transition-all ${i === activeImg ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'}`}
                    aria-label={`Pilih foto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* List thumbnail normal di bawah highlight */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2.5 mt-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`group/thumb relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all ${
                    activeImg === i
                      ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                      : 'border-border hover:border-primary/50 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Lihat foto ${i + 1}`}
                >
                  <img
                    src={img}
                    alt={`${title} foto ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_CAR_IMAGE;
                    }}
                  />
                  {activeImg === i && (
                    <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          )}
        </Reveal>

        {/* INFO */}
        <Reveal delay={100} className="space-y-5">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-primary mb-1.5"><BadgeCheck size={14} /> Unit Terverifikasi · 150+ Titik Inspeksi</div>
            <h1 className="text-2xl md:text-[28px] font-extrabold text-ink leading-tight">{title}</h1>
            <p className="text-muted font-semibold mt-1">{merekTipeSubtitle ? `${merekTipeSubtitle} · ` : ''}{d.variant ? `${d.variant} · ` : ''}{d.tahun}</p>
          </div>
          <div className="p-4 rounded-2xl bg-primary-light/60 border border-primary/15">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Harga</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{formatCurrency(d.harga)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Spec icon={Calendar} label="Tahun" value={`${d.tahun}`} />
            <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(d.kilometer)} KM`} />
            <Spec icon={Cog} label="Transmisi" value={formatTransmisi(d.transmisi)} />
            <Spec icon={Fuel} label="BBM" value={d.bahanBakar ?? '-'} />
            <Spec icon={Building2} label="Cabang" value={d.branch?.name ?? 'Cabang Utama'} />
            <Spec icon={Palette} label="Warna" value={d.warna || '-'} />
          </div>
          <div className="flex flex-col gap-2.5">
            {d.statusKatalog === 'SOLD' || d.statusUnit === 'SOLD' || d.isSold ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-semantic-error/10 border border-semantic-error/20 text-semantic-error font-bold text-[14px] px-5 py-3.5 w-full">
                <CheckCircle2 size={17} className="text-semantic-error" /> Unit Ini Sudah Terjual (Sold)
              </div>
            ) : (
              <button onClick={handleOpenSales} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3.5 shadow-glow hover:bg-primary-dark transition-colors w-full">
                <Phone size={17} /> Tanya / Booking Unit Ini
              </button>
            )}
          </div>
          <CatalogBenefits />
        </Reveal>
      </div>

      {/* Specs + Contact */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 mt-8">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-[15px] font-extrabold text-ink mb-4">Spesifikasi Lengkap</h2>
          <div className="grid grid-cols-2 gap-3">
            <Spec icon={Hash} label="Kode Unit" value={d.code} />
            <Spec icon={Palette} label="Warna" value={d.warna || '-'} />
            <Spec icon={Hash} label="Plat" value={d.plat || '-'} />
            <Spec icon={Calendar} label="Tahun" value={`${d.tahun}`} />
            <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(d.kilometer)} KM`} />
            <Spec icon={Cog} label="Transmisi" value={formatTransmisi(d.transmisi)} />
            <Spec icon={Fuel} label="Bahan Bakar" value={d.bahanBakar ?? '-'} />
            <Spec icon={Building2} label="Cabang" value={d.branch?.name || 'Cabang Utama'} />
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

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white h-fit shadow-card">
          <h3 className="text-lg font-extrabold">Tertarik dengan unit ini?</h3>
          <p className="text-white/85 text-[13px] font-medium mt-1.5 leading-relaxed">Hubungi sales kami untuk info lebih lanjut, negosiasi harga, atau jadwalkan test drive.</p>
          <button onClick={handleOpenSales} className="inline-flex items-center justify-center gap-2 w-full mt-5 rounded-xl bg-white text-primary font-bold text-[14px] px-5 py-3 hover:bg-white/90 shadow-md transition-colors"><Phone size={17} /> Chat Sales Sekarang</button>
          {d.branch && (
            <div className="mt-5 pt-4 border-t border-white/20 text-[12px] space-y-1.5">
              <p className="font-extrabold text-[13px] text-white flex items-center gap-1.5"><Building2 size={14} /> {d.branch.name}</p>
              {d.branch.contact && <p className="text-white/80 flex items-center gap-1.5"><Phone size={14} /> {d.branch.contact}</p>}
            </div>
          )}
          {settings?.phone && <p className="text-center text-white/70 text-[12px] font-medium mt-4">atau call {settings.phone}</p>}
        </div>
      </div>


      {/* Testimoni Unit Terjual */}
      {d.testimonials && d.testimonials.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary flex items-center gap-1.5">
                <BadgeCheck size={14} /> Serah Terima & Bukti Transaksi
              </p>
              <h2 className="text-xl md:text-2xl font-extrabold text-ink mt-1">
                Cerita Pelanggan untuk Unit Ini
              </h2>
            </div>
            <Link to="/testimoni" className="text-[13px] font-bold text-primary hover:underline inline-flex items-center gap-1">
              Lihat Semua Testimoni <ChevronRightIcon size={14} />
            </Link>
          </div>

          <div className="space-y-6">
            {d.testimonials.map((t) => (
              <UnitDeliverySpotlight
                key={t.id}
                testimonial={t}
                unitTitle={title}
                onViewModal={() => setSelectedTestimonialId(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related && related.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-xl font-extrabold text-ink">{related.some((r: CatalogCard) => r.merek?.id === d.merek?.id) ? `Unit ${d.merek?.name} Lainnya` : 'Unit Serupa'}</h2>
            <Link to="/katalog" className="text-[13px] font-bold text-primary hover:underline inline-flex items-center gap-1">Lihat Semua <ChevronRightIcon size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((u: CatalogCard) => <PublicUnitCard key={u.id} card={u} onView={openDetail} />)}
          </div>
        </div>
      )}

      <SalesPickerModal open={salesOpen} onClose={() => setSalesOpen(false)} waText={waText} fallbackNumber={settings?.whatsappNumber} />
      <TestimonialDetailModal id={selectedTestimonialId} onClose={() => setSelectedTestimonialId(null)} />

      {/* Modal Zoom Foto Unit Ukuran Penuh */}
      <Modal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title={title}
        subtitle={`Foto ${activeImg + 1} dari ${gallery.length}`}
        icon={<Car size={18} />}
        size="xl"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center">
            <img
              src={gallery[activeImg]}
              alt={`${title} ukuran penuh`}
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_CAR_IMAGE;
              }}
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex items-center justify-between w-full text-xs font-semibold text-muted">
              <span>Foto {activeImg + 1} dari {gallery.length}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevImg}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-surface-soft font-bold inline-flex items-center gap-1 shadow-sm transition-colors"
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-surface-soft font-bold inline-flex items-center gap-1 shadow-sm transition-colors"
                >
                  Selanjutnya <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
