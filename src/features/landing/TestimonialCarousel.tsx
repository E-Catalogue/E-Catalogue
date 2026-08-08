import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PublicTestimonial } from './public.types';
import { TestimonialCard } from './TestimonialCard';

const MAX_TESTIMONIALS = 5;

const testimonialTime = (testimonial: PublicTestimonial) => Date.parse(testimonial.createdAt || testimonial.handoverDate || '') || 0;

export const TestimonialCarousel = ({ testimonials, onView }: { testimonials: PublicTestimonial[]; onView: (id: string) => void }) => {
  const items = useMemo(() => [...testimonials]
    .sort((left, right) => testimonialTime(right) - testimonialTime(left))
    .slice(0, MAX_TESTIMONIALS), [testimonials]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const maxIndex = Math.max(0, items.length - visibleCount);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const width = track.clientWidth;
      const count = width >= 1100 ? 4 : width >= 800 ? 3 : width >= 560 ? 2 : 1;
      setVisibleCount(count);
      setActiveIndex((current) => Math.min(current, Math.max(0, items.length - count)));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [items.length]);

  const scrollTo = (index: number) => {
    const track = trackRef.current;
    const target = track?.children[index] as HTMLElement | undefined;
    if (!track || !target) return;
    const next = Math.max(0, Math.min(index, maxIndex));
    const nextTarget = track.children[next] as HTMLElement | undefined;
    track.scrollTo({ left: (nextTarget?.offsetLeft ?? target.offsetLeft) - track.offsetLeft, behavior: 'smooth' });
    setActiveIndex(next);
  };

  const updateActiveFromScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const children = [...track.children] as HTMLElement[];
    const nearest = children.reduce((best, child, index) => (
      Math.abs((child.offsetLeft - track.offsetLeft) - track.scrollLeft) < Math.abs((children[best].offsetLeft - track.offsetLeft) - track.scrollLeft) ? index : best
    ), 0);
    setActiveIndex(Math.min(nearest, maxIndex));
  };

  if (!items.length) return null;

  return (
    <div className="relative">
      {items.length > visibleCount && (
        <div className="mb-4 flex items-center justify-end gap-2">
          <span className="mr-2 text-[10px] font-bold text-muted">{String(activeIndex + 1).padStart(2, '0')} / {String(maxIndex + 1).padStart(2, '0')}</span>
          <button type="button" aria-label="Testimoni sebelumnya" disabled={activeIndex === 0} onClick={() => scrollTo(activeIndex - 1)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Testimoni berikutnya" disabled={activeIndex >= maxIndex} onClick={() => scrollTo(activeIndex + 1)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight size={17} /></button>
        </div>
      )}
      <div ref={trackRef} onScroll={updateActiveFromScroll} className={`no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 ${items.length <= visibleCount ? 'justify-center' : ''}`}>
        {items.map((testimonial) => (
          <div key={testimonial.id} className="min-w-0 shrink-0 basis-[calc(100%-2.5rem)] snap-start sm:basis-[calc(50%-0.625rem)] lg:basis-[calc(33.333%-0.834rem)] xl:basis-[calc(25%-0.938rem)]">
            <TestimonialCard testimonial={testimonial} onView={() => onView(testimonial.id)} />
          </div>
        ))}
      </div>
    </div>
  );
};
