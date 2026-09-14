import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Trophy, Eye, MessageSquareShare, ArrowUpRight } from 'lucide-react';
import type { TopUnitItem } from '../crmAnalytics.types';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';

interface TopUnitsSectionProps {
  units: TopUnitItem[];
}

export const TopUnitsSection = ({ units }: TopUnitsSectionProps) => {
  if (!units || units.length === 0) {
    return (
      <SectionCard
        title="Unit Mobil Paling Banyak Dilihat"
        subtitle="Ranking ketertarikan calon pelanggan terhadap inventori"
        icon={<Trophy size={18} />}
      >
        <div className="py-12 text-center text-muted text-sm font-semibold">
          Belum ada data kunjungan unit pada periode yang dipilih.
        </div>
      </SectionCard>
    );
  }

  const maxViews = Math.max(...units.map((u) => u.viewCount), 1);

  return (
    <SectionCard
      title="Unit Mobil Paling Banyak Dilihat"
      subtitle="Peringkat minat unit & daya tarik WhatsApp inquiry calon pelanggan"
      icon={<Trophy size={18} />}
      action={
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
          Top {units.length} Unit
        </span>
      }
    >
      <div className="space-y-3.5">
        {units.map((unit, idx) => {
          const imgUrl = cmsImageUrl('unit', unit.imageFilename) || DEFAULT_CAR_IMAGE;
          const viewPct = Math.round((unit.viewCount / maxViews) * 100);

          const rankBadge =
            idx === 0
              ? 'bg-amber-400 text-ink shadow-sm'
              : idx === 1
              ? 'bg-slate-300 text-ink shadow-sm'
              : idx === 2
              ? 'bg-amber-700/80 text-white shadow-sm'
              : 'bg-surface-soft text-muted border border-border';

          return (
            <div
              key={unit.id}
              className="p-3 sm:p-3.5 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Unit Info & Image */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-surface-soft border border-border">
                    <img
                      src={imgUrl}
                      alt={unit.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_CAR_IMAGE;
                      }}
                    />
                  </div>
                  <span
                    className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${rankBadge}`}
                  >
                    {idx + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[13px] font-extrabold text-ink truncate group-hover:text-primary transition-colors">
                      {unit.name}
                    </h4>
                    {unit.platNomor && (
                      <span className="px-1.5 py-0.5 rounded bg-surface-soft border border-border text-[10px] font-mono font-bold text-ink-soft shrink-0">
                        {unit.platNomor}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-muted mt-0.5">
                    {unit.tahun} · {unit.warna} · {formatCurrency(unit.otrPrice)}
                  </p>

                  {/* Relative views bar */}
                  <div className="w-full sm:w-48 h-1.5 rounded-full bg-surface-soft overflow-hidden mt-2 border border-border/60">
                    <div
                      style={{ width: `${viewPct}%` }}
                      className="h-full bg-primary rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/80">
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1 text-ink font-extrabold text-sm">
                    <Eye size={14} className="text-primary" />
                    <span>{formatNumber(unit.viewCount)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted uppercase">Dilihat</span>
                </div>

                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1 text-accent-green font-extrabold text-sm">
                    <MessageSquareShare size={14} />
                    <span>{formatNumber(unit.inquiryCount)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted uppercase">Klik WA</span>
                </div>

                <div className="text-right">
                  <span className="text-[13px] font-black text-ink">{unit.inquiryRate}%</span>
                  <p className="text-[10px] font-bold text-muted uppercase">Konversi</p>
                </div>

                <a
                  href={`/katalog/${unit.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Lihat di Katalog Publik"
                  className="w-8 h-8 rounded-xl bg-surface-soft border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors shrink-0"
                >
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};
