import { Link, useNavigate } from '@tanstack/react-router';
import { Car, Wrench, Users, BarChart3, CircleDollarSign, CalendarDays, ChevronDown } from 'lucide-react';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { UnitCard } from '@/shared/components/ui/UnitCard';
import { StatCard } from './components/StatCard';
import { SalesChart } from './components/SalesChart';
import { RecentActivity } from './components/RecentActivity';
import { PipelineFunnel } from './components/PipelineFunnel';
import { RekondisiList } from './components/RekondisiList';
import { BottomStats } from './components/BottomStats';
import { DASHBOARD_STATS } from '@/data/mock';
import { useAppSelector } from '@/app/store';
import { formatCurrency } from '@/core/utils/format';

const LihatSemua = ({ to }: { to: string }) => (
  <Link to={to} className="text-[11px] font-bold text-primary hover:underline shrink-0">
    Lihat Semua
  </Link>
);

export const DashboardPage = () => {
  const s = DASHBOARD_STATS;
  const readyUnits = useAppSelector((st) => st.data.units.filter((u) => u.status === 'ready'));
  const navigate = useNavigate();
  const goToStock = () => navigate({ to: '/inventory' });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto animate-float-up">
      {/* Date selector */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3.5 py-2 text-[12px] font-bold text-ink-soft shadow-card">
          <CalendarDays size={15} className="text-primary" /> 21 Mei 2024
          <ChevronDown size={14} className="text-muted" />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={Car} color="red" label="Total Stok Unit" value={`${s.totalStock}`} unit="Unit"
          subtitle={{ text: 'Ready:', highlight: `${s.readyStock} Unit` }} />
        <StatCard icon={Wrench} color="blue" label="Dalam Rekondisi" value={`${s.rekondisi}`} unit="Unit"
          subtitle={{ text: 'Estimasi selesai:', highlight: '5 Unit' }} />
        <StatCard icon={Users} color="green" label="Lead / Prospek" value={`${s.leads}`} unit="Lead"
          subtitle={{ text: 'Follow Up Hari Ini:', highlight: `${s.followUpToday}` }} />
        <StatCard icon={BarChart3} color="orange" label="Unit Terjual (Bln Ini)" value={`${s.soldThisMonth}`} unit="Unit"
          progress={{ percent: Math.round((s.soldThisMonth / s.soldTarget) * 100), label: `Target: ${s.soldTarget} Unit` }} />
        <StatCard icon={CircleDollarSign} color="purple" label="Total Omzet (Bln Ini)"
          value={formatCurrency(s.omzet, { compact: true }).replace('Rp ', 'Rp ')}
          progress={{ percent: Math.round((s.omzet / s.omzetTarget) * 100), label: `Target: ${formatCurrency(s.omzetTarget, { compact: true })}` }} />
      </div>

      {/* Konten utama — 2 kolom dengan tinggi sama; kartu pengisi (flex-1) menutup space kosong */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* KOLOM KIRI (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <SectionCard
            title="Ready Stock"
            icon={<Car size={16} />}
            action={<LihatSemua to="/ready-stock" />}
            bodyClassName="p-4 md:p-5"
          >
            {/* Klik kartu → menuju halaman stok (bukan modal). Scroll horizontal bila penuh. */}
            <div className="flex gap-4 overflow-x-auto scrollbar-slim pb-2 -mx-1 px-1 snap-x">
              {readyUnits.map((u) => (
                <div key={u.id} className="w-[230px] shrink-0 snap-start">
                  <UnitCard unit={u} onView={goToStock} />
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
            <SectionCard title="Pipeline Penjualan" icon={<BarChart3 size={16} />} className="flex flex-col" bodyClassName="flex-1 flex flex-col justify-center">
              <PipelineFunnel />
            </SectionCard>
            <SectionCard title="Unit Rekondisi" icon={<Wrench size={16} />} action={<LihatSemua to="/rekondisi" />} className="flex flex-col" bodyClassName="flex-1">
              <RekondisiList />
            </SectionCard>
          </div>
        </div>

        {/* KOLOM KANAN (1/3) */}
        <div className="flex flex-col gap-5">
          <SectionCard
            title="Grafik Penjualan"
            icon={<BarChart3 size={16} />}
            action={
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft bg-surface-soft border border-border rounded-lg px-2.5 py-1">
                Bulan Ini <ChevronDown size={13} className="text-muted" />
              </span>
            }
          >
            <SalesChart />
          </SectionCard>

          <SectionCard title="Aktivitas Terbaru" icon={<Users size={16} />} className="flex flex-col flex-1" bodyClassName="flex-1">
            <RecentActivity />
          </SectionCard>
        </div>
      </div>

      {/* Bottom strip */}
      <BottomStats />
    </div>
  );
};
