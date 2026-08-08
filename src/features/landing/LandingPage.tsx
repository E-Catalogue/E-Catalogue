import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Search, HandCoins, Star, Quote, MapPin, Clock3, ShieldCheck, ChevronDown } from 'lucide-react';
import { PublicUnitCard } from './PublicUnitCard';
import { Reveal } from '@/shared/components/Reveal';
import { Ic } from './Ic';
import { CustomerLoader, EmptyCmsState } from './CustomerStates';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { buildWhatsAppUrl, waMessages } from '@/core/utils/whatsapp';
import { usePublicHomepage, usePublicSiteSettings } from './landing.hooks';
import { heroContainer, fadeUpItem, staggerContainer } from './landing.motion';
import type { CatalogCard } from './public.types';
import { BranchCard, ShowroomMap } from './ShowroomMap';
import { TestimonialDetailModal } from './TestimonialDetailModal';
import { formatCurrency } from '@/core/utils/format';

export const LandingPage = () => {
  const { data: hp, isLoading, isError, refetch } = usePublicHomepage();
  const { data: site } = usePublicSiteSettings();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [testimonialId, setTestimonialId] = useState<string | null>(null);
  const openDetail = (u: CatalogCard) => navigate({ to: '/katalog/$id', params: { id: u.id } });
  const waUrl = buildWhatsAppUrl(site?.whatsappNumber, waMessages.generalContact(site?.companyName));
  const resolveLink = (link?: string) => (link === 'whatsapp' ? waUrl : link || '/katalog');
  const submitHeroSearch = (event: FormEvent) => { event.preventDefault(); navigate({ to: '/katalog', search: { q: heroSearch.trim() } }); };

  // Tampilkan hanya setelah data siap — hindari render setengah jadi.
  if (isLoading) return <CustomerLoader />;
  if (isError) return (
    <section className="relative overflow-hidden min-h-[68vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-background to-surface" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 grid lg:grid-cols-[1fr_.8fr] gap-10 items-center w-full">
        <div>
          <span className="inline-flex rounded-full bg-primary-light px-3 py-1.5 text-[12px] font-bold text-primary">Showroom mobil terpercaya</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-ink">Temukan mobil yang siap menemani perjalanan Anda.</h1>
          <p className="mt-4 max-w-xl text-[15px] font-medium leading-relaxed text-muted">Konten terbaru belum berhasil dimuat. Anda tetap dapat membuka katalog atau mencoba memuat ulang beranda.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/katalog" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-bold text-white shadow-glow"><Search size={17} /> Buka Katalog</Link>
            <button onClick={() => refetch()} className="rounded-xl border border-border bg-surface px-5 py-3 text-[14px] font-bold text-ink-soft hover:border-primary hover:text-primary">Coba Lagi</button>
          </div>
        </div>
        <div className="rounded-[2.5rem] border border-border bg-surface/80 p-8 shadow-card">
          <p className="text-[12px] font-bold uppercase tracking-wide text-primary">Butuh bantuan?</p>
          <p className="mt-2 text-xl font-extrabold text-ink">Tim showroom tetap dapat dihubungi.</p>
          <a href={waUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-primary hover:underline">Hubungi via WhatsApp <ArrowRight size={16} /></a>
        </div>
      </div>
    </section>
  );
  // CMS belum di-setup (tenant baru) → jangan tampil kosong melompong.
  if (!hp || Object.keys(hp).length === 0 || (!hp.hero && !hp.whyUs && !hp.featured)) {
    return <EmptyCmsState />;
  }

  const hero = hp?.hero;
  const heroImg = hero?.spotlightUnit?.image?.filename ? cmsImageUrl('unit', hero.spotlightUnit.image.filename) : cmsImageUrl('page', hero?.imageFilename);
  const fc = hero?.floatingCard;

  return (
    <>
      {/* HERO */}
      {hero?.isVisible !== false && hero && (
        <section className="relative overflow-hidden">
          {/* Ambient blobs bergerak halus */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-primary/12 blur-3xl animate-blob" />
            <div className="absolute top-40 -left-24 w-80 h-80 rounded-full bg-accent-green/10 blur-3xl animate-blob-slow" />
            <div className="absolute bottom-4 right-1/3 w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-breathe" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center relative">
            <motion.div variants={heroContainer} initial="hidden" animate="show">
              <motion.span variants={fadeUpItem} className="inline-flex items-center gap-2 rounded-full bg-primary-light text-primary text-[12px] font-bold px-3 py-1.5">
                <Ic name={fc?.icon ?? 'badge-check'} size={14} /> {hero.badgeText}
              </motion.span>
              <motion.h1 variants={fadeUpItem} className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-ink leading-[1.1] mt-4">
                {hero.titleHtml.split(/(<em>.*?<\/em>)/g).filter(Boolean).map((part, i) => {
                  const m = part.match(/^<em>(.*?)<\/em>$/);
                  return m ? <span key={i} className="text-primary">{m[1]}</span> : <span key={i}>{part}</span>;
                })}
              </motion.h1>
              <motion.p variants={fadeUpItem} className="text-muted font-medium mt-4 text-[15px] leading-relaxed max-w-md">{hero.subtitle}</motion.p>
              {hero.primaryBranch && <motion.div variants={fadeUpItem} className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-bold text-ink-soft"><span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-primary" />{hero.primaryBranch.nama} · {hero.primaryBranch.lokasi}</span>{hero.primaryBranch.businessHours && <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-primary" />{hero.primaryBranch.businessHours}</span>}</motion.div>}
              <motion.form variants={fadeUpItem} onSubmit={submitHeroSearch} className="mt-6 flex max-w-xl gap-2 rounded-2xl border border-border bg-surface p-2 shadow-card">
                <div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={heroSearch} onChange={(e) => setHeroSearch(e.target.value)} placeholder={hero.searchPlaceholder || 'Cari unit yang Anda inginkan'} className="h-11 w-full bg-transparent pl-10 pr-3 text-[13px] font-semibold text-ink outline-none" /></div>
                <button className="rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white transition-transform hover:scale-[1.02]">{hero.searchButtonLabel || 'Cari Unit'}</button>
              </motion.form>
              <motion.div variants={fadeUpItem} className="flex flex-wrap gap-3 mt-6">
                {hero.primaryCtaLink === 'whatsapp' ? <a href={waUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3 shadow-glow hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.97] transition-all"><Search size={17} /> {hero.primaryCtaLabel} <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /></a> : <Link to={resolveLink(hero.primaryCtaLink)} className="group inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3 shadow-glow hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.97] transition-all"><Search size={17} /> {hero.primaryCtaLabel} <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /></Link>}
                {hero.secondaryCtaLink === 'whatsapp' ? <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3 hover:border-primary hover:text-primary hover:scale-[1.03] active:scale-[0.97] transition-all"><HandCoins size={17} /> {hero.secondaryCtaLabel}</a> : <Link to={resolveLink(hero.secondaryCtaLink)} className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3 hover:border-primary hover:text-primary hover:scale-[1.03] active:scale-[0.97] transition-all"><HandCoins size={17} /> {hero.secondaryCtaLabel}</Link>}
              </motion.div>
              <motion.div variants={fadeUpItem} className="flex gap-8 mt-9">
                {hero.stats.map((s) => (
                  <motion.div key={s.label} whileHover={{ y: -3 }} className="cursor-default">
                    <p className="text-2xl md:text-3xl font-extrabold text-ink">{s.value}</p>
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 60, damping: 14 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/25 to-transparent rounded-[3rem] blur-2xl animate-breathe" />
              <div className="animate-bob-slow relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-ink shadow-card-hover aspect-[4/3]">
                {heroImg ? <img src={heroImg} alt={hero.spotlightUnit?.name || hero.badgeText} className="h-full w-full object-cover opacity-90" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-ink to-ink-soft text-white"><ShieldCheck size={64} className="opacity-30" /></div>}
                {hero.spotlightUnit && <button onClick={() => openDetail(hero.spotlightUnit!)} className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-ink/70 p-4 text-left text-white backdrop-blur-md transition-colors hover:bg-ink/85"><span className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/65">Sorotan showroom</span><span className="mt-1 flex items-end justify-between gap-3"><span><strong className="block text-base">{hero.spotlightUnit.name}</strong><span className="text-[11px] text-white/70">{hero.spotlightUnit.tahun} · {hero.spotlightUnit.warna}</span></span><strong className="text-sm">{formatCurrency(hero.spotlightUnit.harga)}</strong></span></button>}
              </div>
              {fc && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.55, type: 'spring', stiffness: 110, damping: 15 }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="absolute -bottom-5 left-2 sm:left-6 bg-surface rounded-2xl shadow-card-hover border border-border p-4 flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center"><Ic name={fc.icon} size={22} /></div>
                  <div>
                    <p className="text-[13px] font-extrabold text-ink leading-none">{fc.title}</p>
                    <p className="text-[11px] text-muted font-semibold mt-1">{fc.subtitle}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Brand chips */}
          {hp?.brands?.isVisible !== false && hp?.brands?.items?.length ? (
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-7xl mx-auto px-4 md:px-6 pb-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <motion.span variants={fadeUpItem} className="text-[12px] font-bold text-muted mr-1">{hp.brands.label}</motion.span>
                {hp.brands.items.map((b) => (
                  <motion.div key={b.id} variants={fadeUpItem} whileHover={{ y: -3, scale: 1.05 }}>
                    <Link to="/katalog" className="inline-block px-3.5 py-1.5 rounded-full bg-surface border border-border text-[12px] font-bold text-ink-soft hover:border-primary hover:text-primary transition-colors">
                      {b.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8% 0px -8% 0px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hp.whyUs.items.map((f) => (
                <motion.div key={f.title} variants={fadeUpItem} whileHover={{ y: -8 }} className="group bg-background rounded-2xl border border-border p-6 hover:shadow-card hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6"><Ic name={f.icon} size={24} strokeWidth={2.2} /></div>
                  <h3 className="font-extrabold text-ink text-[15px]">{f.title}</h3>
                  <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
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
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8% 0px -8% 0px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {hp.howItWorks.steps.map((s, i) => (
              <motion.div key={s.title} variants={fadeUpItem} whileHover={{ y: -8 }} className="group relative bg-surface rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-card transition-colors overflow-hidden">
                <span className="absolute top-4 right-5 text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">0{i + 1}</span>
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110"><Ic name={s.icon} size={24} strokeWidth={2.2} /></div>
                <h3 className="font-extrabold text-ink text-[15px] relative">{s.title}</h3>
                <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed relative">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
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
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8% 0px -8% 0px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hp.featured.units.map((u) => (
                <motion.div key={u.id} variants={fadeUpItem}><PublicUnitCard card={u} onView={openDetail} /></motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* TESTIMONIALS */}
      {hp?.locations?.isVisible !== false && hp?.locations?.items?.length ? <section className="bg-surface border-y border-border"><div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20"><Reveal className="max-w-2xl mb-8"><p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp.locations.eyebrow}</p><h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-ink">{hp.locations.title}</h2><p className="mt-2 text-muted font-medium">{hp.locations.subtitle}</p></Reveal><ShowroomMap branches={hp.locations.items} className="h-[390px]" /><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{hp.locations.items.map((branch) => <BranchCard key={branch.id} branch={branch} compact />)}</div></div></section> : null}

      {hp?.testimonials?.isVisible !== false && hp?.testimonials?.items?.length ? (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
          <Reveal className="text-center max-w-xl mx-auto mb-10">
            <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp.testimonials.eyebrow}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{hp.testimonials.title}</h2>
            <p className="text-muted font-medium mt-2">{hp.testimonials.subtitle}</p>
          </Reveal>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8% 0px -8% 0px' }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hp.testimonials.items.map((t) => (
              <motion.button type="button" onClick={() => setTestimonialId(t.id)} key={t.id} variants={fadeUpItem} whileHover={{ y: -6 }} className="group bg-surface rounded-2xl border border-border p-6 hover:shadow-card hover:border-primary/30 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary">
                <Quote size={28} className="text-primary/30 group-hover:text-primary/50 transition-colors" />
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
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-extrabold text-primary">Baca cerita lengkap <ArrowRight size={13} /></span>
              </motion.button>
            ))}
          </motion.div>
        </section>
      ) : null}

      {hp?.faq?.isVisible !== false && hp?.faq?.items?.length ? <section className="max-w-4xl mx-auto px-4 md:px-6 py-14 md:py-20"><Reveal className="text-center mb-8"><p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp.faq.eyebrow}</p><h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-ink">{hp.faq.title}</h2></Reveal><div className="space-y-3">{hp.faq.items.map((item) => <details key={item.question} className="group rounded-2xl border border-border bg-surface p-5 open:border-primary/30 open:shadow-card"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-ink">{item.question}<ChevronDown size={18} className="text-primary transition-transform group-open:rotate-180" /></summary><p className="mt-3 pr-8 text-[13px] font-medium leading-6 text-muted">{item.answer}</p></details>)}</div></section> : null}

      {/* CTA */}
      {hp?.cta?.isVisible !== false && hp?.cta && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-dark to-primary p-8 md:p-14 text-center text-white animate-gradient-pan">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl animate-blob" />
            <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-blob-slow" />
            <h2 className="relative text-2xl md:text-4xl font-extrabold leading-tight">{hp.cta.title}</h2>
            <p className="relative text-white/85 font-medium mt-3 max-w-lg mx-auto">{hp.cta.subtitle}</p>
            <div className="relative flex flex-wrap gap-3 justify-center mt-6">
              <Link to={resolveLink(hp.cta.primaryLink)} className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-bold text-[14px] px-6 py-3 shadow-lg hover:bg-white/90 hover:scale-[1.04] active:scale-[0.97] transition-all">
                <Search size={17} /> {hp.cta.primaryLabel}
              </Link>
              {hp.cta.secondaryLink === 'whatsapp' ? (
                <a href={waUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-xl bg-ink/20 backdrop-blur border border-white/30 text-white font-bold text-[14px] px-6 py-3 hover:bg-ink/30 hover:scale-[1.04] active:scale-[0.97] transition-all">
                  {hp.cta.secondaryLabel} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <Link to={resolveLink(hp.cta.secondaryLink)} className="group inline-flex items-center gap-2 rounded-xl bg-ink/20 backdrop-blur border border-white/30 text-white font-bold text-[14px] px-6 py-3 hover:bg-ink/30 hover:scale-[1.04] active:scale-[0.97] transition-all">
                  {hp.cta.secondaryLabel} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </Reveal>
        </section>
      )}
      <TestimonialDetailModal id={testimonialId} onClose={() => setTestimonialId(null)} />
    </>
  );
};
