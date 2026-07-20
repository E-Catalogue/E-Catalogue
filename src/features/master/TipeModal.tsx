import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { NameFormModal, type NameActiveValues } from './NameFormModal';
import { ActiveBadge } from './ActiveBadge';
import { useTipes, useTipeMutations } from './master.hooks';
import { notifyApiError } from '@/core/api/notify';
import { usePermissions } from '@/features/auth/usePermissions';
import type { Merek, Tipe } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  merek: Merek | null;
}

export const TipeModal = ({ open, onClose, merek }: Props) => {
  const { can } = usePermissions();
  const merekId = merek?.id ?? '';
  const { data, isLoading } = useTipes(open ? merekId : null, { page: 1, limit: 100 });
  const m = useTipeMutations(merekId);

  const [form, setForm] = useState<{ item: Tipe | null } | null>(null);
  const [toDelete, setToDelete] = useState<Tipe | null>(null);

  const tipes = data?.data ?? [];

  const handleSubmit = (values: NameActiveValues) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Tipe — ${merek?.name ?? ''}`}
        subtitle="Kelola tipe/varian untuk merek ini"
        size="lg"
        footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-[13px] font-semibold text-muted">{tipes.length} tipe</p>
          {can('TIPE_CREATE') && <Button icon={<Plus size={16} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Tipe</Button>}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted"><Loader2 size={22} className="animate-spin" /></div>
        ) : tipes.length === 0 ? (
          <div className="text-center py-12 text-muted font-semibold text-sm">Belum ada tipe.</div>
        ) : (
          <div className="divide-y divide-divider border border-border rounded-2xl overflow-hidden">
            {tipes.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-soft transition-colors">
                <span className="font-bold text-ink text-[13px]">{t.name}</span>
                <div className="flex items-center gap-2">
                  <ActiveBadge active={t.isActive} />
                  {can('TIPE_UPDATE') && <button onClick={() => setForm({ item: t })} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10" title="Edit"><Pencil size={14} /></button>}
                  {can('TIPE_DELETE') && <button onClick={() => setToDelete(t)} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10" title="Hapus"><Trash2 size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <NameFormModal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.item ? 'Edit Tipe' : 'Tambah Tipe'}
        label="Nama Tipe"
        initial={form?.item ? { name: form.item.name, isActive: form.item.isActive } : null}
        submitting={m.create.isPending || m.update.isPending}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })}
        loading={m.remove.isPending}
        closeOnConfirm={false}
        title="Hapus Tipe"
        message={toDelete ? `Hapus tipe "${toDelete.name}"?` : ''}
      />
    </>
  );
};
