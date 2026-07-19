import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  CalendarDays,
  Car,
  Clock,
  CreditCard,
  DollarSign,
  Layers,
  Share2,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { formatCurrency } from '@/core/utils/format';
import { dashboardApi } from './dashboard.api';
import type { DashboardPeriodType } from './dashboard.types';
import { AgingStock } from './components/AgingStock';
import { LeadSources } from './components/LeadSources';
import { SalesChart } from './components/SalesChart';
import { SalesPerformance } from './components/SalesPerformance';
import { StatCard } from './components/StatCard';
import { TopSelling } from './components/TopSelling';

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const currentYear = () => String(new Date().getFullYear());

const periodLabel = {
  monthly: 'Bulanan',
  yearly: 'Tahunan',
  yearToDate: 'Year to Date',
} satisfies Record<DashboardPeriodType, string>;

const periodTypeOptions: DashboardPeriodType[] = ['monthly', 'yearToDate', 'yearly'];

const asPct = (value: number) => Math.max(0, Math.min(Math.round(value), 999));

export const DashboardPage = () => {
  const [tipePeriode, setTipePeriode] = useState<DashboardPeriodType>('monthly');
  const [period, setPeriod] = useState(currentMonth());

  const normalizedPeriod = useMemo(() => {
    if (tipePeriode === 'monthly') return period.includes('-') ? period : currentMonth();
    return period.slice(0, 4) || currentYear();
  }, [period, tipePeriode]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-overview', tipePeriode, normalizedPeriod],
    queryFn: () => dashboardApi.overview({ tipePeriode, period: normalizedPeriod }),
  });

  const onPeriodTypeChange = (value: DashboardPeriodType) => {
    setTipePeriode(value);
    setPeriod(value === 'monthly' ? currentMonth() : currentYear());
  };

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto rounded-2xl border border-border bg-surface p-6 text-sm font-semibold text-muted">
        Memuat dashboard...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-[1600px] mx-auto rounded-2xl border border-semantic-error/30 bg-semantic-error/10 p-6 text-sm font-semibold text-semantic-error">
        Dashboard gagal dimuat{error instanceof Error ? `: ${error.message}` : '.'}
      </div>
    );
  }

  const { summary, inventory, charts } = data;
  const targetUnitPct = summary.targetUnit > 0 ? asPct((summary.unitSold / summary.targetUnit) * 100) : 0;
  const targetRevenuePct = summary.targetRevenue > 0 ? asPct((summary.revenue / summary.targetRevenue) * 100) : 0;
  const chartYear = data.period.period.slice(0, 4);
  const topSales = charts.salesPerformance[0];
  const topSelling = charts.topSelling[0];
  const leadSource = charts.leadSources[0];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-float-up pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border shadow-card">
        <div>
          <h1 className="text-lg font-extrabold text-ink">Dashboard Executive</h1>
          <p className="text-[12px] font-semibold text-muted">
            Periode {data.period.label}. Data diambil dari transaksi penjualan, kas, stok, dan lead.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex rounded-xl border border-border bg-surface-soft p-1">
            {periodTypeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onPeriodTypeChange(option)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors ${
                  tipePeriode === option ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'
                }`}
              >
                {periodLabel[option]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-3 py-2 text-[12px] font-bold text-ink">
            <CalendarDays size={15} className="text-primary" />
            <input
              type={tipePeriode === 'monthly' ? 'month' : 'number'}
              min={tipePeriode === 'monthly' ? undefined : 2000}
              max={tipePeriode === 'monthly' ? undefined : 2100}
              value={normalizedPeriod}
              onChange={(event) => setPeriod(event.target.value)}
              className="bg-transparent outline-none w-32 font-bold"
            />
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-primary" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">1. Metrik Keuangan & Arus Kas</h2>
          </div>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">{periodLabel[tipePeriode]}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            color="green"
            label="Total Omzet"
            value={formatCurrency(summary.revenue, { compact: true })}
            trend={{ value: summary.trend.revenue, label: `vs ${data.period.previousLabel}` }}
            progress={{ percent: targetRevenuePct, label: 'Pencapaian Target Omzet' }}
            details={[
              { label: 'Target Omzet', value: formatCurrency(summary.targetRevenue, { compact: true }) },
              { label: 'Sisa Target', value: formatCurrency(Math.max(summary.targetRevenue - summary.revenue, 0), { compact: true }), color: 'text-accent-amber' },
              { label: 'Cash In', value: formatCurrency(summary.cashIn, { compact: true }) },
            ]}
          />
          <StatCard
            icon={Trophy}
            color="orange"
            label="Profit Bersih Praktis"
            value={formatCurrency(summary.netProfit, { compact: true })}
            trend={{ value: summary.trend.netProfit, label: `vs ${data.period.previousLabel}` }}
            subtitle={{ text: 'Margin bersih:', highlight: `${summary.margin}% dari omzet` }}
            details={[
              { label: 'Gross Profit', value: formatCurrency(summary.grossProfit, { compact: true }) },
              { label: 'HPP', value: formatCurrency(summary.hpp, { compact: true }) },
              { label: 'Expense', value: formatCurrency(summary.expense, { compact: true }), color: 'text-semantic-error' },
            ]}
          />
          <StatCard
            icon={Wallet}
            color="teal"
            label="Cash Flow & Kas Tersedia"
            value={formatCurrency(summary.availableCash, { compact: true })}
            trend={{ value: summary.trend.cash, label: `net flow vs ${data.period.previousLabel}` }}
            subtitle={{ text: 'Arus kas bersih:', highlight: formatCurrency(summary.netCashFlow, { compact: true }) }}
            details={[
              { label: 'Kas Masuk', value: formatCurrency(summary.cashIn, { compact: true }), color: 'text-accent-green' },
              { label: 'Kas Keluar', value: formatCurrency(summary.cashOut, { compact: true }), color: 'text-semantic-error' },
              { label: 'Net Cash Flow', value: formatCurrency(summary.netCashFlow, { compact: true }) },
            ]}
          />
          <StatCard
            icon={CreditCard}
            color="red"
            label="Total Pengeluaran"
            value={formatCurrency(summary.expense, { compact: true })}
            trend={{ value: summary.trend.expense, label: `vs ${data.period.previousLabel}` }}
            subtitle={{ text: 'Rasio expense:', highlight: `${summary.revenue > 0 ? ((summary.expense / summary.revenue) * 100).toFixed(1) : 0}% dari omzet` }}
            details={[
              { label: 'Operasional + Payroll', value: formatCurrency(summary.expense, { compact: true }) },
              { label: 'Cash Out Aktual', value: formatCurrency(summary.cashOut, { compact: true }) },
              { label: 'Selisih cash out', value: formatCurrency(Math.max(summary.cashOut - summary.expense, 0), { compact: true }) },
            ]}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <Car size={16} className="text-accent-blue" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">2. Inventaris & Sales Pipeline</h2>
          </div>
          <span className="text-[11px] font-bold text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-lg">Showroom Assets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            color="purple"
            label="Valuasi Stok Aktif"
            value={formatCurrency(inventory.totalValue, { compact: true })}
            subtitle={{ text: 'Total stok aktif:', highlight: `${inventory.totalStock} unit` }}
            details={[
              { label: 'Ready Stock', value: `${inventory.readyStock} Unit`, color: 'text-accent-green' },
              { label: 'Hold/Booked', value: `${inventory.holdStock} Unit`, color: 'text-accent-blue' },
              { label: 'Inventory/Rekondisi', value: `${inventory.inventoryStock} Unit`, color: 'text-accent-orange' },
            ]}
          />
          <StatCard
            icon={Layers}
            color="blue"
            label="Unit Terjual"
            value={`${summary.unitSold} / ${summary.targetUnit}`}
            unit="Unit"
            trend={{ value: summary.trend.unitSold, label: `vs ${data.period.previousLabel}` }}
            progress={{ percent: targetUnitPct, label: 'Pencapaian Target Unit' }}
            details={[
              { label: 'Sisa Target', value: `${Math.max(summary.targetUnit - summary.unitSold, 0)} Unit` },
              { label: 'Top Model', value: topSelling ? `${topSelling.merek} ${topSelling.tipe}` : '-' },
              { label: 'Konversi Lead', value: `${summary.conversionRate}%` },
            ]}
          />
          <StatCard
            icon={Clock}
            color="teal"
            label="Rata-Rata Umur Stok"
            value={`${inventory.averageAge} Hari`}
            subtitle={{ text: 'Distribusi stok:', highlight: `${inventory.healthyCount} sehat` }}
            progress={{ percent: asPct((inventory.averageAge / 90) * 100), label: 'Batas monitor 90 hari' }}
            details={[
              { label: 'Sehat (<30 Hari)', value: `${inventory.healthyCount} Unit`, color: 'text-accent-green' },
              { label: 'Perhatian (30-60 Hari)', value: `${inventory.warningCount} Unit`, color: 'text-accent-amber' },
              { label: 'Kritis (>60 Hari)', value: `${inventory.criticalCount} Unit`, color: 'text-semantic-error' },
            ]}
          />
          <StatCard
            icon={Users}
            color="orange"
            label="Lead & Test Drive"
            value={`${summary.totalLeads} Lead`}
            trend={{ value: summary.trend.leads, label: `vs ${data.period.previousLabel}` }}
            subtitle={{ text: 'Sumber terbesar:', highlight: leadSource ? leadSource.source : '-' }}
            details={[
              { label: 'Test Drive', value: `${summary.totalTestDrives} Jadwal`, color: 'text-accent-blue' },
              { label: 'Top Sales', value: topSales?.name || '-' },
              { label: 'Konversi Deal', value: `${summary.conversionRate}%`, color: 'text-accent-green' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <SectionCard
            title={`Grafik Penjualan Bulanan (${chartYear})`}
            icon={<BarChart3 size={16} />}
            className="flex-1 flex flex-col"
            bodyClassName="flex-1 flex flex-col justify-center"
          >
            <SalesChart data={charts.monthlySales} year={chartYear} />
          </SectionCard>
        </div>
        <SectionCard title="Target vs Realisasi" icon={<Target size={16} />} className="flex flex-col">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span className="text-muted">Unit</span>
                <span className="text-primary">{targetUnitPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-surface-soft overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(targetUnitPct, 100)}%` }} />
              </div>
              <div className="mt-1 text-[11px] font-bold text-ink">{summary.unitSold} / {summary.targetUnit} Unit</div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span className="text-muted">Omzet</span>
                <span className="text-accent-green">{targetRevenuePct}%</span>
              </div>
              <div className="h-3 rounded-full bg-surface-soft overflow-hidden">
                <div className="h-full rounded-full bg-accent-green" style={{ width: `${Math.min(targetRevenuePct, 100)}%` }} />
              </div>
              <div className="mt-1 text-[11px] font-bold text-ink">
                {formatCurrency(summary.revenue, { compact: true })} / {formatCurrency(summary.targetRevenue, { compact: true })}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <SectionCard title="Top Selling Mobil" icon={<Trophy size={16} />} action={<span className="text-[11px] font-bold text-muted">{data.period.label}</span>}>
          <TopSelling data={charts.topSelling} totalUnit={summary.unitSold} />
        </SectionCard>
        <SectionCard title="Aging Stock" icon={<Clock size={16} />} action={<span className="text-[11px] font-bold text-semantic-error">Urutan Terlama</span>}>
          <AgingStock data={charts.agingStock} summary={{ ...inventory }} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <SectionCard title="Performa Sales" icon={<Users size={16} />} action={<span className="text-[11px] font-bold text-muted">Berdasarkan Unit Deal</span>}>
          <SalesPerformance data={charts.salesPerformance} targetUnit={summary.targetUnit} />
        </SectionCard>
        <SectionCard title="Sumber Leads / Prospek" icon={<Share2 size={16} />} className="flex flex-col" bodyClassName="flex-1 flex items-center justify-center">
          <LeadSources data={charts.leadSources} />
        </SectionCard>
      </div>

      <SectionCard title="Ringkasan Perbandingan" icon={<ArrowLeftRight size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: 'Trend Unit', value: `${summary.trend.unitSold}%`, icon: Layers },
            { label: 'Trend Omzet', value: `${summary.trend.revenue}%`, icon: DollarSign },
            { label: 'Trend Profit', value: `${summary.trend.netProfit}%`, icon: Trophy },
            { label: 'Stok Kritis', value: `${inventory.criticalCount} Unit`, icon: AlertTriangle },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-surface-soft p-3">
              <div className="flex items-center gap-2 text-muted">
                <item.icon size={14} />
                <span className="text-[11px] font-bold uppercase">{item.label}</span>
              </div>
              <div className="mt-2 text-lg font-extrabold text-ink">{item.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
