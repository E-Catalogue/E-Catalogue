import { Car } from 'lucide-react';

interface LogoProps {
  compact?: boolean;
}

/** Logo Cars Showroom — mark mobil candy-orange + wordmark. */
export const Logo = ({ compact = false }: LogoProps) => {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <div
        className={`rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow shrink-0 ${
          compact ? 'w-10 h-10' : 'w-11 h-11'
        }`}
      >
        <Car size={compact ? 20 : 22} className="text-white" strokeWidth={2.4} />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none whitespace-nowrap">
          <span className="font-extrabold text-[15px] text-ink tracking-tight">CARS SHOWROOM</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary mt-1">
            Used Car Specialist
          </span>
        </div>
      )}
    </div>
  );
};
