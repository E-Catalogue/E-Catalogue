import { Modal } from '@/shared/components/Modal';
import type { PaymentMethodCategory } from '../../schema';

interface PaymentMethodModalProps {
  isOpen: boolean; onClose: () => void; selectedMethod: string; onSelectMethod: (method: string) => void;
}

const PAYMENT_CATEGORIES: PaymentMethodCategory[] = [
  {
    id: 'cat_cash', name: 'Pembayaran Tunai',
    methods: [ { id: 'Cash', name: 'Uang Tunai / Cash', icon: '💵' } ]
  },
  {
    id: 'cat_ewallet', name: 'E-Wallet & QRIS',
    methods: [ 
      { id: 'QRIS', name: 'Scan QRIS', icon: '📱' },
      { id: 'GoPay', name: 'GoPay', icon: '🟢' },
      { id: 'ShopeePay', name: 'ShopeePay', icon: '🟠' }
    ]
  },
  {
    id: 'cat_bank', name: 'Kartu & Bank Transfer',
    methods: [ 
      { id: 'Debit', name: 'Mesin EDC (Debit/Kredit)', icon: '💳' },
      { id: 'BCA', name: 'Transfer VA BCA', icon: '🏦' },
      { id: 'Mandiri', name: 'Transfer VA Mandiri', icon: '🏦' }
    ]
  }
];

export const PaymentMethodModal = ({ isOpen, onClose, selectedMethod, onSelectMethod }: PaymentMethodModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Metode Pembayaran" size="md">
      <div className="space-y-6 pt-2 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
        {PAYMENT_CATEGORIES.map(category => (
          <div key={category.id}>
            <h4 className="font-black text-[10px] md:text-xs text-content-secondary uppercase tracking-widest mb-3 border-b border-divider pb-2">{category.name}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.methods.map(method => {
                const isSelected = selectedMethod === method.id;
                return (
                  <button key={method.id} onClick={() => { onSelectMethod(method.id); onClose(); }}
                    className={`w-full p-3 md:p-4 border-2 rounded-xl flex items-center justify-between font-bold text-xs transition-all text-left
                    ${isSelected ? 'border-[#86673A] bg-[#86673A]/10 text-[#86673A] shadow-sm' : 'border-divider text-content-secondary hover:border-[#86673A]/40 hover:bg-[#F8F6F2]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl md:text-2xl bg-white w-8 h-8 md:w-10 md:h-10 rounded-full shadow-sm flex items-center justify-center shrink-0">{method.icon}</span>
                      <span className="leading-tight">{method.name}</span>
                    </div>
                    {isSelected && <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};