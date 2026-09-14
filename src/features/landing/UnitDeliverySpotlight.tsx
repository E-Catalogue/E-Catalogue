import { BadgeCheck, CalendarDays, Maximize2, Quote, Star, UserCheck, ShieldCheck } from 'lucide-react';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { formatDate } from '@/core/utils/format';
import type { PublicTestimonial } from './public.types';

interface UnitDeliverySpotlightProps {
  testimonial: PublicTestimonial;
  unitTitle: string;
  onViewModal: () => void;
}

const FALLBACK_IMAGE = '/images/default-showroom-hero.svg';

export const UnitDeliverySpotlight = ({ testimonial, unitTitle, onViewModal }: UnitDeliverySpotlightProps) => {
  const deliveryImageUrl = cmsImageUrl('testimoni', testimonial.imageFilename)
    ?? cmsImageUrl('unit', testimonial.unit?.imageFilename)
    ?? FALLBACK_IMAGE;

  const avatarUrl = cmsImageUrl('testimoni', testimonial.avatarFilename);
  const customerMeta = [testimonial.role, testimonial.city].filter(Boolean).join(' · ');

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-surface p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(19,27,46,0.06)]">
      {/* Decorative gradient blur background */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-amber/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_1fr] items-center">
        {/* SISI KIRI: Foto Bukti Serah Terima */}
        <div className="group relative overflow-hidden rounded-2xl bg-surface-soft border border-border shadow-md">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <img
              src={deliveryImageUrl}
              alt={`Serah terima unit ${unitTitle} kepada ${testimonial.name}`}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-black/20" />

            {/* Badge Floating: Dokumentasi Serah Terima (Warna Terang) */}
            <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-md backdrop-blur-md">
              <BadgeCheck size={14} className="text-primary" />
              <span className="text-ink font-extrabold">Dokumentasi Serah Terima</span>
            </div>

            {/* Tombol Perbesar Foto */}
            <button
              type="button"
              onClick={onViewModal}
              className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
              title="Perbesar foto"
            >
              <Maximize2 size={14} />
            </button>

            {/* Bottom Caption on Image */}
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Unit Kendaraan</p>
              <p className="text-sm font-extrabold truncate text-white mt-0.5">{unitTitle}</p>
            </div>
          </div>
        </div>

        {/* SISI KANAN: Kutipan & Cerita Pengalaman Pelanggan */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header: Rating & Tag */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-amber/10 px-3 py-1 text-accent-amber border border-accent-amber/20">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < testimonial.rating ? 'fill-accent-amber text-accent-amber' : 'text-muted/30'}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold text-ink ml-1">{testimonial.rating}.0 / 5.0</span>
              </div>

              {testimonial.handoverDate && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted bg-surface-soft px-3 py-1 rounded-full border border-border">
                  <CalendarDays size={13} className="text-primary" />
                  {formatDate(testimonial.handoverDate)}
                </span>
              )}
            </div>

            {/* Judul Testimoni (Rapi, tanpa tumpang tindih) */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Quote size={16} className="fill-primary/20 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-ink leading-snug tracking-tight">
                {testimonial.title || 'Pengalaman Membeli Mobil yang Luar Biasa'}
              </h3>
            </div>

            {/* Teks Cerita Pengalaman */}
            <p className="text-[14px] md:text-[15px] font-medium leading-relaxed text-ink-soft italic">
              “{testimonial.text}”
            </p>
          </div>

          {/* Profil Pembeli & Sales PIC */}
          <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-light text-sm font-extrabold uppercase text-primary ring-2 ring-primary/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={testimonial.name} className="h-full w-full object-cover" />
                ) : (
                  testimonial.name[0]
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[14px] font-extrabold text-ink">{testimonial.name}</p>
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-accent-green/10 px-1.5 py-0.5 text-[9px] font-extrabold text-accent-green">
                    <ShieldCheck size={11} /> Pembeli Terverifikasi
                  </span>
                </div>
                {customerMeta && <p className="text-[11px] font-semibold text-muted mt-0.5">{customerMeta}</p>}
              </div>
            </div>

            {testimonial.sales && (
              <div className="text-left sm:text-right bg-surface-soft sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Sales Consultant</p>
                <p className="text-[12px] font-extrabold text-ink flex sm:justify-end items-center gap-1 mt-0.5">
                  <UserCheck size={13} className="text-primary" />
                  {testimonial.sales.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
