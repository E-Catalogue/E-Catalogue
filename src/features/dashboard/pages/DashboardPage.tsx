import { MainLayout } from '../../main/components/MainLayout';
import { SummaryCards } from '../components/SummaryCards';
import { TopProductsList } from '../components/TopProductsList';
import { RecentActivity } from '../components/RecentActivity';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

export const DashboardPage = () => {
  const { metrics, topProducts, recentTransactions, isLoading, formatRupiah } = useDashboardMetrics();

  return (
    <MainLayout 
      // Kita set 0 dan false karena Dashboard tidak butuh panel keranjang POS
      cartItemCount={0} 
      isCartOpen={false} 
      setIsCartOpen={() => {}} 
      showCartPanel={false}
    >
      <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-customGray-light tracking-tight">Dashboard Ringkasan</h1>
            <p className="text-xs font-bold text-content-secondary mt-1">Pantau performa penjualan cabang hari ini.</p>
          </div>
        </div>

        {isLoading ? (
           <div className="flex-1 flex items-center justify-center min-h-[400px]">
             <svg className="animate-spin h-8 w-8 text-[#86673A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </div>
        ) : (
           <>
             {/* SECTION 1: KOTAK METRIK */}
             <SummaryCards metrics={metrics} formatRupiah={formatRupiah} />

             {/* SECTION 2: GRID LIST & TABEL */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Kolom Kiri: Produk Terlaris (1 Kolom di Desktop Besar) */}
                <div className="lg:col-span-1 h-[400px] md:h-[450px]">
                  <TopProductsList products={topProducts} formatRupiah={formatRupiah} />
                </div>
                
                {/* Kolom Kanan: Transaksi Terakhir (2 Kolom di Desktop Besar) */}
                <div className="lg:col-span-2 h-[400px] md:h-[450px]">
                  <RecentActivity transactions={recentTransactions} formatRupiah={formatRupiah} />
                </div>
             </div>
           </>
        )}
      </div>
    </MainLayout>
  );
};