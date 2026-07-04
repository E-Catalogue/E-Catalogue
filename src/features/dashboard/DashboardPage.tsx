import { 
  Car, ShoppingBag, DollarSign, Wallet, TrendingUp, CreditCard, 
  CalendarDays, ChevronDown, BarChart3, Target, ArrowLeftRight, 
  Trophy, Clock, Users, Share2, Lightbulb, AlertTriangle,
  Activity, Award, CheckCircle2, ShieldAlert, Zap, PhoneCall, PieChart, Layers
} from 'lucide-react';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { StatCard } from './components/StatCard';
import { SalesChart } from './components/SalesChart';
import { TargetChart } from './components/TargetChart';
import { MonthComparison } from './components/MonthComparison';
import { YearComparison } from './components/YearComparison';
import { TopSelling } from './components/TopSelling';
import { AgingStock } from './components/AgingStock';
import { SalesPerformance } from './components/SalesPerformance';
import { LeadSources } from './components/LeadSources';
import { AutoInsights } from './components/AutoInsights';
import { SlowMoving } from './components/SlowMoving';
import { DASH, YEAR_COMPARE, TOP_SELLING, SALES_PERF, LEAD_SOURCES, AGING_STOCK, SLOW_MOVING } from '@/data/mock';
import { formatCurrency } from '@/core/utils/format';

export const DashboardPage = () => {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-float-up pb-12">
      {/* Header / Filter Periode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border shadow-card">
        <div>
          <h1 className="text-lg font-extrabold text-ink">Dashboard Executive</h1>
          <p className="text-[12px] font-semibold text-muted">Pantau performa bisnis, keuangan, dan stok secara real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-surface-soft border border-border hover:border-primary rounded-xl px-3.5 py-2 text-[12px] font-bold text-ink transition-colors">
            <CalendarDays size={15} className="text-primary" /> Juli 2026
            <ChevronDown size={14} className="text-muted" />
          </button>
        </div>
      </div>

      {/* ── SECTION 1: KEUANGAN & PROFITABILITAS (4 KARTU) ────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-primary" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">1. Metrik Keuangan & Arus Kas (Bulan Ini)</h2>
          </div>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">Real-time Financials</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            color="green"
            label="Total Omzet Kotor"
            value="Rp 3,24 Miliar"
            trend={{ value: DASH.trendOmzet, label: 'vs Juni 2026' }}
            progress={{ percent: Math.round((DASH.omzet / DASH.targetOmzet) * 100), label: 'Pencapaian Target Bulanan' }}
            details={[
              { label: 'Target Omzet Bulanan', value: 'Rp 5,00 Miliar' },
              { label: 'Sisa Target Bulan Ini', value: 'Rp 1,76 Miliar', color: 'text-accent-amber' },
              { label: 'Rata-rata Harian (21 hari)', value: 'Rp 154,2 Juta / hari' },
            ]}
          />
          <StatCard
            icon={Trophy}
            color="orange"
            label="Profit Bersih (Keuntungan)"
            value="Rp 331,15 Juta"
            trend={{ value: DASH.trendProfit, label: 'vs Juni 2026' }}
            subtitle={{ text: 'Margin bersih:', highlight: '10,2% dari omzet' }}
            details={[
              { label: 'Laba Bersih Juni 2026', value: 'Rp 295,00 Juta' },
              { label: 'Total Laba 2026 (YTD)', value: 'Rp 2,18 Miliar', color: 'text-accent-green' },
              { label: 'Estimasi Laba Tahunan', value: 'Rp 3,97 Miliar' },
            ]}
          />
          <StatCard
            icon={Wallet}
            color="teal"
            label="Cash Flow & Kas Tersedia"
            value="Rp 3,18 Miliar"
            trend={{ value: DASH.trendCash, label: 'vs Juni 2026' }}
            subtitle={{ text: 'Arus kas bersih:', highlight: 'Surplus sehat' }}
            details={[
              { label: 'Total Omzet Masuk', value: 'Rp 3,24 Miliar' },
              { label: 'Total Keluar (Operasional)', value: 'Rp 58,85 Juta' },
              { label: 'Rasio Kas terhadap Kas Keluar', value: '54x Lipat', color: 'text-accent-teal' },
            ]}
          />
          <StatCard
            icon={CreditCard}
            color="red"
            label="Total Pengeluaran Operasional"
            value="Rp 58,85 Juta"
            trend={{ value: DASH.trendPengeluaran, label: 'Lebih hemat vs Juni' }}
            subtitle={{ text: 'Rasio efisiensi:', highlight: '1,8% dari omzet' }}
            details={[
              { label: 'Gaji & Sewa Showroom', value: 'Rp 26,00 Juta' },
              { label: 'Fee Investor (2.5%)', value: 'Rp 25,00 Juta' },
              { label: 'Iklan, Listrik & ATK', value: 'Rp 7,85 Juta' },
            ]}
          />
        </div>
      </div>

      {/* ── SECTION 2: INVENTARIS & EVALUASI STOK (4 KARTU) ───────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <Car size={16} className="text-accent-blue" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">2. Komposisi Inventaris & Evaluasi Stok</h2>
          </div>
          <span className="text-[11px] font-bold text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-lg">Showroom Assets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            color="purple"
            label="Valuasi Aset Showroom"
            value="Rp 8,24 Miliar"
            trend={{ value: DASH.trendInventory, label: 'Kenaikan aset ready' }}
            subtitle={{ text: 'Total dari 28 unit:', highlight: 'Ready stock' }}
            details={[
              { label: 'Rata-rata Harga Unit', value: 'Rp 294,2 Juta / unit' },
              { label: 'Valuasi Juni 2026', value: 'Rp 7,83 Miliar' },
              { label: 'Pertumbuhan Aset Bersih', value: '+Rp 410 Juta', color: 'text-accent-purple' },
            ]}
          />
          <StatCard
            icon={Layers}
            color="blue"
            label="Kuantitas Stok Keseluruhan"
            value={`${DASH.totalStock} Unit`}
            unit="Total"
            trend={{ value: DASH.trendStock, label: 'Sirkulasi aktif' }}
            subtitle={{ text: 'Ketersediaan showroom:', highlight: '66% Ready' }}
            details={[
              { label: 'Siap Jual (Ready Stock)', value: '28 Unit', color: 'text-accent-green' },
              { label: 'Proses Rekondisi & Bengkel', value: '7 Unit', color: 'text-accent-orange' },
              { label: 'Sudah Booked / SPK / Pending', value: '7 Unit', color: 'text-accent-blue' },
            ]}
          />
          <StatCard
            icon={Clock}
            color="teal"
            label="Rata-Rata Umur Stok (Aging)"
            value="26 Hari"
            unit="di Showroom"
            subtitle={{ text: 'Status perputaran:', highlight: 'Sehat (<30 Hari)' }}
            progress={{ percent: Math.round((26 / 30) * 100), label: 'Batas Ideal Maksimal 30 Hari' }}
            details={[
              { label: 'Stok Sehat (< 30 Hari)', value: '39 Unit (92%)', color: 'text-accent-green' },
              { label: 'Stok Perhatian (30 - 60 Hari)', value: '2 Unit', color: 'text-accent-amber' },
              { label: 'Stok Kritis (> 60 Hari)', value: '1 Unit', color: 'text-semantic-error' },
            ]}
          />
          <StatCard
            icon={AlertTriangle}
            color="red"
            label="Stok Kritis & Slow Moving"
            value="3 Unit"
            unit="Perhatian"
            subtitle={{ text: 'Unit dengan penjualan:', highlight: 'Lambat (≤ 1 unit)' }}
            details={[
              { label: 'Suzuki XL7 Alpha (64 Hari)', value: 'Rp 205 Juta', color: 'text-semantic-error' },
              { label: 'Honda Brio RS (55 Hari)', value: 'Rp 175 Juta', color: 'text-accent-amber' },
              { label: 'Daihatsu Terios X (45 Hari)', value: 'Rp 195 Juta', color: 'text-accent-amber' },
            ]}
          />
        </div>
      </div>

      {/* ── SECTION 3: TARGET & PERFORMA TAHUNAN (4 KARTU) ────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-accent-green" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">3. Realisasi Target Bulanan & Performa Tahunan (YTD)</h2>
          </div>
          <span className="text-[11px] font-bold text-accent-green bg-accent-green/10 px-2.5 py-0.5 rounded-lg">Performance Benchmarks</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            color="blue"
            label="Realisasi Penjualan Unit"
            value={`${DASH.unitTerjual} / ${DASH.targetUnit}`}
            unit="Unit"
            progress={{ percent: Math.round((DASH.unitTerjual / DASH.targetUnit) * 100), label: 'Progress Target Bulan Juli' }}
            subtitle={{ text: 'Sisa target:', highlight: `${Math.max(DASH.targetUnit - DASH.unitTerjual, 0)} Unit lagi` }}
            details={[
              { label: 'Target Penjualan Bulan Ini', value: '25 Unit' },
              { label: 'Terjual Sampai Hari Ini', value: '18 Unit (72%)', color: 'text-primary' },
              { label: 'Kecepatan Penjualan', value: '0,86 Unit / hari' },
            ]}
          />
          <StatCard
            icon={CalendarDays}
            color="purple"
            label="Omzet Tahunan 2026 (YTD)"
            value="Rp 21,78 M"
            trend={{ value: 23.5, label: 'vs 2025 (YoY)' }}
            subtitle={{ text: 'Total akumulasi:', highlight: '121 Unit Terjual' }}
            details={[
              { label: 'Total Omzet 2025 (YTD)', value: 'Rp 17,64 Miliar' },
              { label: 'Selisih Kenaikan Omzet', value: '+Rp 4,14 Miliar', color: 'text-accent-purple' },
              { label: 'Rata-rata Omzet Bulanan', value: 'Rp 3,11 M / bulan' },
            ]}
          />
          <StatCard
            icon={Award}
            color="green"
            label="Profit Tahunan 2026 (YTD)"
            value="Rp 2,18 Miliar"
            trend={{ value: 29.8, label: 'Kenaikan laba YoY' }}
            subtitle={{ text: 'Performa laba:', highlight: 'Sangat memuaskan' }}
            details={[
              { label: 'Profit 2025 (YTD)', value: 'Rp 1,68 Miliar' },
              { label: 'Pertumbuhan Bersih', value: '+Rp 500,0 Juta', color: 'text-accent-green' },
              { label: 'Rata-rata Laba Bersih', value: 'Rp 311,4 Juta / bulan' },
            ]}
          />
          <StatCard
            icon={Trophy}
            color="orange"
            label="Mobil Terlaris (Top Selling)"
            value="Toyota Avanza"
            subtitle={{ text: 'Kontribusi terbesar:', highlight: '5 Unit (Rp 900 Juta)' }}
            progress={{ percent: Math.round((5 / DASH.unitTerjual) * 100), label: 'Porsi dari Total Penjualan Unit' }}
            details={[
              { label: '#1 Toyota Avanza', value: '5 Unit (Rp 900 Jt)', color: 'text-accent-orange' },
              { label: '#2 Mitsubishi Xpander', value: '4 Unit (Rp 1,00 M)', color: 'text-ink' },
              { label: '#3 Honda Brio RS / CVT', value: '3 Unit (Rp 510 Jt)', color: 'text-ink' },
            ]}
          />
        </div>
      </div>

      {/* ── SECTION 4: PEMASARAN, PROSPEK & TIM SALES (4 KARTU) ───────── */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-divider pb-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-accent-purple" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink">4. Pemasaran, Sumber Prospek & Produktivitas Tim Sales</h2>
          </div>
          <span className="text-[11px] font-bold text-accent-purple bg-accent-purple/10 px-2.5 py-0.5 rounded-lg">Sales & Marketing Force</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            color="teal"
            label="Top Sales Performer"
            value="Andi Firmansyah"
            subtitle={{ text: 'Pencapaian tertinggi:', highlight: '8 Unit (Rp 1,44 M)' }}
            progress={{ percent: Math.round((8 / (DASH.targetUnit / 3)) * 100), label: 'Pencapaian Target Individu (8,3 Unit)' }}
            details={[
              { label: 'Kontribusi Unit', value: '8 Unit (44% total)', color: 'text-accent-teal' },
              { label: 'Kontribusi Omzet', value: 'Rp 1,44 Miliar' },
              { label: 'Status Target (8,3 Unit)', value: '96% Tercapai', color: 'text-accent-green' },
            ]}
          />
          <StatCard
            icon={Activity}
            color="blue"
            label="Produktivitas Tim Sales"
            value="3 Personil"
            unit="Aktif"
            subtitle={{ text: 'Rata-rata penjualan:', highlight: '6,0 unit / sales' }}
            details={[
              { label: 'Andi Firmansyah (Senior)', value: '8 Unit (Rp 1,44 M)', color: 'text-primary' },
              { label: 'Budi Santoso (Mid)', value: '6 Unit (Rp 1,08 M)', color: 'text-ink' },
              { label: 'Citra Dewi (Junior)', value: '4 Unit (Rp 720 Jt)', color: 'text-muted' },
            ]}
          />
          <StatCard
            icon={Share2}
            color="purple"
            label="Total Leads & Prospek"
            value="56 Prospek"
            unit="Masuk"
            trend={{ value: 18.0, label: 'Kenaikan prospek' }}
            subtitle={{ text: 'Saluran terbanyak:', highlight: 'WhatsApp (39%)' }}
            details={[
              { label: 'WhatsApp Chat', value: '22 Prospek (39%)', color: 'text-accent-green' },
              { label: 'Walk-in Showroom', value: '14 Prospek (25%)', color: 'text-primary' },
              { label: 'Marketplace, IG & Referral', value: '20 Prospek (36%)' },
            ]}
          />
          <StatCard
            icon={PhoneCall}
            color="orange"
            label="Konversi & Follow-Up"
            value="12,5% Deal"
            unit="Rate"
            subtitle={{ text: 'Dari 56 prospek masuk:', highlight: '7 SPK / Deal' }}
            progress={{ percent: 12.5 * 4, label: 'Target Konversi Ideal > 10%' }}
            details={[
              { label: 'Prospek Follow-Up Hari Ini', value: '12 Prospek', color: 'text-accent-orange' },
              { label: 'Jadwal Test Drive Aktif', value: '4 Jadwal', color: 'text-accent-blue' },
              { label: 'Total Deal & SPK Selesai', value: '7 Prospek', color: 'text-accent-green' },
            ]}
          />
        </div>
      </div>

      {/* ── ROW 3: GRAFIK PENJUALAN & TARGET ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <SectionCard
            title="Grafik Penjualan Bulanan (2026)"
            icon={<BarChart3 size={16} />}
            className="flex-1 flex flex-col"
            bodyClassName="flex-1 flex flex-col justify-center"
          >
            <SalesChart />
          </SectionCard>
        </div>
        <div className="flex flex-col">
          <SectionCard
            title="Target vs Realisasi"
            icon={<Target size={16} />}
            className="flex-1 flex flex-col"
            bodyClassName="flex-1"
          >
            <TargetChart />
          </SectionCard>
        </div>
      </div>

      {/* ── ROW 4: PERBANDINGAN PERIODE ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <SectionCard
          title="Perbandingan Bulan Ini vs Bulan Lalu"
          icon={<ArrowLeftRight size={16} />}
        >
          <MonthComparison />
        </SectionCard>
        <SectionCard
          title="Perbandingan Tahun Ini vs Tahun Lalu (YTD)"
          icon={<ArrowLeftRight size={16} />}
        >
          <YearComparison />
        </SectionCard>
      </div>

      {/* ── ROW 5: STOK ANALYSIS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <SectionCard
          title="Top Selling Mobil"
          icon={<Trophy size={16} />}
          action={<span className="text-[11px] font-bold text-muted">Bulan Ini</span>}
        >
          <TopSelling />
        </SectionCard>
        <SectionCard
          title="Aging Stock (Lama di Showroom)"
          icon={<Clock size={16} />}
          action={<span className="text-[11px] font-bold text-semantic-error">Urutan Terlama</span>}
        >
          <AgingStock />
        </SectionCard>
      </div>

      {/* ── ROW 6: PERFORMA SALES & LEADS ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <SectionCard
          title="Performa Sales"
          icon={<Users size={16} />}
          action={<span className="text-[11px] font-bold text-muted">Berdasarkan Unit</span>}
        >
          <SalesPerformance />
        </SectionCard>
        <SectionCard
          title="Sumber Leads / Prospek"
          icon={<Share2 size={16} />}
          className="flex flex-col"
          bodyClassName="flex-1 flex items-center justify-center"
        >
          <LeadSources />
        </SectionCard>
      </div>

      {/* ── ROW 7: INSIGHT & SLOW MOVING ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <SectionCard
          title="Insight Otomatis"
          icon={<Lightbulb size={16} />}
        >
          <AutoInsights />
        </SectionCard>
        <SectionCard
          title="Mobil Slow Moving (Perputaran Lambat)"
          icon={<AlertTriangle size={16} />}
          action={<span className="text-[11px] font-bold text-muted">3 Bulan Terakhir</span>}
        >
          <SlowMoving />
        </SectionCard>
      </div>
    </div>
  );
};
