import { useState } from 'react';
import { Target, Plus, PlayCircle, Lock } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { SelectField } from '@/shared/components/ui/Field';
import { Tooltip } from '@/shared/components/ui/Tooltip';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { notifyApiError } from '@/core/api/notify';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { useTargetBranches, useTargetMutations } from './target.hooks';
import { TargetFormModal } from './TargetFormModal';
import { TargetDetailModal } from './TargetDetailModal';
import { TARGET_STATUS_COLOR, TARGET_STATUS_LABEL, type BranchTarget } from './target.types';

const idr = (n?: number | null) => (n == null ? '-' : formatCurrency(n, { compact: true }));
const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const currentPeriod = () => new Date().toISOString().slice(0, 7);

const TargetPageInner = () => {
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, setSelectedBranchId, branchHeader, branchKey } = useBranchScope();
  const [periodInput, setPeriodInput] = useState(currentPeriod());
  const period = PERIOD_RE.test(periodInput) ? periodInput : undefined;

  const query = useTargetBranches({ period }, branchKey, branchHeader);
  const { data } = query;
  const rows: BranchTarget[] = data?.data ?? [];

  // Backend lookup cabang tidak ada di modul ini — turunkan opsi selector dari cabang yang muncul
  // pada data target (mode "semua cabang" Owner mengembalikan lintas cabang tanpa header).
  const branches = Array.from(
    new Map(rows.filter((r) => r.branch).map((r) => [r.branch!.id, r.branch!])).values(),
  );

  const m = useTargetMutations(branchKey, branchHeader);

  const [formTarget, setFormTarget] = useState<{ item: BranchTarget | null } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmActivate, setConfirmActivate] = useState<BranchTarget | null>(null);
  const [confirmClose, setConfirmClose] = useState<BranchTarget | null>(null);

  const canCreate = can('TARGET_CREATE');
  const createDisabled = isOwner && !selectedBranchId;

  const columns: Column<BranchTarget>[] = [
    {
      header: 'Cabang',
      cell: (r) => <span className="font-bold text-ink text-[13px]">{r.branch?.nama ?? r.branchId}</span>,
    },
    {
      header: 'Periode',
      cell: (r) => <span className="font-semibold text-ink-soft text-[13px]">{r.period}</span>,
    },
    {
      header: 'Target / Aktual Unit',
      align: 'right',
      cell: (r) => (
        <span className="font-semibold text-ink-soft text-[13px]">
          {formatNumber(r.unitTarget)} / {formatNumber(r.actualUnit ?? 0)}
        </span>
      ),
    },
    {
      header: 'Target / Aktual Revenue',
      align: 'right',
      cell: (r) => (
        <span className="font-semibold text-ink-soft text-[13px]">
          {idr(r.revenueTarget)} / {idr(r.actualRevenue ?? 0)}
        </span>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      cell: (r) => (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${TARGET_STATUS_COLOR[r.status]}`}>
          {TARGET_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (r) => (
        <RowActions
          onView={() => setDetailId(r.id)}
          onEdit={r.status === 'DRAFT' && can('TARGET_UPDATE') ? () => setFormTarget({ item: r }) : undefined}
          extra={[
            ...(r.status === 'DRAFT' && can('TARGET_ACTIVATE')
              ? [{ icon: <PlayCircle size={13} />, label: 'Aktifkan', onClick: () => setConfirmActivate(r) }]
              : []),
            ...(r.status === 'ACTIVE' && can('TARGET_CLOSE')
              ? [{ icon: <Lock size={13} />, label: 'Tutup', onClick: () => setConfirmClose(r), variant: 'danger' as const }]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <PageHeader
        title="Target Cabang & Sales"
        description={`${rows.length} target periode ${periodInput}`}
        action={
          canCreate ? (
            createDisabled ? (
              <Tooltip label="Pilih cabang terlebih dahulu untuk membuat target" side="top">
                <Button icon={<Plus size={16} />} disabled>Buat Target</Button>
              </Tooltip>
            ) : (
              <Button icon={<Plus size={16} />} onClick={() => setFormTarget({ item: null })}>Buat Target</Button>
            )
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
        {isOwner && (
          <SelectField
            label=""
            value={selectedBranchId ?? ''}
            onChange={(e) => setSelectedBranchId(e.target.value || null)}
            options={[
              { value: '', label: 'Semua Cabang' },
              ...branches.map((b) => ({ value: b.id, label: b.nama })),
            ]}
          />
        )}
        <input
          type="month"
          value={periodInput}
          onChange={(e) => setPeriodInput(e.target.value)}
          className="h-11 px-3.5 rounded-xl bg-surface border border-border text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      <SectionCard title={`Daftar Target (${rows.length})`} icon={<Target size={16} />} bodyClassName="p-0 md:p-0">
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.id}
          loading={query.isLoading}
          refreshing={query.isFetching && !query.isLoading}
          error={query.isError}
          onRetry={() => query.refetch()}
          emptyState={{
            icon: Target,
            title: isOwner && branches.length === 0 ? 'Belum ada cabang yang dapat dipilih' : 'Belum ada target untuk periode ini',
            description: isOwner && branches.length === 0
              ? 'Backend Target aktif belum menyediakan lookup cabang. Buat target setelah konteks cabang tersedia.'
              : 'Buat target cabang untuk mulai memantau pencapaian.',
          }}
        />
      </SectionCard>

      <TargetFormModal
        key={formTarget ? (formTarget.item?.id ?? 'create') : 'closed'}
        open={!!formTarget}
        onClose={() => setFormTarget(null)}
        target={formTarget?.item}
        branchKey={branchKey}
        branchHeader={branchHeader}
      />

      <TargetDetailModal
        open={!!detailId}
        onClose={() => setDetailId(null)}
        targetId={detailId}
        branchKey={branchKey}
        branchHeader={branchHeader}
      />

      <ConfirmDialog
        open={!!confirmActivate}
        onClose={() => setConfirmActivate(null)}
        onConfirm={() => confirmActivate && m.activate.mutate(confirmActivate.id, { onSuccess: () => setConfirmActivate(null), onError: (e) => notifyApiError(e) })}
        title="Aktifkan Target"
        message="Setelah diaktifkan, target dan distribusi sales tidak dapat diubah lagi."
        confirmLabel="Aktifkan"
        tone="warning"
        loading={m.activate.isPending}
        closeOnConfirm={false}
      />
      <ConfirmDialog
        open={!!confirmClose}
        onClose={() => setConfirmClose(null)}
        onConfirm={() => confirmClose && m.close.mutate(confirmClose.id, { onSuccess: () => setConfirmClose(null), onError: (e) => notifyApiError(e) })}
        title="Tutup Target"
        message="Menutup target akan menyimpan snapshot pencapaian akhir dan tindakan ini tidak dapat dibatalkan."
        confirmLabel="Tutup"
        tone="danger"
        loading={m.close.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};

export const TargetPage = () => (
  <RequirePermission code="TARGET_READ">
    <TargetPageInner />
  </RequirePermission>
);
