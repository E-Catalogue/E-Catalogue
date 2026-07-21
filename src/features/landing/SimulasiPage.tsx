import { useState, useMemo, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Car, Percent, Calendar, Info, ArrowRight, Wallet, Loader2 } from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { formatCurrency } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { WHATSAPP_URL as DEFAULT_WA } from './publicNav';
import { usePublicCatalog, usePublicCreditConfig, usePublicSiteSettings, useCalculateCredit } from './landing.hooks';
import type { CreditCalcResult } from './public.types';

export const SimulasiPage = () => {
  const { data: config } = usePublicCreditConfig();
  const { data: catalog } = usePublicCatalog({ limit: 100 });
  const { data: settings } = usePublicSiteSettings();
  const calcM = useCalculateCredit();
  const units = useMemo(() => catalog?.data ?? [], [catalog?.data]);

  const [unitId, setUnitId] = useState('');
  const selected = units.find((u) => u.id === unitId);
  const price = selected?.harga ?? 300_000_000;

  const [dpPercent, setDpPercent] = useState(20);
  const [tenor, setTenor] = useState(36);
  const [rate, setRate] = useState(4.5);
  const [server, setServer] = useState<CreditCalcResult | null>(null);

  useEffect(() => {
    if (config) { setDpPercent(config.dpDefaultPercent); setRate(config.rateDefault); setTenor(config.tenorOptions[2] ?? 36); }
  }, [config]);
  useEffect(() => { if (units.length && !unitId) setUnitId(units[0].id); }, [units, unitId]);

  const local = useMemo(() => {
    const dp = Math.round((price * dpPercent) / 100);
    const pokok = price - dp;
    const totalBunga = Math.round((pokok * (rate / 100) * tenor) / 12);
    return { dp, pokok, totalBunga, cicilan: Math.round((pokok + totalBunga) / tenor) };
  }, [price, dpPercent, tenor, rate]);

  const debKey = useDebouncedValue(`${price}-${dpPercent}-${tenor}-${rate}`, 450);
  useEffect(() => {
    if (!price) return;
    calcM.mutate({ price, dpPercent, tenor, rate }, { onSuccess: (r) => setServer(r), onError: () => setServer(null) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debKey]);

  const tenors = config?.tenorOptions ?? [12, 24, 36, 48, 60];
  const cicilan = server?.cicilanPerBulan ?? local.cicilan;
  const waUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : DEFAULT_WA;

  const rows = server?.breakdown ?? [
    { label: 'Harga Mobil', value: price },
    { label: `Uang Muka (${dpPercent}%)`, value: local.dp },
    { label: 'Pokok Kredit', value: local.pokok },
    { label: `Total Bunga (${rate}%/th)`, value: local.totalBunga },
  ];

  return (
    <>
      <PublicHeader eyebrow="Simulasi Kredit" title="Hitung Cicilan Mobil Anda"
        subtitle="Atur uang muka, tenor, dan bunga untuk melihat estimasi cicilan bulanan secara instan."
        breadcrumb={[{ label: 'Beranda', to: '/' }, { label: 'Simulasi Kredit' }]} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        {/* FORM */}
        <div className="bg-surface rounded-2xl border border-border p-6 md:p-7 space-y-7">
          <div>
            <label className="flex items-center gap-2 text-[12px] font-bold text-ink mb-2"><Car size={15} className="text-primary" /> Pilih Mobil</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold cursor-pointer focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light">
              {units.length === 0 && <option value="">Memuat unit…</option>}
              {units.map((u) => <option key={u.id} value={u.id}>{u.merek?.name} {u.tipe?.name} {u.variant ?? ''} — {formatCurrency(u.harga, { compact: true })}</option>)}
            </select>
            <div className="flex items-center justify-between mt-2.5 px-3.5 py-2.5 rounded-xl bg-primary-light/60 border border-primary/15">
              <span className="text-[12px] font-semibold text-ink-soft">Harga Mobil</span>
              <span className="text-[14px] font-extrabold text-primary">{formatCurrency(price)}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-ink"><Wallet size={15} className="text-primary" /> Uang Muka (DP)</label>
              <span className="text-[13px] font-extrabold text-primary">{dpPercent}% · {formatCurrency(local.dp, { compact: true })}</span>
            </div>
            <input type="range" min={config?.dpMinPercent ?? 10} max={config?.dpMaxPercent ?? 70} step={config?.dpStep ?? 5} value={dpPercent} onChange={(e) => setDpPercent(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
            <div className="flex justify-between text-[10px] font-semibold text-muted mt-1"><span>{config?.dpMinPercent ?? 10}%</span><span>{config?.dpMaxPercent ?? 70}%</span></div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[12px] font-bold text-ink mb-2.5"><Calendar size={15} className="text-primary" /> Tenor (bulan)</label>
            <div className="grid grid-cols-5 gap-2">
              {tenors.map((t) => (
                <button key={t} onClick={() => setTenor(t)} className={`py-2.5 rounded-xl text-[13px] font-bold transition-colors ${tenor === t ? 'bg-primary text-white shadow-glow' : 'bg-surface-soft border border-border text-ink-soft hover:border-primary'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-ink"><Percent size={15} className="text-primary" /> Bunga / Tahun</label>
              <span className="text-[13px] font-extrabold text-primary">{rate}%</span>
            </div>
            <input type="range" min={config?.rateMin ?? 2} max={config?.rateMax ?? 9} step={config?.rateStep ?? 0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
            <div className="flex justify-between text-[10px] font-semibold text-muted mt-1"><span>{config?.rateMin ?? 2}%</span><span>{config?.rateMax ?? 9}%</span></div>
          </div>
        </div>

        {/* RESULT */}
        <div className="lg:sticky lg:top-20 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-7 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <p className="relative text-[12px] font-bold uppercase tracking-wide text-white/80 flex items-center gap-2">
              Estimasi Cicilan / Bulan {calcM.isPending && <Loader2 size={13} className="animate-spin" />}
            </p>
            <p className="relative text-4xl font-extrabold mt-2">{formatCurrency(cicilan)}</p>
            <p className="relative text-white/80 text-[13px] font-medium mt-1">selama {tenor} bulan • DP {dpPercent}%{server?.method ? ` • metode ${server.method}` : ''}</p>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 space-y-3">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-[13px]"><span className="font-semibold text-muted">{r.label}</span><span className="font-extrabold text-ink">{formatCurrency(r.value)}</span></div>
            ))}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-muted font-medium bg-surface-soft border border-border rounded-xl p-3">
            <Info size={14} className="text-primary shrink-0 mt-0.5" />
            {config?.disclaimer ?? 'Estimasi memakai perhitungan bunga flat dan bersifat ilustrasi. Angka final mengikuti ketentuan leasing.'}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a href={waUrl} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3.5 shadow-glow hover:bg-primary-dark transition-colors">Ajukan Kredit</a>
            {selected && (
              <Link to="/katalog/$id" params={{ id: selected.id }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[14px] px-5 py-3.5 hover:border-primary hover:text-primary transition-colors">Lihat Unit <ArrowRight size={16} /></Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
