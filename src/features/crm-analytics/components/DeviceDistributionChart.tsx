import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Smartphone, Monitor, Tablet, Sparkles } from 'lucide-react';
import type { CrmAnalyticsDevices } from '../crmAnalytics.types';
import { formatNumber } from '@/core/utils/format';

interface DeviceDistributionChartProps {
  devices: CrmAnalyticsDevices;
}

export const DeviceDistributionChart = ({ devices }: DeviceDistributionChartProps) => {
  const total = devices.mobile + devices.desktop + devices.tablet;
  const mobilePct = total > 0 ? Math.round((devices.mobile / total) * 100) : 0;
  const desktopPct = total > 0 ? Math.round((devices.desktop / total) * 100) : 0;
  const tabletPct = total > 0 ? 100 - mobilePct - desktopPct : 0;

  const items = [
    {
      label: 'Smartphone / Mobile',
      count: devices.mobile,
      pct: mobilePct,
      icon: Smartphone,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgLight: 'bg-primary/10',
    },
    {
      label: 'Komputer / Laptop',
      count: devices.desktop,
      pct: desktopPct,
      icon: Monitor,
      color: 'bg-accent-blue',
      textColor: 'text-accent-blue',
      bgLight: 'bg-accent-blue/10',
    },
    {
      label: 'Tablet / iPad',
      count: devices.tablet,
      pct: tabletPct,
      icon: Tablet,
      color: 'bg-accent-teal',
      textColor: 'text-accent-teal',
      bgLight: 'bg-accent-teal/10',
    },
  ];

  return (
    <SectionCard
      title="Perangkat Pengunjung"
      subtitle={`Total ${formatNumber(total)} sesi penjelajahan terdeteksi`}
      icon={<Smartphone size={18} />}
    >
      <div className="space-y-4">
        {/* Multi-segment stacked progress bar */}
        <div className="h-3.5 w-full rounded-full bg-surface-soft overflow-hidden flex border border-border p-0.5">
          {items.map(
            (item, idx) =>
              item.pct > 0 && (
                <div
                  key={idx}
                  style={{ width: `${item.pct}%` }}
                  className={`${item.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                  title={`${item.label}: ${item.pct}%`}
                />
              )
          )}
        </div>

        {/* Breakdown items */}
        <div className="space-y-3 pt-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-soft border border-border/80"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bgLight} ${item.textColor} flex items-center justify-center shrink-0`}>
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-ink">{item.label}</p>
                    <p className="text-[11px] font-semibold text-muted">
                      {formatNumber(item.count)} sesi
                    </p>
                  </div>
                </div>
                <span className={`text-base font-extrabold ${item.textColor}`}>{item.pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Insight note */}
        <div className="p-3 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-start gap-2.5 text-[11px] font-medium text-ink-soft">
          <Sparkles size={16} className="text-accent-amber shrink-0 mt-0.5" />
          <span>
            {mobilePct >= 60
              ? `Mayoritas (${mobilePct}%) calon pelanggan mengakses via smartphone. Tampilan navigasi floating navbar & tombol WhatsApp mobile sangat efektif mendorong konversi.`
              : 'Traffic terbagi seimbang antara pengguna desktop dan mobile showroom.'}
          </span>
        </div>
      </div>
    </SectionCard>
  );
};
