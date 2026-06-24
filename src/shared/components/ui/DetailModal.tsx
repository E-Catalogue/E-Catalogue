import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface DetailRow {
  label: string;
  value: ReactNode;
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  rows: DetailRow[];
  onEdit?: () => void;
}

export const DetailModal = ({ open, onClose, title, subtitle, icon, rows, onEdit }: DetailModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    subtitle={subtitle}
    icon={icon}
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>Tutup</Button>
        {onEdit && <Button icon={<Pencil size={15} />} onClick={onEdit}>Edit</Button>}
      </>
    }
  >
    <dl className="divide-y divide-divider">
      {rows.map((r, i) => (
        <div key={i} className="flex items-start justify-between gap-4 py-2.5">
          <dt className="text-[12px] font-semibold text-muted shrink-0">{r.label}</dt>
          <dd className="text-[13px] font-bold text-ink text-right">{r.value}</dd>
        </div>
      ))}
    </dl>
  </Modal>
);
