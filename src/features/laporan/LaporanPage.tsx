import { Download, TrendingUp, Car, Wallet, Percent } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { SalesChart } from '@/features/dashboard/components/SalesChart';
import { DASHBOARD_STATS, CONVERSION_RATE } from '@/data/mock';
import { useAppSelector } from '@/app/store';
import { formatCurrency, formatNumber } from '@/core/utils/format';

export const LaporanPage = () => {
  const units = useAppSelector((s) => s.data.units);
  // Penjualan per merek (dari unit terjual + ready sebagai ilustrasi).
  const byBrand = units.reduce<Record<string, number>>((acc, u) => {
    acc[u.brand] = (acc[u.brand] ?? 0) + 1;
    return acc;
  }, {});
  const brands = Object.entries(byBrand).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxBrand = Math.max(...brands.map(([, c]) => c));

  const summary = [
    { icon: Car, label: 'Unit Terjual', value: `${DASHBOARD_STATS.soldThisMonth} Unit`, color: 'bg-primary' },
    { icon: Wallet, label: 'Total Omzet', value: formatCurrency(DASHBOARD_STATS.omzet, { compact: true }), color: 'bg-accent-green' },
    { icon: TrendingUp, label: 'Nilai Inventory', value: formatCurrency(DASHBOARD_STATS.totalValue, { compact: true }), color: 'bg-accent-blue' },
    { icon: Percent, label: 'Konversi Lead', value: `${CONVERSION_RATE}%`, color: 'bg-accent-purple' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto  space-y-5">
      <PageHeader
        title="Laporan"
        description="Ringkasan performa penjualan & inventory"
        action={
          <button className="flex items-center gap-2 bg-ink text-white font-bold text-[13px] px-4 py-2.5 rounded-xl hover:bg-ink-soft transition-colors">
            <Download size={16} strokeWidth={2.5} /> Export PDF
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border shadow-card p-5">
            <div className={`w-11 h-11 rounded-xl ${s.color} text-white flex items-center justify-center mb-3`}>
              <s.icon size={21} strokeWidth={2.3} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{s.label}</p>
            <p className="text-xl font-extrabold text-ink mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Tren Penjualan (Bulan Ini)" className="lg:col-span-2">
          <SalesChart />
        </SectionCard>

        <SectionCard title="Stok per Merek">
          <div className="space-y-3.5">
            {brands.map(([brand, count]) => (
              <div key={brand}>
                <div className="flex items-center justify-between text-[12px] font-bold mb-1">
                  <span className="text-ink">{brand}</span>
                  <span className="text-muted">{formatNumber(count)} unit</span>
                </div>
                <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(count / maxBrand) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
