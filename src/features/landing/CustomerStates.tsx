import { Link } from '@tanstack/react-router';
import { Construction, MapPinOff, ServerCrash, Home, Search, RefreshCw, MessageCircle, Car } from 'lucide-react';
import { WHATSAPP_URL as DEFAULT_WA } from './publicNav';
import { usePublicSiteSettings } from './landing.hooks';
import { cmsImageUrl } from '@/features/cms/cms.api';

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-md text-center relative">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
      {children}
    </div>
  </div>
);

const IconBadge = ({ children, tone = 'primary' }: { children: React.ReactNode; tone?: 'primary' | 'amber' | 'error' }) => {
  const cls = tone === 'error' ? 'bg-semantic-error/10 text-semantic-error border-semantic-error/20'
    : tone === 'amber' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
    : 'bg-primary-light text-primary border-primary/15';
  return <div className={`relative w-20 h-20 rounded-3xl border flex items-center justify-center mx-auto mb-6 ${cls}`}>{children}</div>;
};

/* ── 1. Data CMS belum di-setup ── */
export const EmptyCmsState = ({ title = 'Website Sedang Dipersiapkan', subtitle = 'Konten website sedang dalam tahap penyesuaian. Silakan kembali lagi beberapa saat lagi.' }: { title?: string; subtitle?: string }) => (
  <Shell>
    <IconBadge tone="amber"><Construction size={36} strokeWidth={1.8} /></IconBadge>
    <h1 className="relative text-[22px] font-extrabold text-ink">{title}</h1>
    <p className="relative text-muted font-medium mt-3 leading-relaxed text-[13px]">{subtitle}</p>
    <button onClick={() => window.location.reload()} className="relative inline-flex items-center gap-2 mt-7 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-2.5 shadow-glow hover:bg-primary-dark transition-colors">
      <RefreshCw size={15} /> Muat Ulang
    </button>
  </Shell>
);

/* ── 2. 404 ── */
export const CustomerNotFound = () => (
  <Shell>
    <div className="relative select-none mb-2">
      <p className="text-[96px] sm:text-[120px] font-black leading-none tracking-tighter bg-gradient-to-b from-ink/15 to-ink/5 bg-clip-text text-transparent">404</p>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border shadow-card-hover flex items-center justify-center animate-float-up">
          <MapPinOff size={30} className="text-primary" strokeWidth={1.8} />
        </div>
      </div>
    </div>
    <h1 className="relative text-[22px] font-extrabold text-ink">Oops! Kesasar ya?</h1>
    <p className="relative text-muted font-medium mt-3 leading-relaxed text-[13px]">Halaman yang Anda cari mungkin sudah dihapus, atau URL-nya salah ketik.</p>
    <div className="relative flex items-center justify-center gap-3 mt-7 flex-wrap">
      <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-2.5 shadow-glow hover:bg-primary-dark transition-colors"><Home size={15} /> Kembali ke Beranda</Link>
      <Link to="/katalog" className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[13px] px-5 py-2.5 hover:border-primary hover:text-primary transition-colors"><Search size={15} /> Lihat Katalog</Link>
    </div>
  </Shell>
);

/* ── 3. Server error / API down ── */
export const CustomerServerError = ({ onRetry, waUrl = DEFAULT_WA }: { onRetry?: () => void; waUrl?: string }) => (
  <Shell>
    <IconBadge tone="error"><ServerCrash size={34} strokeWidth={1.8} /></IconBadge>
    <h1 className="relative text-[22px] font-extrabold text-ink">Mohon Maaf, Ada Gangguan Sistem</h1>
    <p className="relative text-muted font-medium mt-3 leading-relaxed text-[13px]">Server kami sedang mengalami kendala atau pemeliharaan rutin. Tim kami sedang menanganinya — silakan coba beberapa saat lagi.</p>
    <div className="relative flex items-center justify-center gap-3 mt-7 flex-wrap">
      <button onClick={() => (onRetry ? onRetry() : window.location.reload())} className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-2.5 shadow-glow hover:bg-primary-dark transition-colors"><RefreshCw size={15} /> Coba Lagi</button>
      <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-accent-green text-white font-bold text-[13px] px-5 py-2.5 hover:brightness-95 transition-all"><MessageCircle size={15} /> Hubungi Hotline</a>
    </div>
  </Shell>
);

/* ── Loader full-screen branded — menutupi header & footer ── */
export const CustomerLoader = ({ label = 'Menyiapkan halaman…' }: { label?: string }) => {
  const { data: s } = usePublicSiteSettings();
  const logo = cmsImageUrl('site', s?.logoFilename);
  const name = s?.companyName || 'GM MOBILINDO';

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-7">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Mark */}
      <div className="relative">
        <div className="w-20 h-20 rounded-[1.6rem] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center animate-loader-pulse overflow-hidden">
          {logo ? <img src={logo} alt={name} className="w-full h-full object-cover" /> : <Car size={38} className="text-white" strokeWidth={2.2} />}
        </div>
        {/* Orbiting ring */}
        <div className="absolute -inset-2 rounded-[2rem] border-2 border-primary/15 border-t-primary animate-spin" style={{ animationDuration: '0.9s' }} />
      </div>

      {/* Brand + label */}
      <div className="relative text-center">
        <p className="font-extrabold text-ink text-[15px] tracking-tight uppercase">{name}</p>
        <p className="text-muted text-[12.5px] font-medium mt-1">{label}</p>
      </div>

      {/* Indeterminate bar */}
      <div className="relative w-44 h-1.5 rounded-full bg-surface-soft overflow-hidden">
        <div className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-primary/60 to-primary animate-loader-bar" />
      </div>
    </div>
  );
};
