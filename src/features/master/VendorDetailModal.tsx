import { Store } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DetailModal } from '@/shared/components/ui/DetailModal';
import { Modal } from '@/shared/components/ui/Modal';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { ActiveBadge } from './ActiveBadge';
import { useVendor } from './master.hooks';
import type { Vendor } from './types';

interface Props {
  id: string | null;
  onClose: () => void;
  onEdit?: (vendor: Vendor) => void;
}

const date = (value?: string) => value ? new Date(value).toLocaleString('id-ID') : '-';

export const VendorDetailModal = ({ id, onClose, onEdit }: Props) => {
  const { data, isLoading, isError, refetch } = useVendor(id);
  if (!id) return null;

  if (isLoading) {
    return (
      <Modal open onClose={onClose} title="Detail Vendor" icon={<Store size={20} />} footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}>
        <div className="space-y-3">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
      </Modal>
    );
  }

  if (isError || !data) {
    return (
      <Modal open onClose={onClose} title="Detail Vendor" icon={<Store size={20} />} footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}>
        <div className="text-center py-8">
          <p className="font-bold text-ink">Detail vendor tidak dapat dimuat.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-4">Coba Lagi</Button>
        </div>
      </Modal>
    );
  }

  return (
    <DetailModal
      open
      onClose={onClose}
      title="Detail Vendor"
      subtitle={`${data.code} — ${data.name}`}
      icon={<Store size={20} />}
      onEdit={onEdit ? () => onEdit(data) : undefined}
      rows={[
        { label: 'Code', value: data.code },
        { label: 'Nama', value: data.name },
        { label: 'Alamat', value: data.address || '-' },
        { label: 'Telepon', value: data.phone || '-' },
        { label: 'Status', value: <ActiveBadge active={data.isActive} /> },
        { label: 'Dibuat', value: date(data.createdAt) },
        { label: 'Diperbarui', value: date(data.updatedAt) },
      ]}
    />
  );
};
