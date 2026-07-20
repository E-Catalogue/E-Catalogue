import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Building2,
  CalendarDays,
  Car,
  CreditCard,
  DollarSign,
  Landmark,
  Layers,
  RefreshCw,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { StatCardSkeleton, TableSkeleton } from '@/shared/components/ui/Skeleton';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { formatCurrency } from '@/core/utils/format';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useBranches } from '@/features/master/master.hooks';
import { RequirePermission } from '@/features/auth/permissions';
import { dashboardApi } from './dashboard.api';
import {
  isDashboardConsolidated,
  type DashboardBranchBreakdown,
  type DashboardOverview,
} from './dashboard.types';
import { SalesChart } from './components/SalesChart';
import { StatCard } from './components/StatCard';

const MONTH_LABEL_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatPeriodLabel = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  const label = MONTH_LABEL_LONG[(month || 1) - 1] ?? period;
  return `${label} ${year}`;
};

const asPct = (value: number) => Math.max(0, Math.min(Math.round(value), 999));

const DashboardPageInner = () => {
  const [period, setPeriod] = useState(currentMonth());
  const { isOwner, selectedBranchId, setSelectedBranchId, branchHeader, branchKey } = useBranchScope();
  const { data: branchesResp } = useBranches({ page: 1, limit: 100 });
  const branches = branchesResp?.data ?? [];

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-overview', period, branchKey],
    queryFn: () => dashboardApi.overview({ period }, branchHeader),
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-float-up pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border shadow-card">
        <div>
          <h1 className="text-lg font-extrabold text-ink">Dashboard Executive</h1>
          <p className="text-[12px] font-semibold text-muted">
            Periode {formatPeriodLabel(period)}. Data diambil dari transaksi penjualan, kas, stok, dan lead.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {isOwner && (
            <label className="flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-3 py-2 text-[12px] font-bold text-ink">
              <Building2 size={15} className="text-primary" />
              <select
                value={selectedBranchId ?? ''}
                onChange={(event) => setSelectedBranchId(event.target.value || null)}
                className="bg-transparent outline-none font-bold max-w-[160px]"
              >
                <option value="">Semua Cabang</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.nama}</option>
                ))}
              </select>
            </label>
          )}
          <label className="flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-3 py-2 text-[12px] font-bold text-ink">
            <CalendarDays size={15} className="text-primary" />
            <input
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value || currentMonth())}
              className="bg-transparent outline-none w-32 font-bold"
            />
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-8">
          <StatCardSkeleton count={4} />
          <StatCardSkeleton count={3} />
          <TableSkeleton rows={4} cols={4} />
        </div>
      )}

      {isError && !isLoading && (
        <div className="max-w-[1600px] mx-auto rounded-2xl border border-semantic-error/30 bg-semantic-error/10 p-6 text-sm font-semibold text-semantic-error flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>Dashboard gagal dimuat{error instanceof Error ? `: ${error.message}` : '.'}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-semantic-error text-white text-[12px] font-extrabold hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={13} /> Coba Lagi
          </button>
        </div>
      )}

      {data && !isLoading && !isError && (
        <DashboardContent data={data} isFetching={isFetching} />
      )}
    </div>
  );
};

const DashboardContent = ({ data, isFetching }: { data: DashboardOverview; isFetching: boolean }) => {
  const consolidated = isDashboardConsolidated(data);
  const { summary, inventory } = data;

  const targetUnitPct = summary.targetUnit > 0 ? asPct((summary.unitSold / summary.targetUnit) * 100) : 0;
  const targetRevenuePct = summary.targetRevenue > 0 ? asPct((summary.revenue / summary.targetRevenue) * 100) : 0;
  const marginPct = summary.revenue > 0 ? Number(((summary.netProfit / summary.revenue) * 100).toFixed(1)) : 0;
  const expenseRatioPct = summary.revenue > 0 ? ((summary.expense / summary.revenue) * 100).toFixed(1) : '0';

  const breakdownColumns: Column<DashboardBranchBreakdown>[] = [
    { header: 'Cabang', cell: (row) => (
      <div>
        <span className="font-extrabold text-ink">{row.branch.nama}</span>
        <span className="text-[10px] font-bold text-muted ml-1.5">({row.branch.code})</span>
      </div>
    ) },
    { header: 'Unit Terjual', align: 'right', cell: (row) => `${row.summary.unitSold} / ${row.summary.targetUnit}` },
    { header: 'Omzet', align: 'right', cell: (row) => formatCurrency(row.summary.revenue, { compact: true }) },
    { header: 'Profit Bersih', align: 'right', cell: (row) => formatCurrency(row.summary.netProfit, { compact: true }) },
    { header: 'Net Cash Flow', align: 'right', cell: (row) => formatCurrency(row.summary.netCashFlow, { compact: true }) },
    { header: 'Stok Aktif', align: 'right', cell: (row) => `${row.inventory.totalStock} Unit` },
  ];

  return (
    <div className={`space-y-8 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
      {consolidated && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-[12px] font-bold text-primary flex items-center gap-2">
          <Landmark size={15} />
          Menampilkan konsolidasi seluruh cabang. Arus kas konsolidasi mengecualikan transfer antar-cabang.
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-primary" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">1. Metrik Keuangan &amp; Arus Kas</h2>
          </div>
          {!consolidated && (
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">{data.branch.nama}</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            color="green"
            label="Total Omzet"
            value={formatCurrency(summary.revenue, { compact: true })}
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
            label="Profit Bersih Perusahaan"
            value={formatCurrency(summary.netProfit, { compact: true })}
            subtitle={{ text: 'Margin bersih:', highlight: `${marginPct}% dari omzet` }}
            details={[
              { label: 'Gross Profit', value: formatCurrency(summary.grossProfit, { compact: true }) },
              { label: 'HPP', value: formatCurrency(summary.hpp, { compact: true }) },
              { label: 'Expense', value: formatCurrency(summary.expense, { compact: true }), color: 'text-semantic-error' },
            ]}
          />
          <StatCard
            icon={Wallet}
            color="teal"
            label="Arus Kas Bersih"
            value={formatCurrency(summary.netCashFlow, { compact: true })}
            subtitle={{ text: 'Kas masuk vs keluar:', highlight: `${formatCurrency(summary.cashIn, { compact: true })} / ${formatCurrency(summary.cashOut, { compact: true })}` }}
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
            subtitle={{ text: 'Rasio expense:', highlight: `${expenseRatioPct}% dari omzet` }}
            details={[
              { label: 'Operasional', value: formatCurrency(summary.operationalExpense, { compact: true }) },
              { label: 'Payroll', value: formatCurrency(summary.payrollExpense, { compact: true }) },
              { label: 'Rekondisi', value: formatCurrency(summary.reconditioningCost, { compact: true }) },
            ]}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <Car size={16} className="text-accent-blue" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">2. Inventaris &amp; Sales Pipeline</h2>
          </div>
          <span className="text-[11px] font-bold text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-lg">Showroom Assets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            progress={{ percent: targetUnitPct, label: 'Pencapaian Target Unit' }}
            details={[
              { label: 'Sisa Target', value: `${Math.max(summary.targetUnit - summary.unitSold, 0)} Unit` },
              { label: 'Status Target', value: summary.targetStatus ?? '-' },
              { label: 'Konversi Lead', value: `${summary.conversionRate}%` },
            ]}
          />
          <StatCard
            icon={Users}
            color="orange"
            label="Lead & Test Drive"
            value={`${summary.totalLeads} Lead`}
            subtitle={{ text: 'Test drive terjadwal:', highlight: `${summary.totalTestDrives} jadwal` }}
            details={[
              { label: 'Test Drive', value: `${summary.totalTestDrives} Jadwal`, color: 'text-accent-blue' },
              { label: 'Unit Terjual', value: `${summary.unitSold} Unit` },
              { label: 'Konversi Deal', value: `${summary.conversionRate}%`, color: 'text-accent-green' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {!consolidated && (
          <div className="lg:col-span-2 flex flex-col">
            <SectionCard
              title={`Grafik Penjualan Bulanan (${data.period.slice(0, 4)})`}
              icon={<BarChart3 size={16} />}
              className="flex-1 flex flex-col"
              bodyClassName="flex-1 flex flex-col justify-center"
            >
              <SalesChart data={data.charts.monthlySales} year={data.period.slice(0, 4)} />
            </SectionCard>
          </div>
        )}
        <SectionCard title="Target vs Realisasi" icon={<Target size={16} />} className={consolidated ? 'lg:col-span-3 flex flex-col' : 'flex flex-col'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <SectionCard title="Distribusi Profit & Provisi" icon={<Landmark size={16} />} action={<span className="text-[11px] font-bold text-muted">Dari Settlement Terfinalisasi</span>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Profit Investor', value: summary.investorProfit, icon: Users },
            { label: 'Fixed Return Accrued', value: summary.fixedReturnExpense, icon: Wallet },
            { label: 'Provisi Pajak', value: summary.taxProvision, icon: CreditCard },
            { label: 'Insentif Sales Accrued', value: summary.salesIncentiveAccrued, icon: Trophy },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-surface-soft p-3">
              <div className="flex items-center gap-2 text-muted">
                <item.icon size={14} />
                <span className="text-[11px] font-bold uppercase">{item.label}</span>
              </div>
              <div className="mt-2 text-lg font-extrabold text-ink">{formatCurrency(item.value, { compact: true })}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {consolidated && (
        <SectionCard title="Breakdown per Cabang" icon={<Building2 size={16} />} bodyClassName="p-0 md:p-0">
          {data.breakdown.length === 0 ? (
            <p className="p-5 text-[12px] font-semibold text-muted">Belum ada cabang aktif.</p>
          ) : (
            <DataTable columns={breakdownColumns} data={data.breakdown} rowKey={(row) => row.branch.id} />
          )}
        </SectionCard>
      )}
    </div>
  );
};

export const DashboardPage = () => (
  <RequirePermission code="DASHBOARD_READ">
    <DashboardPageInner />
  </RequirePermission>
);
