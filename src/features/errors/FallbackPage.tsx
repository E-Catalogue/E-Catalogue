import { Link, useRouterState } from '@tanstack/react-router';
import { Wrench, Lock, ArrowLeft, Home, Car } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { PATH_BY_CODE, MENU_ITEMS } from '@/shared/layout/menu';

/* ── Determine what kind of "miss" this is ── */
type PathStatus = 'coming-soon' | 'forbidden' | 'not-found';

const usePathStatus = (): PathStatus => {
  const groupMenus = useAppSelector((s) => s.auth.groupMenus);
  const pathname   = useRouterState({ select: (s) => s.location.pathname });

  /* Buang trailing slash agar "/foo" dan "/foo/" dianggap sama */
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  const current = norm(pathname);

  /* Collect every path the authenticated user has legitimate access to */
  const accessiblePaths = new Set<string>();
  for (const g of groupMenus) {
    for (const m of g.menus ?? []) {
      /* Backend-declared path (e.g. /inventory/units) */
      if (m.path) accessiblePaths.add(norm(m.path));
      /* Frontend-mapped path via code (e.g. UNIT → /inventory) */
      if (m.code && PATH_BY_CODE[m.code]) accessiblePaths.add(norm(PATH_BY_CODE[m.code]));
    }
  }

  /*
   * Catch-all hanya aktif saat TIDAK ada route file yang cocok. Maka:
   * - path PERSIS sama dengan menu yang bisa diakses → menu ada tapi belum dibuat (coming soon)
   * - path PERSIS sama dengan menu frontend yang tidak dimiliki user → akses ditolak (403)
   * - sisanya (URL acak / sub-path halaman nyata seperti /users/saf) → 404
   */
  if (accessiblePaths.has(current)) return 'coming-soon';

  if (MENU_ITEMS.some((m) => norm(m.path) === current)) return 'forbidden';

  return 'not-found';
};

/* ── Coming Soon ── */
const ComingSoonPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[64vh] px-4 text-center">
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center">
        <Wrench size={34} className="text-accent-amber" strokeWidth={1.8} />
      </div>
      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-extrabold shadow-glow">
        WIP
      </span>
    </div>
    <h1 className="text-[22px] font-extrabold text-ink">Fitur Sedang Dikembangkan</h1>
    <p className="text-muted font-medium mt-3 max-w-sm leading-relaxed text-[13px]">
      Halaman ini sudah direncanakan dan ada dalam akses Anda, namun tim kami sedang aktif
      membangunnya. Nantikan update berikutnya!
    </p>
    <div className="flex items-center gap-3 mt-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-2.5 shadow-glow hover:bg-primary-dark transition-colors"
      >
        <Home size={15} /> Dashboard
      </Link>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[13px] px-5 py-2.5 hover:border-primary hover:text-primary transition-colors"
      >
        <ArrowLeft size={15} /> Kembali
      </button>
    </div>
  </div>
);

/* ── Access Denied (403) ── */
const ForbiddenPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[64vh] px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-semantic-error/10 border border-semantic-error/20 flex items-center justify-center mb-6">
      <Lock size={34} className="text-semantic-error" strokeWidth={1.8} />
    </div>
    <p className="text-[11px] font-extrabold uppercase tracking-widest text-semantic-error mb-2">
      403 — Akses Ditolak
    </p>
    <h1 className="text-[22px] font-extrabold text-ink">Anda Tidak Punya Akses</h1>
    <p className="text-muted font-medium mt-3 max-w-sm leading-relaxed text-[13px]">
      Halaman ini ada dalam sistem, namun tidak termasuk dalam hak akses akun Anda saat ini.
      Hubungi administrator jika Anda merasa ini tidak sesuai.
    </p>
    <div className="flex items-center gap-3 mt-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-2.5 shadow-glow hover:bg-primary-dark transition-colors"
      >
        <Home size={15} /> Dashboard
      </Link>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[13px] px-5 py-2.5 hover:border-primary hover:text-primary transition-colors"
      >
        <ArrowLeft size={15} /> Kembali
      </button>
    </div>
  </div>
);

/* ── Not Found (404) ── */
const NotFoundPage = () => (
  <div className="relative flex flex-col items-center justify-center min-h-[72vh] px-4 text-center overflow-hidden">
    {/* Ambient glow */}
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-primary/8 blur-3xl pointer-events-none" />

    {/* Big 404 with car cutout */}
    <div className="relative select-none">
      <p className="text-[110px] sm:text-[150px] font-black leading-none tracking-tighter bg-gradient-to-b from-ink/15 to-ink/5 bg-clip-text text-transparent">
        404
      </p>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-surface border border-border shadow-card-hover flex items-center justify-center ">
          <Car size={38} className="text-primary" strokeWidth={1.8} />
        </div>
      </div>
    </div>

    <h1 className="relative text-[22px] font-extrabold text-ink mt-2">Halaman Tersesat di Jalan</h1>
    <p className="relative text-muted font-medium mt-3 max-w-sm leading-relaxed text-[13px]">
      Alamat yang Anda tuju tidak ditemukan — mungkin sudah dipindahkan, dihapus, atau salah ketik.
    </p>
    <div className="relative flex items-center gap-3 mt-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-bold text-[13px] px-5 py-2.5 shadow-glow hover:bg-primary-dark transition-colors"
      >
        <Home size={15} /> Dashboard
      </Link>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border text-ink-soft font-bold text-[13px] px-5 py-2.5 hover:border-primary hover:text-primary transition-colors"
      >
        <ArrowLeft size={15} /> Kembali
      </button>
    </div>
  </div>
);

/**
 * Fallback cerdas untuk route admin yang tidak cocok.
 * Membedakan tiga kondisi berdasarkan hak akses (groupMenus):
 * fitur sedang dikembangkan · akses ditolak (403) · tidak ditemukan (404).
 */
export const FallbackPage = () => {
  const status = usePathStatus();
  if (status === 'coming-soon') return <ComingSoonPage />;
  if (status === 'forbidden')   return <ForbiddenPage />;
  return <NotFoundPage />;
};
