import { Link } from '@tanstack/react-router';
import { ShieldCheck, Heart, Eye, Award, Users, Car, Target, ArrowRight } from 'lucide-react';

const VALUES = [
  { icon: ShieldCheck, title: 'Transparan', desc: 'Kondisi & riwayat mobil kami sampaikan apa adanya. Tanpa biaya tersembunyi.' },
  { icon: Heart, title: 'Mengutamakan Pelanggan', desc: 'Kepuasan dan kepercayaan Anda adalah prioritas utama kami.' },
  { icon: Award, title: 'Kualitas Terjamin', desc: 'Setiap unit melalui inspeksi & rekondisi sebelum dipasarkan.' },
];

const STATS = [
  { icon: Car, value: '2.500+', label: 'Unit Terjual' },
  { icon: Users, value: '5.000+', label: 'Pelanggan Puas' },
  { icon: Award, value: '10+', label: 'Tahun Pengalaman' },
  { icon: ShieldCheck, value: '150+', label: 'Titik Inspeksi' },
];

export const TentangPage = () => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden bg-surface border-b border-border">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center relative">
        <div className="animate-float-up">
          <p className="text-primary font-bold text-[13px] uppercase tracking-wide">Tentang Kami</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-ink leading-tight mt-3">
            Partner Terpercaya untuk Mobil Bekas Anda
          </h1>
          <p className="text-muted font-medium mt-4 leading-relaxed max-w-md">
            Cars Showroom hadir untuk menghapus keraguan dalam membeli mobil bekas. Kami percaya setiap orang
            berhak mendapatkan mobil berkualitas dengan harga jujur dan pelayanan yang tulus.
          </p>
          <Link to="/katalog" className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3 shadow-glow hover:bg-primary-dark transition-colors">
            Lihat Katalog <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative animate-scale-in">
          <img src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1400&auto=format&fit=crop" alt="" className="rounded-[2.5rem] shadow-card-hover w-full object-cover aspect-[4/3]" />
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-surface rounded-2xl border border-border p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-3"><Icon size={24} strokeWidth={2.2} /></div>
              <p className="text-2xl md:text-3xl font-extrabold text-ink">{s.value}</p>
              <p className="text-[12px] font-semibold text-muted mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>

    {/* Visi Misi */}
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid md:grid-cols-2 gap-6">
        <div className="bg-background rounded-2xl border border-border p-7">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4"><Eye size={24} /></div>
          <h2 className="text-xl font-extrabold text-ink">Visi</h2>
          <p className="text-muted font-medium mt-2 leading-relaxed">Menjadi showroom mobil bekas paling terpercaya dan transparan di Indonesia, pilihan utama setiap keluarga.</p>
        </div>
        <div className="bg-background rounded-2xl border border-border p-7">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow mb-4"><Target size={24} /></div>
          <h2 className="text-xl font-extrabold text-ink">Misi</h2>
          <p className="text-muted font-medium mt-2 leading-relaxed">Menyediakan mobil bekas berkualitas yang terinspeksi & bergaransi, dengan harga jujur dan layanan yang memudahkan setiap pelanggan.</p>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-primary font-bold text-[13px] uppercase tracking-wide">Nilai Kami</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">Yang Kami Pegang Teguh</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="bg-surface rounded-2xl border border-border p-7 hover:shadow-card hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4"><Icon size={24} strokeWidth={2.2} /></div>
              <h3 className="font-extrabold text-ink text-[16px]">{v.title}</h3>
              <p className="text-[13px] text-muted font-medium mt-1.5 leading-relaxed">{v.desc}</p>
            </div>
          );
        })}
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark p-8 md:p-14 text-center text-white">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative text-2xl md:text-3xl font-extrabold leading-tight">Mulai Perjalanan Mobil Anda</h2>
        <p className="relative text-white/85 font-medium mt-3 max-w-lg mx-auto">Telusuri katalog kami atau hubungi tim untuk konsultasi gratis.</p>
        <div className="relative flex flex-wrap gap-3 justify-center mt-6">
          <Link to="/katalog" className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-bold text-[14px] px-6 py-3 hover:bg-white/90 transition-colors">
            Lihat Katalog <ArrowRight size={16} />
          </Link>
          <Link to="/kontak" className="inline-flex items-center gap-2 rounded-xl bg-ink/20 backdrop-blur border border-white/30 text-white font-bold text-[14px] px-6 py-3 hover:bg-ink/30 transition-colors">
            Hubungi Kami
          </Link>
        </div>
      </div>
    </section>
  </div>
);
