import { Search, ChevronDown } from 'lucide-react';
import type { OrderType } from '@/features/order/api/transaction.schema';
import { ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, type OrderStatus } from '../schema';

interface TrackingTabsProps {
  statusFilter: 'ALL' | OrderStatus;
  onStatusChange: (status: 'ALL' | OrderStatus) => void;
  typeFilter: 'ALL' | OrderType;
  onTypeChange: (type: 'ALL' | OrderType) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  totalOrders: number;
}

const STATUS_TABS: { id: 'ALL' | OrderStatus; label: string }[] = [
  { id: 'ALL', label: 'Semua' },
  ...ORDER_STATUSES.map(s => ({ id: s, label: ORDER_STATUS_LABEL[s] })),
];

export const TrackingTabs = ({
  statusFilter, onStatusChange, typeFilter, onTypeChange, searchQuery, onSearchChange, totalOrders,
}: TrackingTabsProps) => {
  return (
    <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-[1.5rem] border border-[#E8DFD1] shadow-sm">

      {/* STATUS FILTER */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onStatusChange(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-[11px] md:text-xs font-black transition-all whitespace-nowrap shrink-0 border-2
            ${statusFilter === tab.id
              ? 'bg-[#86673A] text-white border-[#86673A] shadow-md shadow-[#86673A]/20'
              : 'bg-[#F8F6F2] text-content-secondary border-transparent hover:border-[#E8DFD1] hover:text-customGray-light'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TYPE FILTER + SEARCH + COUNTER */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <div className="relative shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as 'ALL' | OrderType)}
            className="appearance-none bg-[#F8F6F2] border-2 border-transparent pl-4 pr-9 py-2.5 rounded-xl text-xs font-bold text-customGray-light focus:bg-white focus:border-[#86673A] focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">Semua Tipe</option>
            {(Object.keys(ORDER_TYPE_LABEL) as OrderType[]).map(t => (
              <option key={t} value={t}>{ORDER_TYPE_LABEL[t]}</option>
            ))}
          </select>
          <ChevronDown size={16} className="text-[#86673A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-secondary">
            <Search size={16} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari No. Order, Nama, Antrean..."
            className="w-full bg-[#F8F6F2] border-2 border-transparent pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold text-customGray-light focus:bg-white focus:border-[#86673A] focus:outline-none transition-all"
          />
        </div>

        <div className="hidden md:flex items-center justify-center bg-[#86673A]/10 text-[#86673A] px-3 py-2 rounded-xl border border-[#86673A]/20 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest">{totalOrders} Pesanan</span>
        </div>
      </div>
    </div>
  );
};
