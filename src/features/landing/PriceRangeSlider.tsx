import { formatCurrency } from '@/core/utils/format';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: { min: number; max: number }) => void;
}

const clampInt = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v || 0)));

/**
 * Dual range slider + input angka untuk rentang harga.
 * - Dua thumb (type=range) yang saling menimpa, dengan track terwarnai di antaranya.
 * - Dua input angka (min/max) untuk nilai kustom; keduanya tersinkron.
 */
export const PriceRangeSlider = ({ min, max, step = 5_000_000, valueMin, valueMax, onChange }: PriceRangeSliderProps) => {
  const span = Math.max(1, max - min);
  const pctMin = ((valueMin - min) / span) * 100;
  const pctMax = ((valueMax - min) / span) * 100;

  const setMin = (v: number) => onChange({ min: clampInt(v, min, valueMax), max: valueMax });
  const setMax = (v: number) => onChange({ min: valueMin, max: clampInt(v, valueMin, max) });

  return (
    <div>
      {/* Slider */}
      <div className="relative h-9 flex items-center">
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-surface-soft border border-border" />
        <div className="absolute h-1.5 rounded-full bg-primary" style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }} />
        <input
          type="range" min={min} max={max} step={step} value={valueMin}
          onChange={(e) => setMin(Number(e.target.value))}
          className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
          aria-label="Harga minimum"
        />
        <input
          type="range" min={min} max={max} step={step} value={valueMax}
          onChange={(e) => setMax(Number(e.target.value))}
          className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
          aria-label="Harga maksimum"
        />
      </div>

      {/* Value labels */}
      <div className="flex items-center justify-between mt-1 text-[11px] font-bold text-primary">
        <span>{formatCurrency(valueMin, { compact: true })}</span>
        <span>{formatCurrency(valueMax, { compact: true })}</span>
      </div>

      {/* Custom number inputs */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-3">
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wide text-muted mb-1">Min</label>
          <input
            type="number" min={min} max={valueMax} step={step} value={valueMin}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full h-9 px-2.5 rounded-lg bg-surface border border-border text-[12px] font-semibold focus:outline-none focus:border-primary"
          />
        </div>
        <span className="text-muted font-bold pt-4">–</span>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wide text-muted mb-1">Max</label>
          <input
            type="number" min={valueMin} max={max} step={step} value={valueMax}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full h-9 px-2.5 rounded-lg bg-surface border border-border text-[12px] font-semibold focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};
