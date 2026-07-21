import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, ImageOff } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useBranch, useBranchMutations } from './master.hooks';
import { mediaUrl } from './master.api';
import { notifyApiError } from '@/core/api/notify';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { validateImageFile } from '@/core/utils/imageValidation';
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
  const confirmAction = useConfirmedAction();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const images = detail?.images ?? branch?.images ?? [];

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;
    const invalid = validateImageFile(file);
    if (invalid) { setFileError(invalid); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFileError(null);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const upload = () => {
    if (!branchId || !pendingFile) return;
    const file = pendingFile;
    confirmAction({
      title: 'Upload Foto Cabang',
      message: `Upload foto “${file.name}” ke galeri ${branch?.nama ?? 'cabang'}?`,
      confirmLabel: 'Upload Foto',
      execute: () => m.uploadImage.mutateAsync({ branchId, file }),
      onSuccess: () => { setPendingFile(null); setPreviewUrl(null); },
      onError: notifyApiError,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={m.uploadImage.isPending || m.deleteImage.isPending}
      title={`Galeri — ${branch?.nama ?? ''}`}
      subtitle="Kelola foto cabang"
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-[13px] font-semibold text-muted">{images.length} foto</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        <Button icon={<ImagePlus size={16} />} onClick={() => fileRef.current?.click()} disabled={m.uploadImage.isPending}>Pilih Foto</Button>
      </div>

      {pendingFile && previewUrl && (
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-primary/30 bg-primary-light/40 p-3">
          <img src={previewUrl} alt="Preview foto cabang" className="w-full sm:w-32 aspect-[4/3] rounded-xl object-cover" />
          <div className="flex-1 min-w-0"><p className="font-bold text-ink truncate">{pendingFile.name}</p><p className="text-[11px] text-muted">Preview lokal, belum tersimpan.</p></div>
          <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => { setPendingFile(null); setPreviewUrl(null); }}>Batal</Button><Button size="sm" onClick={upload} loading={m.uploadImage.isPending}>Upload</Button></div>
        </div>
      )}
      {fileError && <p className="mb-3 text-[11px] font-semibold text-semantic-error">{fileError}</p>}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] !rounded-xl" />)}</div>
      ) : images.length === 0 ? (
        <EmptyState icon={ImageOff} title="Belum ada foto" description="Pilih foto untuk menambahkan gambar cabang ke galeri." />
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
