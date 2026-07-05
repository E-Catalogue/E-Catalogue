import { useRef, useState, type ReactNode } from 'react';
import { Upload, Loader2, ImageIcon, Trash2 } from 'lucide-react';
import { validateImageFile } from '@/core/utils/imageValidation';

interface ImageUploadProps {
  /** URL gambar saat ini (hasil cmsImageUrl), null bila belum ada. */
  previewUrl: string | null;
  onFile: (file: File) => void;
  isUploading?: boolean;
  onRemove?: () => void;
  label?: string;
  hint?: string;
  /** Rasio preview, mis. "aspect-[4/3]" | "aspect-video" | "aspect-square". */
  aspect?: string;
  /** Konten kustom (mis. avatar bulat). */
  rounded?: boolean;
  className?: string;
  children?: ReactNode;
}

export const ImageUpload = ({
  previewUrl, onFile, isUploading, onRemove,
  label, hint = 'JPG/PNG maks 5 MB', aspect = 'aspect-[16/10]', rounded, className = '',
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pick = (file?: File) => {
    if (!file) return;
    // Validasi klien dulu (feedback instan) — server tetap jadi jaring pengaman.
    const invalid = validateImageFile(file);
    if (invalid) { setErr(invalid); return; }
    setErr(null);
    setLocalPreview(URL.createObjectURL(file));  // preview instan sebelum server balas
    onFile(file);
  };

  const shown = localPreview ?? previewUrl;

  return (
    <div className={className}>
      {label && <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-2">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
        className={`group relative ${aspect} ${rounded ? 'rounded-full' : 'rounded-2xl'} overflow-hidden border-2 border-dashed border-border bg-surface-soft cursor-pointer hover:border-primary transition-colors flex items-center justify-center`}
      >
        {shown ? (
          <>
            <img src={shown} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-ink/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 text-ink text-[12px] font-bold px-3 py-1.5">
                <Upload size={13} /> Ganti
              </span>
              {onRemove && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setLocalPreview(null); onRemove(); }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-semantic-error text-white text-[12px] font-bold px-3 py-1.5">
                  <Trash2 size={13} /> Hapus
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <div className="w-11 h-11 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-2">
              <ImageIcon size={20} className="text-muted" />
            </div>
            <p className="text-[12px] font-bold text-ink-soft">Klik atau seret gambar</p>
            <p className="text-[11px] text-muted font-medium mt-0.5">{hint}</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-surface/70 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-primary" />
          </div>
        )}
      </div>
      {err && <p className="text-[11px] font-semibold text-semantic-error mt-1.5">{err}</p>}

      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden"
        onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
};
