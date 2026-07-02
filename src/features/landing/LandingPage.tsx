import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowRight, ShieldCheck, BadgeCheck, Wrench, HandCoins, Search,
  FileSearch, Car, CheckCircle2, Star, Quote, Loader2
} from 'lucide-react';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { Reveal } from '@/shared/components/Reveal';
import { usePublicHomepage, usePublicSiteSettings } from './landing.hooks';
import { WHATSAPP_URL } from './publicNav';
import type { Unit } from '@/data/types';


const FEATURES = [
  { icon: ShieldCheck, title: 'Bergaransi & Terpercaya', desc: 'Setiap unit lolos inspeksi 150+ titik dan bergaransi mesin hingga 1 tahun.' },
  { icon: BadgeCheck, title: 'Surat Lengkap & Aman', desc: 'BPKB, STNK, faktur lengkap. Bebas banjir, bebas tabrakan besar, bebas odometer.' },
  { icon: Wrench, title: 'Sudah Direkondisi', desc: 'Mobil siap pakai, sudah melalui proses rekondisi & detailing menyeluruh.' },
  { icon: HandCoins, title: 'Kredit Mudah & Cepat', desc: 'DP ringan, approval cepat, bekerja sama dengan banyak leasing terpercaya.' },
];

const STEPS = [
  { icon: FileSearch, title: 'Cari & Bandingkan', desc: 'Telusuri katalog lengkap dengan filter cerdas untuk temukan mobil sesuai budget.' },
  { icon: Car, title: 'Test Drive', desc: 'Jadwalkan test drive gratis, rasakan langsung kondisi mobil pilihan Anda.' },
  { icon: HandCoins, title: 'Ajukan & Bayar', desc: 'Pilih cash atau kredit, proses administrasi cepat dan transparan.' },
  { icon: CheckCircle2, title: 'Mobil Jadi Milik Anda', desc: 'Serah terima unit beserta surat lengkap. Selamat berkendara!' },
];

const TESTIMONIALS = [
  { name: 'Andre P.', role: 'Karyawan Swasta', text: 'Pelayanan ramah, mobil sesuai deskripsi, surat lengkap. Proses kredit cepat banget!', rating: 5 },
  { name: 'Sinta W.', role: 'Wiraswasta', text: 'Sudah direkondisi jadi tinggal pakai. Harga transparan, nggak ada biaya tersembunyi.', rating: 5 },
  { name: 'Budi H.', role: 'PNS', text: 'Test drive dulu sebelum beli bikin tenang. Recommended banget buat beli mobil bekas.', rating: 5 },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { data: hp, isLoading } = usePublicHomepage();
  const { data: settings } = usePublicSiteSettings();

  const openDetail = (u: Unit) => navigate({ to: '/katalog/$id', params: { id: u.id } });

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 size={30} className="animate-spin text-primary" /></div>;
  }

  const ready = hp?.featured?.items || [];
  const featured = ready.slice(0, 4);
  const brands = hp?.brands?.items?.slice(0, 6).map((b: any) => b.name || b) || ['Toyota', 'Honda', 'Daihatsu', 'Suzuki', 'Mitsubishi', 'Nissan'];
  
  const hero = hp?.hero;
  const whyUs = hp?.whyUs;
  const howItWorks = hp?.howItWorks;
  const testimonials = hp?.testimonials?.items || TESTIMONIALS;
  const cta = hp?.cta;
  const waUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : WHATSAPP_URL;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center relative">
          <div className="animate-float-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light text-primary text-[12px] font-bold px-3 py-1.5">
              <BadgeCheck size={14} /> {hero?.badgeText || 'Used Car Specialist #1'}
            </span>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-ink leading-[1.1] mt-4" dangerouslySetInnerHTML={{ __html: hero?.titleHtml || 'Mobil Bekas <span className="text-primary">Berkualitas</span>, Tanpa Drama' }} />
            <p className="text-muted font-medium mt-4 text-[15px] leading-relaxed max-w-md">
              {hero?.subtitle || 'Ratusan unit terinspeksi, bergaransi, dan sudah direkondisi. Harga transparan, proses kredit mudah — temukan mobil impian Anda hari ini.'}
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link to={hero?.primaryCtaLink || "/katalog"} className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3 shadow-glow hover:bg-primary-dark transition-colors">
                <Search size={17} /> {hero?.primaryCtaLabel || 'Jelajahi Katalog'}
              </Link>
              <Link to={hero?.secondaryCtaLink || "/simulasi"} className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3 hover:border-primary hover:text-primary transition-colors">
                <HandCoins size={17} /> {hero?.secondaryCtaLabel || 'Simulasi Kredit'}
              </Link>
            </div>

            <div className="flex gap-8 mt-9">
              {(hero?.stats || [
                { value: `${ready.length || '100'}+`, label: 'Unit Tersedia' },
                { value: '4.9', label: 'Rating Pelanggan' },
                { value: '10+', label: 'Tahun Pengalaman' },
              ]).map((s: any) => (
                <div key={s.label}>
                  <p className="text-2xl md:text-3xl font-extrabold text-ink">{s.value}</p>
                  <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] blur-2xl" />
            <img
              src={hero?.imageFilename ? `${import.meta.env.VITE_API_URL}/public/site/${hero.imageFilename}` : "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1400&auto=format&fit=crop"}
              alt="Mobil bekas berkualitas"
              className="relative rounded-[2.5rem] shadow-card-hover w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-5 left-2 sm:left-6 bg-surface rounded-2xl shadow-card-hover border border-border p-4 flex items-center gap-3 animate-float-up">
              <div className="w-11 h-11 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center"><ShieldCheck size={22} /></div>
              <div>
                <p className="text-[13px] font-extrabold text-ink leading-none">{hero?.floatingCard?.title || 'Garansi Mesin'}</p>
                <p className="text-[11px] text-muted font-semibold mt-1">{hero?.floatingCard?.subtitle || 'Inspeksi 150+ titik'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand quick chips */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[12px] font-bold text-muted mr-1">{hp?.brands?.label || 'Merek populer:'}</span>
            {brands.map((b: any) => (
              <Link key={b} to="/katalog" className="px-3.5 py-1.5 rounded-full bg-surface border border-border text-[12px] font-bold text-ink-soft hover:border-primary hover:text-primary transition-colors">
                {b}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
          <Reveal className="text-center max-w-xl mx-auto mb-10">
            <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{whyUs?.eyebrow || 'Kenapa GM Mobilindo'}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{whyUs?.title || 'Beli Mobil Bekas Jadi Tenang'}</h2>
            <p className="text-muted font-medium mt-2">{whyUs?.subtitle || 'Kami menghilangkan keraguan terbesar saat membeli mobil bekas.'}</p>
          </Reveal>
          <Reveal delay={120} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(whyUs?.items || FEATURES).map((f: any) => {
              const Icon = typeof f.icon === 'string' ? ShieldCheck : (f.icon || ShieldCheck);
              return (
                <div key={f.title} className="bg-background rounded-2xl border border-border p-6 hover:shadow-card hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4">
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-extrabold text-ink text-[15px]">{f.title}</h3>
                  <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <Reveal className="text-center max-w-xl mx-auto mb-10">
          <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{howItWorks?.eyebrow || 'Cara Kerja'}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{howItWorks?.title || '4 Langkah Mudah'}</h2>
          <p className="text-muted font-medium mt-2">{howItWorks?.subtitle || 'Dari cari mobil sampai jadi milik Anda — semua simpel.'}</p>
        </Reveal>
        <Reveal delay={120} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(howItWorks?.steps || STEPS).map((s: any, i: number) => {
            const Icon = typeof s.icon === 'string' ? FileSearch : (s.icon || FileSearch);
            return (
              <div key={s.title} className="relative bg-surface rounded-2xl border border-border p-6">
                <span className="absolute top-5 right-5 text-4xl font-extrabold text-primary/10">0{i + 1}</span>
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                <h3 className="font-extrabold text-ink text-[15px]">{s.title}</h3>
                <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </Reveal>
      </section>

      {/* FEATURED */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
          <Reveal className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp?.featured?.eyebrow || 'Pilihan Terbaik'}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{hp?.featured?.title || 'Unit Unggulan'}</h2>
            </div>
            <Link to={hp?.featured?.seeAllLink || "/katalog"} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:gap-2.5 transition-all shrink-0">
              {hp?.featured?.seeAllLabel || 'Lihat Semua'} <ArrowRight size={16} />
            </Link>
          </Reveal>
          <Reveal delay={120} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((u: any) => <UnitCard key={u.id} unit={u} onView={openDetail} />)}
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <Reveal className="text-center max-w-xl mx-auto mb-10">
          <p className="text-primary font-bold text-[13px] uppercase tracking-wide">{hp?.testimonials?.eyebrow || 'Testimoni'}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{hp?.testimonials?.title || 'Kata Mereka'}</h2>
          <p className="text-muted font-medium mt-2">{hp?.testimonials?.subtitle || 'Ribuan pelanggan telah mempercayai kami.'}</p>
        </Reveal>
        <Reveal delay={120} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t: any, i: number) => (
            <div key={t.id || i} className="bg-surface rounded-2xl border border-border p-6">
              <Quote size={28} className="text-primary/30" />
              <div className="flex gap-0.5 mt-3">
                {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={15} className="fill-accent-amber text-accent-amber" />)}
              </div>
              <p className="text-[14px] text-ink-soft font-medium mt-3 leading-relaxed">“{t.text}”</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-divider">
                {t.avatarFilename ? (
                  <img src={`${import.meta.env.VITE_API_URL}/public/testimoni/${t.avatarFilename}`} className="w-10 h-10 rounded-full object-cover" alt={t.name} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm">{t.name[0]}</div>
                )}
                <div>
                  <p className="text-[13px] font-extrabold text-ink">{t.name}</p>
                  <p className="text-[11px] text-muted font-semibold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark p-8 md:p-14 text-center text-white">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-2xl md:text-4xl font-extrabold leading-tight">{cta?.title || 'Siap Membawa Pulang Mobil Idaman?'}</h2>
          <p className="relative text-white/85 font-medium mt-3 max-w-lg mx-auto">{cta?.subtitle || 'Jelajahi katalog atau konsultasi gratis dengan sales kami untuk penawaran terbaik hari ini.'}</p>
          <div className="relative flex flex-wrap gap-3 justify-center mt-6">
            <Link to={cta?.primaryLink || "/katalog"} className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-bold text-[14px] px-6 py-3 hover:bg-white/90 transition-colors">
              <Search size={17} /> {cta?.primaryLabel || 'Lihat Katalog'}
            </Link>
            <a href={cta?.secondaryLink || waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-ink/20 backdrop-blur border border-white/30 text-white font-bold text-[14px] px-6 py-3 hover:bg-ink/30 transition-colors">
              {cta?.secondaryLabel || 'Hubungi Sales'} <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
};
