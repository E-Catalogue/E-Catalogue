import { useState } from 'react';
import { Check, Clock3 } from 'lucide-react';
import type { BranchDay, BranchOperatingHour } from './types';
import { BRANCH_DAYS } from './branchHours';

const timeClass = 'h-10 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-45';

export const BranchOperatingHoursEditor = ({ value, onChange, readOnly = false }: { value: BranchOperatingHour[]; onChange: (next: BranchOperatingHour[]) => void; readOnly?: boolean }) => {
  const [selected, setSelected] = useState<BranchDay[]>(BRANCH_DAYS.slice(0, 6).map((day) => day.value));
  const [bulkOpen, setBulkOpen] = useState('09:00');
  const [bulkClose, setBulkClose] = useState('17:00');
  const setDay = (day: BranchDay, patch: Partial<BranchOperatingHour>) => onChange(value.map((item) => item.day === day ? { ...item, ...patch } : item));
  const selectDay = (day: BranchDay) => setSelected((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  const allSelected = selected.length === BRANCH_DAYS.length;
  const applyBulk = () => onChange(value.map((item) => selected.includes(item.day) ? { ...item, isOpen: true, openTime: bulkOpen, closeTime: bulkClose } : item));

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface-soft/55 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="flex items-center gap-2 text-[13px] font-extrabold text-ink"><Clock3 size={16} className="text-primary" /> Jam operasional</h3><p className="mt-1 text-[11px] font-medium text-muted">Pilih hari, tentukan jam, lalu terapkan. Setiap hari masih dapat disesuaikan.</p></div>
        {!readOnly && <button type="button" onClick={() => setSelected(allSelected ? [] : BRANCH_DAYS.map((day) => day.value))} className="text-[11px] font-extrabold text-primary hover:underline">{allSelected ? 'Hapus pilihan' : 'Pilih semua'}</button>}
      </div>

      {!readOnly && <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {BRANCH_DAYS.map((day) => {
          const checked = selected.includes(day.value);
          return <button key={day.value} type="button" onClick={() => selectDay(day.value)} aria-pressed={checked} className={`relative rounded-xl border px-2 py-2.5 text-center text-[11px] font-extrabold transition-colors ${checked ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-ink-soft hover:border-primary/40'}`}>{checked && <Check size={11} className="absolute right-1.5 top-1.5" />}<span className="sm:hidden">{day.short}</span><span className="hidden sm:inline">{day.label}</span></button>;
        })}
      </div>}

      {!readOnly && <div className="grid gap-3 rounded-xl border border-primary/15 bg-primary-light/35 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-[10px] font-bold uppercase tracking-wide text-muted">Jam buka<input type="time" value={bulkOpen} onChange={(event) => setBulkOpen(event.target.value)} className={`${timeClass} mt-1.5 w-full`} /></label>
        <label className="text-[10px] font-bold uppercase tracking-wide text-muted">Jam tutup<input type="time" value={bulkClose} min={bulkOpen} onChange={(event) => setBulkClose(event.target.value)} className={`${timeClass} mt-1.5 w-full`} /></label>
        <button type="button" disabled={!selected.length || !bulkOpen || !bulkClose || bulkClose <= bulkOpen} onClick={applyBulk} className="h-10 rounded-xl bg-primary px-4 text-[11px] font-extrabold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-45">Terapkan</button>
      </div>}

      <div className="divide-y divide-divider overflow-hidden rounded-xl border border-border bg-surface">
        {BRANCH_DAYS.map((day) => {
          const item = value.find((entry) => entry.day === day.value)!;
          return <div key={day.value} className="grid grid-cols-[6.5rem_1fr] gap-3 p-3 sm:grid-cols-[8rem_1fr_1fr] sm:items-center"><label className="flex items-center gap-2 text-[12px] font-extrabold text-ink"><input type="checkbox" disabled={readOnly} checked={item.isOpen} onChange={(event) => setDay(day.value, event.target.checked ? { isOpen: true, openTime: item.openTime ?? '09:00', closeTime: item.closeTime ?? '17:00' } : { isOpen: false, openTime: null, closeTime: null })} className="h-4 w-4 accent-primary" />{day.label}</label><div className="col-span-1 grid grid-cols-2 gap-2 sm:col-span-2"><input aria-label={`Jam buka ${day.label}`} type="time" disabled={readOnly || !item.isOpen} value={item.openTime ?? ''} onChange={(event) => setDay(day.value, { openTime: event.target.value })} className={`${timeClass} w-full`} /><input aria-label={`Jam tutup ${day.label}`} type="time" disabled={readOnly || !item.isOpen} min={item.openTime ?? undefined} value={item.closeTime ?? ''} onChange={(event) => setDay(day.value, { closeTime: event.target.value })} className={`${timeClass} w-full`} /></div></div>;
        })}
      </div>
    </section>
  );
};
