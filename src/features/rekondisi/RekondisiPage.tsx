import { useState } from 'react';
import { Wrench, Eye, Pencil, Search, Loader2, Gauge, Tag } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { useUnits } from '@/features/units/unit.hooks';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import type { Unit } from '@/features/units/unit.types';

const idr = (n?: number | null) =>
  n == null
    ? '-'
    : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const mediaUrl = (filename: string) =>
  `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ?? ''}/m/${filename}`;

const UnitThumb = ({ unit }: { unit: Unit }) => {
  const img = unit.unitImages?.[0];
  return (
    <img
      src={img ? mediaUrl(img.filename) : DEFAULT_CAR_IMAGE}
      alt=""
      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
      className="w-28 h-20 rounded-xl object-cover bg-surface-soft shrink-0"
    />
  );
};

export const RekondisiPage = () => {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 400);

  const { data, isLoading, isError } = useUnits({
    page: 1,
    limit: 50,
    statusUnit: 'INVENTORY',
    search: debounced || undefined,
  });

  const units = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const m = useUnitModals();

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader
        title="Rekondisi"
        description={`${total} unit dalam proses inventori & rekondisi`}
        action={
          <Button icon={<Wrench size={16} strokeWidth={2.5} />} onClick={m.openCreate}>
            Tambah Unit
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-xs mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari plat / merek / tipe..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted">
          <Loader2 size={26} className="animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-semantic-error font-semibold">Gagal memuat data.</div>
      ) : units.length === 0 ? (
        <div className="text-center py-24 text-muted font-semibold">
          {query ? 'Tidak ada unit yang cocok.' : 'Tidak ada unit dalam rekondisi.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {units.map((u) => (
            <RekondisiCard key={u.id} unit={u} onView={() => m.openDetail(u)} onEdit={() => m.openEdit(u)} />
          ))}
        </div>
      )}

      {m.modals}
    </div>
  );
};

const RekondisiCard = ({
  unit, onView, onEdit,
}: { unit: Unit; onView: () => void; onEdit: () => void }) => {
  const merek = unit.merek?.name ?? '—';
  const tipe = unit.tipe?.name ?? '—';

  return (
    <div
      onClick={onView}
      className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden group hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 cursor-pointer"
    >
      <div className="flex gap-4 p-4">
        <UnitThumb unit={unit} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-extrabold text-ink text-[14px] truncate">{merek} {tipe}</h3>
              <p className="text-[11px] text-muted font-semibold mt-0.5">{unit.tahun} · {unit.transmisi}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors"
                title="Detail"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>

          {/* Status badge */}
          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
            <Wrench size={9} strokeWidth={2.5} /> Rekondisi
          </span>
        </div>
      </div>

      {/* Details row */}
      <div className="border-t border-divider px-4 py-3 grid grid-cols-3 gap-2">
        <Detail icon={<Tag size={11} />} label="Plat" value={unit.platNomor} />
        <Detail icon={<Gauge size={11} />} label="KM" value={unit.kilometer.toLocaleString('id-ID')} />
        <Detail icon={null} label="Harga Beli" value={idr(unit.hargaBeli)} />
      </div>

      {/* Warna strip */}
      <div className="px-4 pb-3">
        <p className="text-[11px] text-muted font-medium">
          Warna: <span className="text-ink-soft font-semibold">{unit.warna}</span>
          {unit.hargaOtrSaatIni && (
            <> · OTR: <span className="text-primary font-bold">{idr(unit.hargaOtrSaatIni)}</span></>
          )}
        </p>
      </div>
    </div>
  );
};

const Detail = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div>
    <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-muted mb-0.5">
      {icon}{label}
    </p>
    <p className="text-[12px] font-bold text-ink truncate">{value}</p>
  </div>
);
