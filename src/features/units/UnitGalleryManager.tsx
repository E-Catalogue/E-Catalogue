import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Images, Star, Trash2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cmsImageUrl } from '@/features/cms/cms.api';
import { validateImageFile } from '@/core/utils/imageValidation';

export interface UnitGalleryImage {
  id: string;
  filename: string;
  originalName?: string;
  sequence?: number;
  isMain?: boolean;
}

interface StagedImage {
  key: string;
  file: File;
  url: string;
}

interface UnitGalleryManagerProps {
  images: UnitGalleryImage[];
  uploading?: boolean;
  reordering?: boolean;
  deleting?: boolean;
  settingMain?: boolean;
  /** Unggah semua file yang sudah dipratinjau; `mainIndex` = indeks file yang ditandai utama (null = biarkan default). */
  onUpload: (files: File[], mainIndex: number | null) => Promise<unknown>;
  /** Dipanggil segera setiap kali urutan foto tersimpan berubah. */
  onReorder: (images: { id: string; sequence: number }[]) => void;
  onSetMain?: (imageId: string) => void;
  onDelete: (imageId: string) => void;
  emptyHint?: string;
}

let stagedCounter = 0;

export const UnitGalleryManager = ({
  images, uploading, reordering, deleting, settingMain,
  onUpload, onReorder, onSetMain, onDelete, emptyHint = 'Belum ada foto tersimpan',
}: UnitGalleryManagerProps) => {
  const [order, setOrder] = useState(images);
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [stagedMain, setStagedMain] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrder(images);
  }, [images]);

  // Bersihkan object URL saat unmount agar tidak bocor memori.
  useEffect(() => () => { staged.forEach((s) => URL.revokeObjectURL(s.url)); }, [staged]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const invalid = files.map((f) => validateImageFile(f)).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError('');
    setStaged((prev) => [
      ...prev,
      ...files.map((file) => ({ key: `staged-${stagedCounter++}`, file, url: URL.createObjectURL(file) })),
    ]);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeStaged = (index: number) => {
    setStaged((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      const next = prev.filter((_, i) => i !== index);
      setStagedMain((m) => (index === m ? 0 : index < m ? m - 1 : m));
      return next;
    });
  };

  const clearStaged = () => {
    staged.forEach((s) => URL.revokeObjectURL(s.url));
    setStaged([]);
    setStagedMain(0);
  };

  const saveAll = async () => {
    if (staged.length === 0) return;
    try {
      await onUpload(staged.map((s) => s.file), staged.length ? stagedMain : null);
      staged.forEach((s) => URL.revokeObjectURL(s.url));
      setStaged([]);
      setStagedMain(0);
    } catch {
      /* error sudah dinotifikasi caller; biarkan pratinjau tetap agar bisa diulang */
    }
  };

  const reorder = (imageId: string, direction: -1 | 1) => {
    const index = order.findIndex((img) => img.id === imageId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    onReorder(next.map((img, idx) => ({ id: img.id, sequence: idx + 1 })));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary-light/50' : 'border-border bg-surface-soft hover:border-primary/60 hover:bg-primary-light/20'
        }`}
      >
        <div className="w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center text-primary"><ImagePlus size={22} /></div>
        <p className="text-[13px] font-extrabold text-ink">Seret &amp; letakkan atau klik untuk pilih foto</p>
        <p className="text-[11px] font-semibold text-muted">Bisa pilih banyak sekaligus · JPG/PNG · maks 5MB per file</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={onInputChange} className="hidden" />
      </div>
      {error && <p className="text-[12px] font-semibold text-semantic-error">{error}</p>}

      {/* Area pratinjau (staging) — muncul sebelum benar-benar diunggah */}
      {staged.length > 0 && (
        <div className="rounded-2xl border border-primary/30 bg-primary-light/20 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[13px] font-extrabold text-ink">{staged.length} foto siap diunggah</p>
              <p className="text-[11px] font-semibold text-muted">Klik bintang untuk memilih foto utama, lalu simpan.</p>
            </div>
            <button type="button" onClick={clearStaged} className="inline-flex items-center gap-1 text-[12px] font-bold text-muted hover:text-semantic-error"><X size={14} /> Batalkan</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {staged.map((s, i) => (
              <div key={s.key} className={`relative rounded-xl overflow-hidden border-2 bg-surface ${i === stagedMain ? 'border-primary' : 'border-transparent'}`}>
                <img src={s.url} alt="" className="w-full aspect-[4/3] object-cover" />
                {i === stagedMain && <span className="absolute top-1.5 left-1.5 bg-primary text-white rounded-md px-1.5 py-0.5 text-[9px] font-extrabold">UTAMA</span>}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/45 p-1.5">
                  <button type="button" title="Jadikan utama" onClick={() => setStagedMain(i)} className={`p-1 rounded-md text-white ${i === stagedMain ? 'bg-primary' : 'hover:bg-white/20'}`}><Star size={13} fill={i === stagedMain ? 'currentColor' : 'none'} /></button>
                  <button type="button" title="Buang" onClick={() => removeStaged(i)} className="p-1 rounded-md text-white hover:bg-semantic-error"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={clearStaged} disabled={uploading}>Batal</Button>
            <Button size="sm" icon={<UploadCloud size={15} />} onClick={saveAll} loading={uploading}>
              {uploading ? 'Mengunggah…' : `Simpan ${staged.length} Foto`}
            </Button>
          </div>
        </div>
      )}

      {/* Foto tersimpan */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Images size={14} className="text-muted" />
          <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Foto Tersimpan ({order.length})</p>
        </div>
        {order.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl py-8 text-center text-muted">
            <p className="text-[13px] font-semibold">{emptyHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {order.map((img, index) => (
              <div key={img.id} className="relative rounded-xl border border-border overflow-hidden bg-surface-soft group">
                <img src={cmsImageUrl('unit', img.filename) ?? ''} alt={img.originalName ?? ''} className="w-full aspect-[4/3] object-cover" />
                {img.isMain && <span className="absolute top-1.5 left-1.5 bg-primary text-white rounded-md px-1.5 py-0.5 text-[9px] font-extrabold">UTAMA</span>}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/45 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button type="button" title="Naik" disabled={index === 0 || reordering} onClick={() => reorder(img.id, -1)} className="p-1 rounded-md text-white hover:bg-white/20 disabled:opacity-30"><ArrowUp size={13} /></button>
                    <button type="button" title="Turun" disabled={index === order.length - 1 || reordering} onClick={() => reorder(img.id, 1)} className="p-1 rounded-md text-white hover:bg-white/20 disabled:opacity-30"><ArrowDown size={13} /></button>
                    {onSetMain && (
                      <button type="button" title="Jadikan utama" disabled={!!img.isMain || settingMain} onClick={() => onSetMain(img.id)} className="p-1 rounded-md text-white hover:bg-accent-amber disabled:opacity-30"><Star size={13} fill={img.isMain ? 'currentColor' : 'none'} /></button>
                    )}
                  </div>
                  <button type="button" title="Hapus" disabled={deleting} onClick={() => onDelete(img.id)} className="p-1 rounded-md text-white hover:bg-semantic-error disabled:opacity-30"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
