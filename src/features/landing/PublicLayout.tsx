import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Car, Phone, Menu, X, MapPin, Mail, MessageCircle, Globe } from 'lucide-react';
import { PUBLIC_NAV, WHATSAPP_URL as DEFAULT_WA } from './publicNav';
import { usePublicSiteSettings } from './landing.hooks';

const NavLogo = ({ logoUrl, companyName }: { logoUrl?: string | null, companyName?: string }) => (
  <Link to="/" className="flex items-center gap-3">
    {logoUrl ? (
      <img src={logoUrl} alt={companyName || "Logo"} className="h-10 object-contain" />
    ) : (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
        <Car size={22} className="text-white" strokeWidth={2.4} />
      </div>
    )}
    <div className="leading-none hidden sm:block">
      <p className="font-extrabold text-ink text-[15px] tracking-tight">{companyName || "GM MOBILINDO"}</p>
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary mt-1">Used Car Specialist</p>
    </div>
  </Link>
);

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  const [navOpen, setNavOpen] = useState(false);
  const { data: settings } = usePublicSiteSettings();

  const waUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : DEFAULT_WA;
  const companyName = settings?.companyName || "GM MOBILINDO";
  const logoUrl = settings?.logoFilename ? `${import.meta.env.VITE_API_URL}/public/site/${settings.logoFilename}` : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <NavLogo logoUrl={logoUrl} companyName={companyName} />
          <nav className="hidden md:flex items-center gap-1">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === '/' }}
                activeProps={{ className: 'bg-primary-light text-primary' }}
                inactiveProps={{ className: 'text-ink-soft hover:text-primary hover:bg-surface-soft' }}
                className="px-3.5 py-2 rounded-xl text-[13px] font-bold transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={waUrl} target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-4 py-2.5 shadow-glow hover:bg-primary-dark transition-colors">
              <Phone size={16} /> Hubungi Kami
            </a>
            <button onClick={() => setNavOpen((v) => !v)} className="md:hidden p-2 rounded-lg text-ink-soft hover:bg-surface-soft">
              {navOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1 ">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setNavOpen(false)}
                activeOptions={{ exact: item.to === '/' }}
                activeProps={{ className: 'bg-primary-light text-primary' }}
                inactiveProps={{ className: 'text-ink-soft' }}
                className="py-2.5 px-3 rounded-xl text-[14px] font-bold"
              >
                {item.label}
              </Link>
            ))}
            <a href={waUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-4 py-2.5 justify-center">
              <Phone size={16} /> Hubungi Kami
            </a>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="bg-ink text-white/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-10 object-contain brightness-0 invert" />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
                  <Car size={22} className="text-white" strokeWidth={2.4} />
                </div>
              )}
              <div className="leading-none">
                <p className="font-extrabold text-white text-[15px]">{companyName}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold mt-1">Used Car Specialist</p>
              </div>
            </div>
            <p className="text-[13px] font-medium mt-4 leading-relaxed max-w-sm">
              {settings?.footerDescription || 'Showroom mobil bekas berkualitas dengan layanan terpercaya, bergaransi, dan harga transparan untuk mobil impian Anda.'}
            </p>
            <div className="flex gap-3 mt-5">
              {settings?.whatsappNumber && (
                <a href={waUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><MessageCircle size={18} /></a>
              )}
              {settings?.social?.website && (
                <a href={settings.social.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><Globe size={18} /></a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-[13px] uppercase tracking-wide mb-3">Menu</h4>
            <ul className="space-y-2 text-[13px] font-medium">
              {PUBLIC_NAV.map((item) => (
                <li key={item.to}><Link to={item.to} className="hover:text-primary transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-[13px] uppercase tracking-wide mb-3">Kontak</h4>
            <ul className="space-y-2.5 text-[13px] font-medium">
              {(settings?.address || 'Jl. Raya Otomotif No. 88, Jakarta') && (
                <li className="flex items-start gap-2.5"><MapPin size={16} className="text-primary shrink-0 mt-0.5" /> {settings?.address || 'Jl. Raya Otomotif No. 88, Jakarta'}</li>
              )}
              {(settings?.phone || '021-1500-888') && (
                <li className="flex items-center gap-2.5"><Phone size={16} className="text-primary" /> {settings?.phone || '021-1500-888'}</li>
              )}
              {(settings?.email || 'halo@gmmobilindo.id') && (
                <li className="flex items-center gap-2.5"><Mail size={16} className="text-primary" /> {settings?.email || 'halo@gmmobilindo.id'}</li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-[12px] font-medium">
          {settings?.copyrightText || `© ${new Date().getFullYear()} ${companyName}. Semua hak dilindungi.`}
        </div>
      </footer>
    </div>
  );
};
