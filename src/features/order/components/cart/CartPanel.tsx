import { useState } from 'react';
import type { CartItem, Promo } from '../../schema';
import { Trash2, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react'; // Menggunakan Lucide Icons agar lebih modern
import { handleProductImageError } from '@/shared/utils/handleProductImageError';

interface CartPanelProps {
  cart: CartItem[]; 
  subTotal: number; 
  tax: number; 
  serviceCharge: number;
  discountAmount: number; 
  grandTotal: number;
  formatRupiah: (val: number) => string; 
  appliedPromo: Promo | null; 
  paymentMethod: string;
  onUpdateQty: (id: string, type: 'increment' | 'decrement') => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onCheckout: () => void;
  onClickItemToEdit: (item: CartItem) => void;
}

export const CartPanel = ({
  cart, subTotal, tax, serviceCharge, discountAmount, grandTotal, formatRupiah,
  onUpdateQty, onRemoveItem, onClearAll, onCheckout, onClickItemToEdit
}: CartPanelProps) => {

  const [expandedBundles, setExpandedBundles] = useState<string[]>([]);

  const toggleBundle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedBundles(prev => prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full bg-surface w-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6 no-scrollbar space-y-4 md:space-y-5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
             <span className="text-4xl md:text-5xl mb-3">🛒</span>
             <p className="text-xs md:text-sm font-bold text-content-secondary">Keranjang masih kosong</p>
          </div>
        ) : (
          cart.map((item) => {
            const isBundle = item.product.type === 'bundle';
            const isExpanded = expandedBundles.includes(item.id);

            return (
              <div key={item.id} className="group relative bg-white border border-[#E8DFD1] rounded-[1.5rem] p-4 md:p-5 shadow-sm hover:border-[#86673A] transition-all flex flex-col">
                
                {/* HEADER ITEM (Klik untuk Edit) */}
                <div className="flex gap-4 items-start cursor-pointer" onClick={() => onClickItemToEdit(item)}>
                   {/* Thumbnail (Sedikit diperbesar untuk Tablet) */}
                   <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl overflow-hidden bg-[#F8F6F2] border border-[#E8DFD1]">
                     <img src={item.product.image} alt={item.product.name} onError={handleProductImageError} className="w-full h-full object-cover" />
                   </div>

                   {/* Rincian Nama & Harga Dasar */}
                   <div className="flex-1 pr-2">
                      <div className="flex flex-col gap-1.5 items-start mb-1">
                        {isBundle && <span className="bg-[#86673A] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">Paket</span>}
                        <h4 className="font-black text-xs md:text-sm text-customGray-light leading-tight line-clamp-2">{item.product.name}</h4>
                      </div>
                      <p className="text-[11px] font-bold text-content-secondary">Dasar: {formatRupiah(item.product.price)}</p>
                   </div>
                   
                   {/* Tombol Hapus (Dibuat BESAR & Lega) */}
                   <button 
                     onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }} 
                     className="w-10 h-10 md:w-12 md:h-12 bg-semantic-error/10 text-semantic-error rounded-xl flex items-center justify-center hover:bg-semantic-error hover:text-white transition-colors shrink-0 shadow-sm"
                     aria-label="Hapus Item"
                   >
                     <Trash2 size={20} strokeWidth={2.5} />
                   </button>
                </div>

                {/* RENDER OPSI (SINGLE ATAU BUNDLE) */}
                <div className="mt-4">
                  {!isBundle && Object.keys(item.selectedOptions).length > 0 && (
                    <div className="space-y-1.5 mb-3 bg-[#F8F6F2] p-3 rounded-xl border border-[#E8DFD1]">
                      {Object.values(item.selectedOptions).map((opt: any) => (
                        <div key={opt.id} className="flex justify-between items-center text-[11px] text-content-secondary">
                          <span>- {opt.name}</span>
                          <span className="font-bold text-[#86673A]">{opt.price > 0 ? `+${formatRupiah(opt.price)}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isBundle && item.selectedOptions && (
                    <div className="border border-[#E8DFD1] bg-[#F8F6F2]/50 rounded-xl mb-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => toggleBundle(item.id, e)} className="flex items-center justify-between w-full text-[11px] font-bold text-content-secondary p-3 hover:bg-[#F8F6F2] hover:text-[#86673A] transition-colors">
                        <span className="uppercase tracking-widest">Rincian Paket ({Object.keys(item.selectedOptions).length} Item)</span>
                        {isExpanded ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-3 pt-0 space-y-3 bg-[#F8F6F2]">
                          {Object.entries(item.selectedOptions).map(([bItemId, opts]: [string, any]) => {
                             const bundleItemDef = item.product.bundleItems?.find(b => b.id === bItemId);
                             return (
                               <div key={bItemId} className="pl-3 border-l-2 border-[#86673A]/40">
                                 <p className="text-[11px] font-black text-customGray-light mb-1.5">{bundleItemDef?.productName}</p>
                                 {Object.values(opts).map((opt: any) => (
                                   <div key={opt.id} className="flex justify-between items-center text-[10px] text-content-secondary mb-1">
                                     <span>- {opt.name}</span>
                                     <span className="font-bold text-[#86673A]">{opt.price > 0 ? `+${formatRupiah(opt.price)}` : ''}</span>
                                   </div>
                                 ))}
                               </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <div className="bg-[#86673A]/5 border border-[#86673A]/20 p-2.5 rounded-lg mt-1 mb-3">
                      <p className="text-[11px] font-bold italic text-[#86673A] leading-snug">Note: "{item.notes}"</p>
                    </div>
                  )}

                  {/* AREA KENDALI QUANTITY & TOTAL (Layout Touch-Friendly) */}
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-[#E8DFD1] flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                     
                     {/* Kendali Kuantitas (BESAR UNTUK TABLET) */}
                     <div className="flex items-center gap-1.5 bg-[#F8F6F2] p-1.5 rounded-[1rem] border border-[#E8DFD1] shadow-sm">
                        <button 
                          onClick={() => onUpdateQty(item.id, 'decrement')} 
                          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-content-secondary hover:bg-[#86673A] hover:text-white hover:border-[#86673A] border border-[#E8DFD1] shadow-sm transition-all active:scale-95"
                          aria-label="Kurangi Jumlah"
                        >
                          <Minus size={20} strokeWidth={3} />
                        </button>
                        
                        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                          <span className="text-sm md:text-base font-black text-customGray-light">{item.quantity}</span>
                        </div>
                        
                        <button 
                          onClick={() => onUpdateQty(item.id, 'increment')} 
                          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-content-secondary hover:bg-[#86673A] hover:text-white hover:border-[#86673A] border border-[#E8DFD1] shadow-sm transition-all active:scale-95"
                          aria-label="Tambah Jumlah"
                        >
                          <Plus size={20} strokeWidth={3} />
                        </button>
                     </div>

                     {/* Total Harga Item */}
                     <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-0.5">Total Harga</p>
                        <p className="text-sm md:text-base font-black text-[#86673A]">
                           {formatRupiah(item.totalItemPrice)}
                        </p>
                     </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* SUMMARY FOOTER - Menambahkan Service Charge */}
      <div className="bg-white border-t border-[#E8DFD1] p-5 md:p-6 lg:p-7 shrink-0 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.08)] rounded-tl-[2rem]">
         <div className="space-y-2.5 mb-5">
           <div className="flex justify-between text-xs md:text-sm font-bold text-content-secondary"><span>Subtotal</span><span>{formatRupiah(subTotal)}</span></div>
           {discountAmount > 0 && <div className="flex justify-between text-xs md:text-sm font-bold text-semantic-success"><span>Diskon</span><span>- {formatRupiah(discountAmount)}</span></div>}
           <div className="flex justify-between text-xs md:text-sm font-bold text-content-secondary"><span>Pajak PB1 (10%)</span><span>{formatRupiah(tax)}</span></div>
           
           {/* TAMPILKAN SERVICE CHARGE */}
           {serviceCharge > 0 && (
             <div className="flex justify-between text-xs md:text-sm font-bold text-content-secondary"><span>Layanan (5%)</span><span>{formatRupiah(serviceCharge)}</span></div>
           )}

           <div className="border-t-2 border-dashed border-[#E8DFD1] pt-3 mt-3 flex justify-between items-end">
             <span className="text-sm md:text-base font-black text-customGray-light uppercase tracking-widest">Total Bayar</span>
             <span className="text-lg md:text-xl font-black text-[#86673A]">{formatRupiah(grandTotal)}</span>
           </div>
         </div>

         <div className="flex gap-4">
           {/* Tombol Kosongkan (Diperbesar) */}
           <button 
             onClick={onClearAll} 
             disabled={cart.length === 0} 
             className="px-6 py-4 bg-semantic-error/10 border-2 border-semantic-error/20 text-semantic-error rounded-2xl font-black text-sm hover:bg-semantic-error hover:text-white transition-all disabled:opacity-50 active:scale-95"
           >
             Kosongkan
           </button>
           
           {/* Tombol Proses (Diperbesar) */}
           <button 
             onClick={onCheckout} 
             disabled={cart.length === 0} 
             className="flex-1 py-4 bg-[#86673A] text-white rounded-2xl font-black text-base hover:bg-[#684F2A] shadow-xl shadow-[#86673A]/30 transition-all disabled:opacity-50 active:scale-95"
           >
             Proses Pesanan
           </button>
         </div>
      </div>
    </div>
  );
};