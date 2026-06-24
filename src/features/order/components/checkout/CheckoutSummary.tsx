import type { Promo } from '../../schema';
import { TicketPercent, CreditCard, Award } from 'lucide-react';

interface CheckoutSummaryProps {
  subTotal: number; 
  tax: number; 
  serviceCharge: number; 
  discountAmount: number; 
  loyaltyPointsUsed: number; 
  grandTotal: number; 
  formatRupiah: (val: number) => string;
  paymentMethod: string; 
  appliedPromo: Promo | null;
  isMemberValidated: boolean; 
  onOpenPromoModal: () => void;
  onOpenPaymentModal: () => void;
  onOpenLoyaltyModal: () => void;
  onProcessPayment: () => void;
}

export const CheckoutSummary = ({
  subTotal, tax, serviceCharge, discountAmount, loyaltyPointsUsed, grandTotal, formatRupiah,
  paymentMethod, appliedPromo, isMemberValidated,
  onOpenPromoModal, onOpenPaymentModal, onOpenLoyaltyModal, onProcessPayment
}: CheckoutSummaryProps) => {

  return (
    <div className="flex flex-col gap-4">
      
      {/* KOTAK 1: Aksi (Promo, Member, & Pembayaran) */}
      <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] p-4 shadow-sm flex flex-col gap-2">
        
        {/* Pilih Promo */}
        <div className="flex justify-between items-center bg-[#F8F6F2] p-3 rounded-xl cursor-pointer hover:border-[#86673A] border border-transparent transition-all group" onClick={onOpenPromoModal}>
           <div className="flex items-center gap-3.5">
              {/* PERBAIKAN: Memisahkan base class dan condition class dengan bersih */}
              <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-colors ${
                appliedPromo 
                  ? 'bg-semantic-success text-white border-semantic-success' 
                  : 'bg-white text-[#86673A] border-[#E8DFD1] group-hover:bg-[#86673A] group-hover:text-white'
              }`}>
                <TicketPercent size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-content-secondary uppercase tracking-widest mb-0.5">Kode Promo</p>
                <p className={`text-xs font-black ${appliedPromo ? 'text-semantic-success' : 'text-customGray-light'}`}>
                  {appliedPromo ? appliedPromo.code : 'Pilih Diskon Tersedia'}
                </p>
              </div>
           </div>
        </div>

        {/* Tukar Poin (HANYA MUNCUL JIKA MEMBER VALID) */}
        {isMemberValidated && (
          <div className="flex justify-between items-center bg-[#F8F6F2] p-3 rounded-xl cursor-pointer hover:border-[#86673A] border border-transparent transition-all group" onClick={onOpenLoyaltyModal}>
             <div className="flex items-center gap-3.5">
                {/* PERBAIKAN: Memisahkan base class dan condition class dengan bersih */}
                <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-colors ${
                  loyaltyPointsUsed > 0 
                    ? 'bg-[#86673A] text-white border-[#86673A]' 
                    : 'bg-white text-[#86673A] border-[#E8DFD1] group-hover:bg-[#86673A] group-hover:text-white'
                }`}>
                  <Award size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-content-secondary uppercase tracking-widest mb-0.5">Tukar Poin</p>
                  <p className={`text-xs font-black ${loyaltyPointsUsed > 0 ? 'text-[#86673A]' : 'text-customGray-light'}`}>
                    {loyaltyPointsUsed > 0 ? `- Rp ${loyaltyPointsUsed.toLocaleString('id-ID')}` : 'Gunakan Poin Member'}
                  </p>
                </div>
             </div>
          </div>
        )}

        {/* Pilih Metode Pembayaran */}
        <div className="flex justify-between items-center bg-[#F8F6F2] p-3 rounded-xl cursor-pointer hover:border-[#86673A] border border-transparent transition-all group" onClick={onOpenPaymentModal}>
           <div className="flex items-center gap-3.5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#86673A] shadow-sm border border-[#E8DFD1] group-hover:bg-[#86673A] group-hover:text-white transition-colors">
                <CreditCard size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-content-secondary uppercase tracking-widest mb-0.5">Metode Bayar</p>
                <p className="text-xs font-black text-customGray-light">{paymentMethod}</p>
              </div>
           </div>
        </div>
      </div>

      {/* KOTAK 2: Rincian Biaya */}
      <div className="bg-[#F8F6F2] border border-[#E8DFD1] rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden">
        {/* Dekorasi Air */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-bl-full pointer-events-none opacity-40"></div>
        
        <h3 className="font-black text-[11px] md:text-xs text-customGray-light uppercase tracking-widest mb-4 relative z-10">Ringkasan Biaya</h3>
        
        <div className="space-y-2.5 mb-5 relative z-10">
          <div className="flex justify-between items-center text-xs font-bold text-content-secondary">
            <span>Subtotal</span><span className="text-customGray-light">{formatRupiah(subTotal)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-xs font-bold text-semantic-success">
              <span>Diskon Promo</span><span>- {formatRupiah(discountAmount)}</span>
            </div>
          )}

          {loyaltyPointsUsed > 0 && (
            <div className="flex justify-between items-center text-xs font-bold text-[#86673A]">
              <span>Tukar Poin</span><span>- {formatRupiah(loyaltyPointsUsed)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-bold text-content-secondary">
            <span>Pajak PB1 (10%)</span><span className="text-customGray-light">{formatRupiah(tax)}</span>
          </div>
          
          {serviceCharge > 0 && (
            <div className="flex justify-between items-center text-xs font-bold text-content-secondary">
              <span>Layanan (5%)</span><span className="text-customGray-light">{formatRupiah(serviceCharge)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-dashed border-[#86673A]/30 mb-5 relative z-10">
          <div className="flex justify-between items-center">
            <span className="font-black text-[11px] text-content-secondary uppercase tracking-widest">Total Tagihan</span>
            <span className="text-xl md:text-2xl font-black text-[#86673A] tracking-tighter leading-none">{formatRupiah(grandTotal)}</span>
          </div>
        </div>

        <button onClick={onProcessPayment} className="w-full py-4 bg-[#86673A] text-white rounded-xl font-black text-sm hover:bg-[#684F2A] shadow-lg shadow-[#86673A]/20 transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10">
          Proses Transaksi
        </button>
      </div>

    </div>
  );
};