import { useState, useEffect, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

interface PosLayoutProps {
  children: ReactNode; 
  rightPanel?: ReactNode; 
  cartItemCount: number;
  isCartOpen: boolean;           
  setIsCartOpen: (val: boolean) => void; 
  showCartPanel?: boolean; 
}

export const PosLayout = ({ children, rightPanel, cartItemCount, isCartOpen, setIsCartOpen, showCartPanel = true }: PosLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-content-primary font-sans relative">
      
      {/* OVERLAY MOBILE */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* LEFT SIDEBAR MAIN */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 bg-surface flex flex-col items-center py-4 md:py-6 border-r border-divider shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out shrink-0
        ${isMobileSidebarOpen ? 'translate-x-0 w-16 md:w-20' : '-translate-x-full lg:translate-x-0'}
        ${isDesktopSidebarOpen ? 'lg:w-20 xl:w-24' : 'lg:w-0 lg:border-none lg:overflow-hidden'}`}>
        
        <div className="w-10 h-10 md:w-12 md:h-12 bg-customGray-light rounded-xl flex items-center justify-center text-white font-black text-base md:text-lg mb-6 md:mb-8 shadow-xl shrink-0 min-w-[2.5rem]">AC</div>
        
        <nav className="flex-1 flex flex-col gap-4 md:gap-6 w-full items-center min-w-[4rem]">
          <Link to="/pos" onClick={() => setIsMobileSidebarOpen(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center bg-accent text-white shadow-lg shadow-accent/30 cursor-pointer">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
        </nav>
      </aside>

      {/* DESKTOP SIDEBAR TOGGLE BUTTON */}
      <button onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} className={`hidden lg:flex absolute top-5 z-40 w-6 h-6 md:w-7 md:h-7 bg-surface border border-divider rounded-full items-center justify-center shadow-md transition-all hover:text-accent ${isDesktopSidebarOpen ? 'left-[4.5rem] xl:left-[5.5rem]' : 'left-3'}`}>
         <svg className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${!isDesktopSidebarOpen && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
      </button>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative bg-background overflow-hidden">
        
        {/* HEADER BERSENIH (Tanpa Search) */}
        <header className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 md:gap-4 shrink-0 bg-surface border-b border-divider shadow-sm z-30 min-h-[50px] md:min-h-[70px]">
          
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
             <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-1.5 md:p-2 bg-background rounded-lg border border-divider shadow-sm text-content-primary shrink-0">
               <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
             </button>
             <div>
               <h1 className="text-sm md:text-lg lg:text-xl font-black text-customGray-light tracking-tight leading-none">Adonara <span className="text-accent">Coffee</span></h1>
               <p className="text-content-secondary text-[8px] md:text-[10px] font-bold mt-0.5 uppercase tracking-widest opacity-70">Cabang Senayan</p>
             </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            {/* Jam (Disembunyikan di layar sangat kecil) */}
            <div className="hidden sm:flex flex-col items-end justify-center mr-1 md:mr-3">
               <span className="text-[10px] md:text-xs font-bold text-customGray-light">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
               <span className="text-[8px] md:text-[9px] text-content-secondary uppercase">{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-1.5 md:gap-2 bg-surface border border-divider p-1 pr-1.5 md:p-1.5 md:pr-3 rounded-full hover:border-customGray-light transition-all shrink-0 shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Dimas+Ardianto&background=CAAB7F&color=fff&bold=true" alt="Profile" className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover shrink-0" />
                <span className="text-[10px] md:text-xs font-bold text-customGray-light hidden md:block">Dimas</span>
                <svg className="w-3 h-3 text-content-secondary hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-40 md:w-48 bg-surface border border-divider rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in">
                  <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-divider bg-background/50">
                    <p className="text-[10px] md:text-xs font-bold text-customGray-light truncate">Dimas Ardianto</p>
                    <p className="text-[8px] md:text-[9px] text-content-secondary uppercase font-bold mt-0.5">Kasir • Shift Pagi</p>
                  </div>
                  <button className="w-full text-left px-3 md:px-4 py-2.5 text-[9px] md:text-[10px] font-bold text-content-secondary hover:bg-primary/30 hover:text-customGray-light transition-all">Pengaturan Akun</button>
                  <button onClick={() => alert("Logout Berhasil")} className="w-full text-left px-3 md:px-4 py-2.5 text-[9px] md:text-[10px] font-bold text-semantic-error hover:bg-semantic-error/10 transition-all border-t border-divider">Logout System</button>
                </div>
              )}
            </div>

            {/* TOMBOL BUKA KERANJANG (Hanya muncul jika isCartOpen = false DAN sedang di menu POS) */}
            {(!isCartOpen && showCartPanel) && (
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 md:p-2.5 rounded-xl bg-customGray-light text-white shadow-md shrink-0 transition-transform active:scale-95 hover:bg-black">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartItemCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-semantic-error text-white text-[8px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full ring-2 ring-surface">{cartItemCount}</span>}
              </button>
            )}
          </div>
        </header>

        {/* AREA CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 pb-8 pt-4 md:pt-6 no-scrollbar min-h-0">
          {children}
        </div>
      </main>

      {/* RIGHT CART PANEL */}
      {showCartPanel && (
        <aside className={`fixed inset-y-0 right-0 z-50 lg:relative lg:z-0 flex flex-col bg-surface shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out border-l border-divider/40 shrink-0
          ${isCartOpen ? 'translate-x-0 w-[85vw] md:w-[350px] xl:w-[380px] lg:w-[320px] rounded-l-[1.5rem] lg:rounded-none' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'}
        `}>
           <div className="px-4 md:px-5 lg:px-6 pt-5 md:pt-6 pb-3 flex justify-between items-center shrink-0 border-b border-divider/50">
              <h2 className="text-base md:text-lg lg:text-xl font-black text-customGray-light">Current Order</h2>
              {/* TOMBOL TUTUP KERANJANG (Muncul di Mobile dan Desktop) */}
              <button onClick={() => setIsCartOpen(false)} className="p-1 md:p-1.5 bg-background border border-divider text-content-secondary hover:text-accent hover:border-accent rounded-lg transition-all" title="Sembunyikan Keranjang">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
           </div>

           <div className="flex-1 overflow-hidden min-w-[85vw] md:min-w-[350px] xl:min-w-[380px] lg:min-w-[320px]">
              {rightPanel}
           </div>
        </aside>
      )}
    </div>
  );
};