import { useState, type ImgHTMLAttributes } from 'react';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';

interface PublicUnitImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
}

/**
 * Menampilkan foto unit secara utuh untuk sumber portrait maupun landscape.
 * Backdrop buram mengisi rasio container tanpa memotong gambar utama.
 */
export const PublicUnitImage = ({
  src,
  alt,
  className = '',
  imageClassName = '',
  loading = 'lazy',
}: PublicUnitImageProps) => {
  const requestedSrc = src || DEFAULT_CAR_IMAGE;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = failedSrc === requestedSrc ? DEFAULT_CAR_IMAGE : requestedSrc;

  const handleError = () => {
    if (resolvedSrc !== DEFAULT_CAR_IMAGE) setFailedSrc(requestedSrc);
  };

  return (
    <div className={`relative isolate h-full w-full overflow-hidden bg-surface-soft ${className}`}>
      <img
        aria-hidden="true"
        src={resolvedSrc}
        alt=""
        loading={loading}
        onError={handleError}
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/5" />
      <img
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        className={`relative z-[1] h-full w-full object-contain ${imageClassName}`}
      />
    </div>
  );
};
