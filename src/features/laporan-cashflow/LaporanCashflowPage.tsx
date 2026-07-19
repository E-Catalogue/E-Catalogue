import { useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, TrendingUp, Wallet,
  CalendarDays, Landmark, FileWarning, Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { TextField } from '@/shared/components/ui/Field';
import { formatCurrency } from '@/core/utils/format';
import { useCashDashboard } from '@/features/finance/finance.hooks';

export const LaporanCashflowPage = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const dashboard = useCashDashboard({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
  const summary = dashboard.data?.summary;
  const accounts = dashboard.data?.accounts ?? [];
  const netCash = summary ? summary.totalIn - summary.totalOut : 0;
  const totalAccountsBal = accounts.reduce((acc, a) => acc + (a.endingBalance || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-float-up pb-12">
      <PageHeader
        title="Laporan Cashflow"
        description="Ringkasan arus kas real-time dari akun kas aktif. Laporan rinci (statement of cash flows per kategori & export) menyusul setelah endpoint backend tersedia."
      />

      {/* Filter periode — beneran tersambung ke query, bukan dekorasi */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-surface border border-border shadow-sm">
        <CalendarDays size={18} className="text-primary shrink-0" />
        <span className="text-sm font-extrabold text-ink shrink-0">Periode:</span>
        <TextField label="" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} wrapClass="w-40" />
        <span className="text-muted text-sm">—</span>
        <TextField label="" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} wrapClass="w-40" />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-[12px] font-bold text-primary hover:underline">Reset</button>
        )}
      </div>

      {dashboard.isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : dashboard.isError ? (
        <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data cashflow.</div>
      ) : (
        <>
          {/* KPI — seluruhnya dari data real useCashDashboard, tanpa fallback angka palsu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            <div className="rounded-2xl p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Kas Masuk</p>
                  <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 text-accent-green">{formatCurrency(summary?.totalIn ?? 0, { compact: true })}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-accent-green/10 text-accent-green"><ArrowDownLeft size={24} strokeWidth={2.5} /></div>
              </div>
            </div>

            <div className="rounded-2xl p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Kas Keluar</p>
                  <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 text-semantic-error">{formatCurrency(summary?.totalOut ?? 0, { compact: true })}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-semantic-error/10 text-semantic-error"><ArrowUpRight size={24} strokeWidth={2.5} /></div>
              </div>
            </div>

            <div className="rounded-2xl p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Surplus Bersih</p>
                  <h3 className={`text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 ${netCash >= 0 ? 'text-primary' : 'text-semantic-error'}`}>
                    {netCash >= 0 ? '+' : ''}{formatCurrency(netCash, { compact: true })}
                  </h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${netCash >= 0 ? 'bg-primary/10 text-primary' : 'bg-semantic-error/10 text-semantic-error'}`}><TrendingUp size={24} strokeWidth={2.5} /></div>
              </div>
            </div>

            <div className="rounded-2xl p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Saldo Akhir</p>
                  <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 text-accent-blue">{formatCurrency(summary?.endingBalance ?? 0, { compact: true })}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-accent-blue/10 text-accent-blue"><Wallet size={24} strokeWidth={2.5} /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <SectionCard title="Laporan Rinci (Statement of Cash Flows)" subtitle="Rincian per kategori transaksi & export Excel/PDF">
                <div className="flex flex-col items-center text-center py-10 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 text-accent-amber flex items-center justify-center"><FileWarning size={26} /></div>
                  <p className="font-bold text-ink">Belum tersedia</p>
                  <p className="text-muted text-[13px] font-medium max-w-sm">
                    Laporan rinci per kategori dan fitur export belum bisa ditampilkan karena endpoint backend untuk modul ini belum tersedia. Ringkasan di atas sudah data real dari akun kas aktif.
                  </p>
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Komposisi Likuiditas Rekening" subtitle="Saldo akhir per akun kas, periode terpilih">
              {accounts.length === 0 ? (
                <p className="text-center py-8 text-[12px] text-muted">Belum ada akun kas dengan transaksi pada periode ini.</p>
              ) : (
                <div className="space-y-4">
                  {accounts.map((acc) => {
                    const percentage = totalAccountsBal > 0 ? ((acc.endingBalance || 0) / totalAccountsBal) * 100 : 0;
                    return (
                      <div key={acc.id} className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary/40 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-surface-soft border border-divider flex items-center justify-center shrink-0 text-primary"><Landmark size={15} /></div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-ink truncate">{acc.name}</p>
                              <p className="text-[10px] text-muted">{acc.code}</p>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold text-ink shrink-0">{formatCurrency(acc.endingBalance || 0)}</span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-surface-soft overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
                          </div>
                          <span className="text-[11px] font-extrabold text-muted shrink-0 w-11 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-divider flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-muted">Total Seluruh Rekening</span>
                    <span className="text-base font-extrabold text-accent-green">{formatCurrency(totalAccountsBal)}</span>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
};
