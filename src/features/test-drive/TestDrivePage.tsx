import { useState } from 'react';
import { Plus, KeyRound } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TestDriveFormModal } from './TestDriveFormModal';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { removeTestDrive } from '@/app/store/dataSlice';
import { formatDate } from '@/core/utils/format';
import type { TestDrive } from '@/data/types';

export const TestDrivePage = () => {
  const data = useAppSelector((s) => s.data.testDrives);
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<{ item: TestDrive | null } | null>(null);
  const [toDelete, setToDelete] = useState<TestDrive | null>(null);

  const columns: Column<TestDrive>[] = [
    { header: 'Pelanggan', cell: (t) => <span className="font-bold text-ink">{t.customer}</span> },
    { header: 'Unit', cell: (t) => t.unit || '-' },
    { header: 'Tanggal', cell: (t) => formatDate(t.date) },
    { header: 'Jam', cell: (t) => t.time, align: 'center' },
    { header: 'Status', cell: (t) => <StatusBadge status={t.status} />, align: 'center' },
    { header: '', align: 'right', cell: (t) => <RowActions onEdit={() => setForm({ item: t })} onDelete={() => setToDelete(t)} /> },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader
        title="Test Drive"
        description="Jadwal dan riwayat test drive pelanggan"
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Jadwalkan Test Drive</Button>}
      />
      <SectionCard title="Jadwal Test Drive" icon={<KeyRound size={16} />} bodyClassName="p-0 md:p-0">
        <DataTable columns={columns} data={data} rowKey={(t) => t.id} />
      </SectionCard>

      <TestDriveFormModal open={!!form} item={form?.item} onClose={() => setForm(null)} />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && dispatch(removeTestDrive(toDelete.id))} title="Hapus Jadwal" message={toDelete ? `Hapus jadwal test drive ${toDelete.customer}?` : ''} />
    </div>
  );
};
