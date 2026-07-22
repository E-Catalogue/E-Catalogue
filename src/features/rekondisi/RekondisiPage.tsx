import { useState } from 'react';
import {
  CheckCircle2, Eye, Plus, Wrench,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { SelectField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useCreateRekondisi, useUnits } from '@/features/units/unit.hooks';
import type { Unit } from '@/features/units/unit.types';
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
  onCreated: (unit: Unit) => void;
}) => {
  const [unitId, setUnitId] = useState('');
  // Backend TIDAK menyediakan lookup unit khusus rekondisi (`/finance/lookups/units` dihapus, dan
  // rekondisi.route.js hanya punya vendors/checks/cash-accounts). Rekondisi memang operasi berbasis
  // unit, jadi pakai daftar unit nyata `/units` lalu saring status INVENTORY di klien.
  const { data: unitsRes, isLoading } = useUnits({ page: 1, limit: 100 });
  const createM = useCreateRekondisi();
  const units = (unitsRes?.data ?? []).filter((u) => u.statusUnit === 'INVENTORY');
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
      await createM.mutateAsync({ id: selected.id });
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
        <SearchableSelect
          label="Unit Inventory"
          required
          value={unitId}
          onChange={setUnitId}
          loading={isLoading}
          options={units.map((unit) => ({ value: unit.id, label: `${unit.platNomor} · ${unit.merek?.name ?? ''} ${unit.tipe?.name ?? ''}`.trim() }))}
          placeholder="Pilih unit inventory"
          searchPlaceholder="Cari plat / merek / tipe..."
          emptyMessage="Tidak ada unit berstatus Inventory."
        />
        {selected && (
          <div className="rounded-xl border border-border bg-surface-soft p-3 text-[12px] font-semibold text-ink-soft">
            Harga beli: <span className="font-bold text-ink">{idr(selected.purchaseCost)}</span>
            {selected.purchaseCashTransactionId && (
              <span className="ml-2 text-primary">Pembelian sudah tercatat kas</span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

const RekondisiPageInner = () => {
  const { can } = usePermissions();
  const [status, setStatus] = useState<RekondisiStatus | ''>('');
  const [unitId, setUnitId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailUnit, setDetailUnit] = useState<{ id: string; label?: string } | null>(null);

  // Filter unit: pakai daftar unit nyata (lihat catatan di CreateRekondisiModal — tidak ada lookup rekondisi).
  const { data: unitLookup } = useUnits({ page: 1, limit: 100 });
  const { data, isLoading, isError } = useRekondisis({ page: 1, limit: 100, status: status || undefined, unitId: unitId || undefined });

  const rows: Rekondisi[] = data?.data ?? [];
  const units = (unitLookup?.data ?? []).filter((u) => u.statusUnit === 'INVENTORY');
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
        action={can('REKONDISI_CREATE') ? <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Buat Rekondisi</Button> : undefined}
      />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-3">
        <SelectField
          label=""
          value={status}
          onChange={(e) => setStatus(e.target.value as RekondisiStatus | '')}
          options={STATUS_OPTIONS}
        />
        <SearchableSelect
          value={unitId}
          onChange={setUnitId}
          clearable
          options={units.map((unit) => ({ value: unit.id, label: `${unit.platNomor} · ${unit.merek?.name ?? ''} ${unit.tipe?.name ?? ''}`.trim() }))}
          placeholder="Semua Unit"
          searchPlaceholder="Cari unit..."
          emptyMessage="Tidak ada unit."
        />
      </div>

      <SectionCard title={`Daftar Rekondisi (${rows.length})`} icon={<Wrench size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
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
        onCreated={(unit) => setDetailUnit({ id: unit.id, label: `${unit.platNomor} · ${unit.merek?.name ?? ''} ${unit.tipe?.name ?? ''}`.trim() })}
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

export const RekondisiPage = () => (
  <RequirePermission code="REKONDISI_READ">
    <RekondisiPageInner />
  </RequirePermission>
);
