import type { DashboardMetrics } from '../schema';
import { Wallet, Receipt, TrendingUp, ArrowUpRight } from 'lucide-react';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
  formatRupiah: (val: number) => string;
}

export const SummaryCards = ({ metrics, formatRupiah }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      
      {/* Card 1: Pendapatan */}
      <div className="bg-[#86673A] rounded-[1.5rem] p-6 shadow-lg shadow-[#86673A]/20 relative overflow-hidden text-white">
         <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
         <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md">
               <ArrowUpRight size={12} strokeWidth={3} />
               <span>+{metrics.revenueGrowth}%</span>
            </div>
         </div>
         <p className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-1">Total Pendapatan (Hari Ini)</p>
         <h3 className="text-2xl md:text-3xl font-black tracking-tight">{formatRupiah(metrics.totalRevenue)}</h3>
      </div>

      {/* Card 2: Jumlah Order */}
      <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] p-6 shadow-sm">
         <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#F8F6F2] text-[#86673A] rounded-xl flex items-center justify-center">
              <Receipt size={20} strokeWidth={2.5} />
            </div>
         </div>
         <p className="text-[11px] font-bold uppercase tracking-widest text-content-secondary mb-1">Jumlah Transaksi</p>
         <h3 className="text-2xl md:text-3xl font-black text-customGray-light tracking-tight">{metrics.totalOrders} <span className="text-sm font-bold text-content-secondary tracking-normal">Order</span></h3>
      </div>

      {/* Card 3: Rata-rata Transaksi */}
      <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] p-6 shadow-sm">
         <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#F8F6F2] text-[#86673A] rounded-xl flex items-center justify-center">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
         </div>
         <p className="text-[11px] font-bold uppercase tracking-widest text-content-secondary mb-1">Rata-rata Nilai Order</p>
         <h3 className="text-2xl md:text-3xl font-black text-customGray-light tracking-tight">{formatRupiah(metrics.averageOrderValue)}</h3>
      </div>

    </div>
  );
};