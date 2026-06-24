interface CategoryOption {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: CategoryOption[];
  activeCategory: string;
  onSelect: (catId: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onSelect, searchTerm, onSearchChange }: CategoryTabsProps) => {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 xl:pb-0 w-full xl:w-auto">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => onSelect(cat.id)}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs lg:text-sm font-bold transition-all duration-300 whitespace-nowrap border shrink-0
            ${activeCategory === cat.id
              ? 'bg-[#86673A] text-white border-[#86673A] shadow-md shadow-[#86673A]/30'
              : 'bg-white text-content-secondary border-divider hover:border-secondary hover:text-[#86673A]'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="relative w-full xl:w-64 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-content-secondary">
          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari menu kopi, snack..."
          className="w-full bg-white border border-divider pl-9 md:pl-10 pr-3 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold focus:border-secondary focus:outline-none shadow-sm transition-colors text-customGray-light"
        />
      </div>
    </div>
  );
};