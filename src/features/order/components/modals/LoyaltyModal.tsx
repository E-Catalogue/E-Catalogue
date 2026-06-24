import { useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Award, Sparkles } from 'lucide-react';
import { POINT_CONVERSION_RATE } from '../../hooks/useCheckout';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePoints: number;
  usedPoints: number;
  baseGrandTotal: number; // Tagihan dasar sebelum dipotong poin
  loyaltyState: { input: string; error: string; };
  loyaltyHandlers: {
    onInit: () => void;
    onChangeInput: (val: string) => void;
    onSetPreset: (percentage: number, baseTotal: number) => void;
    onApply: (baseTotal: number, onSuccess: () => void) => void;
    onCancel: (onSuccess: () => void) => void;
  }
}

const PRESETS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: 'Semua', value: 1 },
];

export const LoyaltyModal = ({ 
  isOpen, onClose, availablePoints, usedPoints, baseGrandTotal, 
  loyaltyState, loyaltyHandlers 
}: LoyaltyModalProps) => {

  // Sinkronisasi setiap modal dibuka
  useEffect(() => {
    if (isOpen) loyaltyHandlers.onInit();
  }, [isOpen]);

  // Hitung nilai konversi rupiah secara real-time
  const parsedInput = parseInt(loyaltyState.input || '0', 10);
  const conversionValue = isNaN(parsedInput) ? 0 : parsedInput * POINT_CONVERSION_RATE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tukar Poin Member" size="sm" icon={<Award className="text-[#86673A]" />}>
      <div className="pt-2">
        
        {/* Info Poin Wallet */}
        <div className="bg-[#86673A]/10 border border-[#86673A]/20 p-4 rounded-xl flex items-center justify-between mb-5 relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-[10px] font-bold text-[#86673A] uppercase tracking-widest mb-1 flex items-center gap-1.5">
               <Sparkles size={12} /> Poin Tersedia
             </p>
             <p className="text-2xl font-black text-[#86673A]">{availablePoints.toLocaleString('id-ID')} <span className="text-xs font-bold uppercase tracking-widest">Pts</span></p>
           </div>
           <Award size={48} strokeWidth={2} className="text-[#86673A] opacity-10 absolute -right-2 -bottom-2" />
        </div>

        {/* Input & Quick Select */}
        <div className="mb-5">
           <div className="flex justify-between items-end mb-2">
             <label className="block text-[10px] font-bold text-content-secondary uppercase tracking-widest pl-1">Jumlah Poin Ditukar</label>
           </div>

           {/* Input Field */}
           <div className="relative mb-3">
             <input 
               type="number"
               value={loyaltyState.input}
               onChange={(e) => loyaltyHandlers.onChangeInput(e.target.value)}
               placeholder="Ketik jumlah poin..."
               className={`w-full bg-[#F8F6F2] border-2 px-4 py-3.5 rounded-xl text-sm font-bold text-customGray-light focus:outline-none focus:bg-white transition-colors
                 ${loyaltyState.error ? 'border-semantic-error/50 focus:border-semantic-error' : 'border-transparent focus:border-[#86673A]'}`}
             />
           </div>
           {loyaltyState.error && <p className="text-[10px] font-bold text-semantic-error mt-1 mb-3 pl-1">{loyaltyState.error}</p>}

           {/* Tombol Preset Cepat */}
           <div className="grid grid-cols-4 gap-2 mb-4">
             {PRESETS.map((preset, idx) => (
               <button 
                 key={idx}
                 onClick={() => loyaltyHandlers.onSetPreset(preset.value, baseGrandTotal)}
                 className="py-2 bg-white border border-[#E8DFD1] text-[10px] font-black text-content-secondary rounded-lg hover:border-[#86673A] hover:text-[#86673A] transition-all active:scale-95 shadow-sm"
               >
                 {preset.label}
               </button>
             ))}
           </div>

           {/* Box Konversi Dinamis */}
           <div className="bg-semantic-success/10 border border-semantic-success/20 p-3 rounded-xl flex items-center justify-between transition-all">
              <div>
                <p className="text-[9px] font-black uppercase text-semantic-success tracking-widest mb-0.5">Nilai Potongan</p>
                <p className="text-[9px] font-medium text-semantic-success/80">Rate: 1 Pts = Rp {POINT_CONVERSION_RATE}</p>
              </div>
              <span className="text-sm md:text-base font-black text-semantic-success">
                - Rp {conversionValue.toLocaleString('id-ID')}
              </span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-dashed border-divider">
           {usedPoints > 0 && (
             <button onClick={() => loyaltyHandlers.onCancel(onClose)} className="px-4 py-3 border-2 border-semantic-error/20 text-semantic-error rounded-xl font-bold text-xs hover:bg-semantic-error/10 transition-colors">
               Batal Tukar
             </button>
           )}
           <button onClick={() => loyaltyHandlers.onApply(baseGrandTotal, onClose)} className="flex-1 bg-[#86673A] text-white py-3.5 rounded-xl font-black text-sm hover:bg-[#684F2A] shadow-lg shadow-[#86673A]/20 transition-all active:scale-95 flex items-center justify-center gap-2">
             Terapkan Poin
           </button>
        </div>
      </div>
    </Modal>
  );
};