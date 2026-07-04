import { useState } from 'react';
import {
  Plus, Search, Users, Phone, Mail,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { LeadFormModal } from './LeadFormModal';
import { useLeads, useLeadMutations } from './crm.hooks';
import { notifyApiError } from '@/core/api/notify';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import type { Lead } from './crm.types';

export const CrmPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useLeads({ page, limit: 15, search: debounced });
  const m = useLeadMutations();

  const [form, setForm] = useState<{ item: Lead | null } | null>(null);
  const leads = data?.data ?? [];

  const handleSubmit = (values: Partial<Lead>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
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
      header: '',
      align: 'right',
      cell: (r) => <RowActions onEdit={() => setForm({ item: r })} />,
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto  space-y-5">
      <PageHeader
        title="CRM / Lead"
        description="Data customer & prospek penjualan"
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Lead</Button>}
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
          <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada lead.</div>
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
    </div>
  );
};
