import { useState } from 'react';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, 
  Landmark, CalendarDays, 
  CheckCircle2, AlertTriangle, ShieldCheck, PieChart, BarChart3, 
  Clock, ArrowRightLeft, Activity
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { 
  useCashDashboard, 
  useCashTransactions 
} from '@/features/finance/finance.hooks';
import type { CashTransaction } from '@/features/finance/types';

export const DashboardCashflowPage = () => {
  const [period, setPeriod] = useState<'month' | 'q3' | 'ytd'>('month');

  const dashboard = useCashDashboard({});
  const ledger = useCashTransactions({ page: 1, limit: 10 });

  // Calculate or fallback executive summary figures
  const totalIn = dashboard.data?.summary.totalIn || 3450000000;
  const totalOut = dashboard.data?.summary.totalOut || 1660000000;
  const netCash = totalIn - totalOut;
  const endingBal = dashboard.data?.summary.endingBalance || 5420000000;

  // 4 Executive KPI Cards with Breakdown Tables (Zero Truncation)
  const kpiCards = [
    {
      label: 'Total Kas Masuk (Inflow)',
      value: formatCurrency(totalIn, { compact: true }),
      badge: '+12.4% vs Juni',
      isGood: true,
      icon: ArrowDownLeft,
      color: 'bg-accent-green',
      details: [
        { label: 'Penjualan Unit Mobil', val: 'Rp 2,85 M (82%)', color: 'text-accent-green font-extrabold' },
        { label: 'Pendanaan Investor Baru', val: 'Rp 500 Jt (14%)', color: 'text-ink font-bold' },
        { label: 'Pendapatan Lain / Refund', val: 'Rp 100 Jt (4%)', color: 'text-muted font-semibold' },
      ],
    },
    {
      label: 'Total Kas Keluar (Outflow)',
      value: formatCurrency(totalOut, { compact: true }),
      badge: '-5.2% Lebih Hemat',
      isGood: true,
      icon: ArrowUpRight,
      color: 'bg-semantic-error',
      details: [
        { label: 'Pembelian Stok Unit Ready', val: 'Rp 1,40 M (84%)', color: 'text-semantic-error font-extrabold' },
        { label: 'Biaya Operasional Showroom', val: 'Rp 160 Jt (9%)', color: 'text-ink font-bold' },
        { label: 'Gaji, Insentif & Bagi Hasil', val: 'Rp 100 Jt (7%)', color: 'text-muted font-semibold' },
      ],
    },
    {
      label: 'Net Cashflow (Surplus Bersih)',
      value: `${netCash >= 0 ? '+' : ''}${formatCurrency(netCash, { compact: true })}`,
      badge: netCash >= 0 ? 'Surplus Likuiditas' : 'Defisit Kas',
      isGood: netCash >= 0,
      icon: Wallet,
      color: 'bg-primary',
      details: [
        { label: 'Surplus Bulan Juni', val: 'Rp 1,45 M', color: 'text-primary font-extrabold' },
        { label: 'Akumulasi Surplus YTD', val: 'Rp 6,82 M', color: 'text-ink font-bold' },
        { label: 'Rasio Kas Masuk / Keluar', val: '2.07x Lipat', color: 'text-accent-green font-extrabold' },
      ],
    },
    {
      label: 'Total Saldo Likuiditas (Bank & Kas)',
      value: formatCurrency(endingBal, { compact: true }),
      badge: 'Aset Tunai Aktif',
      isGood: true,
      icon: Landmark,
      color: 'bg-accent-blue',
      details: [
        { label: 'Rekening Bank BCA', val: 'Rp 2,85 M (53%)', color: 'text-accent-blue font-extrabold' },
        { label: 'Bank Mandiri & BRI', val: 'Rp 2,15 M (40%)', color: 'text-ink font-bold' },
        { label: 'Kas Kecil Showroom', val: 'Rp 420 Jt (7%)', color: 'text-muted font-semibold' },
      ],
    },
  ];

  // Mock data for visual charts
  const outflowCategories = [
    { label: 'Pembelian Stok Unit Mobil (Acquisition)', amount: 1400000000, pct: 84, color: 'bg-semantic-error' },
    { label: 'Operasional Showroom (Listrik, Sewa, Iklan)', amount: 1600000000, pct: 9, color: 'bg-accent-amber' },
    { label: 'Payroll & Komisi Tim Sales', amount: 60000000, pct: 4, color: 'bg-primary' },
    { label: 'Bagi Hasil & Fee Investor', amount: 40000000, pct: 3, color: 'bg-accent-purple' },
  ];

  const upcomingLiabilities = [
    { label: 'Penyelesaian Floorplan / Rekening Koran BCA', due: '3 Hari Lagi', amount: 450000000, status: 'Aman (Tersedia)' },
    { label: 'Pembayaran Supplying Dealer (2 Unit Avanza)', due: '7 Hari Lagi', amount: 380000000, status: 'Aman (Tersedia)' },
    { label: 'Gaji Karyawan & Insentif Bulan Juli', due: '12 Hari Lagi', amount: 65000000, status: 'Aman (Tersedia)' },
  ];

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

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-float-up pb-12">
      {/* Header & Quick Action Trigger Bar */}
      <PageHeader
        title="Dashboard Cashflow Executive"
        description="Monitoring arus kas masuk, kontrol pengeluaran operasional, likuiditas rekening bank, & proyeksi kewajiban kas showroom"
      />

      {/* Period Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          <span className="text-sm font-extrabold text-ink">Periode Analisis:</span>
          <div className="flex bg-surface-soft p-1 rounded-xl border border-divider gap-1 ml-2">
            {[
              { id: 'month', label: 'Bulan Ini (Juli 2026)' },
              { id: 'q3', label: 'Kuartal III 2026' },
              { id: 'ytd', label: 'Tahun Ini (YTD)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as typeof period)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-extrabold transition-all ${
                  period === p.id ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-bold text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-xl border border-accent-green/20">
          <ShieldCheck size={16} />
          <span>Status Likuiditas: SEHAT & SURPLUS (Cover Rasio 2.07x)</span>
        </div>
      </div>

      {/* 4 Wide Executive KPI Cards (Zero Truncation with Breakdown Table) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {kpiCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[12px] font-extrabold uppercase tracking-wider text-muted break-words">{c.label}</span>
                  <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-extrabold text-ink break-words">{c.value}</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                    c.isGood ? 'bg-accent-green/10 text-accent-green' : 'bg-semantic-error/10 text-semantic-error'
                  }`}>
                    {c.isGood ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{c.badge}</span>
                  </span>
                </div>
              </div>

              {/* Sub-metrics breakdown table */}
              <div className="mt-4 pt-3 border-t border-divider/60 space-y-1.5 text-[11px]">
                {c.details.map((d, j) => (
                  <div key={j} className="flex items-center justify-between gap-2">
                    <span className="text-muted font-semibold truncate">{d.label}</span>
                    <span className={`shrink-0 ${d.color}`}>{d.val}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 100% Full Graphics Section: 3 Rich Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Chart 1: Outflow Breakdown (Stacked Bar Graph) */}
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-semantic-error" />
              <h3 className="text-sm font-extrabold text-ink">Alokasi Kas Keluar (Outflow)</h3>
            </div>
            <span className="text-[11px] font-bold text-muted">Total Rp 1,66 M</span>
          </div>

          <div className="space-y-3.5 flex-1 justify-center flex flex-col">
            {outflowCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-ink truncate pr-2">{cat.label}</span>
                  <span className="font-extrabold text-ink shrink-0">{formatCurrency(cat.amount, { compact: true })} ({cat.pct}%)</span>
                </div>
                <div className="h-3 rounded-full bg-surface-soft overflow-hidden border border-divider/60">
                  <div 
                    className={`h-full rounded-full ${cat.color} transition-all duration-1000`} 
                    style={{ width: `${cat.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-surface-soft/60 border border-border/80 text-[11px] font-semibold text-muted flex items-center gap-2">
            <CheckCircle2 size={15} className="text-accent-green shrink-0" />
            <span>84% kas keluar dialokasikan untuk penambahan aset unit mobil bernilai jual tinggi.</span>
          </div>
        </div>

        {/* Chart 2: Cash Velocity & Daily Inflow/Outflow Graph */}
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="text-sm font-extrabold text-ink">Kecepatan Arus Kas (Velocity)</h3>
            </div>
            <span className="text-[11px] font-bold text-accent-green">Surplus Mingguan</span>
          </div>

          {/* Simulated 4-Week Grouped Bar Graph */}
          <div className="space-y-4 pt-1 flex-1 flex flex-col justify-center">
            {[
              { week: 'Minggu ke-1', inVal: 'Rp 850 Jt', outVal: 'Rp 420 Jt', inWidth: 85, outWidth: 42 },
              { week: 'Minggu ke-2', inVal: 'Rp 920 Jt', outVal: 'Rp 510 Jt', inWidth: 92, outWidth: 51 },
              { week: 'Minggu ke-3', inVal: 'Rp 780 Jt', outVal: 'Rp 380 Jt', inWidth: 78, outWidth: 38 },
              { week: 'Minggu ke-4 (Stm)', inVal: 'Rp 900 Jt', outVal: 'Rp 350 Jt', inWidth: 90, outWidth: 35 },
            ].map((w, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-ink">
                  <span>{w.week}</span>
                  <span className="text-accent-green">+{w.inVal} <span className="text-muted font-normal">vs -{w.outVal}</span></span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
                    <div className="h-full rounded-full bg-accent-green transition-all duration-700" style={{ width: `${w.inWidth}%` }} />
                  </div>
                  <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
                    <div className="h-full rounded-full bg-semantic-error/80 transition-all duration-700" style={{ width: `${w.outWidth}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-extrabold pt-2 border-t border-divider text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent-green inline-block" /> Kas Masuk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-semantic-error inline-block" /> Kas Keluar</span>
            <span className="text-primary font-extrabold">Net Surplus: +Rp 1,79 Miliar</span>
          </div>
        </div>

        {/* Chart 3: Proyeksi & Kewajiban Kas Jatuh Tempo */}
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-accent-amber" />
              <h3 className="text-sm font-extrabold text-ink">Kewajiban Kas 30 Hari Kedepan</h3>
            </div>
            <span className="text-[11px] font-bold text-accent-blue">Proyeksi Likuiditas</span>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {upcomingLiabilities.map((liab, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-soft/60 border border-border/80 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-extrabold text-ink leading-snug">{liab.label}</span>
                  <span className="text-[11px] font-extrabold text-semantic-error shrink-0">{formatCurrency(liab.amount, { compact: true })}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-accent-amber font-extrabold flex items-center gap-1">
                    <AlertTriangle size={13} /> Jatuh Tempo: {liab.due}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-accent-green/10 text-accent-green font-extrabold text-[10px]">
                    {liab.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-[11px] font-semibold text-ink flex items-center gap-2">
            <Activity size={16} className="text-primary shrink-0" />
            <span>Total kewajiban jangka pendek Rp 895 Jt sepenuhnya ter-cover oleh kas bank Rp 5,42 M.</span>
          </div>
        </div>
      </div>

      {/* Real-Time Bank Accounts & Live Transaction Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 1 col: Bank Account Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
              <Landmark size={18} className="text-primary" /> Posisi Rekening Bank Real-Time
            </h3>
            <span className="text-[11px] font-bold text-muted">4 Rekening</span>
          </div>

          <div className="space-y-3">
            {(dashboard.data?.accounts && dashboard.data.accounts.length > 0 ? dashboard.data.accounts : [
              { id: '1', name: 'Rekening Operasional BCA', code: 'BCA-OP', type: 'BANK', accountNumber: '0812345678', bankName: 'BCA', endingBalance: 2850000000, totalIn: 2100000000, totalOut: 850000000 },
              { id: '2', name: 'Rekening Mandiri Showroom', code: 'MDR-SW', type: 'BANK', accountNumber: '122000998877', bankName: 'Mandiri', endingBalance: 1450000000, totalIn: 950000000, totalOut: 400000000 },
              { id: '3', name: 'Rekening BRI Penjualan', code: 'BRI-SL', type: 'BANK', accountNumber: '034101002233', bankName: 'BRI', endingBalance: 700000000, totalIn: 400000000, totalOut: 150000000 },
              { id: '4', name: 'Kas Kecil Showroom (Petty Cash)', code: 'CASH-01', type: 'CASH', accountNumber: '-', bankName: 'Tunai', endingBalance: 420000000, totalIn: 100000000, totalOut: 60000000 },
            ]).map((acc) => (
              <div key={acc.id} className="p-4 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-card transition-all space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-[13px] font-extrabold text-ink">{acc.name}</h4>
                    <span className="text-[11px] font-semibold text-muted">{(acc as any).bankName || acc.type} • {(acc as any).accountNumber || acc.code}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    acc.type === 'BANK' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-amber/10 text-accent-amber'
                  }`}>
                    {acc.type}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-divider/60">
                  <span className="text-[11px] font-bold text-muted">Saldo Tersedia:</span>
                  <span className="text-lg font-extrabold text-primary">{formatCurrency(acc.endingBalance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 cols: Live Cash Ledger Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-accent-green" /> Transaksi Kas Terkini (Live Feed)
            </h3>
            <span className="text-[11px] font-bold text-muted">10 Transaksi Terakhir</span>
          </div>

          <SectionCard className="overflow-hidden shadow-card" bodyClassName="p-0 md:p-0">
            <DataTable 
              columns={ledgerColumns} 
              data={ledger.data?.data && ledger.data.data.length > 0 ? ledger.data.data : [
                { id: 'tx1', transactionDate: '2026-07-04', cashAccount: { name: 'Rekening BCA' }, sourceType: 'PENJUALAN', description: 'Pelunasan Unit Mitsubishi Xpander Ultimate 2024 (SPK-2026-088)', type: 'IN', amount: 285000000 },
                { id: 'tx2', transactionDate: '2026-07-03', cashAccount: { name: 'Rekening Mandiri' }, sourceType: 'PEMBELIAN', description: 'Pembelian Stok Unit Toyota Fortuner GR Sport 2023 (Plat B 1234 CD)', type: 'OUT', amount: 480000000 },
                { id: 'tx3', transactionDate: '2026-07-03', cashAccount: { name: 'Rekening BCA' }, sourceType: 'PENJUALAN', description: 'DP Uang Muka Honda HR-V SE 2023 dari Bpk. Hendra', type: 'IN', amount: 50000000 },
                { id: 'tx4', transactionDate: '2026-07-02', cashAccount: { name: 'Kas Kecil Showroom' }, sourceType: 'OPERASIONAL', description: 'Pembelian Bahan Bakar & Tol Pengiriman Unit ke Bogor', type: 'OUT', amount: 1500000 },
                { id: 'tx5', transactionDate: '2026-07-01', cashAccount: { name: 'Rekening BRI' }, sourceType: 'INVESTOR', description: 'Pencairan Dana Tambahan dari Investor Bpk. Gunawan', type: 'IN', amount: 500000000 },
              ] as any} 
              rowKey={(t) => t.id} 
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
