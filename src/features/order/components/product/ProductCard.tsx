import type { Product } from '../../schema';
import { handleProductImageError } from '@/shared/utils/handleProductImageError';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  formatRupiah: (val: number) => string;
}

export const ProductCard = ({ product, onClick, formatRupiah }: ProductCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 shadow-sm border border-divider/40 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col h-full w-full relative overflow-hidden"
    >
      {/* Badge Bundle */}
      {product.type === 'bundle' && (
        <div className="absolute top-0 right-0 bg-[#86673A] text-white text-[9px] md:text-[10px] font-black px-3 pt-2 pb-1 rounded-bl-xl z-10 shadow-md">
          PAKET
        </div>
      )}

      <div className="relative aspect-[4/3] rounded-xl md:rounded-[1.2rem] overflow-hidden mb-3 md:mb-4 bg-[#F8F6F2] w-full">
        <img
          src={product.image}
          alt={product.name}
          onError={handleProductImageError}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <div className="px-1 flex-1 flex flex-col justify-between">
        <h3 className="text-xs md:text-sm font-black text-customGray-light leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <span className="text-[#86673A] font-black text-sm md:text-base">
          {formatRupiah(product.price)}
        </span>
      </div>
    </div>
  );
};