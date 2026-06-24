import { Eye, Pencil, Trash2 } from 'lucide-react';

interface RowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const RowActions = ({ onView, onEdit, onDelete }: RowActionsProps) => (
  <div className="flex items-center justify-end gap-1">
    {onView && (
      <button onClick={onView} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors" title="Detail">
        <Eye size={15} strokeWidth={2.3} />
      </button>
    )}
    {onEdit && (
      <button onClick={onEdit} className="p-2 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors" title="Edit">
        <Pencil size={14} strokeWidth={2.3} />
      </button>
    )}
    {onDelete && (
      <button onClick={onDelete} className="p-2 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10 transition-colors" title="Hapus">
        <Trash2 size={14} strokeWidth={2.3} />
      </button>
    )}
  </div>
);
