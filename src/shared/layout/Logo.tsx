import { Car } from 'lucide-react';
import { usePublicSiteSettings } from '@/features/cms/cms.hooks';
import { cmsImageUrl } from '@/features/cms/cms.api';

interface LogoProps {
  compact?: boolean;
}

/** Logo showroom — dinamis dari CMS site-settings (nama, tagline, logo), fallback default. */
export const Logo = ({ compact = false }: LogoProps) => {
  const { data } = usePublicSiteSettings();
  const name = data?.companyName || 'GM MOBILINDO';
  const tagline = data?.tagline || 'Used Car Specialist';
  const logoUrl = cmsImageUrl('site', data?.logoFilename);

  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <div
        className={`rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ${
          logoUrl ? 'bg-surface border border-border' : 'bg-gradient-to-br from-primary to-primary-dark shadow-glow'
        } ${compact ? 'w-10 h-10' : 'w-11 h-11'}`}
      >
        {logoUrl
          ? <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
          : <Car size={compact ? 20 : 22} className="text-white" strokeWidth={2.4} />}
      </div>
      {!compact && (
        <div className="flex flex-col leading-none whitespace-nowrap">
          <span className="font-extrabold text-[15px] text-ink tracking-tight uppercase">{name}</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary mt-1">{tagline}</span>
        </div>
      )}
    </div>
  );
};
