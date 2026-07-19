import { useState, type FormEvent, type ReactNode } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';

export interface NameActiveValues {
  name: string;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  label?: string;
  initial?: NameActiveValues | null;
  submitting?: boolean;
  onSubmit: (values: NameActiveValues) => void;
}

/** Modal form sederhana untuk entitas ber-field nama + status aktif. */
export const NameFormModal = ({ open, onClose, title, subtitle, icon, label = 'Nama', initial, submitting, onSubmit }: Props) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [seed, setSeed] = useState<NameActiveValues | null | undefined>(initial);

  if (open && initial !== seed) {
    setSeed(initial);
    setName(initial?.name ?? '');
    setIsActive(initial?.isActive ?? true);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name.trim(), isActive });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" form="name-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
        </>
      }
    >
      <form id="name-form" onSubmit={submit} className="space-y-4">
        <TextField label={label} required value={name} onChange={(e) => setName(e.target.value)} placeholder={`Masukkan ${label.toLowerCase()}`} />
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Aktif</span>
        </label>
      </form>
    </Modal>
  );
};
