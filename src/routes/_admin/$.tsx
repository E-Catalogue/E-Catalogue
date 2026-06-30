import { createFileRoute, Link } from '@tanstack/react-router';
import { Wrench, ArrowLeft } from 'lucide-react';

const ComingSoonPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center mb-6">
      <Wrench size={36} className="text-primary" strokeWidth={2} />
    </div>
    <h1 className="text-2xl font-extrabold text-ink">Fitur Sedang Dikembangkan</h1>
    <p className="text-muted font-medium mt-3 max-w-sm leading-relaxed">
      Halaman ini belum tersedia. Tim kami sedang aktif mengerjakan fitur ini dan akan segera hadir.
    </p>
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-2 mt-8 rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3 shadow-glow hover:bg-primary-dark transition-colors"
    >
      <ArrowLeft size={16} /> Kembali ke Dashboard
    </Link>
  </div>
);

export const Route = createFileRoute('/_admin/$')({
  component: ComingSoonPage,
});
