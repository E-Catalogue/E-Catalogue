import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, ShieldCheck, Lock, Car, BadgeCheck, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

const STATS = [
  { icon: Car, value: '42', label: 'Unit Stok' },
  { icon: Users, value: '56', label: 'Lead Aktif' },
  { icon: TrendingUp, value: '4.9', label: 'Rating' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const handleLogin = () => navigate({ to: '/dashboard' });

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-[1.1fr_1fr]">
      {/* ===== KIRI: Showcase ===== */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Foto mobil + overlay gradient */}
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Lapis 1: penggelap merata — jamin teks selalu terbaca */}
        <div className="absolute inset-0 bg-ink/75" />
        {/* Lapis 2: gradient kedalaman (lebih gelap di kiri & bawah tempat teks berada) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/70 to-ink/30" />
        {/* Lapis 3: tint hangat primary untuk kesan elegan */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/45 via-primary/10 to-transparent mix-blend-soft-light" />
        {/* Blob dekoratif */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-10 right-0 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Car size={24} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="leading-none">
            <p className="font-extrabold text-white text-[16px] tracking-tight">CARS SHOWROOM</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mt-1">Used Car Specialist</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-md animate-float-up">
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

        {/* Stat kaca */}
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
        <div className="w-full max-w-sm animate-float-up">
          {/* Logo (mobile / brand mark) */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
              <Car size={22} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="leading-none">
              <p className="font-extrabold text-ink text-[15px] tracking-tight">CARS SHOWROOM</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary mt-1">Used Car Specialist</p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-5">
            <Lock size={24} strokeWidth={2.2} />
          </div>
          <h2 className="text-2xl font-extrabold text-ink">Masuk ke Dashboard</h2>
          <p className="text-muted font-medium mt-1.5 text-[14px]">Khusus pengguna internal showroom.</p>

          <div className="mt-7 space-y-4 opacity-60 pointer-events-none select-none">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Email</label>
              <input disabled placeholder="email@carsshowroom.id" className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Password</label>
              <input disabled type="password" placeholder="••••••••" className="w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-primary-light/60 border border-primary/15">
            <BadgeCheck size={15} className="text-primary shrink-0" />
            <p className="text-[11px] text-ink-soft font-semibold">Mode demo — autentikasi belum aktif, langsung klik Login.</p>
          </div>

          <Button block onClick={handleLogin} icon={<ArrowRight size={17} />} className="mt-5 h-12">
            Login
          </Button>

          <a href="/" className="block text-center text-[12px] font-bold text-muted hover:text-primary mt-5 transition-colors">
            ← Kembali ke halaman utama
          </a>
        </div>
      </div>
    </div>
  );
};
