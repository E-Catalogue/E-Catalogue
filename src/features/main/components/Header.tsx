import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from 'react-redux';
import { Menu, LogOut, User, ShoppingBag, Store } from 'lucide-react';
import { clearCredentials } from '@/app/store/authSlice';
import { authApi } from '@/features/auth/api/auth.api';
import { LogoutModal } from './modals/LogoutModal';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  currentTime: Date;
  isProfileOpen: boolean;
  onToggleProfile: () => void;
  cartItemCount: number;
  isCartOpen: boolean;
  onOpenCart: () => void;
  showCartButton: boolean;
}

export const Header = ({
  onOpenMobileSidebar, currentTime, isProfileOpen, onToggleProfile,
  cartItemCount, isCartOpen, onOpenCart, showCartButton
}: HeaderProps) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    onToggleProfile(); 
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    // 1. Beritahu server bahwa kita logout (opsional, tapi disarankan)
    await authApi.logout();
    
    // 2. Bersihkan Redux & LocalStorage
    dispatch(clearCredentials());
    
    setIsLoggingOut(false);
    setIsLogoutModalOpen(false);
    
    // 3. Redirect ke halaman Login (Karena state Redux kosong, Router akan otomatis melempar)
    // Jaga-jaga kita paksa navigasi
    navigate({ to: '/' });
  };

  return (
    <>
      <header className="px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shrink-0 bg-white border-b border-divider/60 shadow-sm z-30 min-h-[60px] md:min-h-[80px]">
        {/* ... (BAGIAN KIRI: Menu Hamburger & Store Info - SAMA SEPERTI SEBELUMNYA) ... */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
           <button onClick={onOpenMobileSidebar} className="lg:hidden p-2 md:p-2.5 bg-[#F8F6F2] rounded-xl text-content-secondary hover:text-customGray-light transition-colors shrink-0">
             <Menu size={22} strokeWidth={2.5} />
           </button>
           <div className="hidden lg:flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#86673A]/10 text-[#86673A] flex items-center justify-center border border-[#86673A]/20">
               <Store size={20} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col justify-center">
               <h2 className="text-sm md:text-base font-black text-customGray-light tracking-tight leading-none">Cabang Senayan</h2>
               <p className="text-content-secondary text-[10px] font-bold mt-1 uppercase tracking-widest">Shift Pagi</p>
             </div>
           </div>
        </div>

        {/* BAGIAN KANAN */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          
          {/* ... (Waktu Digital - SAMA SEPERTI SEBELUMNYA) ... */}
          <div className="hidden md:flex items-center gap-4 bg-[#F8F6F2] border border-[#E8DFD1] px-4 py-2 rounded-2xl mr-2">
             <div className="flex flex-col items-end">
               <span className="text-[9px] text-content-secondary uppercase font-bold tracking-widest mb-0.5">Waktu Saat Ini</span>
               <span className="text-[10px] text-content-secondary font-medium">{currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
             </div>
             <div className="w-px h-6 bg-[#E8DFD1]"></div>
             <span className="text-sm font-black text-customGray-light tracking-widest">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="relative">
            <button onClick={onToggleProfile} className="flex items-center gap-3 bg-white border-2 border-divider/60 p-1.5 pr-2.5 md:p-2 md:pr-4 rounded-full hover:border-[#86673A] transition-all shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#86673A]/10 text-[#86673A] flex items-center justify-center font-black text-sm md:text-base border border-[#86673A]/20 shrink-0">DA</div>
              <div className="hidden md:flex flex-col items-start pr-2">
                <span className="text-[10px] font-black text-customGray-light uppercase tracking-widest">Dimas A.</span>
                <span className="text-[9px] text-content-secondary font-bold">Admin Kasir</span>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-divider/60 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                <div className="p-5 border-b border-divider/60 bg-[#F8F6F2]/50 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#86673A]/10 text-[#86673A] flex items-center justify-center font-black text-base border border-[#86673A]/20 shrink-0">DA</div>
                   <div>
                     <p className="text-xs font-black text-customGray-light leading-tight">Dimas Ardianto</p>
                     <p className="text-[9px] text-content-secondary uppercase font-bold tracking-widest mt-1">Admin Kasir</p>
                   </div>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold text-content-secondary hover:bg-[#F8F6F2] hover:text-customGray-light transition-all">
                    <User size={16} strokeWidth={2.5}/> Profil Saya
                  </button>
                  <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold text-semantic-error hover:bg-semantic-error/10 transition-all">
                    <LogOut size={16} strokeWidth={2.5}/> Keluar Aplikasi
                  </button>
                </div>
              </div>
            )}
          </div>

          {(!isCartOpen && showCartButton) && (
            <button onClick={onOpenCart} className="relative p-3 md:p-3.5 rounded-2xl bg-customGray-light text-white shadow-xl shadow-black/10 shrink-0 transition-transform active:scale-95 hover:bg-black group ml-2">
              <ShoppingBag size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-semantic-error text-white text-[10px] md:text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ring-4 ring-[#F8F6F2] shadow-sm">{cartItemCount}</span>}
            </button>
          )}
        </div>
      </header>

      {/* MODAL KONFIRMASI LOGOUT */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
};