import { useState } from 'react';
import { PiggyBank, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SelectField } from '@/shared/components/ui/Field';
import { DateField } from '@/shared/components/ui/DateField';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useInvestors } from '@/features/master/master.hooks';
import { formatCurrency, formatDate } from '@/core/utils/format';
import { notifyApiError } from '@/core/api/notify';
import { useInvestorObligationMutations, useInvestorObligations } from './investor-obligation.hooks';
import {
  OBLIGATION_STATUS_COLOR, OBLIGATION_STATUS_LABEL, OBLIGATION_TYPE_LABEL,
  type InvestorObligation, type InvestorObligationStatus, type InvestorObligationType,
} from './investor-obligation.types';
import { InvestorObligationDetailModal } from './InvestorObligationDetailModal';

const STATUS_OPTIONS: InvestorObligationStatus[] = ['ACCRUED', 'DUE', 'PARTIALLY_PAID', 'PAID', 'REVERSED'];
const TYPE_OPTIONS: InvestorObligationType[] = ['FIXED_RETURN', 'PRINCIPAL', 'PROFIT_SHARE'];
const SUMMARY_STATUSES: InvestorObligationStatus[] = ['ACCRUED', 'DUE', 'PARTIALLY_PAID', 'PAID'];

const isOverdue = (o: InvestorObligation) =>
  new Date(o.dueDate).getTime() < Date.now() && o.status !== 'PAID' && o.status !== 'REVERSED';

/** Kartu ringkasan per status — memakai `meta.total` dari list endpoint (limit=1) karena
 * backend tidak menyediakan endpoint agregat khusus untuk obligation (lihat catatan gap). */
const SummaryCards = ({ branchKey, headers, investorId }: { branchKey: string; headers: Record<string, string> | undefined; investorId?: string }) => {
  const counts = SUMMARY_STATUSES.map((status) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInvestorObligations(branchKey, { page: 1, limit: 1, status, investorId }, headers),
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {SUMMARY_STATUSES.map((status, i) => {
        const total = counts[i].data?.meta?.total ?? 0;
        const loading = counts[i].isLoading;
        return (
          <div key={status} className="bg-surface rounded-2xl border border-border shadow-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{OBLIGATION_STATUS_LABEL[status]}</p>
            <p className="text-xl font-extrabold text-ink mt-1">{loading ? '…' : total}</p>
          </div>
        );
      })}
    </div>
  );
};

const GenerateAction = ({
  branchKey, headers, disabled, disabledReason,
}: { branchKey: string; headers: Record<string, string> | undefined; disabled: boolean; disabledReason?: string }) => {
  const [open, setOpen] = useState(false);
  const [throughDate, setThroughDate] = useState('');
  const m = useInvestorObligationMutations(branchKey);

  return (
    <>
      <Button
        icon={<RefreshCw size={15} />}
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
      >
        Generate Kewajiban
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => m.generate.mutate(
          { data: throughDate ? { throughDate } : {}, headers },
          { onSuccess: () => setOpen(false), onError: (e) => notifyApiError(e) },
        )}
        closeOnConfirm={false}
        loading={m.generate.isPending}
        tone="primary"
        icon={RefreshCw}
        title="Generate Kewajiban Investor"
        message="Sistem akan membuat/memperbarui kewajiban FIXED_RETURN yang jatuh tempo sampai tanggal berikut untuk cabang aktif. Aman dipanggil ulang (idempotent per siklus)."
        confirmLabel="Ya, Generate"
      >
        <DateField
          label="Sampai Tanggal (opsional)"
          value={throughDate}
          onChange={(v) => setThroughDate(v)}
        />
        <p className="text-[11px] text-muted font-medium mt-1.5">Kosongkan untuk memakai tanggal hari ini.</p>
      </ConfirmDialog>
    </>
  );
};

export const InvestorObligationPage = () => {
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, branchHeader, branchKey } = useBranchScope();
  const { data: investorsRes } = useInvestors({ page: 1, limit: 100 });
  const investors = investorsRes?.data ?? [];

  const [page, setPage] = useState(1);
  const [investorId, setInvestorId] = useState('');
  const [status, setStatus] = useState<InvestorObligationStatus | ''>('');
  const [type, setType] = useState<InvestorObligationType | ''>('');
  const [dueBefore, setDueBefore] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const params = {
    page, limit: 10,
    investorId: investorId || undefined,
    status: status || undefined,
    type: type || undefined,
    dueBefore: dueBefore || undefined,
  };
  const { data, isLoading, isError } = useInvestorObligations(branchKey, params, branchHeader);
  const obligations = data?.data ?? [];

  const mutationBlocked = isOwner && !selectedBranchId;

  const columns: Column<InvestorObligation>[] = [
    {
      header: 'Investor', cell: (r) => (
        <div>
          <p className="font-bold text-ink">{r.investor?.name ?? '-'}</p>
          <p className="text-[11px] font-medium text-muted">{r.investor?.code}</p>
        </div>
      ),
    },
    {
      header: 'Cabang', cell: (r) => (
        <div>
          <p className="font-semibold text-ink text-[12px]">{r.branch?.nama ?? '-'}</p>
          <p className="text-[11px] font-medium text-muted">{r.branch?.code}</p>
        </div>
      ),
    },
    { header: 'Tipe', cell: (r) => <span className="text-[11px] font-bold text-ink-soft">{OBLIGATION_TYPE_LABEL[r.type]}</span> },
    {
      header: 'Siklus', cell: (r) => (
        <span className="text-[11px] font-medium text-muted">{formatDate(r.cycleStart)} – {formatDate(r.cycleEnd)}</span>
      ),
    },
    {
      header: 'Jatuh Tempo', cell: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-ink">{formatDate(r.dueDate)}</span>
          {isOverdue(r) && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-semantic-error/10 text-semantic-error text-[9px] font-bold uppercase">
              <AlertTriangle size={10} /> Overdue
            </span>
          )}
        </div>
      ),
    },
    { header: 'Nominal', align: 'right', cell: (r) => <span className="font-bold text-ink">{formatCurrency(r.amount)}</span> },
    { header: 'Dibayar', align: 'right', cell: (r) => <span className="font-semibold text-accent-green">{formatCurrency(r.paidAmount)}</span> },
    { header: 'Sisa', align: 'right', cell: (r) => <span className="font-bold text-ink">{formatCurrency(r.amount - r.paidAmount)}</span> },
    {
      header: 'Status', align: 'center', cell: (r) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${OBLIGATION_STATUS_COLOR[r.status]}`}>
          {OBLIGATION_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      header: '', align: 'right', cell: (r) => (
        <RowActions onView={() => setDetailId(r.id)} label="Aksi" />
      ),
    },
  ];

  return (
    <RequirePermission code="INVESTOR_OBLIGATION_READ">
      <div className="max-w-[1400px] mx-auto space-y-5">
        <PageHeader
          title="Kewajiban Investor"
          description="Daftar & aging kewajiban fixed return, principal, dan bagi hasil investor"
          action={can('INVESTOR_OBLIGATION_GENERATE') && (
            <GenerateAction
              branchKey={branchKey}
              headers={branchHeader}
              disabled={mutationBlocked}
              disabledReason="Pilih cabang terlebih dahulu untuk generate kewajiban"
            />
          )}
        />

        {mutationBlocked && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 text-[12px] font-semibold text-accent-amber">
            <AlertTriangle size={16} className="shrink-0" />
            Pilih cabang aktif di header (pojok kanan atas) untuk melakukan aksi generate, pembayaran, atau reversal.
          </div>
        )}

        <SummaryCards branchKey={branchKey} headers={branchHeader} investorId={investorId || undefined} />

        <SectionCard title="Filter" icon={<Search size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectField
              label="Investor"
              value={investorId}
              onChange={(e) => { setInvestorId(e.target.value); setPage(1); }}
              options={[{ value: '', label: 'Semua Investor' }, ...investors.map((i) => ({ value: i.id, label: i.name }))]}
            />
            <SelectField
              label="Status"
              value={status}
              onChange={(e) => { setStatus(e.target.value as InvestorObligationStatus | ''); setPage(1); }}
              options={[{ value: '', label: 'Semua Status' }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: OBLIGATION_STATUS_LABEL[s] }))]}
            />
            <SelectField
              label="Tipe"
              value={type}
              onChange={(e) => { setType(e.target.value as InvestorObligationType | ''); setPage(1); }}
              options={[{ value: '', label: 'Semua Tipe' }, ...TYPE_OPTIONS.map((t) => ({ value: t, label: OBLIGATION_TYPE_LABEL[t] }))]}
            />
            <DateField
              label="Jatuh Tempo Sebelum"
              value={dueBefore}
              onChange={(v) => { setDueBefore(v); setPage(1); }}
            />
          </div>
        </SectionCard>

        <SectionCard title="Daftar Kewajiban" icon={<PiggyBank size={16} />} bodyClassName="p-0 md:p-0">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : isError ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          ) : obligations.length === 0 ? (
            <EmptyState icon={PiggyBank} title="Belum ada kewajiban investor" description="Kewajiban akan tampil setelah proses generate atau transaksi terkait membentuk kewajiban." />
          ) : (
            <>
              <DataTable columns={columns} data={obligations} rowKey={(r) => r.id} />
              <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
            </>
          )}
        </SectionCard>

        <InvestorObligationDetailModal
          open={!!detailId}
          onClose={() => setDetailId(null)}
          id={detailId}
          branchKey={branchKey}
          branchHeader={branchHeader}
          mutationBlocked={mutationBlocked}
        />
      </div>
    </RequirePermission>
  );
};
