import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  const { formData, isLoading, error, handleChange, handleLogin } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-white overflow-hidden">
      <div className="hidden lg:flex flex-1 relative bg-[#FAF8F5] flex-col justify-center items-center p-12 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#F0E6D8] to-transparent opacity-70 pointer-events-none"></div>
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
           <div className="mb-8 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm flex items-center gap-2 border border-[#E8DFD1]">
              <span className="text-[#86673A]">✨</span>
              <span className="text-xs font-bold text-customGray-light uppercase tracking-wider">Premium Coffee Point of Sale</span>
           </div>
           <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1000&auto=format&fit=crop" 
                alt="Crafted Coffee" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#86673A] text-white rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
                   AC
                 </div>
                 <div>
                   <h3 className="font-black text-sm text-customGray-light leading-tight">Adonara Coffee</h3>
                   <p className="text-[10px] font-bold text-content-secondary mt-0.5">Point of Sale (POS) System</p>
                 </div>
              </div>
           </div>
           <div className="text-center">
              <h1 className="text-4xl font-black text-customGray-light tracking-tight mb-3">Crafted Coffee,<br/>Perfected Daily</h1>
              <p className="text-sm font-medium text-content-secondary max-w-xs mx-auto leading-relaxed">
                Kelola pesanan, transaksi, dan pelaporan cafe dengan sistem modern kami.
              </p>
           </div>

        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-white z-10 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)]">
        
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="lg:hidden flex items-center gap-3 mb-10">
             <div className="w-12 h-12 bg-[#86673A] rounded-xl flex items-center justify-center shadow-lg">
               <span className="text-white font-black text-lg">AC</span>
             </div>
             <h2 className="text-2xl font-black text-customGray-light">Adonara</h2>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-customGray-light tracking-tight mb-3">Selamat Datang</h2>
            <p className="text-content-secondary text-sm font-medium leading-relaxed">
              Silakan masukkan kredensial kasir Anda untuk membuka sistem dan memulai shift hari ini.
            </p>
          </div>
          <LoginForm 
             formData={formData}
             isLoading={isLoading}
             error={error}
             onChange={handleChange}
             onSubmit={handleLogin}
          />
          <div className="mt-12 pt-6 border-t border-divider/50">
             <p className="text-[10px] text-content-secondary/60 font-bold uppercase tracking-widest text-left">
               &copy; {new Date().getFullYear()} Adonara Coffee Systems
             </p>
          </div>

        </div>

      </div>

    </div>
  );
};