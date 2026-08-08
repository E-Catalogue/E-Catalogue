import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Gauge, Palette, ShieldCheck } from 'lucide-react';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { formatCurrency } from '@/core/utils/format';
import type { CatalogCard } from './public.types';

const AUTOPLAY_MS = 5_000;
const DEFAULT_UNIT_IMAGE = 'https://images.unsplash.com/photo-1708148246994-b7b3c818090d?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const STATUS_LABEL: Record<CatalogCard['status'], string> = {
  ready: 'Ready Stock',
  booked: 'Dalam Pemesanan',
  sold: 'Terjual',
};

interface Props {
  units: CatalogCard[];
  fallbackImage?: string | null;
  fallbackAlt: string;
  onView: (unit: CatalogCard) => void;
}

export const HeroUnitCarousel = ({ units, fallbackImage, fallbackAlt, onView }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const normalizedIndex = units.length ? activeIndex % units.length : 0;
  const activeUnit = units.length ? units[normalizedIndex] : null;
  const nextUnit = units.length > 1 ? units[(normalizedIndex + 1) % units.length] : null;
  const activeImage = activeUnit
    ? (activeUnit.image?.filename ? cmsImageUrl('unit', activeUnit.image.filename) : DEFAULT_UNIT_IMAGE)
    : fallbackImage;
  const nextImage = nextUnit
    ? (nextUnit.image?.filename ? cmsImageUrl('unit', nextUnit.image.filename) : DEFAULT_UNIT_IMAGE)
    : null;
  const reducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    if (units.length < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % units.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, paused, reducedMotion, units.length]);

  const move = (nextDirection: number) => {
    if (units.length < 2) return;
    setDirection(nextDirection);
    setActiveIndex((current) => (current + nextDirection + units.length) % units.length);
  };

  return (
    <section
      aria-label="Unit unggulan showroom"
      aria-roledescription="carousel"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className={`relative ${nextUnit ? 'pr-10 sm:pr-16' : ''}`}>
        {nextUnit && nextImage && (
          <button type="button" aria-label={`Tampilkan ${nextUnit.name}`} onClick={() => move(1)} className="group absolute bottom-8 right-0 top-8 z-0 w-24 overflow-hidden rounded-[1.75rem] border border-border bg-ink opacity-40 shadow-card transition-all hover:opacity-65 focus:outline-none focus:ring-2 focus:ring-primary sm:w-36">
            <img src={nextImage} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-ink/35" />
            <span className="absolute bottom-4 left-4 right-2 text-left text-[9px] font-extrabold uppercase tracking-[.12em] text-white">Berikutnya</span>
          </button>
        )}
        <div className="relative z-10 aspect-[5/6] min-h-[28rem] overflow-hidden rounded-[2.5rem] border border-white/50 bg-ink shadow-card-hover sm:aspect-[4/3] sm:min-h-0 lg:aspect-[5/4]">
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={activeUnit?.id ?? activeImage ?? 'fallback'}
            custom={direction}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0.35, x: direction > 0 ? '100%' : '-100%', scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0.15, x: direction > 0 ? '-42%' : '42%', scale: 0.94 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.68, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {activeImage ? (
              <img src={activeImage} alt={activeUnit?.name ?? fallbackAlt} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-ink via-ink-soft to-primary-dark text-white">
                <ShieldCheck size={72} className="opacity-25" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
              {activeUnit ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] backdrop-blur-md">
                      {STATUS_LABEL[activeUnit.status]}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-white/65">{String(normalizedIndex + 1).padStart(2, '0')} / {String(units.length).padStart(2, '0')}</span>
                  </div>
                  <h2 className="mt-4 max-w-md text-2xl font-extrabold leading-tight sm:text-3xl">{activeUnit.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-white/70">
                    <span className="inline-flex items-center gap-1.5"><Gauge size={13} />{activeUnit.tahun} · {activeUnit.transmisi}</span>
                    <span className="inline-flex items-center gap-1.5"><Palette size={13} />{activeUnit.warna}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-4">
                    <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/55">Harga OTR</p><p className="mt-1 text-xl font-extrabold">{formatCurrency(activeUnit.harga)}</p></div>
                    <button type="button" onClick={() => onView(activeUnit)} className="group inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-[12px] font-extrabold text-ink transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/70">
                      Lihat unit <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink/45 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[.15em] backdrop-blur-md">
                  <ShieldCheck size={14} /> Koleksi showroom segera diperbarui
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {units.length > 1 && (
          <div className="absolute left-5 top-5 flex gap-2">
            <button type="button" aria-label="Unit sebelumnya" onClick={() => move(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-ink/35 text-white backdrop-blur-md transition-colors hover:bg-ink/65 focus:outline-none focus:ring-2 focus:ring-white/70"><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Unit berikutnya" onClick={() => move(1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-ink/35 text-white backdrop-blur-md transition-colors hover:bg-ink/65 focus:outline-none focus:ring-2 focus:ring-white/70"><ChevronRight size={18} /></button>
          </div>
        )}
        </div>
      </div>

      {units.length > 1 && (
        <div className="relative mt-5 flex items-center justify-center gap-2" aria-label="Pilih unit unggulan">
          {units.map((unit, index) => (
            <button
              key={unit.id}
              type="button"
              aria-label={`Tampilkan ${unit.name}`}
              aria-current={index === normalizedIndex ? 'true' : undefined}
              onClick={() => { setDirection(index > normalizedIndex ? 1 : -1); setActiveIndex(index); }}
              className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${index === normalizedIndex ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/45'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
