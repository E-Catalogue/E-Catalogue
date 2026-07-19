import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Loader2, ImageOff } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useBranch, useBranchMutations } from './master.hooks';
import { mediaUrl } from './master.api';
import { notifyApiError } from '@/core/api/notify';
import type { Branch } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
}

export const BranchImagesModal = ({ open, onClose, branch }: Props) => {
  const branchId = branch?.id ?? null;
  const { data: detail, isLoading } = useBranch(open ? branchId : null);
  const m = useBranchMutations();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const images = detail?.images ?? branch?.images ?? [];

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;
    m.uploadImage.mutate({ branchId, file }, { onError: (err) => notifyApiError(err) });
    e.target.value = '';
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Galeri — ${branch?.nama ?? ''}`}
      subtitle="Kelola foto cabang"
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-[13px] font-semibold text-muted">{images.length} foto</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        <Button
          icon={m.uploadImage.isPending ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          onClick={() => fileRef.current?.click()}
          disabled={m.uploadImage.isPending}
        >
          {m.uploadImage.isPending ? 'Mengunggah...' : 'Upload Foto'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted"><Loader2 size={22} className="animate-spin" /></div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted">
          <ImageOff size={32} className="mb-2" />
          <p className="font-semibold text-sm">Belum ada foto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden border border-border aspect-[4/3] bg-surface-soft">
              <img src={img.url ?? mediaUrl(img.id)} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setToDelete(img.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-surface/90 backdrop-blur text-semantic-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Hapus foto"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (branchId && toDelete) m.deleteImage.mutate({ branchId, imageId: toDelete }, { onError: (err) => notifyApiError(err) });
        }}
        title="Hapus Foto"
        message="Foto ini akan dihapus permanen dari galeri cabang. Lanjutkan?"
      />
    </Modal>
  );
};
