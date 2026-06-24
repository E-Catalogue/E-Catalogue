import { useState } from 'react';
import type { CartItem, Promo } from "../../schema";
import { CheckoutItemsList } from "./CheckoutItemsList";
import { CheckoutSummary } from "./CheckoutSummary";
import { CustomerInfoForm } from "./CustomerInfoForm";
import { LoyaltyModal } from "../modals/LoyaltyModal"; 
import { useCheckout } from "../../hooks/useCheckout";
import { ChevronLeft } from "lucide-react";

interface CheckoutLayoutProps {
  cart: CartItem[]; 
  subTotal: number; 
  tax: number; 
  serviceCharge: number; 
  discountAmount: number; 
  grandTotal: number; 
  formatRupiah: (val: number) => string;
  paymentMethod: string; 
  appliedPromo: Promo | null;
  onBackToMenu: () => void;
  onOpenPromoModal: () => void;
  onOpenPaymentModal: () => void;
  onProcessPayment: () => void;
  // PERBAIKAN: Tambahkan parameter `pointsUsed` & `customerProfileId`
  setCustomerInfoData: (name: string, phone: string, type: 'Dine In' | 'Take Away', number: string, pointsUsed: number, customerProfileId: string | null) => void;
}

export const CheckoutLayout = ({ 
  cart, subTotal, tax, serviceCharge, discountAmount, grandTotal, formatRupiah, paymentMethod, appliedPromo, 
  onBackToMenu, onOpenPromoModal, onOpenPaymentModal, onProcessPayment, setCustomerInfoData
}: CheckoutLayoutProps) => {

  const { 
    formData, 
    errors, 
    isCheckingMember,
    loyaltyState,      
    loyaltyHandlers,   
    handleChange, 
    handleChangeOrderType, 
    handleChangeCustomerType,
    handleCheckMember,
    handleProcessPayment 
  } = useCheckout(() => {
    // PERBAIKAN: Kirim loyaltyPointsUsed ke PointOfSalePage
    setCustomerInfoData(
      formData.customerName,
      formData.customerPhone || '-',
      formData.orderType,
      formData.orderNumber,
      formData.loyaltyPointsUsed,
      formData.customerProfileId
    );
    onProcessPayment();
  });

  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const finalGrandTotal = grandTotal - formData.loyaltyPointsUsed;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden bg-background">
      <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
         <div className="flex items-center gap-3">
           <button onClick={onBackToMenu} className="group flex items-center gap-1.5 p-1.5 pr-3 bg-white border border-divider/60 rounded-full text-content-secondary hover:text-customGray-light transition-all hover:bg-surface shadow-sm">
             <div className="bg-[#F8F6F2] p-1 rounded-full group-hover:bg-[#86673A]/10 group-hover:text-[#86673A] transition-colors">
               <ChevronLeft size={16} strokeWidth={2.5} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Kembali</span>
           </button>
           <h2 className="text-xl md:text-2xl font-black text-customGray-light tracking-tight ml-2">Checkout</h2>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full overflow-y-auto lg:overflow-hidden no-scrollbar pb-6 lg:pb-0">
        <div className="flex-1 flex flex-col gap-4 md:gap-6 lg:overflow-y-auto no-scrollbar lg:pr-2 pb-4">
          <CustomerInfoForm 
             formData={formData}
             errors={errors}
             isCheckingMember={isCheckingMember}
             onChange={handleChange}
             onChangeOrderType={handleChangeOrderType}
             onChangeCustomerType={handleChangeCustomerType}
             onCheckMember={handleCheckMember}
          />
          <CheckoutItemsList cart={cart} formatRupiah={formatRupiah} />
        </div>
        
        <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0">
          <div className="lg:sticky lg:top-0">
            <CheckoutSummary 
              subTotal={subTotal} 
              tax={tax} 
              serviceCharge={serviceCharge} 
              discountAmount={discountAmount} 
              loyaltyPointsUsed={formData.loyaltyPointsUsed} 
              grandTotal={finalGrandTotal} 
              formatRupiah={formatRupiah}
              paymentMethod={paymentMethod} 
              appliedPromo={appliedPromo}
              isMemberValidated={formData.isMemberValidated} 
              onOpenPromoModal={onOpenPromoModal} 
              onOpenPaymentModal={onOpenPaymentModal} 
              onOpenLoyaltyModal={() => setIsLoyaltyModalOpen(true)}
              onProcessPayment={handleProcessPayment}
            />
          </div>
        </div>
      </div>

      <LoyaltyModal 
        isOpen={isLoyaltyModalOpen}
        onClose={() => setIsLoyaltyModalOpen(false)}
        availablePoints={formData.loyaltyPointsAvailable}
        usedPoints={formData.loyaltyPointsUsed}
        baseGrandTotal={grandTotal}
        loyaltyState={loyaltyState}
        loyaltyHandlers={loyaltyHandlers}
      />
    </div>
  );
};