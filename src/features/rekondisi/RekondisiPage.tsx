import { useState } from 'react';
import { CheckCircle2, Eye, Loader2, Plus, Search, Wrench } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { SelectField } from '@/shared/components/ui/Field';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { useLookupUnits } from '@/features/finance/finance.hooks';
import type { LookupUnit } from '@/features/finance/types';
import { useCreateRekondisi } from '@/features/units/unit.hooks';
import { unitApi } from '@/features/units/unit.api';
import { notifyApiError } from '@/core/api/notify';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { RekondisiDetailModal } from './RekondisiDetailModal';
import { useRekondisis } from './rekondisi.hooks';
import {
  REKONDISI_STATUS_COLOR,
  REKONDISI_STATUS_LABEL,
  type Rekondisi,
  type RekondisiStatus,
} from './rekondisi.types';

const idr = (n?: number | null) => (n == null ? '-' : formatCurrency(n, { compact: true }));

const STATUS_OPTIONS: Array<{ value: RekondisiStatus | ''; label: string }> = [
  { value: '', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'IN_PROGRESS', label: 'Dalam Proses' },
  { value: 'COMPLETED', label: 'Selesai' },
];

const CreateRekondisiModal = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (unit: LookupUnit) => void;
}) => {
  const [search, setSearch] = useState('');
  const [unitId, setUnitId] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data: unitsRes, isLoading } = useLookupUnits({ search: debounced || undefined, statusUnit: 'INVENTORY' });
  const createM = useCreateRekondisi();
  const units = unitsRes?.data ?? [];
  const selected = units.find((unit) => unit.id === unitId);

  const handleCreate = async () => {
    if (!selected) return;
    try {
      const check = await unitApi.rekondisiStatusCheck(selected.id);
      if (check.data.hasUnfinishedRekondisi) {
        store.dispatch(showToast({
          type: 'general',
          title: 'Rekondisi masih berjalan',
          message: 'Unit ini masih memiliki rekondisi yang belum selesai.',
        }));
        return;
      }
      await createM.mutateAsync(selected.id);
      onCreated(selected);
      onClose();
    } catch (err) {
      notifyApiError(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buat Rekondisi"
      subtitle="Pilih unit inventory untuk memulai rekondisi"
      icon={<Wrench size={18} />}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createM.isPending}>Batal</Button>
          <Button icon={<Plus size={15} />} onClick={handleCreate} disabled={!unitId || createM.isPending}>
            {createM.isPending ? 'Membuat...' : 'Buat Rekondisi'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Cari Unit</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari plat, merek, atau tipe..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <SelectField
          label="Unit Inventory"
          required
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          options={[
            { value: '', label: isLoading ? 'Memuat unit...' : 'Pilih unit' },
            ...units.map((unit) => ({
              value: unit.id,
              label: `${unit.platNomor} - ${unit.merekName} ${unit.tipeName}`,
            })),
          ]}
        />
        {selected && (
          <div className="rounded-xl border border-border bg-surface-soft p-3 text-[12px] font-semibold text-ink-soft">
            Harga beli: <span className="font-bold text-ink">{idr(selected.hargaBeli)}</span>
            {selected.purchaseCashTransactionId && (
              <span className="ml-2 text-primary">Pembelian sudah tercatat kas</span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export const RekondisiPage = () => {
  const [status, setStatus] = useState<RekondisiStatus | ''>('');
  const [unitSearch, setUnitSearch] = useState('');
  const [unitId, setUnitId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailUnit, setDetailUnit] = useState<{ id: string; label?: string } | null>(null);
  const debouncedUnit = useDebouncedValue(unitSearch, 350);

  const { data: unitLookup } = useLookupUnits({ search: debouncedUnit || undefined, statusUnit: 'INVENTORY' });
  const { data, isLoading, isError } = useRekondisis({ page: 1, limit: 100, status: status || undefined, unitId: unitId || undefined });

  const rows: Rekondisi[] = data?.data ?? [];
  const units = unitLookup?.data ?? [];
  const total = data?.meta?.total ?? rows.length;

  const columns: Column<Rekondisi>[] = [
    {
      header: 'Unit',
      cell: (r) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{r.unit?.platNomor ?? r.unitId}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5">Seq #{r.seq}</p>
        </div>
      ),
    },
    {
      header: 'Vendor',
      cell: (r) => <span className="font-semibold text-ink-soft text-[13px]">{r.vendor?.name ?? '-'}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (r) => (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${REKONDISI_STATUS_COLOR[r.status]}`}>
          {REKONDISI_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      header: 'Tanggal',
      align: 'right',
      cell: (r) => <span className="font-semibold text-ink-soft text-[13px]">{formatDate(r.tanggal)}</span>,
    },
    {
      header: 'Nominal',
      align: 'right',
      cell: (r) => <span className="font-bold text-ink text-[13px]">{idr(r.nominal)}</span>,
    },
    {
      header: 'Total',
      align: 'right',
      cell: (r) => <span className="font-bold text-primary text-[13px]">{idr(r.total)}</span>,
    },
    {
      header: 'Bayar',
      align: 'center',
      cell: (r) => r.paidAt ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-green/10 text-accent-green text-[10px] font-bold">
          <CheckCircle2 size={12} /> Paid
        </span>
      ) : (
        <span className="text-[11px] font-semibold text-muted">Belum</span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (r) => (
        <ActionMenu items={[
          {
            icon: <Eye size={13} />,
            label: 'Kelola Detail',
            onClick: () => setDetailUnit({ id: r.unitId, label: r.unit?.platNomor ?? r.unitId }),
            variant: 'primary',
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto  space-y-5">
      <PageHeader
        title="Rekondisi"
        description={`${total} data rekondisi`}
        action={<Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Buat Rekondisi</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_260px] gap-3">
        <SelectField
          label=""
          value={status}
          onChange={(e) => setStatus(e.target.value as RekondisiStatus | '')}
          options={STATUS_OPTIONS}
        />
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
            placeholder="Cari unit untuk filter..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="h-11 px-3.5 rounded-xl bg-surface border border-border text-sm font-semibold"
        >
          <option value="">Semua Unit</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>{unit.platNomor} - {unit.merekName} {unit.tipeName}</option>
          ))}
        </select>
      </div>

      <SectionCard title={`Daftar Rekondisi (${rows.length})`} icon={<Wrench size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat rekondisi.</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <Wrench size={32} className="text-muted mx-auto mb-3" />
            <p className="font-bold text-ink text-[14px]">Belum ada rekondisi.</p>
            <p className="text-muted text-[12px] font-medium mt-1">Buat rekondisi dari unit inventory untuk mulai mencatat pekerjaan.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={rows} rowKey={(r) => r.id} />
        )}
      </SectionCard>

      <CreateRekondisiModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(unit) => setDetailUnit({ id: unit.id, label: `${unit.platNomor} - ${unit.merekName} ${unit.tipeName}` })}
      />

      <RekondisiDetailModal
        open={!!detailUnit}
        onClose={() => setDetailUnit(null)}
        unitId={detailUnit?.id ?? null}
        unitLabel={detailUnit?.label}
      />
    </div>
  );
};
