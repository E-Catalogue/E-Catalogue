import {
  ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown,
  Landmark, ShieldCheck, ArrowRightLeft, Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { RequirePermission } from '@/features/auth/permissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useCashDashboard, useCashTransactions } from '@/features/finance/finance.hooks';
import { isConsolidatedCashDashboard, type CashTransaction } from '@/features/finance/types';

const ledgerColumns: Column<CashTransaction>[] = [
  { header: 'Tanggal', cell: (t) => formatDate(t.transactionDate) },
  { header: 'Akun Kas / Bank', cell: (t) => <span className="font-bold text-ink">{t.cashAccount?.name ?? t.cashAccountId}</span> },
  { header: 'Sumber', cell: (t) => <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-surface-soft border border-border text-muted">{t.sourceType}</span> },
  { header: 'Keterangan', cell: (t) => <span className="font-extrabold text-ink break-words">{t.description || '-'}</span> },
  { header: 'Tipe', align: 'center', cell: (t) => (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
      t.type === 'IN' ? 'bg-accent-green/15 text-accent-green' : 'bg-semantic-error/15 text-semantic-error'
    }`}>
      {t.type === 'IN' ? 'MASUK' : 'KELUAR'}
    </span>
  )},
  { header: 'Nominal', align: 'right', cell: (t) => (
    <span className={`font-extrabold ${t.type === 'IN' ? 'text-accent-green' : 'text-semantic-error'}`}>
      {t.type === 'IN' ? '+' : '-'} {formatCurrency(t.amount)}
    </span>
  )},
];

const DashboardCashflowPageInner = () => {
  const { branchKey, branchHeader } = useBranchScope();
  const dashboard = useCashDashboard(branchKey, {}, branchHeader);
  const ledger = useCashTransactions(branchKey, { page: 1, limit: 10 }, branchHeader);

  const summary = dashboard.data ? (isConsolidatedCashDashboard(dashboard.data) ? dashboard.data.consolidated : dashboard.data.summary) : undefined;
  const accounts = dashboard.data?.accounts ?? [];
  const totalIn = summary?.totalIn ?? 0;
  const totalOut = summary?.totalOut ?? 0;
  const netCash = totalIn - totalOut;
  const endingBal = summary?.endingBalance ?? 0;

  const kpiCards = [
    { label: 'Total Kas Masuk (Inflow)', value: formatCurrency(totalIn, { compact: true }), icon: ArrowDownLeft, color: 'bg-accent-green' },
    { label: 'Total Kas Keluar (Outflow)', value: formatCurrency(totalOut, { compact: true }), icon: ArrowUpRight, color: 'bg-semantic-error' },
    { label: 'Net Cashflow (Surplus Bersih)', value: `${netCash >= 0 ? '+' : ''}${formatCurrency(netCash, { compact: true })}`, icon: netCash >= 0 ? TrendingUp : TrendingDown, color: 'bg-primary' },
    { label: 'Total Saldo Likuiditas (Bank & Kas)', value: formatCurrency(endingBal, { compact: true }), icon: Landmark, color: 'bg-accent-blue' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-float-up pb-12">
      <PageHeader
        title="Dashboard Cashflow"
        description="Monitoring arus kas masuk, saldo rekening, dan transaksi kas terkini — data real-time dari akun kas aktif"
      />

      {dashboard.isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : dashboard.isError ? (
        <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data cashflow.</div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-[12px] font-bold text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-xl border border-accent-green/20 w-fit">
            <ShieldCheck size={16} />
            <span>{netCash >= 0 ? 'Status Likuiditas: Surplus' : 'Status Likuiditas: Defisit'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {kpiCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[12px] font-extrabold uppercase tracking-wider text-muted break-words">{c.label}</span>
                    <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-ink break-words">{c.value}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                <Landmark size={18} className="text-primary" /> Posisi Rekening
              </h3>
              {accounts.length === 0 ? (
                <p className="text-center py-8 text-[12px] text-muted border border-dashed border-border rounded-xl">Belum ada akun kas dengan transaksi pada periode ini.</p>
              ) : (
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="p-4 rounded-2xl bg-surface border border-border shadow-sm space-y-2.5">
                      <div className="flex items-start justify-between">
                        <h4 className="text-[13px] font-extrabold text-ink">{acc.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          acc.type === 'BANK' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-amber/10 text-accent-amber'
                        }`}>
                          {acc.type}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-divider/60">
                        <span className="text-[11px] font-bold text-muted">Saldo:</span>
                        <span className="text-lg font-extrabold text-primary">{formatCurrency(acc.endingBalance)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-accent-green" /> Transaksi Kas Terkini
              </h3>
              <SectionCard className="overflow-hidden shadow-card" bodyClassName="p-0 md:p-0">
                {(ledger.data?.data ?? []).length === 0 ? (
                  <p className="text-center py-8 text-[12px] text-muted">Belum ada transaksi.</p>
                ) : (
                  <DataTable columns={ledgerColumns} data={ledger.data?.data ?? []} rowKey={(t) => t.id} />
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const DashboardCashflowPage = () => (
  <RequirePermission code="CASH_TRANSACTION_READ">
    <DashboardCashflowPageInner />
  </RequirePermission>
);
