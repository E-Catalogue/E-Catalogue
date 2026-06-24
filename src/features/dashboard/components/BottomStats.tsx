import { Car, BadgeCheck, Wrench, ReceiptText, Bookmark, Hourglass, Clock, Wallet, type LucideIcon } from 'lucide-react';
import { DASHBOARD_STATS } from '@/data/mock';
import { formatCurrency } from '@/core/utils/format';

const STATS: { icon: LucideIcon; label: string; value: string; color: string }[] = [
  { icon: Car, label: 'Total Unit', value: `${DASHBOARD_STATS.totalStock} Unit`, color: 'text-primary' },
  { icon: BadgeCheck, label: 'Ready Stock', value: `${DASHBOARD_STATS.readyStock} Unit`, color: 'text-accent-green' },
  { icon: Wrench, label: 'Rekondisi', value: `${DASHBOARD_STATS.rekondisi} Unit`, color: 'text-accent-orange' },
  { icon: ReceiptText, label: 'Sold (Bln Ini)', value: `${DASHBOARD_STATS.soldThisMonth} Unit`, color: 'text-accent-blue' },
  { icon: Bookmark, label: 'Booked', value: `${DASHBOARD_STATS.booked} Unit`, color: 'text-accent-purple' },
  { icon: Hourglass, label: 'Pending', value: `${DASHBOARD_STATS.pending} Unit`, color: 'text-accent-amber' },
  { icon: Clock, label: 'Avg Days (Stock)', value: `${DASHBOARD_STATS.avgDaysInStock} Hari`, color: 'text-accent-teal' },
  { icon: Wallet, label: 'Total Value', value: formatCurrency(DASHBOARD_STATS.totalValue, { compact: true }), color: 'text-primary' },
];

export const BottomStats = () => (
  <div className="bg-surface rounded-2xl border border-border shadow-card grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 divide-y sm:divide-y-0 divide-divider">
    {STATS.map((s, i) => {
      const Icon = s.icon;
      return (
        <div key={s.label} className={`flex items-center gap-3 p-4 ${i !== STATS.length - 1 ? 'xl:border-r border-divider' : ''}`}>
          <Icon size={22} className={`${s.color} shrink-0`} strokeWidth={2.2} />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted truncate">{s.label}</p>
            <p className="text-sm font-extrabold text-ink mt-0.5">{s.value}</p>
          </div>
        </div>
      );
    })}
  </div>
);
