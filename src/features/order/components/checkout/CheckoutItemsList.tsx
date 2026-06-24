import type { CartItem } from '../../schema';
import { handleProductImageError } from '@/shared/utils/handleProductImageError';

interface CheckoutItemsListProps {
  cart: CartItem[];
  formatRupiah: (val: number) => string;
}

export const CheckoutItemsList = ({ cart, formatRupiah }: CheckoutItemsListProps) => {
  return (
    <div className="bg-white border-2 border-divider/60 rounded-[1.5rem] p-5 shadow-sm">
       <div className="flex items-center justify-between mb-5 border-b border-divider pb-4">
         <h3 className="font-black text-[11px] md:text-sm text-customGray-light uppercase tracking-widest">Rincian Pesanan</h3>
         <span className="bg-[#F8F6F2] text-customGray-light px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-[#E8DFD1]">{cart.length} Item</span>
       </div>

       <div className="space-y-5">
         {cart.map(item => {
            const isBundle = item.product.type === 'bundle';
            const basePrice = item.product.price;
            const additionPrice = item.totalItemPrice - item.product.price;
            const finalItemPrice = item.totalItemPrice; 
            
            return (
              <div key={item.id} className="pb-5 border-b border-dashed border-divider last:border-0 last:pb-0">
                 
                 {/* HEADER ITEM */}
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3.5 items-start pr-3">
                       {/* THUMBNAIL GAMBAR */}
                       <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl overflow-hidden bg-[#F8F6F2] border border-[#E8DFD1]">
                         <img src={item.product.image} alt={item.product.name} onError={handleProductImageError} className="w-full h-full object-cover" />
                       </div>

                       <div className="pt-0.5">
                         {isBundle && <span className="bg-[#86673A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest mb-1.5 block w-max">Paket</span>}
                         <div className="flex items-start gap-2.5">
                           <span className="font-black text-sm md:text-base text-[#86673A]">{item.quantity}x</span>
                           <h4 className="font-black text-sm md:text-base text-customGray-light leading-tight">{item.product.name}</h4>
                         </div>
                         <p className="text-[10px] font-bold text-content-secondary mt-1">Dasar: {formatRupiah(basePrice)} / item</p>
                       </div>
                    </div>
                 </div>

                 {/* Rincian Opsi (Single) */}
                 {!isBundle && Object.keys(item.selectedOptions).length > 0 && (
                   <div className="pl-[5.25rem] md:pl-[5.75rem] space-y-1">
                     {Object.values(item.selectedOptions).map((opt: any) => (
                       <div key={opt.id} className="text-[10px] text-content-secondary flex justify-between items-center bg-[#F8F6F2]/50 px-2 py-1 rounded">
                         <span>- {opt.name}</span>
                         {opt.price > 0 ? <span className="font-medium text-[#86673A] pl-2">+{formatRupiah(opt.price)}</span> : <span></span>}
                       </div>
                     ))}
                   </div>
                 )}

                 {/* Rincian Opsi (Bundle) */}
                 {isBundle && item.selectedOptions && (
                    <div className="pl-[5.25rem] md:pl-[5.75rem] space-y-2.5">
                       {Object.entries(item.selectedOptions).map(([bItemId, opts]: [string, any]) => {
                         const bundleItemDef = item.product.bundleItems?.find(b => b.id === bItemId);
                         return (
                           <div key={bItemId} className="border-l-2 border-[#86673A]/30 pl-2.5">
                             <p className="text-[10px] font-black text-customGray-light mb-1">{bundleItemDef?.productName}</p>
                             <div className="space-y-1">
                               {Object.values(opts).map((opt: any) => (
                                 <div key={opt.id} className="text-[9px] text-content-secondary flex justify-between items-center">
                                   <span>• {opt.name}</span>
                                   {opt.price > 0 ? <span className="font-medium text-[#86673A] pl-2">+{formatRupiah(opt.price)}</span> : <span></span>}
                                 </div>
                               ))}
                             </div>
                           </div>
                         );
                       })}
                    </div>
                 )}

                 {/* Rincian Tambahan & Total Akhir Per Item */}
                 <div className="pl-[5.25rem] md:pl-[5.75rem] mt-3">
                   {/* Tampilkan Catatan Jika Ada */}
                   {item.notes && (
                     <p className="text-[10px] italic text-[#86673A] font-medium bg-[#86673A]/5 p-2 rounded-lg border border-[#86673A]/10 mb-3">
                       Catatan: "{item.notes}"
                     </p>
                   )}
                   
                   <div className="bg-[#F8F6F2] rounded-xl p-3 border border-[#E8DFD1]">
                     {/* Rincian Tambahan */}
                     {additionPrice > 0 && (
                       <div className="flex justify-between items-center text-[10px] mb-2 pb-2 border-b border-[#E8DFD1]/50">
                         <span className="font-bold text-content-secondary">Total Tambahan (Additions)</span>
                         <span className="font-black text-[#86673A]">+{formatRupiah(additionPrice)}</span>
                       </div>
                     )}
                     
                     {/* TOTAL AKHIR (Kalkulasi Item * Qty) */}
                     <div className="flex justify-between items-end">
                       <div className="flex flex-col">
                         <span className="font-black text-[11px] text-customGray-light uppercase tracking-widest">Total Harga Item</span>
                         {item.quantity > 1 && (
                            <span className="text-[9px] font-bold text-content-secondary mt-0.5">
                              (@ {formatRupiah(finalItemPrice)} x {item.quantity})
                            </span>
                         )}
                       </div>
                       <span className="font-black text-sm md:text-base text-customGray-light">
                         {formatRupiah(finalItemPrice * item.quantity)}
                       </span>
                     </div>
                   </div>
                 </div>
                 
              </div>
            );
         })}
       </div>
    </div>
  );
};