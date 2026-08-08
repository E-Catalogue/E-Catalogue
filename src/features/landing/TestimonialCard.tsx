import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, CalendarDays, Car, Quote, Star } from 'lucide-react';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { formatDate } from '@/core/utils/format';
import type { PublicTestimonial } from './public.types';

const FALLBACK_IMAGE = '/images/default-showroom-hero.svg';

export const TestimonialCard = ({ testimonial, onView }: { testimonial: PublicTestimonial; onView: () => void }) => {
  const imageUrl = cmsImageUrl('testimoni', testimonial.imageFilename)
    ?? cmsImageUrl('unit', testimonial.unit?.imageFilename)
    ?? FALLBACK_IMAGE;
  const avatarUrl = cmsImageUrl('testimoni', testimonial.avatarFilename);
  const unitLabel = testimonial.unit
    ? [testimonial.unit.name, testimonial.unit.tahun].filter(Boolean).join(' · ')
    : 'Pelanggan showroom';
  const customerMeta = [testimonial.role, testimonial.city].filter(Boolean).join(' · ');

  return (
    <motion.button
      type="button"
      onClick={onView}
      whileHover={{ y: -7 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface p-1.5 text-left shadow-[0_12px_34px_rgba(19,27,46,0.08)] transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-[0_20px_50px_rgba(19,27,46,0.14)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.15rem] bg-surface-soft">
        <img
          src={imageUrl}
          alt={`Serah terima unit kepada ${testimonial.name}`}
          loading="lazy"
          onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/20" />

        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/25 bg-ink/45 px-2.5 py-1.5 text-[8px] font-extrabold uppercase tracking-[.11em] text-white backdrop-blur-md">
          <BadgeCheck size={13} className="text-primary-light" /> Cerita pelanggan
        </span>
        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[9px] font-extrabold text-ink shadow-sm">
          <Star size={13} className="fill-accent-amber text-accent-amber" /> {testimonial.rating}.0
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <p className="text-[9px] font-bold uppercase tracking-[.14em] text-white/60">Unit yang dibeli</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-[13px] font-extrabold"><Car size={14} className="shrink-0 text-primary-light" />{unitLabel}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] font-extrabold uppercase tracking-[.13em] text-primary">Pengalaman pelanggan</p>
            <h3 className="mt-1 line-clamp-2 text-[14px] font-extrabold leading-snug text-ink">
              {testimonial.title || 'Pengalaman membeli mobil bersama kami'}
            </h3>
          </div>
          <Quote size={22} className="shrink-0 text-primary/18" />
        </div>

        <p className="mt-2.5 line-clamp-2 text-[11px] font-medium leading-5 text-ink-soft">“{testimonial.text}”</p>

        <div className="mt-4 flex items-center gap-2.5 border-t border-divider pt-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-light text-xs font-extrabold uppercase text-primary ring-2 ring-primary-light/55">
            {avatarUrl ? <img src={avatarUrl} alt={testimonial.name} className="h-full w-full object-cover" /> : testimonial.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-extrabold text-ink">{testimonial.name}</p>
            {customerMeta && <p className="mt-0.5 truncate text-[9px] font-semibold text-muted">{customerMeta}</p>}
          </div>
          {testimonial.handoverDate && (
            <span className="hidden shrink-0 items-center gap-1 text-[9px] font-bold text-muted sm:inline-flex">
              <CalendarDays size={12} className="text-primary" /> {formatDate(testimonial.handoverDate)}
            </span>
          )}
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-primary">
          Lihat cerita serah-terima <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.button>
  );
};
