import { Link } from '@tanstack/react-router';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Reveal } from '@/shared/components/Reveal';
import { Ic } from './Ic';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { usePublicAbout, usePublicSiteSettings } from './landing.hooks';
import { WHATSAPP_URL as DEFAULT_WA } from './publicNav';

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1400&auto=format&fit=crop';

export const TentangPage = () => {
  const { data: about, isLoading } = usePublicAbout();
  const { data: settings } = usePublicSiteSettings();
  const waUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : DEFAULT_WA;
  const resolve = (link?: string) => (link === 'whatsapp' ? waUrl : link || '/katalog');

  if (isLoading) return <div className="flex items-center justify-center py-40 text-muted"><Loader2 size={30} className="animate-spin" /></div>;

  const hero = about?.hero;
  const heroImg = cmsImageUrl('page', hero?.imageFilename) ?? HERO_FALLBACK;
  const vm = about?.visiMisi;

  return (
    <div>
      {/* Hero */}
      {hero?.isVisible !== false && hero && (
        <section className="relative overflow-hidden bg-surface border-b border-border">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center relative">
            <div className="animate-float-up">
              <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hero.eyebrow}</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-ink leading-tight mt-3">{hero.title}</h1>
              <p className="text-muted font-medium mt-4 leading-relaxed max-w-md">{hero.subtitle}</p>
              <Link to={resolve(hero.ctaLink)} className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3 shadow-glow hover:bg-primary-dark transition-colors">{hero.ctaLabel} <ArrowRight size={16} /></Link>
            </div>
            <div className="relative animate-scale-in">
              <img src={heroImg} alt={hero.title} className="rounded-[2.5rem] shadow-card-hover w-full object-cover aspect-[4/3]" />
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      {about?.stats?.isVisible !== false && about?.stats?.items?.length ? (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {about.stats.items.map((s) => (
              <div key={s.label} className="bg-surface rounded-2xl border border-border p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-3"><Ic name={s.icon} size={24} strokeWidth={2.2} /></div>
                <p className="text-2xl md:text-3xl font-extrabold text-ink">{s.value}</p>
                <p className="text-[12px] font-semibold text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </section>
      ) : null}

      {/* Visi & Misi */}
      {vm?.isVisible !== false && vm && (
        <section className="bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid md:grid-cols-2 gap-6">
            <Reveal className="bg-background rounded-2xl border border-border p-7">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4"><Ic name={vm.visiIcon} size={24} /></div>
              <h2 className="text-xl font-extrabold text-ink">{vm.visiTitle}</h2>
              <p className="text-muted font-medium mt-2 leading-relaxed">{vm.visi}</p>
            </Reveal>
            <Reveal delay={100} className="bg-background rounded-2xl border border-border p-7">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4"><Ic name={vm.misiIcon} size={24} /></div>
              <h2 className="text-xl font-extrabold text-ink">{vm.misiTitle}</h2>
              <p className="text-muted font-medium mt-2 leading-relaxed">{vm.misi}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* Values */}
      {about?.values?.isVisible !== false && about?.values?.items?.length ? (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
          <Reveal className="text-center max-w-xl mx-auto mb-10">
            <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{about.values.eyebrow}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{about.values.title}</h2>
          </Reveal>
          <Reveal delay={120} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {about.values.items.map((v) => (
              <div key={v.title} className="bg-surface rounded-2xl border border-border p-7 hover:shadow-card hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4"><Ic name={v.icon} size={24} strokeWidth={2.2} /></div>
                <h3 className="font-extrabold text-ink text-[16px]">{v.title}</h3>
                <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </Reveal>
        </section>
      ) : null}

      {/* CTA */}
      {about?.cta?.isVisible !== false && about?.cta && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark p-8 md:p-14 text-center text-white">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-2xl md:text-3xl font-extrabold leading-tight">{about.cta.title}</h2>
            <p className="relative text-white/85 font-medium mt-3 max-w-lg mx-auto">{about.cta.subtitle}</p>
            <div className="relative flex flex-wrap gap-3 justify-center mt-6">
              <Link to={resolve(about.cta.primaryLink)} className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-bold text-[14px] px-6 py-3 hover:bg-white/90 transition-colors">{about.cta.primaryLabel} <ArrowRight size={16} /></Link>
              <Link to={resolve(about.cta.secondaryLink)} className="inline-flex items-center gap-2 rounded-xl bg-ink/20 backdrop-blur border border-white/30 text-white font-bold text-[14px] px-6 py-3 hover:bg-ink/30 transition-colors">{about.cta.secondaryLabel}</Link>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
};
