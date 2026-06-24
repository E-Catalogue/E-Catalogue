import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { CartItem, Promo } from '../../schema';
import { usePayment } from '../../hooks/usePayment';
import { ChevronLeft } from 'lucide-react';

interface PaymentViewProps {
  cart: CartItem[]; subTotal: number; tax: number; serviceCharge: number; discountAmount: number;
  loyaltyPointsUsed: number; // PERBAIKAN: Tambahkan prop ini
  grandTotal: number; formatRupiah: (val: number) => string;
  paymentMethod: string; appliedPromo: Promo | null;
  customerName: string; orderNumber: string; orderType: string; customerPhone?: string;
  // Identitas order dari server (GET /sales/order/{id})
  orderNo?: string; queueNo?: string; orderStatus?: string; isLoadingDetail?: boolean;
  onBack: () => void;
  // Menyelesaikan pembayaran; parent berpindah ke halaman sukses.
  onConfirmPayment: () => Promise<void>;
  // Batalkan order (hanya tampil bila order PENDING)
  onCancelOrder?: () => void;
}

export const PaymentView = ({
  cart, subTotal, tax, serviceCharge, discountAmount, loyaltyPointsUsed, grandTotal, formatRupiah,
  paymentMethod, customerName, orderNumber, orderType, customerPhone,
  orderNo, queueNo, orderStatus, isLoadingDetail,
  onBack, onConfirmPayment, onCancelOrder
}: PaymentViewProps) => {

  const {
    receivedAmount, virtualAccountCode, transactionTime, orderId,
    isProcessing, setIsProcessing,
    isCashValid, canConfirm, cashChange, isEWallet, isTransferVA, isEDC,
    handleCashInput, handleQuickAmount, resetAmount
  } = usePayment({ grandTotal, paymentMethod }); // grandTotal di sini otomatis adalah finalGrandTotal

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    setSubmitError(null);
    setIsProcessing(true);
    try {
      // Order dibuat ke server; jika sukses parent akan mengganti tampilan ke "success".
      await onConfirmPayment();
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message || err?.message || 'Gagal membuat pesanan. Silakan coba lagi.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden bg-background">
      <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
         <div className="flex items-center gap-3">
           <button onClick={onBack} disabled={isProcessing} className="group flex items-center gap-1.5 p-1.5 pr-3 bg-white border border-divider/60 rounded-full text-content-secondary hover:text-customGray-light transition-all hover:bg-surface shadow-sm disabled:opacity-50">
             <div className="bg-[#F8F6F2] p-1 rounded-full group-hover:bg-[#86673A]/10 group-hover:text-[#86673A] transition-colors">
               <ChevronLeft size={16} strokeWidth={2.5} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Kembali</span>
           </button>
           <h2 className="text-xl md:text-2xl font-black text-customGray-light tracking-tight ml-2">Proses Pembayaran</h2>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full overflow-y-auto lg:overflow-hidden no-scrollbar pb-6 lg:pb-0">
        
        <div className="flex-1 flex flex-col bg-white border-2 border-divider/60 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm lg:overflow-y-auto no-scrollbar relative transition-all duration-500">
           
           <div className="bg-[#F8F6F2] p-5 md:p-6 border-b border-divider/60 shrink-0 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[10px] text-content-secondary uppercase tracking-widest mb-1.5">Informasi Pelanggan</h3>
                  <p className="font-black text-lg md:text-xl text-customGray-light leading-tight">{customerName || 'Walk-in Customer'}</p>
                  {customerPhone && <p className="text-[10px] font-bold text-content-secondary mt-1">{customerPhone}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5 text-right">
                  <span className="font-black text-xs text-[#86673A] uppercase tracking-widest">{orderNo || orderId}</span>
                  {isLoadingDetail
                    ? <span className="font-bold text-[10px] text-content-secondary animate-pulse">Memuat detail order...</span>
                    : <span className="font-bold text-[10px] text-content-secondary">{transactionTime}</span>}
                  {orderStatus && (
                    <span className="mt-0.5 inline-block bg-semantic-warning/15 text-semantic-warning px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">{orderStatus}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#E8DFD1]">
                 <span className="px-3 py-1.5 bg-white rounded-lg text-[10px] font-black uppercase tracking-wider text-[#86673A] shadow-sm border border-[#E8DFD1]">{orderType}</span>
                 <span className="bg-[#86673A] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">{orderType === 'Dine In' ? 'Meja ' : 'Antrean '} {orderNumber || '-'}</span>
                 {queueNo && (
                   <span className="ml-auto bg-[#F8F6F2] border border-[#E8DFD1] text-customGray-light px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">No. Antrean {queueNo}</span>
                 )}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 no-scrollbar">
             {cart.map(item => {
               // ... List menu item di sini ...
               const isBundle = item.product.type === 'bundle';
               const basePrice = item.product.price;
               const additionPrice = item.totalItemPrice - item.product.price;
               const finalItemPrice = item.totalItemPrice;
               
               return (
                <div key={item.id} className="pb-5 border-b border-dashed border-divider last:border-0 last:pb-0">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col items-start pr-3">
                         {isBundle && <span className="bg-[#86673A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest mb-1.5 block w-max">Paket</span>}
                         <div className="flex items-start gap-2.5">
                           <span className="font-black text-sm md:text-base text-[#86673A] min-w-[1.2rem]">{item.quantity}x</span>
                           <h4 className="font-black text-sm md:text-base text-customGray-light leading-tight">{item.product.name}</h4>
                         </div>
                         <p className="text-[10px] font-bold text-content-secondary mt-1 pl-[1.8rem]">Dasar: {formatRupiah(basePrice)} / item</p>
                      </div>
                   </div>

                   <div className="pl-[1.8rem]">
                     {!isBundle && Object.keys(item.selectedOptions).length > 0 && (
                       <div className="space-y-1 mb-2">
                         {Object.values(item.selectedOptions).map((opt: any) => (
                           <div key={opt.id} className="text-[10px] text-content-secondary flex justify-between items-center bg-[#F8F6F2]/50 px-2 py-1 rounded">
                             <span>- {opt.name}</span>
                             {opt.price > 0 ? <span className="font-medium text-[#86673A] pl-2">+{formatRupiah(opt.price)}</span> : <span></span>}
                           </div>
                         ))}
                       </div>
                     )}

                     {isBundle && item.selectedOptions && (
                        <div className="space-y-2.5 mb-2">
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

                     <div className="bg-[#F8F6F2] rounded-xl p-3 border border-[#E8DFD1] mt-3">
                       {additionPrice > 0 && (
                         <div className="flex justify-between items-center text-[10px] mb-2 pb-2 border-b border-[#E8DFD1]/50">
                           <span className="font-bold text-content-secondary">Total Tambahan (Additions)</span>
                           <span className="font-black text-[#86673A]">+{formatRupiah(additionPrice)}</span>
                         </div>
                       )}
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

           <div className="bg-[#F8F6F2] p-5 md:p-6 border-t border-[#E8DFD1] shrink-0">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[11px] font-bold text-content-secondary"><span>Subtotal</span><span>{formatRupiah(subTotal)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-[11px] font-bold text-semantic-success"><span>Diskon Promo</span><span>- {formatRupiah(discountAmount)}</span></div>}
                
                {/* PERBAIKAN: Tampilkan Tukar Poin di sini */}
                {loyaltyPointsUsed > 0 && <div className="flex justify-between text-[11px] font-bold text-[#86673A]"><span>Tukar Poin</span><span>- {formatRupiah(loyaltyPointsUsed)}</span></div>}
                
                <div className="flex justify-between text-[11px] font-bold text-content-secondary"><span>Pajak PB1 (10%)</span><span>{formatRupiah(tax)}</span></div>
                {serviceCharge > 0 && <div className="flex justify-between text-[11px] font-bold text-content-secondary"><span>Layanan (5%)</span><span>{formatRupiah(serviceCharge)}</span></div>}
              </div>
              <div className="pt-3 border-t border-dashed border-[#86673A]/30 flex justify-between items-end">
                <div>
                  <span className="block font-bold text-[10px] text-content-secondary uppercase tracking-widest mb-1">Metode Bayar</span>
                  <span className="inline-block bg-white border border-[#E8DFD1] px-2 py-1 rounded-md text-[10px] font-black text-[#86673A] uppercase shadow-sm">{paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-[10px] text-content-secondary uppercase tracking-widest mb-1">Total Tagihan</span>
                  <span className="text-2xl font-black tracking-tight leading-none">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
           </div>
        </div>

        {/* KOLOM KANAN: UI Interaksi Pembayaran ... (SAMA SEPERTI SEBELUMNYA) */}
        <div className={`w-full shrink-0 flex flex-col min-h-0 lg:w-[380px] xl:w-[420px]`}>
          <div className="bg-white border-2 border-divider/60 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm flex-1 min-h-0 flex flex-col relative overflow-hidden">

             <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
              {/* m-auto: center saat muat, mulai dari atas & bisa scroll saat layar kecil (anti-terpotong) */}
              <div className="m-auto w-full py-1">

               {/* TAMPILAN: CASH */}
               {paymentMethod === 'Cash' && (
                  <div className="w-full animate-in fade-in duration-300">
                    <h3 className="font-black text-xs text-content-secondary uppercase tracking-widest text-center mb-5">Penerimaan Tunai</h3>
                    <div className="bg-[#F8F6F2] p-5 rounded-[1.5rem] border border-[#E8DFD1] mb-5 shadow-inner">
                      <label className="text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-2 block">Uang Diterima (Rp)</label>
                      <input 
                        type="text" value={receivedAmount === '' ? '' : receivedAmount.toLocaleString('id-ID')} onChange={handleCashInput} placeholder="0"
                        className="w-full bg-white border-2 border-transparent px-4 py-3.5 rounded-xl text-2xl font-black text-customGray-light focus:outline-none focus:border-[#86673A] transition-all text-right shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button onClick={() => handleQuickAmount(grandTotal)} className="p-3 bg-white border border-[#E8DFD1] rounded-xl text-xs font-black text-customGray-light hover:border-[#86673A] hover:text-[#86673A] shadow-sm transition-all">Uang Pas</button>
                      <button onClick={() => handleQuickAmount(50000)} className="p-3 bg-white border border-[#E8DFD1] rounded-xl text-xs font-black text-customGray-light hover:border-[#86673A] hover:text-[#86673A] shadow-sm transition-all">Rp 50.000</button>
                      <button onClick={() => handleQuickAmount(100000)} className="p-3 bg-white border border-[#E8DFD1] rounded-xl text-xs font-black text-customGray-light hover:border-[#86673A] hover:text-[#86673A] shadow-sm transition-all">Rp 100.000</button>
                      <button onClick={resetAmount} className="p-3 bg-semantic-error/10 border border-semantic-error/20 text-semantic-error rounded-xl text-xs font-black hover:bg-semantic-error hover:text-white transition-all">Reset</button>
                    </div>

                    {isCashValid && cashChange > 0 && (
                      <div className="bg-semantic-success/10 border border-semantic-success/20 p-4 rounded-xl flex justify-between items-center animate-in slide-in-from-bottom-2">
                        <span className="font-bold text-semantic-success text-[11px] uppercase tracking-widest">Kembalian</span>
                        <span className="text-xl font-black text-semantic-success">{formatRupiah(cashChange)}</span>
                      </div>
                    )}
                    {typeof receivedAmount === 'number' && receivedAmount > 0 && !isCashValid && (
                      <div className="text-center p-3 text-xs font-bold text-semantic-error bg-semantic-error/10 rounded-xl animate-in shake">
                        Uang tidak cukup! Tagihan: {formatRupiah(grandTotal)}
                      </div>
                    )}
                  </div>
               )}

               {/* TAMPILAN: QRIS / E-WALLET */}
               {isEWallet && (
                  <div className="w-full flex flex-col items-center animate-in fade-in duration-300 py-2">
                     <div className="bg-[#F8F6F2] border border-[#E8DFD1] rounded-2xl md:rounded-[2rem] p-3 sm:p-4 md:p-6 flex flex-col items-center w-full max-w-[min(260px,80vw)] shadow-sm">
                       <div className="w-full flex justify-center mb-2.5 md:mb-4 shrink-0">
                          <img src="/images/QRIS.png" alt="QRIS Logo" className="h-5 md:h-7 object-contain" />
                       </div>
                       {/* QR box: skala mengikuti lebar & tinggi layar (min) agar tidak terpotong */}
                       <div className="bg-white p-2 md:p-3 rounded-xl shadow-sm border border-divider mb-2.5 md:mb-4 w-[min(200px,55vw,34vh)] aspect-square flex items-center justify-center">
                          <QRCodeSVG value={`QRIS-${virtualAccountCode}`} size={256} style={{ height: "100%", width: "100%" }} />
                       </div>
                       <p className="text-[9px] md:text-[10px] font-bold text-content-secondary text-center leading-relaxed">
                         Scan kode QR menggunakan aplikasi <strong className="text-customGray-light">{paymentMethod === 'QRIS' ? 'E-Wallet/M-Banking' : paymentMethod}</strong>.
                       </p>
                     </div>
                  </div>
               )}

               {/* TAMPILAN: TRANSFER BANK / VA */}
               {isTransferVA && (
                  <div className="w-full text-center animate-in fade-in duration-300">
                     <div className="w-16 h-16 bg-[#86673A]/10 text-[#86673A] rounded-full flex items-center justify-center mx-auto mb-4">
                       <span className="text-3xl">🏦</span>
                     </div>
                     <h3 className="font-black text-xl text-customGray-light mb-2">Transfer {paymentMethod}</h3>
                     <p className="text-xs font-bold text-content-secondary mb-8">Mohon transfer ke nomor Virtual Account berikut:</p>
                     <div className="bg-[#F8F6F2] border border-[#E8DFD1] p-5 rounded-2xl">
                        <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-2">Nomor Virtual Account</p>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-divider shadow-sm">
                           <span className="text-xl font-black text-customGray-light tracking-widest">{virtualAccountCode}</span>
                           <button className="p-2 bg-[#86673A]/10 hover:bg-[#86673A]/20 text-[#86673A] rounded-lg transition-colors text-xs font-bold">Salin</button>
                        </div>
                     </div>
                  </div>
               )}

               {/* TAMPILAN: KARTU DEBIT/KREDIT (EDC) */}
               {isEDC && (
                  <div className="w-full text-center animate-in fade-in duration-300 py-10">
                     <div className="w-20 h-20 bg-[#86673A]/10 text-[#86673A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                       <span className="text-4xl">💳</span>
                     </div>
                     <h3 className="font-black text-2xl text-customGray-light mb-3">Mesin EDC</h3>
                     <p className="text-xs font-bold text-content-secondary leading-relaxed px-8">
                        Silakan instruksikan pelanggan untuk menggesek atau memasukkan kartu debit/kredit pada mesin EDC kasir.
                     </p>
                  </div>
               )}
              </div>
             </div>

             <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-divider/60 shrink-0">
               {submitError && (
                 <div className="mb-3 text-center p-3 text-xs font-bold text-semantic-error bg-semantic-error/10 rounded-xl animate-in fade-in">
                   {submitError}
                 </div>
               )}
               <button
                  onClick={handleConfirmPayment}
                  disabled={!canConfirm || isProcessing}
                  className={`w-full py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl
                  ${canConfirm && !isProcessing ? 'bg-[#86673A] text-white shadow-[#86673A]/30 hover:bg-[#684F2A] active:scale-95' : 'bg-divider/50 border-2 border-transparent text-content-secondary cursor-not-allowed'}`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Memproses...
                    </>
                  ) : (
                    paymentMethod === 'Cash' ? 'Selesaikan Pesanan' : 'Verifikasi Pembayaran Sukses'
                  )}
               </button>

               {orderStatus === 'PENDING' && onCancelOrder && (
                 <button
                    onClick={onCancelOrder}
                    disabled={isProcessing}
                    className="w-full mt-3 py-3.5 rounded-xl font-black text-sm border-2 border-semantic-error/30 text-semantic-error hover:bg-semantic-error hover:text-white transition-all active:scale-95 disabled:opacity-50"
                 >
                   Batalkan Pesanan
                 </button>
               )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};