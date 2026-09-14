import { useEffect, type ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Car, Phone, MapPin, Mail, Globe } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaWhatsapp, FaTiktok } from 'react-icons/fa6';
import { PUBLIC_NAV } from './publicNav';
import { usePublicSiteSettings, usePublicNavMenus } from './landing.hooks';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { buildWhatsAppUrl, waMessages } from '@/core/utils/whatsapp';
import { MobileFloatingNav } from './MobileFloatingNav';
import { trackEvent } from '@/core/utils/tracker';


const NavLogo = ({ logoUrl, companyName, tagline }: { logoUrl?: string | null; companyName: string; tagline: string }) => (
  <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
    {logoUrl ? (
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden bg-surface border border-border shrink-0">
        <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow shrink-0">
        <Car size={20} className="text-white sm:w-[22px] sm:h-[22px]" strokeWidth={2.4} />
      </div>
    )}
    <div className="leading-none min-w-0">
      <p className="font-extrabold text-ink text-[13px] sm:text-[15px] tracking-tight uppercase truncate">{companyName}</p>
      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.18em] text-primary mt-0.5 sm:mt-1 truncate">{tagline}</p>
    </div>
  </Link>
);

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  const { data: s } = usePublicSiteSettings();
  const { data: menus, isError: navMenusError } = usePublicNavMenus();
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || '/';

  useEffect(() => {
    trackEvent({
      eventType: 'PAGE_VIEW',
      pagePath: currentPath,
      pageTitle: typeof document !== 'undefined' ? document.title : undefined,
    });
  }, [currentPath]);

  const companyName = s?.companyName || 'GM MOBILINDO';
  const tagline = s?.tagline || 'Used Car Specialist';
  const logoUrl = cmsImageUrl('site', s?.logoFilename);
  const waUrl = buildWhatsAppUrl(s?.whatsappNumber, waMessages.generalContact(s?.companyName));
  const contactLabel = s?.navContactLabel || 'Hubungi Kami';

  // Array kosong adalah kondisi valid saat semua menu dinonaktifkan oleh CMS.
  // Fallback statis hanya dipakai selama loading/ketika endpoint gagal, bukan saat hasilnya kosong.
  const navLinks = navMenusError || menus === undefined
    ? PUBLIC_NAV.map((l) => ({ to: l.to, label: l.label }))
    : menus.map((l) => ({ to: l.path, label: l.label }));

  return (
    <div className="public-motion-scope min-h-screen bg-background flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
          <NavLogo logoUrl={logoUrl} companyName={companyName} tagline={tagline} />
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
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
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent({ eventType: 'WHATSAPP_CLICK', meta: { location: 'navbar_contact' } })}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-4 py-2.5 shadow-glow hover:bg-primary-dark transition-colors"
            >
              <Phone size={16} /> {contactLabel}
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent({ eventType: 'WHATSAPP_CLICK', meta: { location: 'navbar_mobile_chat' } })}
              className="inline-flex sm:hidden items-center gap-1.5 rounded-full bg-accent-green text-white font-bold text-[11px] px-3 py-1.5 shadow-sm hover:bg-accent-green-dark transition-colors"
            >
              <FaWhatsapp size={14} /> <span>Chat Sales</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* FOOTER */}
      <footer className="bg-ink text-white/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow overflow-hidden">
                {logoUrl ? <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" /> : <Car size={22} className="text-white" strokeWidth={2.4} />}
              </div>
              <div className="leading-none">
                <p className="font-extrabold text-white text-[15px] uppercase">{companyName}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold mt-1">{tagline}</p>
              </div>
            </div>
            <p className="text-[13px] font-medium mt-4 leading-relaxed max-w-sm">
              {s?.footerDescription || 'Showroom mobil bekas berkualitas dengan layanan terpercaya, bergaransi, dan harga transparan untuk mobil impian Anda.'}
            </p>
            <div className="flex gap-3 mt-5">
              <a href={waUrl} target="_blank" rel="noreferrer" title="WhatsApp" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><FaWhatsapp size={18} /></a>
              {s?.social?.instagram && <a href={s.social.instagram} target="_blank" rel="noreferrer" title="Instagram" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><FaInstagram size={18} /></a>}
              {s?.social?.facebook && <a href={s.social.facebook} target="_blank" rel="noreferrer" title="Facebook" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><FaFacebookF size={16} /></a>}
              {s?.social?.tiktok && <a href={s.social.tiktok} target="_blank" rel="noreferrer" title="TikTok" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><FaTiktok size={16} /></a>}
              {s?.social?.website && <a href={s.social.website} target="_blank" rel="noreferrer" title="Website" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><Globe size={18} /></a>}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-[13px] uppercase tracking-wide mb-3">Menu</h4>
            <ul className="space-y-2 text-[13px] font-medium">
              {navLinks.map((item) => (
                <li key={item.to}><Link to={item.to} className="hover:text-primary transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-[13px] uppercase tracking-wide mb-3">Kontak</h4>
            <ul className="space-y-2.5 text-[13px] font-medium">
              {s?.address && <li className="flex items-start gap-2.5"><MapPin size={16} className="text-primary shrink-0 mt-0.5" /> {s.address}</li>}
              {s?.phone && <li className="flex items-center gap-2.5"><Phone size={16} className="text-primary" /> {s.phone}</li>}
              {s?.email && <li className="flex items-center gap-2.5"><Mail size={16} className="text-primary" /> {s.email}</li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-5 pb-20 md:pb-5 text-center text-[12px] font-medium">
          {s?.copyrightText || `© ${new Date().getFullYear()} ${companyName}. Semua hak dilindungi.`}
        </div>
      </footer>

      {/* Floating Pill Bottom Navbar for Mobile */}
      <MobileFloatingNav items={navLinks} />
    </div>
  );
};
