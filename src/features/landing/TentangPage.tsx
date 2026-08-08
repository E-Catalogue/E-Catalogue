import { Link } from '@tanstack/react-router';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/shared/components/Reveal';
import { Ic } from './Ic';
import { CustomerLoader, CustomerServerError, EmptyCmsState } from './CustomerStates';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { usePublicAbout, usePublicSiteSettings } from './landing.hooks';
import { buildWhatsAppUrl, waMessages } from '@/core/utils/whatsapp';

export const TentangPage = () => {
  const { data: about, isLoading, isError, refetch } = usePublicAbout();
  const { data: settings } = usePublicSiteSettings();
  const waUrl = buildWhatsAppUrl(settings?.whatsappNumber, waMessages.generalContact(settings?.companyName));
  const resolve = (link?: string) => (link === 'whatsapp' ? waUrl : link || '/katalog');

  if (isLoading) return <CustomerLoader />;
  if (isError) return <CustomerServerError onRetry={() => refetch()} waUrl={waUrl} />;
  if (!about || Object.keys(about).length === 0 || (!about.hero && !about.values)) return <EmptyCmsState title="Halaman Tentang Sedang Dipersiapkan" />;

  const hero = about?.hero;
  const heroImg = cmsImageUrl('page', hero?.imageFilename);
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
              {heroImg ? <img src={heroImg} alt={hero.title} className="rounded-[2.5rem] shadow-card-hover w-full object-cover aspect-[4/3]" /> : <div className="aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br from-primary-light via-surface to-background border border-border grid place-items-center"><Ic name="building-2" size={72} className="text-primary/30" /></div>}
            </div>
          </div>
        </section>
      )}

      {about.story?.isVisible !== false && about.story && <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20 grid gap-10 lg:grid-cols-[.85fr_1.15fr] items-center"><Reveal>{about.story.imageFilename ? <img src={cmsImageUrl('page', about.story.imageFilename) ?? ''} alt={about.story.title} className="aspect-[4/3] w-full rounded-[2.5rem] object-cover shadow-card" /> : <div className="aspect-[4/3] rounded-[2.5rem] border border-border bg-surface grid place-items-center"><Ic name="handshake" size={64} className="text-primary/25" /></div>}</Reveal><Reveal delay={100}><p className="text-[12px] font-extrabold uppercase tracking-[.16em] text-primary">{about.story.eyebrow}</p><h2 className="mt-3 text-3xl font-extrabold leading-tight text-ink">{about.story.title}</h2><div className="mt-5 space-y-4">{about.story.paragraphs.map((paragraph) => <p key={paragraph} className="text-[14px] font-medium leading-7 text-muted">{paragraph}</p>)}</div></Reveal></section>}

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
              <ul className="mt-4 space-y-3">{vm.visiItems.map((item) => <li key={item} className="flex gap-2.5 text-[13px] font-medium leading-6 text-muted"><CheckCircle2 size={17} className="mt-1 shrink-0 text-primary" />{item}</li>)}</ul>
            </Reveal>
            <Reveal delay={100} className="bg-background rounded-2xl border border-border p-7">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4"><Ic name={vm.misiIcon} size={24} /></div>
              <h2 className="text-xl font-extrabold text-ink">{vm.misiTitle}</h2>
              <ul className="mt-4 space-y-3">{vm.misiItems.map((item) => <li key={item} className="flex gap-2.5 text-[13px] font-medium leading-6 text-muted"><CheckCircle2 size={17} className="mt-1 shrink-0 text-primary" />{item}</li>)}</ul>
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

      {about.standards?.isVisible !== false && about.standards?.items?.length ? (
        <section className="relative isolate overflow-hidden bg-ink text-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.04] to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
            <Reveal className="max-w-2xl mb-10 md:mb-12">
              <p className="text-[12px] font-extrabold uppercase tracking-[.16em] text-primary-light">{about.standards.eyebrow}</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-extrabold leading-tight">{about.standards.title}</h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {about.standards.items.map((item) => (
                <Reveal key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
                  <Ic name={item.icon} size={24} className="text-primary-light" />
                  <h3 className="mt-4 font-extrabold">{item.title}</h3>
                  <p className="mt-2 text-[13px] font-medium leading-6 text-white/65">{item.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {about.journey?.isVisible !== false && about.journey?.items?.length ? <section className="max-w-5xl mx-auto px-4 md:px-6 py-14 md:py-20"><Reveal className="text-center mb-10"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">{about.journey.eyebrow}</p><h2 className="mt-2 text-3xl font-extrabold text-ink">{about.journey.title}</h2></Reveal><div className="relative space-y-4 before:absolute before:left-[2.15rem] sm:before:left-[3.15rem] before:top-5 before:bottom-5 before:w-px before:bg-border">{about.journey.items.map((item) => <div key={`${item.year}-${item.title}`} className="relative grid grid-cols-[4.5rem_1fr] gap-2.5 sm:grid-cols-[6.5rem_1fr] sm:gap-4"><span className="z-10 self-start rounded-full border border-primary/20 bg-primary-light px-2 py-2 text-center text-[10px] font-extrabold text-primary sm:px-3 sm:text-xs">{item.year}</span><div className="rounded-2xl border border-border bg-surface p-4 sm:p-5"><h3 className="font-extrabold text-ink">{item.title}</h3><p className="mt-1 text-[13px] font-medium leading-6 text-muted">{item.desc}</p></div></div>)}</div></section> : null}

      {/* CTA */}
      {about?.cta?.isVisible !== false && about?.cta && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
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
