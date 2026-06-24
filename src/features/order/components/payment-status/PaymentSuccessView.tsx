import type { CartItem } from '../../schema';
import { usePaymentSuccess } from '../../hooks/usePaymentSuccess';
import { CheckCircle2, Printer, Plus } from 'lucide-react';

interface PaymentSuccessViewProps {
  cart: CartItem[]; 
  subTotal: number; 
  tax: number; 
  serviceCharge: number; 
  discountAmount: number; 
  loyaltyPointsUsed: number; // PERBAIKAN: Tambahkan prop ini
  grandTotal: number; 
  formatRupiah: (val: number) => string;
  paymentMethod: string; 
  orderId: string; 
  transactionTime: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  orderNumber: string;
  onResetOrder: () => void;
}

export const PaymentSuccessView = ({
  cart, subTotal, tax, serviceCharge, discountAmount, loyaltyPointsUsed, grandTotal, formatRupiah,
  paymentMethod, orderId, transactionTime, customerName, customerPhone, orderType, orderNumber,
  onResetOrder
}: PaymentSuccessViewProps) => {

  const { handlePrint, handleCreateNewOrder } = usePaymentSuccess(grandTotal, onResetOrder);

  return (
    <div className="flex flex-col lg:flex-row gap-5 md:gap-6 h-full animate-in zoom-in-95 duration-500 bg-background print:hidden max-w-6xl mx-auto overflow-y-auto lg:overflow-hidden no-scrollbar pb-6 lg:pb-0">
      
      {/* KOLOM KIRI: RINCIAN TRANSAKSI */}
      <div className="flex-none lg:flex-1 bg-white border border-[#E8DFD1] rounded-[1.5rem] md:rounded-[2rem] shadow-lg flex flex-col overflow-hidden relative border-t-8 border-t-semantic-success/80">
         
         <div className="p-6 md:p-8 border-b border-divider/60 relative">
            <div className="flex justify-between items-start mb-4 md:mb-6">
               <div>
                  <h3 className="font-bold text-[9px] md:text-[10px] text-content-secondary uppercase tracking-widest mb-1">Informasi Pemesan</h3>
                  <p className="font-black text-lg md:text-2xl text-customGray-light leading-none mb-1">{customerName}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-content-secondary">{customerPhone || '-'}</p>
               </div>
               <div className="text-right bg-[#F8F6F2] py-1.5 px-3 md:py-2 md:px-4 rounded-lg md:rounded-xl border border-[#E8DFD1]">
                  <span className="font-black text-[11px] md:text-sm text-[#86673A] block">{orderId}</span>
                  <span className="font-bold text-[8px] md:text-[10px] text-content-secondary">{transactionTime}</span>
               </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
               <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-white rounded-md md:rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider text-customGray-light border border-divider">
                 {orderType}
               </span>
               <span className="bg-[#86673A] text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider shadow-sm">
                 {orderType === 'Dine In' ? 'Meja ' : 'Antrean '} {orderNumber || '-'}
               </span>
            </div>
         </div>

         {/* Daftar Item Beli */}
         <div className="flex-1 overflow-y-visible lg:overflow-y-auto p-6 md:p-8 space-y-4 md:space-y-6 no-scrollbar">
            {cart.map(item => {
               const isBundle = item.product.type === 'bundle';
               const basePrice = item.product.price;
               const additionPrice = item.totalItemPrice - item.product.price;
               const finalItemPrice = item.totalItemPrice;

               return (
                 <div key={item.id} className="pb-4 md:pb-5 border-b border-dashed border-divider last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="font-black text-sm md:text-lg text-[#86673A]">{item.quantity}x</span>
                           <h4 className="font-black text-sm md:text-lg text-customGray-light">{item.product.name}</h4>
                         </div>
                         <p className="text-[9px] md:text-[11px] font-bold text-content-secondary pl-[1.5rem] md:pl-[1.8rem]">Dasar: {formatRupiah(basePrice)} / item</p>
                       </div>
                    </div>

                    <div className="pl-[1.5rem] md:pl-[1.8rem] mt-2 md:mt-3">
                       {!isBundle && Object.keys(item.selectedOptions).length > 0 && (
                         <div className="space-y-1 md:space-y-1.5 mb-2 md:mb-3">
                           {Object.values(item.selectedOptions).map((opt: any) => (
                             <div key={opt.id} className="text-[9px] md:text-xs text-content-secondary flex justify-between">
                               <span>- {opt.name}</span>
                               {opt.price > 0 && <span className="font-medium text-[#86673A]">+{formatRupiah(opt.price)}</span>}
                             </div>
                           ))}
                         </div>
                       )}

                       {isBundle && item.selectedOptions && (
                          <div className="space-y-2 md:space-y-3 mb-2 md:mb-3 border-l-2 border-[#86673A]/20 pl-2.5 md:pl-3">
                             {Object.entries(item.selectedOptions).map(([bItemId, opts]: [string, any]) => {
                               const bundleItemDef = item.product.bundleItems?.find(b => b.id === bItemId);
                               return (
                                 <div key={bItemId}>
                                   <p className="text-[10px] md:text-xs font-black text-customGray-light">{bundleItemDef?.productName}</p>
                                   <div className="space-y-1 mt-1">
                                     {Object.values(opts).map((opt: any) => (
                                       <div key={opt.id} className="text-[8px] md:text-[10px] text-content-secondary flex justify-between">
                                         <span>- {opt.name}</span>
                                         {opt.price > 0 && <span className="text-[#86673A]">+{formatRupiah(opt.price)}</span>}
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               );
                             })}
                          </div>
                       )}

                       <div className="bg-[#F8F6F2] rounded-lg md:rounded-xl p-3 md:p-4 border border-[#E8DFD1] mt-3 md:mt-4">
                         {additionPrice > 0 && (
                           <div className="flex justify-between items-center text-[9px] md:text-xs mb-2 pb-2 md:mb-3 md:pb-3 border-b border-[#E8DFD1]">
                             <span className="font-bold text-content-secondary">Total Tambahan (Additions)</span>
                             <span className="font-black text-[#86673A]">+{formatRupiah(additionPrice)}</span>
                           </div>
                         )}
                         <div className="flex justify-between items-end">
                           <span className="font-black text-[9px] md:text-xs text-customGray-light uppercase tracking-widest">Total Harga Item</span>
                           <span className="font-black text-sm md:text-lg text-customGray-light">
                             {formatRupiah(finalItemPrice * item.quantity)}
                           </span>
                         </div>
                       </div>
                    </div>
                 </div>
               )
            })}
         </div>

         {/* Rincian Total */}
         <div className="bg-[#F8F6F2] p-6 md:p-8 border-t border-[#E8DFD1]">
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              <div className="flex justify-between text-[10px] md:text-xs font-bold text-content-secondary"><span>Subtotal</span><span>{formatRupiah(subTotal)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-[10px] md:text-xs font-bold text-semantic-success"><span>Diskon Promo</span><span>- {formatRupiah(discountAmount)}</span></div>}
              
              {/* PERBAIKAN: Tampilkan Tukar Poin di Sini */}
              {loyaltyPointsUsed > 0 && <div className="flex justify-between text-[10px] md:text-xs font-bold text-[#86673A]"><span>Tukar Poin</span><span>- {formatRupiah(loyaltyPointsUsed)}</span></div>}
              
              <div className="flex justify-between text-[10px] md:text-xs font-bold text-content-secondary"><span>Pajak PB1 (10%)</span><span>{formatRupiah(tax)}</span></div>
              {serviceCharge > 0 && <div className="flex justify-between text-[10px] md:text-xs font-bold text-content-secondary"><span>Layanan (5%)</span><span>{formatRupiah(serviceCharge)}</span></div>}
            </div>
            
            <div className="pt-4 md:pt-5 border-t border-dashed border-[#86673A]/30 flex justify-between items-end">
               <div>
                 <span className="block font-bold text-[8px] md:text-[10px] text-content-secondary uppercase tracking-widest mb-1 md:mb-1.5">Metode Bayar</span>
                 <span className="inline-block bg-white border border-[#E8DFD1] px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-[9px] md:text-xs font-black text-[#86673A] uppercase shadow-sm">{paymentMethod}</span>
               </div>
               <div className="text-right">
                 <span className="block font-bold text-[8px] md:text-[10px] text-content-secondary uppercase tracking-widest mb-0.5 md:mb-1">Total Tagihan</span>
                 <span className="text-lg md:text-2xl font-black tracking-tight leading-none text-[#86673A]">{formatRupiah(grandTotal)}</span>
               </div>
            </div>
         </div>
      </div>

      {/* KOLOM KANAN: KARTU SUKSES & AKSI */}
      <div className="w-full lg:w-[380px] xl:w-[450px] shrink-0 flex flex-col gap-4 md:gap-6">
        <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-lg flex-1 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-semantic-success/5 rounded-bl-full pointer-events-none"></div>
           
           <div className="w-16 h-16 md:w-28 md:h-28 bg-semantic-success/10 text-semantic-success rounded-full flex items-center justify-center mb-5 md:mb-8 shadow-inner animate-bounce">
              <CheckCircle2 size={40} className="md:w-14 md:h-14" strokeWidth={2.5} />
           </div>
           
           <h3 className="font-black text-xl md:text-3xl text-customGray-light mb-2 md:mb-4 tracking-tight text-center">Pembayaran Sukses!</h3>
           <p className="text-[10px] md:text-sm font-bold text-content-secondary text-center leading-relaxed px-4 md:px-0">
             Terima kasih, struk pesanan telah tersimpan aman di dalam sistem.
           </p>
        </div>

        <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-lg space-y-3 md:space-y-4">
           <button onClick={handlePrint} className="w-full py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm bg-[#F8F6F2] border-2 border-transparent text-customGray-light hover:border-[#86673A] transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95">
              <Printer size={16} className="md:w-5 md:h-5" strokeWidth={2.5} />
              Cetak Struk Thermal
           </button>
           <button onClick={handleCreateNewOrder} className="w-full py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm bg-[#86673A] text-white shadow-xl shadow-[#86673A]/20 hover:bg-[#684F2A] transition-all active:scale-95 flex items-center justify-center gap-2">
              Buat Pesanan Baru
              <Plus size={16} className="md:w-5 md:h-5" strokeWidth={3} />
           </button>
        </div>
      </div>
    </div>
  );
};