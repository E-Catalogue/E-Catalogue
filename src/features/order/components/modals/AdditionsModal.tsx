import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { useProductDetail } from '../../hooks/useProducts';
import { mapApiProductToProduct } from '../../api/product.schema';
import { handleProductImageError } from '@/shared/utils/handleProductImageError';
import type { Product, ProductOptionChoice, CartItem, ProductOption } from '../../schema';

interface AdditionsModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  product: Product | null; 
  editingItem?: CartItem | null;
  onConfirmAdd: (product: Product, options: any, notes: string, qty: number) => void;
  onConfirmEdit: (cartItemId: string, options: any, notes: string, qty: number) => void;
  formatRupiah: (val: number) => string;
}

export const AdditionsModal = ({ isOpen, onClose, product, editingItem, onConfirmAdd, onConfirmEdit, formatRupiah }: AdditionsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);

  // Ambil detail produk dari API saat modal dibuka (additions/opsi bersumber dari sini)
  const detailId = isOpen ? (editingItem?.product.id ?? product?.id ?? null) : null;
  const { data: detailData, isLoading: isDetailLoading } = useProductDetail(detailId);

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setSelectedOptions(editingItem.selectedOptions);
      setNotes(editingItem.notes);
      setQty(editingItem.quantity);
      return;
    }

    // Sumber opsi diutamakan dari detail produk (API), fallback ke produk dari list
    const source = detailData ? mapApiProductToProduct(detailData) : product;
    if (!source) return;

    const initialSelections: any = {};
    if (source.type === 'single' && source.options) {
      source.options.forEach(opt => {
        if (opt.isRequired && opt.choices.length > 0) initialSelections[opt.id] = opt.choices[0];
      });
    } else if (source.type === 'bundle' && source.bundleItems) {
      source.bundleItems.forEach(bItem => {
        initialSelections[bItem.id] = {};
        bItem.options.forEach(opt => {
          if (opt.isRequired && opt.choices.length > 0) initialSelections[bItem.id][opt.id] = opt.choices[0];
        });
      });
    }

    setSelectedOptions(initialSelections);
    setNotes('');
    setQty(1);
  }, [isOpen, product, editingItem, detailData]);

  // Saat edit, pertahankan produk dari cart; selain itu pakai detail dari API (fallback list)
  const detailProduct = detailData ? mapApiProductToProduct(detailData) : null;
  const targetProduct = editingItem ? editingItem.product : (detailProduct ?? product);
  if (!targetProduct) return null;

  const handleSave = () => {
    let missing = false;

    if (targetProduct.type === 'single' && targetProduct.options) {
      missing = targetProduct.options.some(opt => opt.isRequired && !selectedOptions[opt.id]);
    } else if (targetProduct.type === 'bundle' && targetProduct.bundleItems) {
      missing = targetProduct.bundleItems.some(bItem => {
        const itemSelections = selectedOptions[bItem.id] || {};
        return bItem.options.some(opt => opt.isRequired && !itemSelections[opt.id]);
      });
    }

    if (missing) return alert("Mohon lengkapi semua pilihan yang diwajibkan.");
    
    if (editingItem) onConfirmEdit(editingItem.id, selectedOptions, notes, qty);
    else onConfirmAdd(targetProduct, selectedOptions, notes, qty);
    
    onClose();
  };

  const handleSingleOptionSelect = (optionGroupId: string, choice: ProductOptionChoice) => {
    setSelectedOptions((prev: any) => ({ ...prev, [optionGroupId]: choice }));
  };

  const handleBundleOptionSelect = (bundleItemId: string, optionGroupId: string, choice: ProductOptionChoice) => {
    setSelectedOptions((prev: any) => ({
      ...prev,
      [bundleItemId]: { ...(prev[bundleItemId] || {}), [optionGroupId]: choice }
    }));
  };

  // --- FUNGSI HELPER UNTUK RENDER OPSI AGAR DESAIN 100% KONSISTEN ---
  const renderOptionGroup = (
    optionGroup: ProductOption, 
    selectedChoiceId: string | undefined, 
    onSelect: (choice: ProductOptionChoice) => void
  ) => (
    <div key={optionGroup.id} className="mb-5 last:mb-0">
      <div className="flex justify-between items-end mb-3">
        <h4 className="font-black text-[11px] md:text-xs text-customGray-light uppercase tracking-widest">
          {optionGroup.category}
        </h4>
        {!optionGroup.isRequired && (
          <span className="text-[9px] px-2 py-0.5 bg-[#F8F6F2] text-content-secondary rounded-md font-bold uppercase tracking-wider">
            Opsional
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {optionGroup.choices.map(choice => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <button 
              key={choice.id} 
              onClick={() => onSelect(choice)}
              className={`p-3 md:p-3.5 rounded-2xl font-bold text-[10px] md:text-xs transition-all flex flex-col items-start justify-center text-left border-2 min-h-[4rem] md:min-h-[4.5rem]
              ${isSelected 
                ? 'border-[#86673A] bg-[#86673A]/5 text-[#86673A] shadow-sm' 
                : 'border-divider bg-white text-content-secondary hover:border-[#86673A]/40 hover:bg-[#F8F6F2]'}`}
            >
              <span className="leading-tight">{choice.name}</span>
              {choice.price > 0 && (
                <span className={`text-[9px] mt-1 ${isSelected ? 'text-[#86673A]' : 'text-content-secondary/70'}`}>
                  +{formatRupiah(choice.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingItem ? `Edit: ${targetProduct.name}` : `Detail Product`}
      size="xl"
      actions={[
        { label: 'Batal', onClick: onClose, variant: 'ghost' },
        { label: editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Pesanan', onClick: handleSave, variant: 'primary' }
      ]}
    >
      <div className="space-y-6 md:space-y-8 max-h-[65vh] overflow-y-auto no-scrollbar pr-2 pb-4">
        
        {/* HEADER PRODUK (Tampil Cantik di Atas Modal) */}
        <div className="flex items-center gap-4 bg-[#F8F6F2] p-4 rounded-2xl border border-divider/50">
           <img
             src={targetProduct.image}
             alt={targetProduct.name}
             onError={handleProductImageError}
             className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-sm"
           />
           <div>
              {targetProduct.type === 'bundle' && (
                <span className="text-[8px] md:text-[9px] bg-[#86673A] text-white px-2 py-0.5 rounded uppercase font-black tracking-widest mb-1 inline-block">Paket Bundle</span>
              )}
              <h2 className="text-sm md:text-base font-black text-customGray-light leading-tight">{targetProduct.name}</h2>
              <p className="text-[#86673A] font-black text-sm md:text-base mt-0.5">{formatRupiah(targetProduct.price)}</p>
           </div>
        </div>

        {/* DETAIL PRODUK (dari API: deskripsi & story) */}
        {isDetailLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-[#F8F6F2] rounded w-full" />
            <div className="h-3 bg-[#F8F6F2] rounded w-2/3" />
          </div>
        ) : (targetProduct.description || targetProduct.story) ? (
          <div className="space-y-2.5">
            {targetProduct.description && (
              <p className="text-xs md:text-sm text-content-secondary leading-relaxed">{targetProduct.description}</p>
            )}
            {targetProduct.story && (
              <p className="text-[11px] md:text-xs italic text-content-secondary/80 leading-relaxed border-l-2 border-[#86673A]/30 pl-3">
                {targetProduct.story}
              </p>
            )}
          </div>
        ) : null}

        {/* INFORMASI PRODUK (details: texture, allergen, dll) */}
        {!isDetailLoading && targetProduct.details && targetProduct.details.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#F8F6F2] p-4 md:p-5 rounded-2xl border border-divider/50">
            {targetProduct.details.map((info) => (
              <div key={info.key} className="flex flex-col gap-0.5">
                <span className="text-[9px] md:text-[10px] font-black text-content-secondary/70 uppercase tracking-widest">{info.key}</span>
                <span className="text-[11px] md:text-xs font-bold text-customGray-light leading-snug">{info.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="w-full h-px bg-divider border-none my-6"></div>

        {/* JUDUL SECTION ADDITION */}
        {targetProduct.type === 'single' && targetProduct.options && targetProduct.options.length > 0 && (
          <h3 className="text-xs md:text-sm font-black text-customGray-light uppercase tracking-widest -mb-2">Pilihan Tambahan</h3>
        )}

        {/* 1. RENDER JIKA SINGLE PRODUCT */}
        {targetProduct.type === 'single' && targetProduct.options?.map(optionGroup => 
          renderOptionGroup(
            optionGroup, 
            selectedOptions[optionGroup.id]?.id, 
            (choice) => handleSingleOptionSelect(optionGroup.id, choice)
          )
        )}

        {/* 2. RENDER JIKA BUNDLE PRODUCT */}
        {targetProduct.type === 'bundle' && targetProduct.bundleItems?.map((bItem, index) => (
          <div key={bItem.id} className="bg-white border-2 border-divider/60 rounded-[1.5rem] p-4 md:p-6 shadow-sm relative overflow-hidden">
            {/* Aksen Label Produk di dalam Bundle */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-divider/60">
              <div className="w-8 h-8 rounded-full bg-[#86673A]/10 text-[#86673A] flex items-center justify-center font-black text-xs shrink-0">
                {index + 1}
              </div>
              <h3 className="font-black text-xs md:text-sm text-customGray-light">
                {bItem.productName}
              </h3>
            </div>
            
            <div className="space-y-6">
              {bItem.options.map(optionGroup => 
                renderOptionGroup(
                  optionGroup, 
                  selectedOptions[bItem.id]?.[optionGroup.id]?.id, 
                  (choice) => handleBundleOptionSelect(bItem.id, optionGroup.id, choice)
                )
              )}
            </div>
          </div>
        ))}

        <div className="w-full h-px bg-divider border-none my-6"></div>

        {/* INPUT CATATAN & JUMLAH (Seragam dengan Input Login) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="space-y-2.5">
            <h4 className="font-black text-[11px] md:text-xs text-customGray-light uppercase tracking-widest">Catatan Tambahan</h4>
            <input 
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Contoh: extra cup, dipisah..." 
              className="w-full bg-[#F8F6F2] border-2 border-transparent px-4 py-3.5 rounded-2xl text-xs font-bold text-customGray-light focus:outline-none focus:border-[#86673A] focus:bg-white transition-all" 
            />
          </div>

          <div className="space-y-2.5">
             <h4 className="font-black text-[11px] md:text-xs text-customGray-light uppercase tracking-widest">Jumlah Beli</h4>
             <div className="flex items-center justify-between bg-[#F8F6F2] border-2 border-transparent rounded-2xl p-2 h-[52px]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-full rounded-xl bg-white text-customGray-light hover:text-[#86673A] shadow-sm transition-all font-black text-lg flex items-center justify-center">-</button>
                <span className="font-black text-sm md:text-base text-customGray-light">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-full rounded-xl bg-[#86673A] text-white shadow-sm transition-all font-black text-lg flex items-center justify-center">+</button>
             </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};