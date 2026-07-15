import { Link, useRouter } from '@tanstack/react-router';
import { Compass, ArrowLeft, LogIn } from 'lucide-react';

/** Halaman 404 global — tampil saat route/path tidak ditemukan. */
export const NotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-6 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="relative mx-auto mb-8 w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-primary-light blur-2xl opacity-70" />
          <div className="relative w-full h-full rounded-full bg-surface border border-border shadow-card flex items-center justify-center">
            <Compass size={56} className="text-primary" strokeWidth={1.6} />
          </div>
        </div>

        <p className="text-[64px] leading-none font-extrabold tracking-tight bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-2 text-xl font-extrabold text-ink">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-sm font-medium text-muted max-w-sm mx-auto">
          Maaf, halaman yang Anda tuju tidak tersedia atau mungkin sudah dipindahkan. Periksa kembali alamatnya.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[13px] hover:border-primary hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-primary text-white font-bold text-[13px] shadow-glow hover:bg-primary-dark transition-colors"
          >
            <LogIn size={16} /> Ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
};
