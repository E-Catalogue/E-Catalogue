import type { TopProduct } from '../schema';
import { Award } from 'lucide-react';
import { handleProductImageError } from '@/shared/utils/handleProductImageError';

interface TopProductsListProps {
  products: TopProduct[];
  formatRupiah: (val: number) => string;
}

export const TopProductsList = ({ products, formatRupiah }: TopProductsListProps) => {
  return (
    <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-5 md:p-6 border-b border-divider/60 flex items-center justify-between bg-[#F8F6F2]/30">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-[#86673A]/10 text-[#86673A] flex items-center justify-center">
             <Award size={18} strokeWidth={2.5} />
           </div>
           <h3 className="font-black text-sm md:text-base text-customGray-light uppercase tracking-widest">Produk Terlaris</h3>
         </div>
      </div>
      
      <div className="p-5 md:p-6 flex-1 overflow-y-auto no-scrollbar space-y-4">
        {products.map((product, index) => (
           <div key={product.id} className="flex items-center gap-4">
              <span className="font-black text-[#86673A] w-4 text-center">{index + 1}</span>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F8F6F2] border border-[#E8DFD1] shrink-0">
                 <img src={product.image} alt={product.name} onError={handleProductImageError} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="font-black text-sm text-customGray-light truncate">{product.name}</h4>
                 <p className="text-[10px] font-bold text-content-secondary mt-0.5">{product.soldCount} Terjual</p>
              </div>
              <div className="text-right shrink-0">
                 <p className="font-black text-sm text-[#86673A]">{formatRupiah(product.revenue)}</p>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};