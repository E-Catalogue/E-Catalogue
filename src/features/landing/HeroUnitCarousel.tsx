import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Gauge, Palette, ShieldCheck } from 'lucide-react';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { formatCurrency, formatTransmisi } from '@/core/utils/format';
import type { CatalogCard } from './public.types';

const AUTOPLAY_MS = 5_000;
const MAX_SLIDER_UNITS = 5;
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

const unitImage = (unit: CatalogCard) => unit.image?.filename
  ? cmsImageUrl('unit', unit.image.filename) ?? DEFAULT_UNIT_IMAGE
  : DEFAULT_UNIT_IMAGE;

const heroPriority = (unit: CatalogCard) => {
  if (unit.statusUnit === 'READY_STOCK' || unit.status === 'ready') return 0;
  if (unit.statusUnit === 'HOLD' || unit.status === 'booked') return 1;
  return 2;
};

const rankHeroUnits = (units: CatalogCard[]) => [...units]
  .sort((left, right) => {
    const statusDifference = heroPriority(left) - heroPriority(right);
    if (statusDifference !== 0) return statusDifference;
    return (Date.parse(right.createdAt) || 0) - (Date.parse(left.createdAt) || 0);
  })
  .slice(0, MAX_SLIDER_UNITS);

const UnitSlide = ({ unit, index, total, active, clone, width, overlap, first, onView }: {
  unit: CatalogCard;
  index: number;
  total: number;
  active: boolean;
  clone: boolean;
  width: number;
  overlap: number;
  first: boolean;
  onView: (unit: CatalogCard) => void;
}) => (
  <motion.article
    aria-hidden={!active || clone}
    data-carousel-unit={unit.id}
    data-active={active && !clone ? 'true' : 'false'}
    animate={{ opacity: active ? 1 : 0.42, scale: active ? 1 : 0.9, y: active ? 0 : 18 }}
    transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
    className={`relative h-full shrink-0 origin-left overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border border-white/50 bg-ink shadow-card-hover ${active ? 'z-10 saturate-100' : 'z-0 saturate-75'}`}
    style={{ width, marginLeft: first ? 0 : -overlap }}
  >
    <img src={unitImage(unit)} alt={clone ? '' : unit.name} className="h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-4 text-white min-[420px]:p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.13em] backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[10px]">{STATUS_LABEL[unit.status]}</span>
        <span className="font-mono text-[11px] font-bold text-white/65">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </div>
      <h2 className="mt-2.5 max-w-md text-xl font-extrabold leading-tight min-[420px]:text-2xl sm:mt-4 sm:text-3xl">{unit.name}</h2>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-white/70">
        <span className="inline-flex items-center gap-1.5"><Gauge size={13} />{unit.tahun} · {formatTransmisi(unit.transmisi || unit.transmission)}</span>
        <span className="inline-flex items-center gap-1.5"><Palette size={13} />{unit.warna}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/15 pt-3 sm:mt-5 sm:gap-4 sm:pt-4">
        <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-white/55 sm:text-[10px]">Harga</p><p className="mt-1 truncate text-base font-extrabold min-[420px]:text-lg sm:text-xl">{formatCurrency(unit.harga)}</p></div>
        <button type="button" tabIndex={active && !clone ? 0 : -1} onClick={() => onView(unit)} className="group inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-white px-2.5 text-[10px] font-extrabold text-ink transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/70 min-[420px]:h-10 min-[420px]:px-3 min-[420px]:text-[11px] sm:h-11 sm:gap-2 sm:px-4 sm:text-[12px]">
          Lihat unit <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  </motion.article>
);

export const HeroUnitCarousel = ({ units, fallbackImage, fallbackAlt, onView }: Props) => {
  const sliderUnits = useMemo(() => rankHeroUnits(units), [units]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [trackStep, setTrackStep] = useState(0);
  const [overlap, setOverlap] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const hasLoop = sliderUnits.length > 1;
  const normalizedIndex = sliderUnits.length ? activeIndex % sliderUnits.length : 0;
  const trackUnits = useMemo(() => hasLoop
    ? [sliderUnits.at(-1) as CatalogCard, ...sliderUnits, sliderUnits[0]]
    : sliderUnits, [hasLoop, sliderUnits]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => {
      const viewportWidth = viewport.clientWidth || 640;
      const isPhone = viewportWidth < 640;
      const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
      const peek = isPhone ? 56 : isTablet ? 92 : 72;
      const nextOverlap = isPhone ? 24 : isTablet ? 40 : 48;
      const minimumWidth = Math.min(240, viewportWidth - 24);
      const nextWidth = Math.max(minimumWidth, viewportWidth - peek);
      const step = nextWidth - nextOverlap;
      setCardWidth(nextWidth);
      setTrackStep(step);
      setOverlap(nextOverlap);
      const safeIndex = sliderUnits.length ? activeIndexRef.current % sliderUnits.length : 0;
      activeIndexRef.current = safeIndex;
      x.set(-(hasLoop ? safeIndex + 1 : 0) * step);
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [hasLoop, sliderUnits.length, x]);

  const move = useCallback((direction: 1 | -1) => {
    const total = sliderUnits.length;
    const step = trackStep;
    if (total < 2 || animating || step <= 0) return;

    const current = activeIndexRef.current % total;
    const next = (current + direction + total) % total;
    const targetTrackIndex = direction === 1 ? current + 2 : current;
    const jumpTrackIndex = direction === 1 && next === 0 ? 1 : direction === -1 && next === total - 1 ? total : null;
    activeIndexRef.current = next;
    setActiveIndex(next);

    if (reducedMotion) {
      x.set(-(jumpTrackIndex ?? targetTrackIndex) * step);
      return;
    }

    setAnimating(true);
    animate(x, -targetTrackIndex * step, {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        if (jumpTrackIndex !== null) x.set(-jumpTrackIndex * step);
        setAnimating(false);
      },
    });
  }, [animating, reducedMotion, sliderUnits.length, trackStep, x]);

  const goTo = (index: number) => {
    if (index === normalizedIndex || animating || trackStep <= 0) return;
    const step = trackStep;
    activeIndexRef.current = index;
    setActiveIndex(index);
    if (reducedMotion) x.set(-(index + 1) * step);
    else {
      setAnimating(true);
      animate(x, -(index + 1) * step, { duration: 0.72, ease: [0.22, 1, 0.36, 1], onComplete: () => setAnimating(false) });
    }
  };

  useEffect(() => {
    if (!hasLoop || paused || reducedMotion || animating) return;
    const timer = window.setInterval(() => move(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, animating, hasLoop, move, paused, reducedMotion]);

  if (!sliderUnits.length) {
    return <section aria-label="Unit unggulan showroom" className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/50 bg-ink shadow-card-hover sm:aspect-[4/3] sm:rounded-[2.5rem] lg:aspect-[5/4]">
      {fallbackImage ? <img src={fallbackImage} alt={fallbackAlt} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-ink via-ink-soft to-primary-dark text-white"><ShieldCheck size={72} className="opacity-25" /></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6"><div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink/45 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[.15em] backdrop-blur-md"><ShieldCheck size={14} /> Koleksi showroom segera diperbarui</div></div>
    </section>;
  }

  return (
    <section
      aria-label="Unit unggulan showroom"
      aria-roledescription="carousel"
      className="relative w-full min-w-0 max-w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}
    >
      <div ref={viewportRef} className="relative w-full min-w-0 max-w-full aspect-[4/5] min-h-0 overflow-hidden sm:aspect-[4/3] lg:aspect-[5/4]">
        {cardWidth > 0 && <motion.div className="absolute inset-y-0 left-0 flex h-full will-change-transform" style={{ x }}>
          {trackUnits.map((unit, trackIndex) => {
            const clone = hasLoop && (trackIndex === 0 || trackIndex === trackUnits.length - 1);
            const logicalIndex = !hasLoop ? 0 : trackIndex === 0 ? sliderUnits.length - 1 : trackIndex === trackUnits.length - 1 ? 0 : trackIndex - 1;
            return <UnitSlide key={`${trackIndex}-${unit.id}`} unit={unit} index={logicalIndex} total={sliderUnits.length} active={logicalIndex === normalizedIndex} clone={clone} width={cardWidth} overlap={overlap} first={trackIndex === 0} onView={onView} />;
          })}
        </motion.div>}

        {hasLoop && <div className="absolute left-3 top-3 z-20 flex gap-1.5 sm:left-5 sm:top-5 sm:gap-2">
          <button type="button" aria-label="Unit sebelumnya" disabled={animating} onClick={() => move(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-ink/45 text-white backdrop-blur-md transition-colors hover:bg-ink/75 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/70 sm:h-10 sm:w-10"><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Unit berikutnya" disabled={animating} onClick={() => move(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-ink/45 text-white backdrop-blur-md transition-colors hover:bg-ink/75 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/70 sm:h-10 sm:w-10"><ChevronRight size={17} /></button>
        </div>}
      </div>

      {hasLoop && <div className="relative mt-5 flex items-center justify-center gap-2" aria-label="Pilih unit unggulan">
        {sliderUnits.map((unit, index) => <button key={unit.id} type="button" aria-label={`Tampilkan ${unit.name}`} aria-current={index === normalizedIndex ? 'true' : undefined} onClick={() => goTo(index)} className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${index === normalizedIndex ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/45'}`} />)}
      </div>}
    </section>
  );
};
