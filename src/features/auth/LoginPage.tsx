import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { ArrowRight, ShieldCheck, Lock, Car, TrendingUp, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAppDispatch } from '@/app/store';
import { setCredentials } from '@/app/store/authSlice';
import { authApi } from './auth.api';
import { classifyAxiosError } from '@/core/api/errorHandler';
import type { ApiErrorBody } from '@/core/api/types';

const STATS = [
  { icon: Car, value: '42', label: 'Unit Stok' },
  { icon: Users, value: '56', label: 'Lead Aktif' },
  { icon: TrendingUp, value: '4.9', label: 'Rating' },
];

const inputClass =
  'w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink placeholder:text-muted placeholder:font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = await authApi.login(identifier.trim(), password);
      dispatch(setCredentials(payload));
      navigate({ to: '/dashboard' });
    } catch (err) {
      // Error infrastruktur (network/timeout/5xx) sudah ditangani modal global (1 pintu).
      // Di sini cukup tampilkan error bisnis (kredensial salah / validasi).
      if (classifyAxiosError(err)) return;
      const ax = err as AxiosError<ApiErrorBody>;
      setError(ax.response?.data?.message ?? 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-[1.1fr_1fr]">
      {/* ===== KIRI: Showcase ===== */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/70 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/45 via-primary/10 to-transparent mix-blend-soft-light" />
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-10 right-0 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Car size={24} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="leading-none">
            <p className="font-extrabold text-white text-[16px] tracking-tight">GM MOBILINDO</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mt-1">Used Car Specialist</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md ">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[12px] font-bold px-3.5 py-1.5">
            <ShieldCheck size={14} /> Area Internal
          </span>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mt-5">
            Kelola Showroom<br />Lebih <span className="text-primary-light">Cerdas</span> & Cepat
          </h1>
          <p className="text-white/80 font-medium mt-4 text-[15px] leading-relaxed">
            Satu dashboard untuk inventory, lead, test drive, penjualan, hingga pembayaran.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 max-w-md">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                <Icon size={18} className="text-primary-light" strokeWidth={2.3} />
                <p className="text-2xl font-extrabold text-white mt-2 leading-none">{s.value}</p>
                <p className="text-[11px] font-semibold text-white/70 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== KANAN: Form ===== */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleLogin} className="w-full max-w-sm ">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
              <Car size={22} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="leading-none">
              <p className="font-extrabold text-ink text-[15px] tracking-tight">GM MOBILINDO</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary mt-1">Used Car Specialist</p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-5">
            <Lock size={24} strokeWidth={2.2} />
          </div>
          <h2 className="text-2xl font-extrabold text-ink">Masuk ke Dashboard</h2>
          <p className="text-muted font-medium mt-1.5 text-[14px]">Khusus pengguna internal showroom.</p>

          {error && (
            <div className="flex items-start gap-2 mt-5 px-3.5 py-2.5 rounded-xl bg-semantic-error/10 border border-semantic-error/20 text-semantic-error">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[12px] font-semibold leading-snug">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Username atau Email</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin"
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

          <Button type="submit" block disabled={loading} icon={loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />} className="mt-6 h-12">
            {loading ? 'Memproses...' : 'Login'}
          </Button>

          <a href="/" className="block text-center text-[12px] font-bold text-muted hover:text-primary mt-5 transition-colors">
            ← Kembali ke halaman utama
          </a>
        </form>
      </div>
    </div>
  );
};
