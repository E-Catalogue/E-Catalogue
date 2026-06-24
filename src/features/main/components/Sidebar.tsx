import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Coffee,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/shared/constants';

interface SidebarProps {
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', shortLabel: 'Dash', icon: LayoutDashboard },
  { path: '/pos', label: 'Order', shortLabel: 'Order', icon: Coffee },
  { path: '/tracking', label: 'Tracking Order', shortLabel: 'Track', icon: ReceiptText },
];

export const Sidebar = ({ isMobileOpen, isDesktopOpen, onCloseMobile, onToggleDesktop }: SidebarProps) => {
  const location = useLocation();

  const isExpanded = isDesktopOpen || isMobileOpen;

  return (
    <>
      {/* OVERLAY MOBILE */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={onCloseMobile} 
        />
      )}

      {/* LEFT SIDEBAR MAIN (Z-Index 50 dipastikan menimpa MainLayout) */}
      <aside className={`fixed inset-y-0 left-0 z-[60] lg:relative bg-white flex flex-col border-r border-divider/60 shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out shrink-0
        ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
        ${isDesktopOpen ? 'lg:w-[260px] xl:w-[280px]' : 'lg:w-[88px]'}`}>
        
        {/* SIDEBAR HEADER (LOGO & TOGGLE) */}
        <div className="flex items-center justify-between p-6 md:p-8 shrink-0 min-h-[100px]">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className={`w-10 h-10 md:w-12 md:h-12 bg-customGray-light rounded-xl flex items-center justify-center text-white font-black text-sm md:text-base shadow-xl shrink-0 transition-all ${!isDesktopOpen && 'mx-auto'}`}>
              AC
            </div>
            
            {/* Teks Logo Hanya Muncul Jika Desktop Terbuka atau di Mobile */}
            <div className={`flex-col whitespace-nowrap transition-all duration-300 ${!isExpanded ? 'opacity-0 w-0 hidden' : 'opacity-100 flex'}`}>
              <h1 className="font-black text-lg md:text-xl text-customGray-light leading-none tracking-tight">Adonara</h1>
              <span className="font-bold text-[10px] text-content-secondary uppercase tracking-widest mt-1">Coffee</span>
            </div>
          </div>

          {/* TOMBOL TOGGLE */}
          <button 
             onClick={onToggleDesktop} 
             className={`hidden lg:flex p-1.5 bg-[#F8F6F2] hover:bg-[#86673A]/10 text-content-secondary hover:text-[#86673A] rounded-lg transition-colors shrink-0`}
          >
             {isDesktopOpen ? <ChevronLeft size={20} strokeWidth={2.5}/> : <ChevronRight size={20} strokeWidth={2.5} className="mx-auto"/>}
          </button>
        </div>
        
        {/* NAVIGATION LIST */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-4 overflow-y-visible mt-4">
          {MENU_ITEMS.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname.startsWith(item.path);

             return (
               <div key={item.path} className="relative group overflow-visible">
                 <Link 
                   to={item.path} 
                   onClick={onCloseMobile} 
                   className={`flex rounded-2xl transition-all font-bold overflow-hidden
                   ${isActive 
                     ? 'bg-[#86673A] text-white shadow-lg shadow-[#86673A]/20' 
                     : 'text-content-secondary hover:bg-[#F8F6F2] hover:text-customGray-light'}
                   ${isExpanded 
                     ? 'flex-row items-center h-[52px] px-4 gap-4' 
                     : 'flex-col items-center justify-center h-[54px] px-2 gap-1.5'}`}
                 >
                   <Icon size={isExpanded ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                   
                   {/* Teks Mode Normal */}
                   {isExpanded && (
                     <span className="text-xs tracking-wide whitespace-nowrap transition-opacity duration-300">
                       {item.label}
                     </span>
                   )}

                   {/* Teks Mode Mini (1 Kata) */}
                   {!isExpanded && (
                     <span className="text-[8px] uppercase tracking-wider text-center leading-none transition-opacity duration-300">
                       {item.shortLabel}
                     </span>
                   )}
                 </Link>

                 {/* TOOLTIP UNTUK MODE MINI SIDEBAR */}
                 {!isExpanded && (
                   <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-customGray-light text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap shadow-xl">
                     {item.label}
                     <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-customGray-light"></div>
                   </div>
                 )}
               </div>
             );
          })}
        </nav>

        {/* SIDEBAR FOOTER (Identitas Aplikasi) */}
        <div className="p-6 border-t border-divider/60 mt-auto overflow-visible">
           {!isExpanded ? (
             // Mode Mini Footer
             <div className="flex flex-col items-center overflow-visible relative group">
                <div className="w-full h-[64px] rounded-2xl bg-[#F8F6F2] text-content-secondary flex flex-col items-center justify-center gap-1 overflow-visible">
                  <span className="text-[10px] font-black text-customGray-light leading-none">AC</span>
                  <span className="text-[9px] font-bold text-content-secondary leading-none">{APP_VERSION}</span>
                </div>
                <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-customGray-light text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap shadow-xl">{APP_NAME} {APP_VERSION}</div>
             </div>
           ) : (
             // Mode Normal Footer
             <div className="bg-[#F8F6F2] p-4 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-xs font-black text-customGray-light leading-none">{APP_NAME}</p>
                  <p className="text-[9px] font-bold uppercase text-content-secondary tracking-widest mt-1.5">Point of Sale</p>
                </div>
                <span className="text-[10px] font-black text-[#86673A] bg-white px-2 py-1 rounded-md border border-[#E8DFD1] shrink-0">{APP_VERSION}</span>
             </div>
           )}
        </div>

      </aside>
    </>
  );
};