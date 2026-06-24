import type { CartItem, Promo } from '../../schema';

interface ThermalReceiptProps {
  cart: CartItem[]; 
  subTotal: number; 
  tax: number; 
  serviceCharge: number; 
  discountAmount: number; 
  loyaltyPointsUsed: number; // PERBAIKAN: Tambahkan prop loyaltyPointsUsed
  grandTotal: number; 
  formatRupiah: (val: number) => string;
  paymentMethod: string; 
  appliedPromo: Promo | null; 
  customerName: string; 
  orderNumber: string; 
  orderType: string; 
  orderId: string; 
  transactionTime: string;
}

export const ThermalReceipt = ({
  cart, subTotal, tax, serviceCharge, discountAmount, loyaltyPointsUsed, grandTotal, formatRupiah,
  customerName, orderNumber, orderType, orderId, transactionTime
}: ThermalReceiptProps) => {

  return (
    <div className="hidden print:block text-black bg-white w-[80mm] mx-auto p-4 font-mono text-[12px] leading-tight">
      
      {/* KOP STRUK */}
      <div className="text-center mb-4">
        <h1 className="font-bold text-xl mb-1 uppercase tracking-widest">Adonara Coffee</h1>
        <p className="text-[10px]">Cabang Senayan</p>
        <p className="text-[10px]">Jl. Sudirman No. 1, Jakarta</p>
      </div>

      <div className="border-b-[1.5px] border-dashed border-black mb-3"></div>

      {/* INFO PEMESAN & WAKTU */}
      <div className="mb-3 text-[10px] space-y-0.5">
        <div className="flex justify-between"><span>Waktu:</span><span>{transactionTime}</span></div>
        <div className="flex justify-between"><span>No Order:</span><span>{orderId}</span></div>
        <div className="flex justify-between"><span>Tipe:</span><span>{orderType}</span></div>
        <div className="flex justify-between"><span>Pelanggan:</span><span>{customerName || 'Walk-in'}</span></div>
      </div>

      <div className="border-b-[1.5px] border-dashed border-black mb-3"></div>

      {/* RINCIAN PESANAN */}
      <div className="mb-4">
        <div className="flex justify-between font-bold text-[10px] mb-2 uppercase border-b border-black pb-1">
          <span>Item</span>
          <span>Harga</span>
        </div>

        {cart.map((item, index) => {
           const basePrice = item.product.price;
           const additionPrice = item.totalItemPrice - item.product.price;
           const finalItemPrice = item.totalItemPrice;

           return (
             <div key={index} className="mb-4">
                {/* Nama Produk */}
                <div className="font-bold text-[11px] mb-1">
                  <span className="break-words">{item.quantity}x {item.product.name}</span>
                </div>
                
                {/* Rincian Harga Dasar */}
                <div className="flex justify-between text-[9px] text-gray-800 mb-0.5 pl-3">
                  <span>Dasar</span>
                  <span>{formatRupiah(basePrice)}</span>
                </div>
                
                {/* Rincian Opsi / Addition */}
                <div className="text-[9px] text-gray-800 space-y-0.5">
                   {Object.values(item.selectedOptions).map((opt: any) => {
                      if (opt && typeof opt === 'object' && !opt.id) {
                        return Object.values(opt).map((subOpt: any) => (
                          <div key={subOpt.id} className="flex justify-between pl-3">
                            <span>- {subOpt.name}</span>
                            {subOpt.price > 0 ? <span>+{formatRupiah(subOpt.price)}</span> : <span />}
                          </div>
                        ));
                      }
                      return (
                        <div key={opt.id} className="flex justify-between pl-3">
                          <span>- {opt.name}</span>
                          {opt.price > 0 ? <span>+{formatRupiah(opt.price)}</span> : <span />}
                        </div>
                      );
                   })}
                </div>

                {/* Total Addition (Summary) */}
                {additionPrice > 0 && (
                   <div className="flex justify-between text-[9px] pl-3 mt-1 italic">
                     <span>Total Tambahan</span>
                     <span>+{formatRupiah(additionPrice)}</span>
                   </div>
                )}

                {/* Total Harga Per Item (Dikalikan Qty Jika > 1) */}
                <div className="flex justify-between text-[10px] font-bold mt-1.5 pt-1.5 border-t border-dashed border-gray-300">
                  <span className="pl-3">
                    {item.quantity > 1 ? `Total (@ ${formatRupiah(finalItemPrice)} x ${item.quantity})` : 'Total Harga Item'}
                  </span>
                  <span>{formatRupiah(finalItemPrice * item.quantity)}</span>
                </div>
             </div>
           )
        })}
      </div>

      <div className="border-b-[1.5px] border-dashed border-black mb-3"></div>

      {/* PERHITUNGAN TOTAL */}
      <div className="space-y-1 mb-4 text-[11px]">
         <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subTotal)}</span></div>
         
         {/* PERBAIKAN: Potongan Harga */}
         {discountAmount > 0 && <div className="flex justify-between"><span>Diskon Promo</span><span>-{formatRupiah(discountAmount)}</span></div>}
         {loyaltyPointsUsed > 0 && <div className="flex justify-between"><span>Tukar Poin</span><span>-{formatRupiah(loyaltyPointsUsed)}</span></div>}
         
         <div className="flex justify-between"><span>Pajak PB1 (10%)</span><span>{formatRupiah(tax)}</span></div>
         {serviceCharge > 0 && <div className="flex justify-between"><span>Layanan (5%)</span><span>{formatRupiah(serviceCharge)}</span></div>}
         
         <div className="border-b-[1.5px] border-black my-2"></div>
         
         <div className="flex justify-between font-bold text-[14px] uppercase mb-1">
           <span>Total Bayar</span><span>{formatRupiah(grandTotal)}</span>
         </div>
      </div>

      {/* NOMOR ANTRIAN BESAR */}
      <div className="text-center mt-6 border-t-[1.5px] border-dashed border-black pt-4">
        <p className="text-[10px] uppercase font-bold mb-1">{orderType === 'Dine In' ? 'Meja' : 'Nomor Antrean'}</p>
        <p className="font-bold text-4xl">{orderNumber}</p>
      </div>

      <div className="text-center mt-6">
        <p className="text-[9px]">Terima kasih atas kunjungan Anda!</p>
        <p className="text-[9px]">Kritik & Saran: adonaracoffee.com/feedback</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { 
            -webkit-print-color-adjust: exact; 
            margin: 0; 
            background-color: white !important; 
            font-family: monospace; 
          }
          #root > div > :not(.print\\:block) { display: none !important; }
          #root { background-color: white !important; }
        }
      `}} />
    </div>
  );
};