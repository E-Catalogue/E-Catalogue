import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Car, Percent, Calendar, Info, ArrowRight, Wallet, Loader2 } from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { formatCurrency } from '@/core/utils/format';
import { WHATSAPP_URL } from './publicNav';
import { usePublicCatalog, usePublicSiteSettings } from './landing.hooks';
import { Reveal } from '@/shared/components/Reveal';

const TENORS = [12, 24, 36, 48, 60];

export const SimulasiPage = () => {
  const { data, isLoading } = usePublicCatalog({});
  const { data: settings } = usePublicSiteSettings();
  
  const units = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((u: any) => u.status === 'ready' || u.status === 'booked');
  }, [data]);

  const [unitId, setUnitId] = useState<string>('');
  
  // Auto-select first unit when loaded
  if (!unitId && units.length > 0) {
    setUnitId(units[0].id);
  }

  const selected = units.find((u: any) => u.id === unitId);
  const price = selected?.price ?? 300_000_000;

  const [dpPercent, setDpPercent] = useState(20);
  const [tenor, setTenor] = useState(36);
  const [rate, setRate] = useState(4.5);

  const calc = useMemo(() => {
    const dp = Math.round((price * dpPercent) / 100);
    const pokok = price - dp;
    const totalBunga = Math.round((pokok * (rate / 100) * tenor) / 12);
    const totalBayar = pokok + totalBunga;
    const cicilan = Math.round(totalBayar / tenor);
    return { dp, pokok, totalBunga, cicilan };
  }, [price, dpPercent, tenor, rate]);

  const waUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : WHATSAPP_URL;

  return (
    <>
      <PublicHeader
        eyebrow="Simulasi Kredit"
        title="Hitung Cicilan Mobil Anda"
        subtitle="Atur uang muka, tenor, dan bunga untuk melihat estimasi cicilan bulanan secara instan."
        breadcrumb={[{ label: 'Beranda', to: '/' }, { label: 'Simulasi Kredit' }]}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 size={30} className="animate-spin text-primary" /></div>
        ) : (
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
            {/* FORM */}
            <Reveal className="bg-surface rounded-2xl border border-border p-6 md:p-7 space-y-7">
              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-ink mb-2"><Car size={15} className="text-primary" /> Pilih Mobil</label>
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold cursor-pointer focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light">
                  {units.map((u: any) => <option key={u.id} value={u.id}>{u.brand} {u.model} {u.variant} — {formatCurrency(u.price, { compact: true })}</option>)}
                </select>
                <div className="flex items-center justify-between mt-2.5 px-3.5 py-2.5 rounded-xl bg-primary-light/60 border border-primary/15">
                  <span className="text-[12px] font-semibold text-ink-soft">Harga Mobil</span>
                  <span className="text-[14px] font-extrabold text-primary">{formatCurrency(price)}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-[12px] font-bold text-ink"><Wallet size={15} className="text-primary" /> Uang Muka (DP)</label>
                  <span className="text-[13px] font-extrabold text-primary">{dpPercent}% · {formatCurrency(calc.dp, { compact: true })}</span>
                </div>
                <input type="range" min={10} max={70} step={5} value={dpPercent} onChange={(e) => setDpPercent(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
                <div className="flex justify-between text-[10px] font-semibold text-muted mt-1"><span>10%</span><span>70%</span></div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[12px] font-bold text-ink mb-2.5"><Calendar size={15} className="text-primary" /> Tenor (bulan)</label>
                <div className="grid grid-cols-5 gap-2">
                  {TENORS.map((t) => (
                    <button key={t} onClick={() => setTenor(t)} className={`py-2.5 rounded-xl text-[13px] font-bold transition-colors ${tenor === t ? 'bg-primary text-white shadow-glow' : 'bg-surface-soft border border-border text-ink-soft hover:border-primary'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-[12px] font-bold text-ink"><Percent size={15} className="text-primary" /> Bunga / Tahun (flat)</label>
                  <span className="text-[13px] font-extrabold text-primary">{rate}%</span>
                </div>
                <input type="range" min={2} max={9} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
                <div className="flex justify-between text-[10px] font-semibold text-muted mt-1"><span>2%</span><span>9%</span></div>
              </div>
            </Reveal>

            {/* RESULT (sticky) */}
            <Reveal delay={100} className="lg:sticky lg:top-20 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-7 text-white relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <p className="relative text-[12px] font-bold uppercase tracking-wide text-white/80">Estimasi Cicilan / Bulan</p>
                <p className="relative text-4xl font-extrabold mt-2">{formatCurrency(calc.cicilan)}</p>
                <p className="relative text-white/80 text-[13px] font-medium mt-1">selama {tenor} bulan • DP {dpPercent}%</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-6 space-y-3">
                {[
                  { label: 'Harga Mobil', value: formatCurrency(price) },
                  { label: `Uang Muka (${dpPercent}%)`, value: formatCurrency(calc.dp) },
                  { label: 'Pokok Kredit', value: formatCurrency(calc.pokok) },
                  { label: `Total Bunga (${rate}%/th)`, value: formatCurrency(calc.totalBunga) },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-muted">{r.label}</span>
                    <span className="font-extrabold text-ink">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 text-[11px] text-muted font-medium bg-surface-soft border border-border rounded-xl p-3">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                Estimasi memakai perhitungan bunga flat dan bersifat ilustrasi. Angka final mengikuti ketentuan leasing.
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href={waUrl} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3.5 shadow-glow hover:bg-primary-dark transition-colors">
                  Ajukan Kredit
                </a>
                {selected && (
                  <Link to="/katalog/$id" params={{ id: selected.id }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3.5 hover:border-primary hover:text-primary transition-colors">
                    Lihat Unit <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </>
  );
};
