import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, ShieldCheck, Lock, Building2, Users, Layers, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { APP_NAME, APP_TAGLINE } from '@/shared/constants';
import { useAppDispatch } from '@/app/store';
import { setAccessToken, setSession } from '@/app/store/authSlice';
import { tenantAuthApi } from '@/features/tenant/api/tenant-auth.api';
import { buildSession } from './session';
import { getApiErrorMessage } from '@/core/api/apiError';

const SHOWCASE_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop';

const HIGHLIGHTS = [
  { icon: Building2, label: 'Showroom' },
  { icon: Users, label: 'Penjualan' },
  { icon: Layers, label: 'Keuangan' },
];

const inputClass =
  'w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink placeholder:text-muted placeholder:font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all';

export const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [tenantSlug, setTenantSlug] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Login tenant → accessToken (refresh token disimpan backend via cookie HttpOnly).
      const loginRes = await tenantAuthApi.login({
        tenantSlug: tenantSlug.trim(),
        email: identifier.trim(),
        password,
      });
      dispatch(setAccessToken(loginRes.accessToken));

      // 2. Sesi + menu. Permission efektif ikut di /me.
      //    Menu bersifat opsional: endpointnya bisa belum tersedia. Gagal memuat menu
      //    TIDAK boleh menggagalkan login — sidebar jatuh ke menu statis (resolveMenus).
      const [me, menus] = await Promise.all([
        tenantAuthApi.getMe(),
        tenantAuthApi.getMenu().catch(() => []),
      ]);
      dispatch(setSession(buildSession(me, menus)));

      navigate({ to: '/' });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal login. Periksa email dan password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-[1.1fr_1fr]">
      {/* ===== KIRI: Showcase ===== */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden bg-ink">
        <img src={SHOWCASE_IMAGE} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        {/* Scrim: menjaga teks putih tetap terbaca di atas foto. */}
        <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/85 to-ink/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-primary/10 to-transparent mix-blend-soft-light" />
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-10 right-0 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Layers size={24} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="leading-none">
            <p className="font-extrabold text-white text-[16px] tracking-tight uppercase">{APP_NAME}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mt-1">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[12px] font-bold px-3.5 py-1.5">
            <ShieldCheck size={14} /> Area Internal
          </span>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mt-5">
            Kelola Showroom<br />
            dari <span className="text-primary-light">Satu Aplikasi</span>
          </h1>
          <p className="text-white/80 font-medium mt-4 text-[15px] leading-relaxed">
            Katalog, stok, pembelian, penjualan, showroom, dan keuangan — dalam satu alur kerja.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 max-w-md">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.label} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                <Icon size={18} className="text-primary-light" strokeWidth={2.3} />
                <p className="text-[12px] font-bold text-white/80 mt-2.5">{h.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== KANAN: Form ===== */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
              <Layers size={22} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="leading-none">
              <p className="font-extrabold text-ink text-[15px] tracking-tight uppercase">{APP_NAME}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary mt-1">{APP_TAGLINE}</p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-5">
            <Lock size={24} strokeWidth={2.2} />
          </div>
          <h2 className="text-2xl font-extrabold text-ink">Masuk ke Ruang Kerja</h2>
          <p className="text-muted font-medium mt-1.5 text-[14px]">Masukkan showroom, email, dan password Anda.</p>

          {error && (
            <div className="flex items-start gap-2 mt-5 px-3.5 py-2.5 rounded-xl bg-semantic-error/10 border border-semantic-error/20 text-semantic-error">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[12px] font-semibold leading-snug">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
                Showroom
              </label>
              <input
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                placeholder="acme"
                autoComplete="organization"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
                Email
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="owner@acme.test"
                autoComplete="username"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </div>
          </div>

          <Button
            type="submit"
            block
            disabled={loading}
            icon={loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
            className="mt-6 h-12"
          >
            {loading ? 'Memproses...' : 'Login'}
          </Button>
        
          <p className="mt-5 text-center text-[12px] font-semibold">
            <Link to="/forgot-password" className="text-muted hover:text-primary">
              Lupa password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
