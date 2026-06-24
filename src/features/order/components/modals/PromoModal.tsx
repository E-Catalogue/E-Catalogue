import { Modal } from '@/shared/components/Modal';
import { PROMOS } from '../../../order/constants';
import type { Promo } from '../../../order/schema';

interface PromoModalProps {
  isOpen: boolean; onClose: () => void; onSelectPromo: (promo: Promo | null) => void; appliedPromo: Promo | null;
}

export const PromoModal = ({ isOpen, onClose, onSelectPromo, appliedPromo }: PromoModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Promo / Diskon" size="sm">
      <div className="space-y-3 pt-2">
        {appliedPromo && (
           <button onClick={() => { onSelectPromo(null); onClose(); }} className="w-full p-3 border-2 border-semantic-error/50 text-semantic-error rounded-xl font-bold text-xs hover:bg-semantic-error/10">Hapus Promo Saat Ini</button>
        )}
        {PROMOS.map(promo => (
          <div key={promo.id} onClick={() => { onSelectPromo(promo); onClose(); }} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${appliedPromo?.id === promo.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-divider hover:border-customGray-light/30'}`}>
            <div className="flex justify-between items-center mb-1"><h4 className="font-bold text-customGray-light text-sm">{promo.name}</h4><span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-black rounded-lg uppercase">{promo.code}</span></div>
            <p className="text-[10px] text-content-secondary mt-1">Diskon: {promo.type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};