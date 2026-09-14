import { useState } from 'react';
import { RequirePermission } from '@/features/auth/permissions';
import {
  useCrmAnalyticsOverview,
  useCrmAnalyticsTrafficChart,
  useCrmAnalyticsTopUnits,
} from './crmAnalytics.hooks';
import { AnalyticsKpiCards } from './components/AnalyticsKpiCards';
import { TrafficActivityChart } from './components/TrafficActivityChart';
import { DeviceDistributionChart } from './components/DeviceDistributionChart';
import { TopUnitsSection } from './components/TopUnitsSection';
import { VisitorLogsTable } from './components/VisitorLogsTable';
import { StatCardSkeleton } from '@/shared/components/ui/Skeleton';
import { RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

type PresetFilter = 'thisMonth' | '7days' | '30days' | 'today';

const PRESET_OPTIONS: { value: PresetFilter; label: string }[] = [
  { value: 'thisMonth', label: 'Bulan Ini' },
  { value: '7days', label: '7 Hari Terakhir' },
  { value: '30days', label: '30 Hari Terakhir' },
  { value: 'today', label: 'Hari Ini' },
];

const getFilterRange = (preset: PresetFilter) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (preset === 'today') {
    return { dateFrom: todayStr, dateTo: todayStr, period: undefined };
  }
  if (preset === '7days') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { dateFrom: d.toISOString().split('T')[0], dateTo: todayStr, period: undefined };
  }
  if (preset === '30days') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { dateFrom: d.toISOString().split('T')[0], dateTo: todayStr, period: undefined };
  }

  // thisMonth
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return { period: `${y}-${m}`, dateFrom: undefined, dateTo: undefined };
};

const CrmAnalyticsPageInner = () => {
  const [preset, setPreset] = useState<PresetFilter>('thisMonth');
  const filterParams = getFilterRange(preset);

  const overviewQuery = useCrmAnalyticsOverview(filterParams);
  const trafficChartQuery = useCrmAnalyticsTrafficChart(filterParams);
  const topUnitsQuery = useCrmAnalyticsTopUnits({ ...filterParams, limit: 5 });

  const isRefreshing =
    overviewQuery.isFetching || trafficChartQuery.isFetching || topUnitsQuery.isFetching;

  const handleRefresh = () => {
    overviewQuery.refetch();
    trafficChartQuery.refetch();
    topUnitsQuery.refetch();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-float-up">
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-extrabold text-ink">
              Dashboard Analisis Pelanggan (CRM)
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              <Sparkles size={12} /> Real-Time Tracking
            </span>
          </div>
          <p className="text-[12px] font-semibold text-muted mt-1">
            Intelijen interaksi pengunjung, minat unit kendaraan, dan konversi calon pembeli ke kontak sales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Switcher */}
          <div className="flex items-center gap-1 bg-surface-soft p-1 rounded-xl border border-border">
            <Calendar size={14} className="text-muted ml-2 mr-1 shrink-0" />
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPreset(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  preset === opt.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Memuat...' : 'Segarkan'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {overviewQuery.isLoading ? (
        <StatCardSkeleton count={5} />
      ) : overviewQuery.data ? (
        <AnalyticsKpiCards overview={overviewQuery.data} />
      ) : overviewQuery.isError ? (
        <div className="p-6 rounded-2xl bg-semantic-error/10 border border-semantic-error/20 text-semantic-error text-sm font-semibold">
          Gagal memuat ringkasan KPI pengunjung.
        </div>
      ) : null}

      {/* Middle: Traffic Chart & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          {trafficChartQuery.isLoading ? (
            <div className="h-72 rounded-2xl bg-surface border border-border animate-pulse" />
          ) : trafficChartQuery.data ? (
            <TrafficActivityChart data={trafficChartQuery.data} />
          ) : null}
        </div>

        <div>
          {overviewQuery.data ? (
            <DeviceDistributionChart devices={overviewQuery.data.devices} />
          ) : (
            <div className="h-72 rounded-2xl bg-surface border border-border animate-pulse" />
          )}
        </div>
      </div>

      {/* Top Viewed Cars */}
      <div>
        {topUnitsQuery.isLoading ? (
          <div className="h-64 rounded-2xl bg-surface border border-border animate-pulse" />
        ) : (
          <TopUnitsSection units={topUnitsQuery.data || []} />
        )}
      </div>

      {/* Visitor Logs Table */}
      <VisitorLogsTable
        period={filterParams.period}
        dateFrom={filterParams.dateFrom}
        dateTo={filterParams.dateTo}
      />
    </div>
  );
};

export const CrmAnalyticsPage = () => (
  <RequirePermission code="CRM_ANALYTICS_READ">
    <CrmAnalyticsPageInner />
  </RequirePermission>
);
