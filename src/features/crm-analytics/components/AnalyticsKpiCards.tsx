import {
  Users,
  Eye,
  Car,
  MessageSquareShare,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { CrmAnalyticsOverview } from '../crmAnalytics.types';
import { formatNumber } from '@/core/utils/format';

interface AnalyticsKpiCardsProps {
  overview: CrmAnalyticsOverview;
}

export const AnalyticsKpiCards = ({ overview }: AnalyticsKpiCardsProps) => {
  const { kpi, growth } = overview;

  const cards = [
    {
      label: 'Pengunjung Unik',
      value: formatNumber(kpi.totalVisitors),
      unit: 'Orang',
      growth: growth.visitors,
      icon: Users,
      color: 'bg-primary text-white',
      desc: 'Calon pelanggan unik',
    },
    {
      label: 'Kunjungan Halaman',
      value: formatNumber(kpi.totalPageViews),
      unit: 'Views',
      growth: growth.pageViews,
      icon: Eye,
      color: 'bg-accent-blue text-white',
      desc: 'Total impresi katalog',
    },
    {
      label: 'Minat Unit Mobil',
      value: formatNumber(kpi.totalUnitViews),
      unit: 'Mobil',
      growth: growth.unitViews,
      icon: Car,
      color: 'bg-accent-orange text-white',
      desc: 'Detail unit dilihat',
    },
    {
      label: 'Lead Inbound (WA)',
      value: formatNumber(kpi.totalInquiries),
      unit: 'Chat',
      growth: growth.inquiries,
      icon: MessageSquareShare,
      color: 'bg-accent-green text-white',
      desc: 'Klik chat & telepon',
    },
    {
      label: 'Tingkat Konversi',
      value: `${kpi.conversionRate}%`,
      unit: '',
      growth: growth.conversionRate,
      icon: TrendingUp,
      color: 'bg-accent-purple text-white',
      desc: 'Pengunjung ke lead WA',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isPositive = card.growth > 0;
        const isNegative = card.growth < 0;
        const GrowthIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

        return (
          <div
            key={idx}
            className="bg-surface rounded-2xl border border-border p-4 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted truncate">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${card.color} flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon size={16} strokeWidth={2.4} />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-extrabold text-ink leading-tight tracking-tight">
                  {card.value}
                </span>
                {card.unit && <span className="text-[11px] font-bold text-muted">{card.unit}</span>}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-border flex items-center justify-between text-[11px]">
              <div
                className={`inline-flex items-center gap-0.5 font-bold ${
                  isPositive ? 'text-accent-green' : isNegative ? 'text-semantic-error' : 'text-muted'
                }`}
              >
                <GrowthIcon size={13} strokeWidth={2.4} />
                <span>{Math.abs(card.growth)}%</span>
              </div>
              <span className="font-semibold text-muted text-[10px] truncate">{card.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
