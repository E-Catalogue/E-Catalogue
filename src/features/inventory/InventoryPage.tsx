import { useState } from 'react';
import { AlertTriangle, Plus, Search, Loader2, SlidersHorizontal, Boxes, Eye, Pencil, Trash2, RefreshCw, Wrench } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SelectField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useUnitModals } from '@/features/units/useUnitModals';
import { useCreateRekondisi, useUnits, useUpdateUnitStatus } from '@/features/units/unit.hooks';
import { unitApi } from '@/features/units/unit.api';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import type { Unit, StatusUnit } from '@/features/units/unit.types';
import { notifyApiError } from '@/core/api/notify';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';

const TABS: { key: StatusUnit | 'all'; label: string }[] = [
  { key: 'all',         label: 'Semua' },
  { key: 'INVENTORY',   label: 'Inventory' },
  { key: 'READY_STOCK', label: 'Ready Stock' },
  { key: 'HOLD',        label: 'Hold' },
  { key: 'SOLD',        label: 'Terjual' },
];

const STATUS_OPTIONS: { value: StatusUnit; label: string }[] = [
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'READY_STOCK', label: 'Ready Stock' },
  { value: 'HOLD', label: 'Hold' },
  { value: 'SOLD', label: 'Terjual' },
];

const TX_LABEL: Record<string, string> = { AUTOMATIC: 'AT', MANUAL: 'MT' };
const idr = (n?: number | null) => (n == null ? '—' : formatCurrency(n, { compact: true }));

/* ── Filter Modal ── */
interface FilterState {
  tx: 'ALL' | 'MANUAL' | 'AUTOMATIC';
  tahunMin: string;
  tahunMax: string;
  merek: string;
}
const FILTER_DEFAULT: FilterState = { tx: 'ALL', tahunMin: '', tahunMax: '', merek: '' };

const FilterModal = ({
  open, onClose, value, onApply, merkList,
}: {
  open: boolean; onClose: () => void;
  value: FilterState; onApply: (f: FilterState) => void;
  merkList: string[];
}) => {
  const [draft, setDraft] = useState<FilterState>(value);
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(FILTER_DEFAULT);

  // Reset draft every time modal opens
  const handleOpen = () => { if (open) setDraft(value); };
  void handleOpen;

  return (
    <Modal
      open={open} onClose={onClose}
      title="Filter Lanjutan"
      subtitle="Saring unit berdasarkan transmisi, tahun, atau merek"
      icon={<SlidersHorizontal size={18} />}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          {hasChanges && (
            <Button variant="ghost" onClick={() => setDraft(FILTER_DEFAULT)}
              className="!text-semantic-error hover:!bg-semantic-error/8">
              Reset
            </Button>
          )}
          <Button onClick={() => { onApply(draft); onClose(); }}>Terapkan</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2.5">Transmisi</p>
          <div className="flex gap-2">
            {(['ALL', 'AUTOMATIC', 'MANUAL'] as const).map((t) => (
              <button key={t} onClick={() => set('tx', t)}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-colors ${
                  draft.tx === t
                    ? 'bg-primary text-white border-primary shadow-glow'
                    : 'bg-surface-soft border-border text-ink-soft hover:border-primary'
                }`}
              >
                {t === 'ALL' ? 'Semua' : t === 'AUTOMATIC' ? 'AT (Matic)' : 'MT (Manual)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2.5">Rentang Tahun</p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <label className="block text-[10px] text-muted font-semibold mb-1.5">Dari</label>
              <input type="number" placeholder="mis. 2019" value={draft.tahunMin}
                onChange={(e) => set('tahunMin', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-[13px] font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <span className="pb-2.5 text-muted font-bold">–</span>
            <div>
              <label className="block text-[10px] text-muted font-semibold mb-1.5">Sampai</label>
              <input type="number" placeholder="mis. 2024" value={draft.tahunMax}
                onChange={(e) => set('tahunMax', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-[13px] font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        {merkList.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2.5">Merek</p>
            <select value={draft.merek} onChange={(e) => set('merek', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-[13px] font-semibold focus:outline-none focus:border-primary">
              <option value="">Semua Merek</option>
              {merkList.map((mk) => <option key={mk} value={mk}>{mk}</option>)}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ── Main Page ── */
const StatusChangeModal = ({ unit, onClose }: { unit: Unit; onClose: () => void }) => {
  const [draft, setDraft] = useState<StatusUnit>(unit.statusUnit);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const updateStatus = useUpdateUnitStatus();
  const isPending = updateStatus.isPending;

  const handleConfirm = () => {
    updateStatus.mutate(
      { id: unit.id, data: { statusUnit: draft } },
      {
        onError: (err) => notifyApiError(err),
        onSuccess: () => {
          setConfirmOpen(false);
          onClose();
        },
      },
    );
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Ubah Status Unit"
        subtitle={unit.platNomor}
        icon={<RefreshCw size={18} />}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>Batal</Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={isPending || draft === unit.statusUnit}>
              Simpan Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectField
            label="Status Unit"
            value={draft}
            onChange={(e) => setDraft(e.target.value as StatusUnit)}
            options={STATUS_OPTIONS}
          />
          {draft === 'SOLD' && (
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-3 py-2.5 text-[12px] font-semibold text-ink-soft">
              Pastikan unit memang sudah selesai terjual sebelum mengubah status ke Terjual.
            </div>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        closeOnConfirm={false}
        loading={isPending}
        tone="warning"
        icon={AlertTriangle}
        title="Konfirmasi Ubah Status"
        message={`Status ${unit.platNomor} akan diubah dari ${unit.statusUnit} menjadi ${draft}. Lanjutkan?`}
        confirmLabel="Ubah Status"
      />
    </>
  );
};

export const InventoryPage = () => {
  const [tab, setTab]           = useState<StatusUnit | 'all'>('all');
  const [query, setQuery]       = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter]     = useState<FilterState>(FILTER_DEFAULT);
  const [statusUnit, setStatusUnit] = useState<Unit | null>(null);
  const [rekondisiUnitId, setRekondisiUnitId] = useState<string | null>(null);
  const debounced               = useDebouncedValue(query, 400);

  const { data, isLoading, isError } = useUnits({ page: 1, limit: 100, search: debounced || undefined });
  const createRekondisi = useCreateRekondisi();

  const all: Unit[] = data?.data ?? [];
  const merkList = [...new Set(all.map((u) => u.merek?.name).filter(Boolean))].sort() as string[];

  let rows = tab !== 'all' ? all.filter((u) => u.statusUnit === tab) : [...all];
  if (filter.tx !== 'ALL') rows = rows.filter((u) => u.transmisi === filter.tx);
  if (filter.merek)        rows = rows.filter((u) => u.merek?.name === filter.merek);
  if (filter.tahunMin)     rows = rows.filter((u) => u.tahun >= Number(filter.tahunMin));
  if (filter.tahunMax)     rows = rows.filter((u) => u.tahun <= Number(filter.tahunMax));

  const activeFilters = [filter.tx !== 'ALL', !!filter.merek, !!(filter.tahunMin || filter.tahunMax)].filter(Boolean).length;

  const m = useUnitModals();

  const handleCreateRekondisi = async (unit: Unit) => {
    setRekondisiUnitId(unit.id);
    try {
      const check = await unitApi.rekondisiStatusCheck(unit.id);
      if (check.data.hasUnfinishedRekondisi) {
        store.dispatch(showToast({
          type: 'general',
          title: 'Rekondisi masih berjalan',
          message: 'Unit ini masih memiliki rekondisi yang belum selesai.',
        }));
        return;
      }
      await createRekondisi.mutateAsync(unit.id);
    } catch (err) {
      notifyApiError(err);
    } finally {
      setRekondisiUnitId(null);
    }
  };

  const columns: Column<Unit>[] = [
    {
      header: 'Unit',
      cell: (u) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{u.platNomor}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5">{u.merek?.name ?? '—'} {u.tipe?.name ?? ''}</p>
        </div>
      ),
    },
    {
      header: 'Tahun / KM',
      align: 'right',
      cell: (u) => (
        <div className="text-right">
          <p className="font-bold text-ink text-[13px]">{u.tahun}</p>
          <p className="text-[11px] text-muted font-medium">{formatNumber(u.kilometer)} KM</p>
        </div>
      ),
    },
    {
      header: 'Transmisi',
      align: 'center',
      cell: (u) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
          u.transmisi === 'AUTOMATIC' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted/10 text-muted'
        }`}>
          {TX_LABEL[u.transmisi] ?? u.transmisi}
        </span>
      ),
    },
    {
      header: 'Harga Beli',
      align: 'right',
      cell: (u) => <span className="font-bold text-ink text-[13px]">{idr(u.hargaBeli)}</span>,
    },
    {
      header: 'HPP',
      align: 'right',
      cell: (u) => <span className="font-bold text-ink text-[13px]">{idr(u.hpp)}</span>,
    },
    {
      header: 'Target',
      align: 'right',
      cell: (u) => <span className="font-bold text-primary text-[13px]">{idr(u.hargaTargetJual)}</span>,
    },
    {
      header: 'OTR',
      align: 'right',
      cell: (u) => <span className="font-bold text-primary text-[13px]">{idr(u.hargaOtrSaatIni)}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (u) => <StatusBadge status={u.statusUnit} />,
    },
    {
      header: '',
      align: 'right',
      cell: (u) => (
        <ActionMenu items={[
          { icon: <Eye size={13} />, label: 'Lihat Detail', onClick: () => m.openDetail(u) },
          { icon: <Pencil size={13} />, label: 'Edit Unit', onClick: () => m.openEdit(u) },
          { icon: <RefreshCw size={13} />, label: 'Ubah Status', onClick: () => setStatusUnit(u) },
          {
            icon: rekondisiUnitId === u.id ? <Loader2 size={13} className="animate-spin" /> : <Wrench size={13} />,
            label: 'Tambah Rekondisi',
            onClick: () => { void handleCreateRekondisi(u); },
            disabled: rekondisiUnitId === u.id || createRekondisi.isPending,
            dividerAfter: true,
          },
          { icon: <Trash2 size={13} />, label: 'Hapus Unit', onClick: () => m.openDelete(u), variant: 'danger' },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto  space-y-5">
      <PageHeader
        title="Inventori"
        description={`${rows.length} dari ${all.length} unit`}
        action={<Button icon={<Plus size={16} strokeWidth={2.5} />} onClick={m.openCreate}>Tambah Unit</Button>}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TABS.map((t) => {
            const count  = t.key === 'all' ? all.length : all.filter((u) => u.statusUnit === t.key).length;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
                  active ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
                }`}
              >
                {t.label}
                {!isLoading && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    active ? 'bg-white/20 text-white' : 'bg-surface-soft text-muted'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2.5 sm:ml-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari plat nomor, merek..."
              className="w-full sm:w-64 h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <button onClick={() => setFilterOpen(true)}
            className={`relative inline-flex items-center gap-2 h-11 px-4 rounded-xl border font-bold text-[12px] transition-all shrink-0 ${
              activeFilters > 0 ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface border-border text-ink-soft hover:border-primary'
            }`}
          >
            <SlidersHorizontal size={15} /> Filter
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-white text-primary text-[10px] font-extrabold shadow">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <SectionCard
        title={`Daftar Unit (${rows.length})`}
        icon={<Boxes size={16} />}
        bodyClassName="p-0 md:p-0"
        action={activeFilters > 0 ? (
          <button onClick={() => setFilter(FILTER_DEFAULT)} className="text-[11px] font-bold text-primary hover:underline">
            Reset Filter
          </button>
        ) : undefined}
      >
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <Boxes size={32} className="text-muted mx-auto mb-3" />
            <p className="font-bold text-ink text-[14px]">Tidak ada unit yang cocok</p>
            <p className="text-muted text-[12px] font-medium mt-1">Coba ubah filter atau tambahkan unit baru.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={rows} rowKey={(u) => u.id} />
        )}
      </SectionCard>

      {m.modals}

      {statusUnit && (
        <StatusChangeModal
          unit={statusUnit}
          onClose={() => setStatusUnit(null)}
        />
      )}

      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)}
        value={filter} onApply={setFilter} merkList={merkList} />
    </div>
  );
};
