import type { ReactNode } from 'react';
import { useLayout } from '../hooks/useLayout';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode; 
  rightPanel?: ReactNode; 
  cartItemCount: number;
  isCartOpen: boolean;           
  setIsCartOpen: (val: boolean) => void; 
  showCartPanel?: boolean; 
}

export const MainLayout = ({ 
  children, rightPanel, cartItemCount, isCartOpen, setIsCartOpen, showCartPanel = true 
}: MainLayoutProps) => {
  
  const {
    isMobileSidebarOpen, setIsMobileSidebarOpen,
    isDesktopSidebarOpen, setIsDesktopSidebarOpen,
    isProfileOpen, setIsProfileOpen,
    currentTime
  } = useLayout();

  return (
    <div className="flex h-screen w-full bg-[#F8F6F2] overflow-hidden text-customGray-light font-sans relative">
      
      {/* SIDEBAR COMPONENT */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        isDesktopOpen={isDesktopSidebarOpen} 
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleDesktop={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#F8F6F2]">
        
        {/* HEADER COMPONENT */}
        <Header 
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          currentTime={currentTime}
          isProfileOpen={isProfileOpen}
          onToggleProfile={() => setIsProfileOpen(!isProfileOpen)}
          cartItemCount={cartItemCount}
          isCartOpen={isCartOpen}
          onOpenCart={() => setIsCartOpen(true)}
          showCartButton={showCartPanel}
        />

        {/* AREA CONTENT (CHILDREN) */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 pb-8 pt-4 md:pt-6 no-scrollbar min-h-0 bg-[#F8F6F2]">
          {children}
        </div>
      </main>

      {/* RIGHT CART PANEL (Terkait POS) */}
      {showCartPanel && (
        <aside className={`fixed inset-y-0 right-0 z-50 lg:relative lg:z-0 flex flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] lg:shadow-none transition-all duration-500 ease-in-out border-l border-divider/60 shrink-0
          ${isCartOpen ? 'translate-x-0 w-[85vw] md:w-[350px] xl:w-[380px] lg:w-[340px] rounded-l-[2rem] lg:rounded-none' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden opacity-0 lg:opacity-100'}
        `}>
           {/* Header Cart (Mobile / Tertutup) */}
           <div className="px-5 md:px-6 lg:px-7 pt-6 md:pt-8 pb-4 flex justify-between items-center shrink-0 border-b border-divider/50 bg-white z-10">
              <h2 className="text-base md:text-lg lg:text-xl font-black text-customGray-light uppercase tracking-widest">Pesanan Baru</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 md:p-2 bg-[#F8F6F2] text-content-secondary hover:text-[#86673A] rounded-xl transition-all" title="Sembunyikan Keranjang">
                <X size={20} strokeWidth={2.5} />
              </button>
           </div>
           
           {/* Inner Cart Panel */}
           <div className="flex-1 overflow-hidden min-w-[85vw] md:min-w-[350px] xl:min-w-[380px] lg:min-w-[340px] bg-[#F8F6F2]">
              {rightPanel}
           </div>
        </aside>
      )}
    </div>
  );
};