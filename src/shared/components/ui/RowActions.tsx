import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ActionMenu, type ActionItem } from './ActionMenu';

interface ExtraAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

interface RowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extra?: ExtraAction[];
  label?: string;
}

/**
 * Standar aksi baris tabel (lihat table_prd.md).
 * Selalu render dropdown ActionMenu agar seragam di seluruh halaman:
 * urutan → Lihat Detail (primary) · Edit · aksi tambahan · [divider] · Hapus (danger).
 */
export const RowActions = ({ onView, onEdit, onDelete, extra, label }: RowActionsProps) => {
  const items: ActionItem[] = [];

  if (onView) items.push({ icon: <Eye size={13} />, label: 'Lihat Detail', onClick: onView, variant: 'primary' });
  if (onEdit) items.push({ icon: <Pencil size={13} />, label: 'Edit', onClick: onEdit });
  if (extra) extra.forEach((a) => items.push({ icon: a.icon, label: a.label, onClick: a.onClick, variant: a.variant, disabled: a.disabled }));
  if (onDelete) {
    // Beri pemisah sebelum aksi destruktif bila ada aksi lain di atasnya.
    if (items.length > 0) items[items.length - 1].dividerAfter = true;
    items.push({ icon: <Trash2 size={13} />, label: 'Hapus', onClick: onDelete, variant: 'danger' });
  }

  if (items.length === 0) return null;

  return <ActionMenu items={items} label={label} />;
};
