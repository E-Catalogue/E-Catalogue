import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Search, HandCoins, Star, Quote, Loader2 } from 'lucide-react';
import { PublicUnitCard } from './PublicUnitCard';
import { Reveal } from '@/shared/components/Reveal';
import { Ic } from './Ic';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { WHATSAPP_URL as DEFAULT_WA } from './publicNav';
import { usePublicHomepage, usePublicSiteSettings } from './landing.hooks';
import type { CatalogCard } from './public.types';

const HERO_FALLBACK_IMG = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1400&auto=format&fit=crop';

export const LandingPage = () => {
  const { data: hp, isLoading } = usePublicHomepage();
  const { data: site } = usePublicSiteSettings();
  const navigate = useNavigate();
  const openDetail = (u: CatalogCard) => navigate({ to: '/katalog/$id', params: { id: u.id } });
  const waUrl = site?.whatsappNumber ? `https://wa.me/${site.whatsappNumber}` : DEFAULT_WA;
  const resolveLink = (link?: string) => (link === 'whatsapp' ? waUrl : link || '/katalog');

  if (isLoading) {
    return <div className="flex items-center justify-center py-40 text-muted"><Loader2 size={30} className="animate-spin" /></div>;
  }

  const hero = hp?.hero;
  const heroImg = cmsImageUrl('page', hero?.imageFilename) ?? HERO_FALLBACK_IMG;
  const fc = hero?.floatingCard;

  return (
    <>
      {/* HERO */}
      {hero?.isVisible !== false && hero && (
        <section className="relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center relative">
            <div className="animate-float-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-light text-primary text-[12px] font-bold px-3 py-1.5">
                <Ic name={fc?.icon ?? 'badge-check'} size={14} /> {hero.badgeText}
              </span>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-ink leading-[1.1] mt-4">
                {hero.titleHtml.split(/(<em>.*?<\/em>)/g).filter(Boolean).map((part, i) => {
                  const m = part.match(/^<em>(.*?)<\/em>$/);
                  return m ? <span key={i} className="text-primary">{m[1]}</span> : <span key={i}>{part}</span>;
                })}
              </h1>
              <p className="text-muted font-medium mt-4 text-[15px] leading-relaxed max-w-md">{hero.subtitle}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to={resolveLink(hero.primaryCtaLink)} className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3 shadow-glow hover:bg-primary-dark transition-colors">
                  <Search size={17} /> {hero.primaryCtaLabel}
                </Link>
                <Link to={resolveLink(hero.secondaryCtaLink)} className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3 hover:border-primary hover:text-primary transition-colors">
                  <HandCoins size={17} /> {hero.secondaryCtaLabel}
                </Link>
              </div>
              <div className="flex gap-8 mt-9">
                {hero.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl md:text-3xl font-extrabold text-ink">{s.value}</p>
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] blur-2xl" />
              <img src={heroImg} alt={hero.badgeText} className="relative rounded-[2.5rem] shadow-card-hover w-full object-cover aspect-[4/3]" />
              {fc && (
                <div className="absolute -bottom-5 left-2 sm:left-6 bg-surface rounded-2xl shadow-card-hover border border-border p-4 flex items-center gap-3 animate-float-up">
                  <div className="w-11 h-11 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center"><Ic name={fc.icon} size={22} /></div>
                  <div>
                    <p className="text-[13px] font-extrabold text-ink leading-none">{fc.title}</p>
                    <p className="text-[11px] text-muted font-semibold mt-1">{fc.subtitle}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Brand chips */}
          {hp?.brands?.isVisible !== false && hp?.brands?.items?.length ? (
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[12px] font-bold text-muted mr-1">{hp.brands.label}</span>
                {hp.brands.items.map((b) => (
                  <Link key={b.id} to="/katalog" className="px-3.5 py-1.5 rounded-full bg-surface border border-border text-[12px] font-bold text-ink-soft hover:border-primary hover:text-primary transition-colors">
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* WHY US */}
      {hp?.whyUs?.isVisible !== false && hp?.whyUs && (
        <section className="bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
            <Reveal className="text-center max-w-xl mx-auto mb-10">
              <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp.whyUs.eyebrow}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{hp.whyUs.title}</h2>
              <p className="text-muted font-medium mt-2">{hp.whyUs.subtitle}</p>
            </Reveal>
            <Reveal delay={120} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hp.whyUs.items.map((f) => (
                <div key={f.title} className="bg-background rounded-2xl border border-border p-6 hover:shadow-card hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4"><Ic name={f.icon} size={24} strokeWidth={2.2} /></div>
                  <h3 className="font-extrabold text-ink text-[15px]">{f.title}</h3>
                  <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      {hp?.howItWorks?.isVisible !== false && hp?.howItWorks && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
          <Reveal className="text-center max-w-xl mx-auto mb-10">
            <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp.howItWorks.eyebrow}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{hp.howItWorks.title}</h2>
            <p className="text-muted font-medium mt-2">{hp.howItWorks.subtitle}</p>
          </Reveal>
          <Reveal delay={120} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {hp.howItWorks.steps.map((s, i) => (
              <div key={s.title} className="relative bg-surface rounded-2xl border border-border p-6">
                <span className="absolute top-5 right-5 text-4xl font-extrabold text-primary/10">0{i + 1}</span>
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4"><Ic name={s.icon} size={24} strokeWidth={2.2} /></div>
                <h3 className="font-extrabold text-ink text-[15px]">{s.title}</h3>
                <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {/* FEATURED */}
      {hp?.featured?.isVisible !== false && hp?.featured?.units?.length ? (
        <section className="bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
            <Reveal className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp.featured.eyebrow}</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{hp.featured.title}</h2>
              </div>
              <Link to={hp.featured.seeAllLink || '/katalog'} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:gap-2.5 transition-all shrink-0">
                {hp.featured.seeAllLabel || 'Lihat Semua'} <ArrowRight size={16} />
              </Link>
            </Reveal>
            <Reveal delay={120} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hp.featured.units.map((u) => <PublicUnitCard key={u.id} card={u} onView={openDetail} />)}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* TESTIMONIALS */}
      {hp?.testimonials?.isVisible !== false && hp?.testimonials?.items?.length ? (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
          <Reveal className="text-center max-w-xl mx-auto mb-10">
            <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp.testimonials.eyebrow}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{hp.testimonials.title}</h2>
            <p className="text-muted font-medium mt-2">{hp.testimonials.subtitle}</p>
          </Reveal>
          <Reveal delay={120} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hp.testimonials.items.map((t) => (
              <div key={t.id} className="bg-surface rounded-2xl border border-border p-6">
                <Quote size={28} className="text-primary/30" />
                <div className="flex gap-0.5 mt-3">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={15} className="fill-accent-amber text-accent-amber" />)}
                </div>
                <p className="text-[14px] text-ink-soft font-medium mt-3 leading-relaxed">“{t.text}”</p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-divider">
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm overflow-hidden">
                    {cmsImageUrl('testimoni', t.avatarFilename)
                      ? <img src={cmsImageUrl('testimoni', t.avatarFilename)!} alt={t.name} className="w-full h-full object-cover" />
                      : t.name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-ink">{t.name}</p>
                    {t.role && <p className="text-[11px] text-muted font-semibold">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </section>
      ) : null}

      {/* CTA */}
      {hp?.cta?.isVisible !== false && hp?.cta && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark p-8 md:p-14 text-center text-white">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-2xl md:text-4xl font-extrabold leading-tight">{hp.cta.title}</h2>
            <p className="relative text-white/85 font-medium mt-3 max-w-lg mx-auto">{hp.cta.subtitle}</p>
            <div className="relative flex flex-wrap gap-3 justify-center mt-6">
              <Link to={resolveLink(hp.cta.primaryLink)} className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-bold text-[14px] px-6 py-3 hover:bg-white/90 transition-colors">
                <Search size={17} /> {hp.cta.primaryLabel}
              </Link>
              {hp.cta.secondaryLink === 'whatsapp' ? (
                <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-ink/20 backdrop-blur border border-white/30 text-white font-bold text-[14px] px-6 py-3 hover:bg-ink/30 transition-colors">
                  {hp.cta.secondaryLabel} <ArrowRight size={16} />
                </a>
              ) : (
                <Link to={resolveLink(hp.cta.secondaryLink)} className="inline-flex items-center gap-2 rounded-xl bg-ink/20 backdrop-blur border border-white/30 text-white font-bold text-[14px] px-6 py-3 hover:bg-ink/30 transition-colors">
                  {hp.cta.secondaryLabel} <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </Reveal>
        </section>
      )}
    </>
  );
};
