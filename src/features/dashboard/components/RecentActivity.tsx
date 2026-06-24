import type { RecentTransaction } from '../schema';
import { History } from 'lucide-react';

interface RecentActivityProps {
  transactions: RecentTransaction[];
  formatRupiah: (val: number) => string;
}

export const RecentActivity = ({ transactions, formatRupiah }: RecentActivityProps) => {
  return (
    <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-5 md:p-6 border-b border-divider/60 flex items-center justify-between bg-[#F8F6F2]/30">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-[#86673A]/10 text-[#86673A] flex items-center justify-center">
             <History size={18} strokeWidth={2.5} />
           </div>
           <h3 className="font-black text-sm md:text-base text-customGray-light uppercase tracking-widest">Transaksi Terakhir</h3>
         </div>
      </div>
      
      <div className="overflow-x-auto no-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F6F2]/50 border-b border-divider/60">
              <th className="px-5 py-3 text-[10px] font-bold text-content-secondary uppercase tracking-widest whitespace-nowrap">Waktu</th>
              <th className="px-5 py-3 text-[10px] font-bold text-content-secondary uppercase tracking-widest whitespace-nowrap">Order ID</th>
              <th className="px-5 py-3 text-[10px] font-bold text-content-secondary uppercase tracking-widest whitespace-nowrap">Pelanggan</th>
              <th className="px-5 py-3 text-[10px] font-bold text-content-secondary uppercase tracking-widest whitespace-nowrap text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id} className="border-b border-divider/30 last:border-0 hover:bg-[#F8F6F2]/30 transition-colors">
                <td className="px-5 py-4 text-xs font-bold text-content-secondary whitespace-nowrap">{trx.time}</td>
                <td className="px-5 py-4">
                  <span className="text-[10px] font-black text-[#86673A] bg-[#86673A]/10 px-2 py-1 rounded-md uppercase">{trx.id}</span>
                </td>
                <td className="px-5 py-4 text-sm font-black text-customGray-light whitespace-nowrap">{trx.customerName}</td>
                <td className="px-5 py-4 text-sm font-black text-customGray-light whitespace-nowrap text-right">{formatRupiah(trx.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};