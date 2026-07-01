import { useState } from 'react';
import { FileImage, KeyRound, Loader2, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Can } from '@/features/auth/permissions';
import { notifyApiError } from '@/core/api/notify';
import { API_ORIGIN } from '@/core/api/client';
import { formatDate } from '@/core/utils/format';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { TestDriveFormModal } from './TestDriveFormModal';
import { useTestDriveMutations, useTestDrives } from './testDrive.hooks';
import type { TestDrive, TestDriveStatus } from './testDrive.types';

const STATUS_CLASS: Record<TestDriveStatus, string> = {
  SCHEDULED: 'bg-accent-blue/10 text-accent-blue',
  COMPLETED: 'bg-accent-green/10 text-accent-green',
  CANCELLED: 'bg-semantic-error/10 text-semantic-error',
};

const STATUS_LABEL: Record<TestDriveStatus, string> = {
  SCHEDULED: 'Dijadwalkan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const mediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}/${url.replace(/^\/+/, '')}`;
};

export const TestDrivePage = () => {
  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debounced = useDebouncedValue(search, 400);
  const { data, isLoading, isError } = useTestDrives({ page, limit: 10, search: debounced || undefined, status: status || undefined });
  const mutations = useTestDriveMutations();
  const [form, setForm] = useState<{ item: TestDrive | null } | null>(null);
  const [toDelete, setToDelete] = useState<TestDrive | null>(null);

  const rows = data?.data ?? [];
  const columns: Column<TestDrive>[] = [
    { header: 'Jadwal', cell: (t) => <span className="font-bold text-ink">{formatDate(t.scheduledAt)}</span> },
    { header: 'Customer', cell: (t) => <span className="font-bold text-ink">{t.lead?.nama ?? t.leadId}</span> },
    { header: 'Unit', cell: (t) => [t.unit?.platNomor, t.unit?.merek?.name, t.unit?.tipe?.name].filter(Boolean).join(' ') || t.unitId },
    { header: 'Sales', cell: (t) => t.sales?.name ?? '-' },
    { header: 'Status', align: 'center', cell: (t) => <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${STATUS_CLASS[t.status]}`}>{STATUS_LABEL[t.status]}</span> },
    { header: 'Foto KTP', align: 'center', cell: (t) => t.fotoKtpUrl ? <a href={mediaUrl(t.fotoKtpUrl)} target="_blank" rel="noreferrer" className="inline-flex justify-center text-primary"><FileImage size={16} /></a> : '-' },
    { header: 'Foto SIM', align: 'center', cell: (t) => t.fotoSimUrl ? <a href={mediaUrl(t.fotoSimUrl)} target="_blank" rel="noreferrer" className="inline-flex justify-center text-primary"><FileImage size={16} /></a> : '-' },
    { header: '', align: 'right', cell: (t) => <RowActions onEdit={() => setForm({ item: t })} onDelete={() => setToDelete(t)} /> },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Test Drive"
        description="Jadwal dan riwayat test drive pelanggan"
        action={<Can code="TEST_DRIVE_CREATE"><Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Jadwalkan Test Drive</Button></Can>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari customer, unit, sales..." className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 px-3.5 rounded-xl bg-surface border border-border text-sm font-semibold">
          <option value="">Semua Status</option>
          <option value="SCHEDULED">Dijadwalkan</option>
          <option value="COMPLETED">Selesai</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>

      <SectionCard title="Jadwal Test Drive" icon={<KeyRound size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={22} className="animate-spin" /></div>
          : isError ? <div className="text-center py-16 text-semantic-error font-semibold text-sm">Gagal memuat test drive.</div>
          : rows.length === 0 ? <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada test drive.</div>
          : <DataTable columns={columns} data={rows} rowKey={(t) => t.id} />}
      </SectionCard>

      <TestDriveFormModal open={!!form} item={form?.item} onClose={() => setForm(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && mutations.remove.mutate(toDelete.id, { onError: (e) => notifyApiError(e), onSuccess: () => setToDelete(null) })}
        title="Hapus Jadwal"
        message={toDelete ? `Hapus jadwal test drive ${toDelete.lead?.nama ?? toDelete.id}?` : ''}
      />
    </div>
  );
};
