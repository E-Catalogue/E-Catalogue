import { TrendingUp, TrendingDown, Lightbulb, Zap, CheckCircle2 } from 'lucide-react';
import { MONTH_COMPARE, YEAR_COMPARE } from '@/data/mock';
import { formatCurrency } from '@/core/utils/format';

const pct = (now: number, prev: number) => prev === 0 ? 0 : Math.round(((now - prev) / prev) * 100);

export const AutoInsights = () => {
  const mOmzet = pct(MONTH_COMPARE.bulanIni.omzet, MONTH_COMPARE.bulanLalu.omzet);
  const yOmzet = pct(YEAR_COMPARE.tahunIni.omzet, YEAR_COMPARE.tahunLalu.omzet);
  const mProfit = pct(MONTH_COMPARE.bulanIni.profit, MONTH_COMPARE.bulanLalu.profit);

  const visualInsights = [
    {
      title: 'Pertumbuhan Omzet Bulanan (MoM)',
      val: `${mOmzet >= 0 ? '+' : ''}${mOmzet}%`,
      up: mOmzet >= 0,
      curr: formatCurrency(MONTH_COMPARE.bulanIni.omzet, { compact: true }),
      prev: formatCurrency(MONTH_COMPARE.bulanLalu.omzet, { compact: true }),
      barWidth: 83,
      color: 'bg-primary',
      desc: 'Penjualan bulan Juli melesat berkat kontribusi model Avanza dan Xpander.',
    },
    {
      title: 'Akselerasi Omzet Tahunan (YoY)',
      val: `${yOmzet >= 0 ? '+' : ''}${yOmzet}%`,
      up: yOmzet >= 0,
      curr: formatCurrency(YEAR_COMPARE.tahunIni.omzet, { compact: true }),
      prev: formatCurrency(YEAR_COMPARE.tahunLalu.omzet, { compact: true }),
      barWidth: 95,
      color: 'bg-accent-green',
      desc: 'Performa YTD 2026 jauh mengungguli pencapaian periode yang sama tahun 2025.',
    },
    {
      title: 'Lonjakan Laba Bersih / Profit (MoM)',
      val: `${mProfit >= 0 ? '+' : ''}${mProfit}%`,
      up: mProfit >= 0,
      curr: formatCurrency(MONTH_COMPARE.bulanIni.profit, { compact: true }),
      prev: formatCurrency(MONTH_COMPARE.bulanLalu.profit, { compact: true }),
      barWidth: 88,
      color: 'bg-accent-orange',
      desc: 'Efisiensi pengeluaran operasional berhasil mendongkrak margin keuntungan bersih.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Graph Legend */}
      <div className="flex items-center justify-between pb-2 border-b border-divider text-[11px] font-bold text-muted">
        <span className="flex items-center gap-1.5 text-primary">
          <Zap size={14} className="fill-primary text-primary" /> Algoritma Analisis Pertumbuhan
        </span>
        <span>Visual Trajectory Scale</span>
      </div>

      {/* Visual Insight Bars */}
      <div className="space-y-4">
        {visualInsights.map((ins, i) => (
          <div key={i} className="p-3 rounded-xl bg-surface-soft/60 border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-extrabold text-ink">{ins.title}</span>
              <div className={`flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                ins.up ? 'bg-accent-green/15 text-accent-green' : 'bg-semantic-error/15 text-semantic-error'
              }`}>
                {ins.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>{ins.val}</span>
              </div>
            </div>

            {/* Visual Bar Graph */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted">
                <span>Periode Lalu: {ins.prev}</span>
                <span className="text-ink font-extrabold">Saat Ini: {ins.curr}</span>
              </div>
              <div className="h-3 rounded-full bg-surface overflow-hidden border border-divider/60">
                <div
                  className={`h-full rounded-full ${ins.color} transition-all duration-1000`}
                  style={{ width: `${ins.barWidth}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] font-semibold text-muted pt-0.5 flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-accent-green shrink-0 mt-0.5" />
              <span>{ins.desc}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-ink">
        <Lightbulb size={16} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] font-semibold leading-relaxed">
          <span className="font-extrabold text-primary">Rekomendasi Strategis:</span> Pertahankan momentum penjualan dengan mempercepat restock mobil slow-moving yang telah direkondisi dan tingkatkan konversi leads WhatsApp dari 39% menjadi di atas 50%.
        </p>
      </div>
    </div>
  );
};
