import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, Database } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { ActiveBadge } from './ActiveBadge';
import { useDebouncedValue } from './useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import type { SimpleMaster, SimpleMasterApi } from './simpleMaster.api';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';

interface SimpleMasterPageProps {
  api: SimpleMasterApi;
  title: string;
  description?: string;
  icon?: ReactNode;
  withCode?: boolean;
  permCode?: string;
}

interface FormValues { name: string; code: string; isActive: boolean }

const FormModal = ({ open, onClose, item, withCode, submitting, onSubmit }: {
  open: boolean; onClose: () => void; item?: SimpleMaster | null; withCode?: boolean; submitting?: boolean; onSubmit: (v: FormValues) => void;
}) => {
  const seed = (i?: SimpleMaster | null): FormValues => ({ name: i?.name ?? '', code: i?.code ?? '', isActive: i?.isActive ?? true });
  const [form, setForm] = useState<FormValues>(seed(item));
  const [seedId, setSeedId] = useState<string | undefined>('init');
  if (open && (item?.id ?? 'new') !== seedId) { setSeedId(item?.id ?? 'new'); setForm(seed(item)); }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, name: form.name.trim(), code: form.code.trim().toUpperCase() });
  };

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit Data' : 'Tambah Data'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="sm-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}>
      <form id="sm-form" onSubmit={submit} className="space-y-4">
        <TextField label="Nama" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Masukkan nama" />
        {withCode && <TextField label="Kode" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="mis. LEASING_A" />}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Aktif</span>
        </label>
      </form>
    </Modal>
  );
};

export const SimpleMasterPage = ({ api, title, description, icon, withCode, permCode }: SimpleMasterPageProps) => {
  const qc = useQueryClient();
  const { can } = usePermissions();
  const pc = permCode ? `${permCode}_` : '';
  const canCreate = !permCode || can(`${pc}CREATE`);
  const canUpdate = !permCode || can(`${pc}UPDATE`);
  const canDelete = !permCode || can(`${pc}DELETE`);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useQuery({
    queryKey: [api.path, { page, search: debounced }],
    queryFn: () => api.list({ page, limit: 10, search: debounced }),
  });

  const inval = () => qc.invalidateQueries({ queryKey: [api.path] });
  const create = useMutation({ mutationFn: api.create, onSuccess: inval });
  const update = useMutation({ mutationFn: (v: { id: string; body: Partial<SimpleMaster> }) => api.update(v.id, v.body), onSuccess: inval });
  const remove = useMutation({ mutationFn: api.remove, onSuccess: inval });

  const [form, setForm] = useState<{ item: SimpleMaster | null } | null>(null);
  const [toDelete, setToDelete] = useState<SimpleMaster | null>(null);

  const rows = data?.data ?? [];

  const handleSubmit = (values: FormValues) => {
    const body: Partial<SimpleMaster> = { name: values.name, isActive: values.isActive };
    if (withCode) body.code = values.code;
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) update.mutate({ id: form.item.id, body }, opts);
    else create.mutate(body, opts);
  };

  const columns: Column<SimpleMaster>[] = [
    { header: 'Nama', cell: (r) => <span className="font-bold text-ink">{r.name}</span> },
    ...(withCode ? [{ header: 'Kode', cell: (r: SimpleMaster) => <span className="font-mono text-[12px]">{r.code || '-'}</span> }] : []),
    { header: 'Status', align: 'center' as const, cell: (r: SimpleMaster) => <ActiveBadge active={r.isActive} /> },
    { header: '', align: 'right' as const, cell: (r: SimpleMaster) => (
      <RowActions 
        onEdit={canUpdate ? () => setForm({ item: r }) : undefined} 
        onDelete={canDelete ? () => setToDelete(r) : undefined} 
      />
    ) },
  ];

  const content = (
    <div className="max-w-[1100px] mx-auto  space-y-5">
      <PageHeader title={title} description={description}
        action={canCreate && <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah</Button>} />

      <div className="relative max-w-xs">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={`Cari ${title.toLowerCase()}...`}
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
      </div>

      <SectionCard title={`Daftar ${title}`} icon={icon ?? <Database size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
          : isError ? <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          : rows.length === 0 ? <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada data.</div>
          : <><DataTable columns={columns} data={rows} rowKey={(r) => r.id} /><div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div></>}
      </SectionCard>

      <FormModal open={!!form} onClose={() => setForm(null)} item={form?.item} withCode={withCode} submitting={create.isPending || update.isPending} onSubmit={handleSubmit} />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })} title={`Hapus ${title}`} message={toDelete ? `Hapus "${toDelete.name}"?` : ''} loading={remove.isPending} closeOnConfirm={false} />
    </div>
  );

  if (permCode) {
    return <RequirePermission code={`${pc}READ`}>{content}</RequirePermission>;
  }

  return content;
};

