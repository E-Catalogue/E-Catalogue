import type { ExtendedCustomerInfo } from '../../hooks/useCheckout';
import { Utensils, ShoppingBag, ChevronDown, User, Star, Search } from 'lucide-react';

interface CustomerInfoFormProps {
  formData: ExtendedCustomerInfo;
  errors: Partial<Record<keyof ExtendedCustomerInfo, string>>;
  isCheckingMember: boolean;
  onChange: (field: keyof ExtendedCustomerInfo, value: string) => void;
  onChangeOrderType: (type: 'Dine In' | 'Take Away') => void;
  onChangeCustomerType: (type: 'Guest' | 'Member') => void;
  onCheckMember: () => void;
}

export const CustomerInfoForm = ({ 
  formData, errors, isCheckingMember, onChange, onChangeOrderType, onChangeCustomerType, onCheckMember 
}: CustomerInfoFormProps) => {
  
  return (
    <div className="bg-white border border-[#E8DFD1] rounded-[1.5rem] p-5 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 border-b border-divider pb-4">
         <h3 className="font-black text-xs md:text-sm text-customGray-light uppercase tracking-widest">Informasi Pelanggan</h3>
         <span className="bg-[#86673A]/10 text-[#86673A] px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border border-[#86673A]/20">Tahap 1</span>
      </div>
      
      {/* TOGGLE TIPE PESANAN (Dine In / Take Away) */}
      <div className="flex bg-[#F8F6F2] border border-[#E8DFD1] rounded-xl p-1 mb-4">
        <button 
          onClick={() => onChangeOrderType('Dine In')} 
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-[10px] md:text-xs font-black rounded-lg transition-all 
            ${formData.orderType === 'Dine In' ? 'bg-white text-[#86673A] shadow-sm ring-1 ring-[#E8DFD1]' : 'text-content-secondary hover:text-customGray-light'}`}
        >
          <Utensils size={14} strokeWidth={2.5} /> Makan di Tempat
        </button>
        <button 
          onClick={() => onChangeOrderType('Take Away')} 
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-[10px] md:text-xs font-black rounded-lg transition-all 
            ${formData.orderType === 'Take Away' ? 'bg-white text-[#86673A] shadow-sm ring-1 ring-[#E8DFD1]' : 'text-content-secondary hover:text-customGray-light'}`}
        >
          <ShoppingBag size={14} strokeWidth={2.5} /> Bawa Pulang
        </button>
      </div>

      {/* TOGGLE TIPE PELANGGAN (Guest / Member) */}
      <div className="flex bg-white border border-divider rounded-xl p-1 mb-6">
        <button 
          onClick={() => onChangeCustomerType('Guest')} 
          className={`flex-1 flex justify-center items-center gap-2 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider
            ${formData.customerType === 'Guest' ? 'bg-customGray-light text-white shadow-sm' : 'text-content-secondary hover:bg-[#F8F6F2]'}`}
        >
          <User size={14} strokeWidth={2.5} /> Guest
        </button>
        <button 
          onClick={() => onChangeCustomerType('Member')} 
          className={`flex-1 flex justify-center items-center gap-2 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider
            ${formData.customerType === 'Member' ? 'bg-[#86673A] text-white shadow-sm' : 'text-content-secondary hover:bg-[#F8F6F2]'}`}
        >
          <Star size={14} strokeWidth={2.5} /> Member
        </button>
      </div>

      {/* TAMPILAN MEMBER SUKSES */}
      {formData.customerType === 'Member' && formData.isMemberValidated && (
        <div className="mb-5 bg-semantic-success/10 border border-semantic-success/30 p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-semantic-success text-white rounded-full flex items-center justify-center shrink-0">
            <Star size={14} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-semantic-success uppercase tracking-widest leading-none mb-1">Member Terverifikasi</p>
            <p className="text-sm font-black text-customGray-light">{formData.customerName} <span className="text-xs font-bold text-content-secondary ml-1">({formData.loyaltyPointsAvailable.toLocaleString('id-ID')} Poin)</span></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        
        {/* Input Nomor HP (Pindah ke atas jika mode Member) */}
        <div className={formData.customerType === 'Member' ? 'md:col-span-2' : 'md:col-span-2'}>
          <label className="block text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-1.5 pl-1">
            No. Telepon {formData.customerType === 'Guest' && <span className="text-[8px] opacity-70 lowercase font-medium tracking-normal">(Opsional)</span>}
            {formData.customerType === 'Member' && <span className="text-semantic-error ml-1">*</span>}
          </label>
          <div className="flex gap-2">
            <input 
              type="tel" 
              value={formData.customerPhone || ''} 
              onChange={(e) => onChange('customerPhone', e.target.value)} 
              placeholder="Contoh: 081234567890" 
              className={`flex-1 bg-[#F8F6F2] border-2 px-4 py-3 md:py-3.5 rounded-xl text-xs font-bold text-customGray-light focus:outline-none focus:bg-white transition-colors placeholder-content-secondary/50
                ${errors.customerPhone ? 'border-semantic-error/50 focus:border-semantic-error' : 'border-transparent focus:border-[#86673A]'}`}
            />
            {formData.customerType === 'Member' && !formData.isMemberValidated && (
              <button 
                onClick={onCheckMember}
                disabled={!formData.customerPhone || isCheckingMember}
                className="bg-customGray-light text-white px-4 md:px-5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isCheckingMember ? 'Cek...' : <><Search size={14} /> Cek</>}
              </button>
            )}
          </div>
          {errors.customerPhone && <p className="text-[9px] font-bold text-semantic-error mt-1.5 pl-1">{errors.customerPhone}</p>}
        </div>

        {/* Input Nama Pemesan */}
        <div>
          <label className="block text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-1.5 pl-1">Nama Pemesan <span className="text-semantic-error">*</span></label>
          <input 
            type="text" 
            value={formData.customerName} 
            onChange={(e) => onChange('customerName', e.target.value)} 
            placeholder="Contoh: Bpk. Dimas" 
            disabled={formData.customerType === 'Member' && formData.isMemberValidated}
            className={`w-full bg-[#F8F6F2] border-2 px-4 py-3 md:py-3.5 rounded-xl text-xs font-bold text-customGray-light focus:outline-none focus:bg-white transition-colors placeholder-content-secondary/50 disabled:opacity-70 disabled:cursor-not-allowed
              ${errors.customerName ? 'border-semantic-error/50 focus:border-semantic-error' : 'border-transparent focus:border-[#86673A]'}`}
          />
          {errors.customerName && <p className="text-[9px] font-bold text-semantic-error mt-1.5 pl-1">{errors.customerName}</p>}
        </div>

        {/* Input Nomor Meja / Antrean */}
        <div>
          <label className="block text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-1.5 pl-1">
            {formData.orderType === 'Dine In' ? 'Nomor Meja' : 'Nomor Antrean'} <span className="text-semantic-error">*</span>
          </label>
          
          {formData.orderType === 'Dine In' ? (
            <div className="relative">
               <select 
                 value={formData.orderNumber} 
                 onChange={(e) => onChange('orderNumber', e.target.value)} 
                 className={`w-full bg-[#F8F6F2] border-2 px-4 py-3 md:py-3.5 pr-10 rounded-xl text-xs font-bold text-customGray-light focus:outline-none focus:bg-white transition-colors appearance-none cursor-pointer
                   ${errors.orderNumber ? 'border-semantic-error/50 focus:border-semantic-error' : 'border-transparent focus:border-[#86673A]'}`}
               >
                 <option value="" disabled>Pilih Meja</option>
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={`Meja ${num}`}>Meja {num}</option>
                 ))}
               </select>
               <ChevronDown size={18} className="text-[#86673A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <input 
              type="text" value={formData.orderNumber} disabled
              className="w-full bg-divider/30 border-2 border-transparent px-4 py-3 md:py-3.5 rounded-xl text-xs font-black text-content-secondary cursor-not-allowed"
            />
          )}
          {errors.orderNumber && <p className="text-[9px] font-bold text-semantic-error mt-1.5 pl-1">{errors.orderNumber}</p>}
        </div>

      </div>
    </div>
  );
};