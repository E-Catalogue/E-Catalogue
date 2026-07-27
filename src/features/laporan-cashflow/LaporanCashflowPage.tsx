import { useState } from 'react';
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CalendarDays, Landmark,
  Loader2, TrendingDown, TrendingUp, Wallet,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DateField } from '@/shared/components/ui/DateField';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useCashFlowReport } from '@/features/finance/finance.hooks';
import { RequirePermission } from '@/features/auth/permissions';
import type { CashFlowReportRow } from '@/features/finance/types';

const idr = (value: number) => formatCurrency(Math.abs(value), { compact: true });
const signedIdr = (value: number) => value > 0 ? `+${idr(value)}` : value < 0 ? `−${idr(value)}` : idr(value);

const FlowCard = ({
  label, value, caption, tone, icon: Icon,
}: {
  label: string; value: string; caption: string; tone: 'positive' | 'negative' | 'neutral'; icon: typeof Wallet;
}) => {
  const styles = {
    positive: 'text-accent-green bg-accent-green/10',
    negative: 'text-semantic-error bg-semantic-error/10',
    neutral: 'text-accent-blue bg-accent-blue/10',
  };
  return (
    <div className="rounded-2xl p-5 border border-border bg-surface shadow-card flex flex-col justify-between min-h-36">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
          <h3 className={`text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 ${styles[tone].split(' ')[0]}`}>{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${styles[tone]}`}><Icon size={24} strokeWidth={2.5} /></div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed font-semibold text-muted">{caption}</p>
    </div>
  );
};

const ReportRows = ({ rows }: { rows: CashFlowReportRow[] }) => (
  <div className="divide-y divide-divider bg-surface">
    {rows.map((row) => (
      <div key={row.sourceType} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3.5 items-center">
        <span className="font-bold text-ink text-sm">{row.label}</span>
        <div className="flex flex-wrap justify-start md:justify-end gap-x-5 gap-y-2 text-right">
          {row.cashIn > 0 && <div><p className="text-[10px] uppercase tracking-wide font-extrabold text-muted">Masuk</p><p className="text-sm font-extrabold text-accent-green">{idr(row.cashIn)}</p></div>}
          {row.cashOut > 0 && <div><p className="text-[10px] uppercase tracking-wide font-extrabold text-muted">Keluar</p><p className="text-sm font-extrabold text-semantic-error">{idr(row.cashOut)}</p></div>}
          <div className="min-w-24"><p className="text-[10px] uppercase tracking-wide font-extrabold text-muted">Bersih</p><p className={`text-sm font-extrabold ${row.netCash > 0 ? 'text-accent-green' : row.netCash < 0 ? 'text-semantic-error' : 'text-muted'}`}>{signedIdr(row.netCash)}</p></div>
        </div>
      </div>
    ))}
  </div>
);

const periodLabel = (dateFrom: string, dateTo: string) => {
  if (dateFrom && dateTo) return `${formatDate(dateFrom)} – ${formatDate(dateTo)}`;
  if (dateFrom) return `Sejak ${formatDate(dateFrom)}`;
  if (dateTo) return `Sampai ${formatDate(dateTo)}`;
  return 'Seluruh transaksi tercatat';
};

const LaporanCashflowPageInner = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { branchKey, branchHeader, isOwner, selectedBranchId } = useBranchScope();
  const report = useCashFlowReport(branchKey, { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }, branchHeader);
  const data = report.data;
  const summary = data?.summary;
  const accountTotal = data?.accounts.reduce((total, account) => total + account.endingBalance, 0) ?? 0;
  const netCash = summary?.netCash ?? 0;
  const netTone = netCash > 0 ? 'positive' : netCash < 0 ? 'negative' : 'neutral';
  const netStatus = netCash > 0 ? 'Kas bertambah' : netCash < 0 ? 'Kas berkurang' : 'Tidak ada perubahan kas';
  const scopeLabel = isOwner && !selectedBranchId ? 'Seluruh cabang' : data?.accounts[0]?.branch?.nama ?? 'Cabang terpilih';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-float-up pb-12">
      <PageHeader title="Laporan Arus Kas" description="Ringkasan pergerakan kas dan saldo akun. Nilai arus kas tidak sama dengan laba atau rugi perusahaan." />

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-surface border border-border shadow-sm">
        <CalendarDays size={18} className="text-primary shrink-0" />
        <span className="text-sm font-extrabold text-ink shrink-0">Periode:</span>
        <DateField value={dateFrom} onChange={setDateFrom} wrapClass="w-44" clearable />
        <span className="text-muted text-sm">—</span>
        <DateField value={dateTo} onChange={setDateTo} wrapClass="w-44" clearable />
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-[12px] font-bold text-primary hover:underline">Reset</button>}
      </div>

      {report.isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
        : report.isError ? <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat laporan arus kas. Coba lagi beberapa saat.</div>
          : (
            <>
              <div className="rounded-2xl border border-border bg-surface px-4 py-3 flex flex-wrap gap-x-8 gap-y-2 text-[12px] font-semibold text-muted">
                <span>Periode aktif: <strong className="text-ink">{periodLabel(dateFrom, dateTo)}</strong></span>
                <span>Cakupan: <strong className="text-ink">{scopeLabel}</strong></span>
                <span>Data transaksi kas, bukan laporan laba rugi.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                <FlowCard label="Kas Masuk" value={idr(summary?.totalIn ?? 0)} caption="Penerimaan kas dari kegiatan eksternal; tidak termasuk transfer internal." tone="positive" icon={ArrowDownLeft} />
                <FlowCard label="Kas Keluar" value={idr(summary?.totalOut ?? 0)} caption="Pengeluaran kas untuk kegiatan eksternal; tidak termasuk transfer internal." tone="negative" icon={ArrowUpRight} />
                <FlowCard label="Arus Kas Bersih" value={signedIdr(netCash)} caption={`${netStatus}. Kas masuk − kas keluar; bukan laba/rugi.`} tone={netTone} icon={netCash < 0 ? TrendingDown : TrendingUp} />
                <FlowCard label="Saldo Akhir" value={idr(summary?.endingBalance ?? 0)} caption="Saldo awal periode + seluruh mutasi kas, termasuk transfer antar akun/cabang." tone="neutral" icon={Wallet} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <SectionCard title="Rincian Arus Kas" subtitle="Pergerakan kas menurut kegiatan. Transfer internal ditampilkan terpisah dan bukan pendapatan atau beban.">
                    {(data?.activities.length ?? 0) === 0 ? <p className="text-center py-10 text-[13px] font-semibold text-muted">Belum ada mutasi kas eksternal pada periode ini.</p> : (
                      <div className="space-y-5">
                        {data?.activities.map((activity) => <div key={activity.key} className="rounded-xl border border-border overflow-hidden"><div className="px-4 py-3 bg-surface-soft flex flex-wrap items-center justify-between gap-3"><div><p className="text-[12px] font-extrabold text-ink">{activity.label}</p><p className="mt-0.5 text-[11px] font-semibold text-muted">{activity.rows.length} kategori transaksi</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wide font-extrabold text-muted">Total arus bersih</p><p className={`text-sm font-extrabold ${activity.netCash > 0 ? 'text-accent-green' : activity.netCash < 0 ? 'text-semantic-error' : 'text-muted'}`}>{signedIdr(activity.netCash)}</p></div></div><ReportRows rows={activity.rows} /></div>)}
                      </div>
                    )}
                  </SectionCard>

                  {(data?.transfers.length ?? 0) > 0 && <SectionCard title="Transfer Internal & Antar Cabang" icon={<ArrowLeftRight size={16} />} subtitle="Informasi perpindahan kas. Nilai ini tidak dihitung sebagai pendapatan, beban, atau arus kas bersih kegiatan."><ReportRows rows={data?.transfers ?? []} /></SectionCard>}
                </div>

                <SectionCard title="Saldo per Akun Kas" icon={<Landmark size={16} />} subtitle="Porsi menunjukkan bagian dari total saldo akhir seluruh akun pada periode aktif.">
                  {(data?.accounts.length ?? 0) === 0 ? <p className="text-center py-8 text-[12px] text-muted">Belum ada akun kas aktif pada cakupan ini.</p> : <div className="space-y-4">{data?.accounts.map((account) => {
                    const percentage = accountTotal > 0 ? (account.endingBalance / accountTotal) * 100 : 0;
                    return <div key={account.id} className="p-3.5 rounded-xl border border-border bg-surface"><div className="flex items-center justify-between mb-1.5 gap-2"><div className="min-w-0"><p className="text-xs font-bold text-ink truncate">{account.name}</p><p className="text-[10px] text-muted">{account.code}</p></div><span className="text-sm font-extrabold text-ink shrink-0">{formatCurrency(account.endingBalance)}</span></div><div className="mt-2.5 flex items-center gap-2"><div className="flex-1 h-2 rounded-full bg-surface-soft overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }} /></div><span className="text-[11px] font-extrabold text-muted shrink-0 w-11 text-right">{percentage.toFixed(1)}%</span></div></div>;
                  })}<div className="pt-3 border-t border-divider flex items-center justify-between px-1"><span className="text-xs font-bold text-muted">Total Saldo Akhir</span><span className="text-base font-extrabold text-accent-green">{formatCurrency(summary?.endingBalance ?? 0)}</span></div></div>}
                </SectionCard>
              </div>
            </>
          )}
    </div>
  );
};

export const LaporanCashflowPage = () => <RequirePermission any={['CASH_TRANSACTION_READ', 'LAPORAN_READ']}><LaporanCashflowPageInner /></RequirePermission>;
