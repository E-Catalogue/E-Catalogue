import { useState } from 'react';
import {
  Plus, Search, Users, Phone, Mail, RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Modal } from '@/shared/components/ui/Modal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SelectField } from '@/shared/components/ui/Field';
import { LeadFormModal } from './LeadFormModal';
import { useLeads, useLeadMutations } from './crm.hooks';
import { notifyApiError } from '@/core/api/notify';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { LEAD_STATUS_LABEL, LEAD_STATUS_COLOR, type Lead, type LeadStatus } from './crm.types';

/** Opsi status manual — `WON` sengaja tidak ditawarkan karena hanya boleh berasal dari transisi order DEAL (lihat PRD CRM/Lead §"Panduan UI"). */
const LEAD_STATUS_OPTIONS: LeadStatus[] = ['NEW', 'INTERESTED', 'FOLLOW_UP', 'TEST_DRIVE', 'QUALIFIED', 'LOST'];

/**
 * `LEAD_DELETE` ada di `prisma/seed.js` tapi backend TIDAK punya route `DELETE /leads/:id`
 * sama sekali (`lead.route.js` cuma GET/POST/PATCH/PATCH-status) — permission itu belum
 * dipakai di mana pun, jadi sengaja TIDAK ada tombol hapus di sini (bukan gap FE).
 */
const CrmPageInner = () => {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useLeads({ page, limit: 15, search: debounced });
  const m = useLeadMutations();

  const [form, setForm] = useState<{ item: Lead | null } | null>(null);
  const [statusTarget, setStatusTarget] = useState<Lead | null>(null);
  const [statusValue, setStatusValue] = useState<LeadStatus>('NEW');
  const [confirmStatus, setConfirmStatus] = useState(false);
  const leads = data?.data ?? [];

  const handleSubmit = (values: Partial<Lead>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  const openStatusChange = (lead: Lead) => {
    setStatusTarget(lead);
    setStatusValue(lead.status);
  };

  const columns: Column<Lead>[] = [
    {
      header: 'Customer',
      cell: (r) => (
        <div>
          <p className="font-bold text-ink">{r.nama}</p>
          {r.nik && <p className="text-[11px] font-medium text-muted">NIK: {r.nik}</p>}
        </div>
      ),
    },
    {
      header: 'Kontak',
      cell: (r) => (
        <div className="space-y-0.5">
          {r.noHp && <p className="flex items-center gap-1.5 text-[12px] text-ink-soft"><Phone size={11} /> {r.noHp}</p>}
          {r.email && <p className="flex items-center gap-1.5 text-[12px] text-ink-soft"><Mail size={11} /> {r.email}</p>}
        </div>
      ),
    },
    { header: 'Sumber', cell: (r) => r.sumberLead?.name ?? <span className="text-muted">-</span> },
    { header: 'Pekerjaan', cell: (r) => r.pekerjaan ?? <span className="text-muted">-</span> },
    {
      header: 'Status',
      cell: (r) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${LEAD_STATUS_COLOR[r.status]}`}>
          {LEAD_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (r) => (
        <RowActions
          onEdit={can('LEAD_UPDATE') ? () => setForm({ item: r }) : undefined}
          extra={can('LEAD_UPDATE') ? [{
            label: 'Ubah Status',
            icon: <RefreshCw size={13} />,
            onClick: () => openStatusChange(r),
            disabled: r.status === 'WON',
          }] : []}
        />
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto  space-y-5">
      <PageHeader
        title="CRM / Lead"
        description="Data customer & prospek penjualan"
        action={can('LEAD_CREATE') ? <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Lead</Button> : undefined}
      />

      <div className="relative w-full sm:max-w-xs">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari nama, NIK, HP, email..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      <SectionCard title="Daftar Lead" icon={<Users size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : leads.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada lead" description="Tambahkan lead untuk memulai proses CRM dan tindak lanjut penjualan." />
        ) : (
          <>
            <DataTable columns={columns} data={leads} rowKey={(r) => r.id} />
            <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
          </>
        )}
      </SectionCard>

      <LeadFormModal
        open={!!form}
        onClose={() => setForm(null)}
        item={form?.item}
        submitting={m.create.isPending || m.update.isPending}
        onSubmit={handleSubmit}
      />

      {statusTarget && (
        <Modal
          open={!!statusTarget}
          onClose={() => setStatusTarget(null)}
          icon={<RefreshCw size={18} />}
          title="Ubah Status Lead"
          subtitle={statusTarget.nama}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setStatusTarget(null)}>Batal</Button>
              <Button onClick={() => setConfirmStatus(true)}>Simpan</Button>
            </>
          }
        >
          <SelectField
            label="Status"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value as LeadStatus)}
            options={LEAD_STATUS_OPTIONS.map((s) => ({ value: s, label: LEAD_STATUS_LABEL[s] }))}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={confirmStatus}
        onClose={() => setConfirmStatus(false)}
        onConfirm={() => statusTarget && m.updateStatus.mutate(
          { id: statusTarget.id, status: statusValue },
          { onSuccess: () => { setConfirmStatus(false); setStatusTarget(null); }, onError: (err) => notifyApiError(err) },
        )}
        closeOnConfirm={false}
        loading={m.updateStatus.isPending}
        tone="primary"
        icon={RefreshCw}
        title="Ubah Status Lead"
        message={`Ubah status lead "${statusTarget?.nama ?? ''}" menjadi "${LEAD_STATUS_LABEL[statusValue]}"?`}
        confirmLabel="Ya, Ubah"
      />
    </div>
  );
};

export const CrmPage = () => (
  <RequirePermission code="LEAD_READ">
    <CrmPageInner />
  </RequirePermission>
);
