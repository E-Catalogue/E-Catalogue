import type { LoginRequest } from '../schema';

interface LoginFormProps {
  formData: LoginRequest;
  isLoading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm = ({ formData, isLoading, error, onChange, onSubmit }: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
      
      {/* Input Email */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-content-secondary uppercase tracking-widest pl-1">Alamat Email</label>
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={onChange}
          disabled={isLoading}
          placeholder="Masukkan Alamat Email"
          className="w-full bg-[#F8F6F2] border-2 border-transparent px-4 py-3.5 rounded-2xl text-sm font-bold text-customGray-light focus:outline-none focus:border-[#86673A] focus:bg-white transition-all disabled:opacity-50"
        />
      </div>

      {/* Input Password */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-content-secondary uppercase tracking-widest pl-1">Password</label>
        <input 
          type="password" 
          name="password"
          value={formData.password}
          onChange={onChange}
          disabled={isLoading}
          placeholder="Masukkan Password"
          className="w-full bg-[#F8F6F2] border-2 border-transparent px-4 py-3.5 rounded-2xl text-sm font-bold text-customGray-light focus:outline-none focus:border-[#86673A] focus:bg-white transition-all disabled:opacity-50"
        />
      </div>

      {/* Pesan Error Bersih */}
      {error && (
        <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-start gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 text-semantic-error shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-xs font-bold text-semantic-error leading-relaxed">{error}</p>
        </div>
      )}

      {/* Tombol Submit */}
      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full mt-2 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3
        ${isLoading ? 'bg-[#E8DFD1] text-content-secondary cursor-not-allowed' : 'bg-[#86673A] text-white hover:bg-[#684F2A] shadow-xl shadow-[#86673A]/20 active:scale-95'}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Memverifikasi...
          </>
        ) : (
          'Masuk ke Kasir'
        )}
      </button>

    </form>
  );
};