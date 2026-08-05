import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Search, Loader2, SlidersHorizontal, Boxes, Eye, Pencil, Trash2, RefreshCw, Wrench, LayoutGrid, Table2, Share2, X, Landmark, Copy } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SelectField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useUnitModals } from '@/features/units/useUnitModals';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useCreateRekondisi, useRekondisiStatusCheck, useUnits, useUpdateUnitStatus } from '@/features/units/unit.hooks';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { BAHAN_BAKAR_LABEL, type Unit, type StatusUnit } from '@/features/units/unit.types';
import { unitDisplayName } from '@/features/units/unit.display';
import { notifyApiError } from '@/core/api/notify';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { unitApi } from '@/features/units/unit.api';
import { buildUnitCopyText, buildUnitShareMessage, buildWhatsAppShareUrl } from '@/core/utils/whatsapp';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';

const STATUS_LABEL: Record<StatusUnit, string> = { INVENTORY: 'Inventory', READY_STOCK: 'Ready Stock', HOLD: 'Hold', SOLD: 'Terjual' };
const cardStatus = (status: StatusUnit): Exclude<StatusUnit, 'HOLD'> => ['READY_STOCK', 'SOLD'].includes(status) ? status as 'READY_STOCK' | 'SOLD' : 'INVENTORY';
const cardStatusLabel = (status: StatusUnit) => cardStatus(status) === 'INVENTORY' ? 'Coming Soon' : STATUS_LABEL[cardStatus(status)];

const TABLE_STATUS_OPTIONS: { value: StatusUnit; label: string }[] = [
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'HOLD', label: 'Hold' },
  { value: 'READY_STOCK', label: 'Ready Stock' },
  { value: 'SOLD', label: 'Terjual' },
];
const CARD_STATUS_OPTIONS: { value: StatusUnit; label: string }[] = [
  { value: 'INVENTORY', label: 'Coming Soon' },
  { value: 'READY_STOCK', label: 'Ready Stock' },
  { value: 'SOLD', label: 'Terjual' },
];
const STATUS_CHANGE_OPTIONS = [
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'HOLD', label: 'Hold' },
  { value: 'READY_STOCK', label: 'Ready Stock' },
];

const TX_LABEL: Record<string, string> = { AUTOMATIC: 'AT', MANUAL: 'MT' };
const idr = (n?: number | null) => (n == null ? '—' : formatCurrency(n, { compact: true }));

/* ── Filter Modal ── */
type OwnerFilter = 'ALL' | 'COMPANY_OWNED' | 'INVESTOR';
type StockAgeFilter = 'ALL' | 'lt30' | '30to60' | '60to90' | 'gt90';
interface FilterState {
  statuses: StatusUnit[];
  tx: 'ALL' | 'MANUAL' | 'AUTOMATIC';
  tahunMin: string;
  tahunMax: string;
  merek: string;
  owner: OwnerFilter;
  stockAge: StockAgeFilter;
}
const FILTER_DEFAULT: FilterState = { statuses: [], tx: 'ALL', tahunMin: '', tahunMax: '', merek: '', owner: 'ALL', stockAge: 'ALL' };

const OWNER_LABEL: Record<OwnerFilter, string> = { ALL: 'Semua', COMPANY_OWNED: 'Perusahaan', INVESTOR: 'Investor' };
const STOCK_AGE_OPTIONS: { value: StockAgeFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'lt30', label: '< 30 hari' },
  { value: '30to60', label: '30–60 hari' },
  { value: '60to90', label: '60–90 hari' },
  { value: 'gt90', label: '> 90 hari' },
];

/** Umur stock (hari) sejak readyStockAt; null jika unit belum pernah READY. */
const stockAgeDays = (readyStockAt?: string | null): number | null => {
  if (!readyStockAt) return null;
  const ms = Date.now() - new Date(readyStockAt).getTime();
  return ms < 0 ? 0 : Math.floor(ms / 86_400_000);
};
const matchStockAge = (readyStockAt: string | null | undefined, bucket: StockAgeFilter): boolean => {
  const d = stockAgeDays(readyStockAt);
  if (d === null) return false;
  if (bucket === 'lt30') return d < 30;
  if (bucket === '30to60') return d >= 30 && d < 60;
  if (bucket === '60to90') return d >= 60 && d < 90;
  if (bucket === 'gt90') return d >= 90;
  return true;
};

const FilterModal = ({
  open, onClose, value, onApply, merkList, view,
}: {
  open: boolean; onClose: () => void;
  value: FilterState; onApply: (f: FilterState) => void;
  merkList: string[];
  view: 'table' | 'card';
}) => {
  const [draft, setDraft] = useState<FilterState>(value);
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(FILTER_DEFAULT);
  const statusOptions = view === 'card' ? CARD_STATUS_OPTIONS : TABLE_STATUS_OPTIONS;

  return (
    <Modal
      open={open} onClose={onClose}
      title="Filter Lanjutan"
      subtitle="Saring unit: transmisi, tahun, merek, pemilik, atau umur stock"
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
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2.5">Status Unit</p>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => {
              const active = draft.statuses.includes(option.value);
              return <button key={option.value} type="button" onClick={() => set('statuses', active ? draft.statuses.filter((status) => status !== option.value) : [...draft.statuses, option.value])}
                className={`py-2.5 rounded-xl text-[12px] font-bold border transition-colors ${active ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-soft border-border text-ink-soft hover:border-primary'}`}>
                {option.label}
              </button>;
            })}
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-muted">Tidak memilih status berarti menampilkan semua.</p>
        </div>
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
          <SelectField
            label="Merek"
            value={draft.merek}
            onChange={(e) => set('merek', e.target.value)}
            options={[{ value: '', label: 'Semua Merek' }, ...merkList.map((mk) => ({ value: mk, label: mk }))]}
          />
        )}

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2.5">Pemilik Unit</p>
          <div className="flex gap-2">
            {(['ALL', 'COMPANY_OWNED', 'INVESTOR'] as OwnerFilter[]).map((o) => (
              <button key={o} onClick={() => set('owner', o)}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-colors ${
                  draft.owner === o ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-soft border-border text-ink-soft hover:border-primary'
                }`}
              >
                {OWNER_LABEL[o]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2.5">Umur Stock (sejak Ready)</p>
          <div className="grid grid-cols-3 gap-2">
            {STOCK_AGE_OPTIONS.map((o) => (
              <button key={o.value} onClick={() => set('stockAge', o.value)}
                className={`py-2 rounded-xl text-[12px] font-bold border transition-colors ${
                  draft.stockAge === o.value ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-soft border-border text-ink-soft hover:border-primary'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

/* ── Main Page ── */
const StatusChangeModal = ({ unit, onClose }: { unit: Unit; onClose: () => void }) => {
  const [draft, setDraft] = useState<StatusUnit>(unit.statusUnit);
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const updateStatus = useUpdateUnitStatus();
  const isPending = updateStatus.isPending;

  const handleConfirm = () => {
    updateStatus.mutate(
      { id: unit.id, data: { statusUnit: draft, ...(draft === 'INVENTORY' ? { reason } : {}) } },
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
            <Button onClick={() => setConfirmOpen(true)} disabled={isPending || draft === unit.statusUnit || (unit.statusUnit === 'READY_STOCK' && draft === 'INVENTORY' && reason.trim().length < 5)}>
              Simpan Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Status Unit"
            value={draft}
            onChange={(value) => setDraft(value as StatusUnit)}
            options={STATUS_CHANGE_OPTIONS}
            searchPlaceholder="Cari status..."
          />
          <p className="text-[11px] font-semibold text-muted">Status Ready Stock memerlukan harga, pendanaan, rekondisi, dan keterangan leasing yang lengkap. Status Terjual hanya berubah melalui proses penjualan.</p>
          {unit.statusUnit === 'READY_STOCK' && draft === 'INVENTORY' && <label className="block text-[12px] font-bold text-ink">Alasan buka kembali harga<textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5 min-h-20 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-primary" placeholder="Contoh: koreksi harga beli atau rekondisi" /></label>}
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
        message={`Status ${unit.platNomor} akan diubah dari ${STATUS_LABEL[unit.statusUnit]} menjadi ${STATUS_LABEL[draft]}. Lanjutkan?`}
        confirmLabel="Ubah Status"
      />
    </>
  );
};

const CreateRekondisiModal = ({ unit, onClose }: { unit: Unit; onClose: () => void }) => {
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: checkRes, isLoading: checking } = useRekondisiStatusCheck(unit.id);
  const createRekondisi = useCreateRekondisi();
  const blocked = !!checkRes?.data.hasUnfinishedRekondisi;

  const handleConfirm = () => {
    createRekondisi.mutate(
      { id: unit.id, keterangan: notes },
      {
        onError: (err) => notifyApiError(err),
        onSuccess: () => { setConfirmOpen(false); onClose(); },
      },
    );
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Tambah Rekondisi"
        subtitle={unit.platNomor}
        icon={<Wrench size={18} />}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={createRekondisi.isPending}>Batal</Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={checking || blocked}>Buat Rekondisi</Button>
          </>
        }
      >
        {checking ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-muted" /></div>
        ) : blocked ? (
          <div className="rounded-xl border border-semantic-error/30 bg-semantic-error/10 px-3 py-2.5 text-[12px] font-semibold text-semantic-error">
            Unit ini masih memiliki rekondisi yang belum selesai. Selesaikan rekondisi berjalan sebelum membuat yang baru.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-muted font-medium leading-relaxed">
              Rekondisi baru akan dibuat berstatus Draft. Vendor dan item pekerjaan bisa dilengkapi setelahnya di menu Rekondisi.
            </p>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Catatan Awal (opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="mis. Ganti kampas rem & servis AC"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-none"
              />
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        closeOnConfirm={false}
        loading={createRekondisi.isPending}
        tone="primary"
        icon={Wrench}
        title="Konfirmasi Tambah Rekondisi"
        message={`Buat rekondisi baru untuk unit ${unit.platNomor}?`}
        confirmLabel="Ya, Buat"
      />
    </>
  );
};

const InventoryPageInner = () => {
  const { can } = usePermissions();
  const [view, setView] = useState<'table' | 'card'>(() => {
    const stored = localStorage.getItem('inventory-view');
    if (stored === 'table' || stored === 'card') return stored;
    return window.matchMedia('(max-width: 639px)').matches ? 'card' : 'table';
  });
  const [query, setQuery]       = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter]     = useState<FilterState>(FILTER_DEFAULT);
  const [statusUnit, setStatusUnit] = useState<Unit | null>(null);
  const [rekondisiTarget, setRekondisiTarget] = useState<Unit | null>(null);
  const debounced               = useDebouncedValue(query, 400);

  useEffect(() => localStorage.setItem('inventory-view', view), [view]);

  const { data, isLoading, isError } = useUnits({ page: 1, limit: 100, search: debounced || undefined });

  const all: Unit[] = data?.data ?? [];
  const merkList = [...new Set(all.map((u) => u.merek?.name).filter(Boolean))].sort() as string[];

  let rows = filter.statuses.length ? all.filter((u) => filter.statuses.includes(view === 'card' ? cardStatus(u.statusUnit) : u.statusUnit)) : [...all];
  if (filter.tx !== 'ALL') rows = rows.filter((u) => u.transmisi === filter.tx);
  if (filter.merek)        rows = rows.filter((u) => u.merek?.name === filter.merek);
  if (filter.tahunMin)     rows = rows.filter((u) => u.tahun >= Number(filter.tahunMin));
  if (filter.tahunMax)     rows = rows.filter((u) => u.tahun <= Number(filter.tahunMax));
  if (filter.owner !== 'ALL') rows = rows.filter((u) => (u.fundingAgreement?.fundingSource ?? 'COMPANY_OWNED') === filter.owner);
  if (filter.stockAge !== 'ALL') rows = rows.filter((u) => matchStockAge(u.readyStockAt, filter.stockAge));

  const activeFilters = [filter.statuses.length > 0, filter.tx !== 'ALL', !!filter.merek, !!(filter.tahunMin || filter.tahunMax), filter.owner !== 'ALL', filter.stockAge !== 'ALL'].filter(Boolean).length;

  const m = useUnitModals();

  const shareUnit = (unit: Unit) => {
    const target = window.open('about:blank', '_blank');
    if (target) target.opener = null;
    unitApi.get(unit.id).then((response) => {
      const url = buildWhatsAppShareUrl(buildUnitShareMessage(response.data));
      if (target) target.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    }).catch((error) => { target?.close(); notifyApiError(error); });
  };

  const copyUnit = async (unit: Unit) => {
    try {
      const response = await unitApi.get(unit.id);
      await navigator.clipboard.writeText(buildUnitCopyText(response.data));
      store.dispatch(showToast({
        type: 'general',
        variant: 'success',
        title: 'Berhasil disalin',
        message: 'Informasi unit sudah tersimpan di clipboard.',
      }));
    } catch (error) {
      notifyApiError(error, 'Informasi unit gagal disalin. Izinkan akses clipboard lalu coba lagi.');
    }
  };

  const actionItems = (unit: Unit) => [
    { icon: <Eye size={13} />, label: 'Lihat Detail', onClick: () => m.openDetail(unit) },
    { icon: <Share2 size={13} />, label: 'Bagikan WhatsApp', onClick: () => shareUnit(unit), variant: 'primary' as const },
    ...(can('UNIT_UPDATE') ? [
      { icon: <Pencil size={13} />, label: 'Edit Unit', onClick: () => m.openEdit(unit) },
      { icon: <Landmark size={13} />, label: 'Data Leasing', onClick: () => m.openLeasing(unit) },
      ...(unit.statusUnit !== 'SOLD' ? [{ icon: <RefreshCw size={13} />, label: 'Ubah Status Unit', onClick: () => setStatusUnit(unit) }] : []),
    ] : []),
    ...(can('REKONDISI_CREATE') ? [{ icon: <Wrench size={13} />, label: 'Tambah Rekondisi', onClick: () => setRekondisiTarget(unit), dividerAfter: true }] : []),
    ...(can('UNIT_DELETE') ? [{ icon: <Trash2 size={13} />, label: 'Hapus Unit', onClick: () => m.openDelete(unit), variant: 'danger' as const }] : []),
  ];

  const columns: Column<Unit>[] = [
    {
      header: 'Unit',
      cell: (u) => {
        const investor = u.fundingAgreement?.fundingSource === 'INVESTOR';
        return (
          <div className="min-w-0">
            <p className="font-bold text-ink text-[13px] truncate" title={unitDisplayName(u)}>{unitDisplayName(u)}</p>
            <p className="text-[11px] text-muted font-medium mt-0.5 truncate">{[u.merek?.name, u.tipe?.name].filter(Boolean).join(' ') || '—'} · {u.platNomor}</p>
            <span className={`inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${investor ? 'bg-accent-amber/10 text-accent-amber' : 'bg-accent-blue/10 text-accent-blue'}`}>
              {investor ? (u.fundingAgreement?.investor?.name ?? 'Investor') : 'Milik Perusahaan'}
            </span>
          </div>
        );
      },
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
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
            u.transmisi === 'AUTOMATIC' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted/10 text-muted'
          }`}>
            {TX_LABEL[u.transmisi] ?? u.transmisi}
          </span>
          {u.bahanBakar && <span className="text-[10px] font-bold text-muted">{BAHAN_BAKAR_LABEL[u.bahanBakar]}</span>}
        </div>
      ),
    },
    {
      header: 'Harga Beli',
      align: 'right',
      cell: (u) => <span className="font-bold text-ink text-[13px]">{idr(u.purchaseCost)}</span>,
    },
    {
      header: 'HPP',
      align: 'right',
      cell: (u) => <span className="font-bold text-ink text-[13px]">{idr(u.pricingCostBasis)}</span>,
    },
    {
      header: 'Target',
      align: 'right',
      cell: (u) => <span className="font-bold text-primary text-[13px]">{idr(u.targetPrice)}</span>,
    },
    {
      header: 'OTR',
      align: 'right',
      cell: (u) => <span className="font-bold text-primary text-[13px]">{idr(u.otrPrice)}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (u) => {
        const age = stockAgeDays(u.readyStockAt);
        return (
          <div className="flex flex-col items-center gap-1">
            <StatusBadge status={u.statusUnit} />
            {u.statusUnit === 'READY_STOCK' && age !== null && (
              <span className={`text-[10px] font-bold ${age > 90 ? 'text-semantic-error' : age > 60 ? 'text-accent-amber' : 'text-muted'}`}>{age} hari</span>
            )}
          </div>
        );
      },
    },
    {
      header: '',
      align: 'right',
      cell: (u) => (
        <ActionMenu items={actionItems(u)} />
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto  space-y-5">
      <PageHeader
        title="Inventori"
        description={`${rows.length} dari ${all.length} unit`}
        action={can('UNIT_CREATE') ? <Button icon={<Plus size={16} strokeWidth={2.5} />} onClick={m.openCreate}>Tambah Unit</Button> : undefined}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="inline-flex self-start rounded-xl border border-border bg-surface p-1">
          <button type="button" onClick={() => setView('table')} className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-bold transition-colors ${view === 'table' ? 'bg-primary text-white shadow-glow' : 'text-muted hover:text-primary'}`}><Table2 size={15} /> Tabel</button>
          <button type="button" onClick={() => setView('card')} className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-bold transition-colors ${view === 'card' ? 'bg-primary text-white shadow-glow' : 'text-muted hover:text-primary'}`}><LayoutGrid size={15} /> Kartu</button>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2.5 sm:ml-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
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

      {filter.statuses.length > 0 && <div className="flex items-center gap-2 flex-wrap -mt-2">
        <span className="text-[11px] font-bold text-muted">Status:</span>
        {filter.statuses.map((status) => <button key={status} type="button" onClick={() => setFilter((current) => ({ ...current, statuses: current.statuses.filter((item) => item !== status) }))}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-light px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/15">{STATUS_LABEL[status]} <X size={12} /></button>)}
      </div>}

      <SectionCard
        title={`Daftar Unit (${rows.length})`}
        icon={view === 'table' ? <Table2 size={16} /> : <LayoutGrid size={16} />}
        bodyClassName={view === 'table' ? 'p-0 md:p-0' : 'p-4 md:p-5'}
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
        ) : view === 'table' ? (
          <DataTable columns={columns} data={rows} rowKey={(u) => u.id} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {rows.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onView={m.openCardDetail}
                statusOverride={cardStatus(unit.statusUnit)}
                statusLabelOverride={cardStatusLabel(unit.statusUnit)}
                actions={(
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => copyUnit(unit)}
                      className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all active:scale-[0.97] bg-accent-blue/10 text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/20"
                    >
                      <Copy size={13} /> Salin
                    </button>
                    <button
                      type="button"
                      onClick={() => shareUnit(unit)}
                      className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all active:scale-[0.97] bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/25 hover:bg-[#25D366]/20"
                    >
                      <Share2 size={13} /> Bagikan WA
                    </button>
                  </div>
                )}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {m.modals}

      {statusUnit && (
        <StatusChangeModal
          unit={statusUnit}
          onClose={() => setStatusUnit(null)}
        />
      )}

      {rekondisiTarget && (
        <CreateRekondisiModal
          unit={rekondisiTarget}
          onClose={() => setRekondisiTarget(null)}
        />
      )}

      {filterOpen && <FilterModal open onClose={() => setFilterOpen(false)}
        value={filter} onApply={setFilter} merkList={merkList} view={view} />}
    </div>
  );
};

export const InventoryPage = () => (
  <RequirePermission code="UNIT_READ">
    <InventoryPageInner />
  </RequirePermission>
);
