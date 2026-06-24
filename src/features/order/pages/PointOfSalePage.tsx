import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/app/store';
import { showGlobalError } from '@/app/store/uiSlice';
import type { CartItem, Product } from '../schema';
import type { OrderType } from '../api/transaction.schema';
import { useProducts, useProductCategories } from '../hooks/useProducts';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { orderDetailToCart } from '../utils/orderDetailToCart';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CategoryTabs } from '../components/product/CategoryTabs';
import { MainLayout } from '../../main/components/MainLayout';
import { CartPanel } from '../components/cart/CartPanel';
import { CheckoutLayout } from '../components/checkout/CheckoutLayout';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal';
import { PaymentMethodModal } from '../components/modals/PaymentMethodModal';
import { ProductCard } from '../components/product/ProductCard';
import { useOrderCart } from '../hooks/useOrderCart';
import { PromoModal } from '../components/modals/PromoModal';
import { PaymentView } from '../components/payment/PaymentView';
import { PaymentSuccessView } from '../components/payment-status/PaymentSuccessView';
import { AdditionsModal } from '../components/modals/AdditionsModal';
import { ThermalReceipt } from '../components/payment/ThermalReceipt'; 

export const PointOfSalePage = () => {
  const { cart, addToCart, editCartItem, updateQuantity, removeCartItem, clearCart, subTotal, discountAmount, tax, serviceCharge, grandTotal, formatRupiah, paymentMethod, setPaymentMethod, appliedPromo, setAppliedPromo, generateOrderPayload } = useOrderCart();

  const [currentView, setCurrentView] = useState<'menu' | 'checkout' | 'payment' | 'success'>('menu');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(window.innerWidth >= 1024);

  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away'>('Dine In');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [customerProfileId, setCustomerProfileId] = useState<string | null>(null);
  
  // PERBAIKAN: Tambahkan state untuk menyimpan poin yang ditukar
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);

  const [finalOrderId, setFinalOrderId] = useState('');
  const [finalQueueNo, setFinalQueueNo] = useState('');
  const [orderDbId, setOrderDbId] = useState<string | null>(null);
  const [finalTransactionTime, setFinalTransactionTime] = useState('');

  const [isAdditionsOpen, setIsAdditionsOpen] = useState(false);
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isConfirmCheckoutOpen, setIsConfirmCheckoutOpen] = useState(false);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  // --- Data produk & kategori dari API ---
  const debouncedSearch = useDebounce(search, 400);

  const productParams = useMemo(() => ({
    search: debouncedSearch.trim() || undefined,
    categoryId: activeCategory !== 'all' ? activeCategory : undefined,
    limit: 100,
  }), [debouncedSearch, activeCategory]);

  const { products: filteredProducts, isLoading: isProductsLoading, isError: isProductsError, refetch: refetchProducts } = useProducts(productParams);
  const { data: categoryData } = useProductCategories();

  // --- Order creation & detail ---
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const branch = useSelector((state: RootState) => state.auth.branch);
  const createOrder = useCreateOrder();
  const cancelOrder = useCancelOrder();
  // Setelah order dibuat & masuk layar bayar, ambil detail order (total & payment dari server)
  const { data: orderDetail, isLoading: isOrderDetailLoading } = useOrderDetail(orderDbId);

  // Buka langsung bagian pembayaran untuk order yang sudah ada (dari menu Tracking: /pos?orderId=)
  const { orderId: existingOrderId } = useSearch({ from: '/pos' });
  const isExistingOrder = !!existingOrderId;

  useEffect(() => {
    if (existingOrderId) {
      setOrderDbId(existingOrderId);
      setPaymentMethod('QRIS'); // sementara QRIS dulu
      setCurrentView('payment');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingOrderId]);

  // Untuk order yang sudah ada, daftar item & info pelanggan diambil dari detail server
  const TYPE_LABEL: Record<OrderType, 'Dine In' | 'Take Away'> = { DINE_IN: 'Dine In', TAKEAWAY: 'Take Away', DELIVERY: 'Take Away' };
  const existingOrderCart: CartItem[] = useMemo(
    () => (isExistingOrder && orderDetail ? orderDetailToCart(orderDetail) : []),
    [isExistingOrder, orderDetail]
  );

  const categoryTabs = useMemo(() => [
    { id: 'all', name: 'Semua Menu' },
    ...(categoryData ?? []).map((cat) => ({ id: cat.id, name: cat.name })),
  ], [categoryData]);

  // PERBAIKAN: Kalkulasi Total Akhir
  const finalGrandTotal = grandTotal - loyaltyPointsUsed;

  const openAddModal = (product: Product) => { setSelectedProduct(product); setEditingCartItem(null); setIsAdditionsOpen(true); };
  const openEditModal = (item: CartItem) => { setEditingCartItem(item); setIsAdditionsOpen(true); };

  // PERBAIKAN: Tangkap nilai pointsUsed & customerProfileId (member)
  const handleSetCustomerData = (name: string, phone: string, type: 'Dine In' | 'Take Away', number: string, pointsUsed: number, profileId: string | null) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setOrderType(type);
    setOrderNumber(number);
    setLoyaltyPointsUsed(pointsUsed);
    setCustomerProfileId(profileId);
  };

  // Mapping label order POS -> enum backend
  const ORDER_TYPE_MAP: Record<string, OrderType> = {
    'Dine In': 'DINE_IN',
    'Take Away': 'TAKEAWAY',
  };

  // "Lanjut Bayar" -> CREATE ORDER ke API, lalu lanjut ke layar pembayaran.
  // createOrder.isPending dipakai untuk loader tombol (cegah double-click).
  const handleConfirmCheckout = async () => {
    const branchId = branch?.id;
    if (!branchId) {
      setIsConfirmCheckoutOpen(false);
      dispatch(showGlobalError({
        type: 'auth',
        title: 'Sesi Tidak Lengkap',
        message: 'Data cabang tidak ditemukan. Silakan login ulang untuk melanjutkan transaksi.',
      }));
      return;
    }

    try {
      const payload = generateOrderPayload({
        ordererName: customerName || 'Walk-in Customer',
        ordererPhone: customerPhone || '-',
        type: ORDER_TYPE_MAP[orderType] ?? 'DINE_IN',
        branchId,
        customerProfileId: customerProfileId || undefined,
      });

      const order = await createOrder.mutateAsync(payload);

      setFinalOrderId(order.orderNo);
      setFinalQueueNo(order.queueNo);
      setOrderDbId(order.id); // memicu GET /sales/order/{id} untuk detail & payment
      setFinalTransactionTime(
        new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB'
      );
      setIsConfirmCheckoutOpen(false);
      setCurrentView('payment');
    } catch (err: any) {
      setIsConfirmCheckoutOpen(false);
      // Error infrastruktur (5xx/timeout/network) sudah ditangani interceptor.
      // Error bisnis (4xx) ditampilkan di sini.
      const status = err?.response?.status;
      if (!status || status < 500) {
        dispatch(showGlobalError({
          type: 'general',
          title: 'Gagal Membuat Pesanan',
          message: err?.response?.data?.message || 'Pesanan tidak dapat dibuat. Mohon periksa kembali dan coba lagi.',
        }));
      }
    }
  };

  // Order sudah dibuat saat "Lanjut Bayar"; konfirmasi di layar bayar -> tampilkan struk sukses.
  const handleFinishPayment = async () => {
    setCurrentView('success');
  };

  // Batalkan order PENDING dari layar pembayaran (PATCH .../cancel + catatan)
  const handleConfirmCancelOrder = async () => {
    if (!orderDbId) return;
    try {
      await cancelOrder.mutateAsync({ orderId: orderDbId, notes: cancelNotes.trim() || undefined });
      setIsCancelOrderOpen(false);
      setCancelNotes('');
      if (isExistingOrder) {
        navigate({ to: '/tracking' }); // order dari tracking -> kembali ke tracking
      } else {
        handleResetOrder(); // order baru -> reset ke menu
      }
    } catch {
      // Error infrastruktur sudah ditangani interceptor global
      setIsCancelOrderOpen(false);
    }
  };

  const handleResetOrder = () => {
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setOrderNumber('');
    setCustomerProfileId(null);
    setLoyaltyPointsUsed(0); // Reset poin
    setFinalOrderId('');
    setFinalQueueNo('');
    setOrderDbId(null);
    setFinalTransactionTime('');
    setCurrentView('menu');
    setIsCartOpen(window.innerWidth >= 1024);
  };

  if (currentView === 'success') {
    return (
      <div className="w-screen h-screen bg-background p-6 md:p-8 lg:p-12 overflow-hidden">
        <PaymentSuccessView 
           cart={cart} subTotal={subTotal} tax={tax} serviceCharge={serviceCharge} discountAmount={discountAmount} 
           loyaltyPointsUsed={loyaltyPointsUsed} grandTotal={finalGrandTotal} // Kirim finalGrandTotal
           formatRupiah={formatRupiah} paymentMethod={paymentMethod}
           customerName={customerName} customerPhone={customerPhone} orderType={orderType} orderNumber={orderNumber}
           orderId={finalOrderId} transactionTime={finalTransactionTime}
           onResetOrder={handleResetOrder}
        />
        <ThermalReceipt 
           cart={cart} subTotal={subTotal} tax={tax} serviceCharge={serviceCharge} discountAmount={discountAmount} 
           loyaltyPointsUsed={loyaltyPointsUsed} grandTotal={finalGrandTotal} // Kirim finalGrandTotal
           formatRupiah={formatRupiah} paymentMethod={paymentMethod} appliedPromo={appliedPromo}
           customerName={customerName} orderNumber={orderNumber} orderType={orderType} 
           orderId={finalOrderId} transactionTime={finalTransactionTime}
        />
      </div>
    );
  }

  return (
    <>
      <MainLayout 
        cartItemCount={cart.length} 
        isCartOpen={isCartOpen} 
        setIsCartOpen={setIsCartOpen} 
        showCartPanel={currentView === 'menu'} 
        rightPanel={
          <CartPanel 
            serviceCharge={serviceCharge}
            cart={cart} subTotal={subTotal} tax={tax} discountAmount={discountAmount} grandTotal={grandTotal}
            formatRupiah={formatRupiah} appliedPromo={appliedPromo} paymentMethod={paymentMethod}
            onUpdateQty={updateQuantity} onRemoveItem={(id) => setItemToRemove(id)} onClearAll={() => setConfirmClear(true)}
            onCheckout={() => { setCurrentView('checkout'); setIsCartOpen(false); } } onClickItemToEdit={openEditModal}         
          />
        }
      >
        
        {currentView === 'menu' && (
          <div className="flex flex-col gap-5 md:gap-6 lg:gap-8 animate-in fade-in duration-500">
            <CategoryTabs categories={categoryTabs} activeCategory={activeCategory} onSelect={setActiveCategory} searchTerm={search} onSearchChange={setSearch} />
            <section className="pb-10">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h2 className="text-sm md:text-base lg:text-lg font-black text-customGray-light">Daftar Menu</h2>
                <span className="text-[8px] md:text-[10px] font-bold text-content-secondary px-2.5 md:px-3 py-1 md:py-1.5 bg-primary/50 rounded-full">{filteredProducts.length} menu</span>
              </div>

              {isProductsLoading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 md:gap-5 lg:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 border border-divider/40 animate-pulse">
                      <div className="aspect-[4/3] rounded-xl md:rounded-[1.2rem] bg-[#F8F6F2] mb-3 md:mb-4" />
                      <div className="h-3 bg-[#F8F6F2] rounded mb-2 w-3/4" />
                      <div className="h-3 bg-[#F8F6F2] rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : isProductsError ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <p className="text-content-secondary font-medium text-xs">Gagal memuat daftar menu.</p>
                  <button onClick={() => refetchProducts()} className="px-4 py-2 rounded-xl bg-[#86673A] text-white text-[10px] md:text-xs font-bold shadow-sm">Coba Lagi</button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-content-secondary text-center py-20 font-medium text-xs">Menu tidak ditemukan.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 md:gap-5 lg:gap-6 transition-all duration-500 ease-in-out">
                  {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onClick={() => openAddModal(product)} formatRupiah={formatRupiah} />)}
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === 'checkout' && (
          <CheckoutLayout 
            cart={cart} subTotal={subTotal} tax={tax} serviceCharge={serviceCharge} discountAmount={discountAmount} grandTotal={grandTotal} formatRupiah={formatRupiah}
            paymentMethod={paymentMethod} appliedPromo={appliedPromo}
            onBackToMenu={() => { setCurrentView('menu'); setIsCartOpen(window.innerWidth >= 1024); } }
            onOpenPromoModal={() => setIsPromoOpen(true)} 
            onOpenPaymentModal={() => setIsPaymentMethodOpen(true)}
            onProcessPayment={() => setIsConfirmCheckoutOpen(true)}
            setCustomerInfoData={handleSetCustomerData}
          />
        )}

        {currentView === 'payment' && (
          <PaymentView
            // Order existing (dari tracking): item & pelanggan dari detail server; selain itu dari cart POS
            cart={isExistingOrder ? existingOrderCart : cart}
            // Total final & rincian diambil dari server (GET order) bila sudah termuat
            subTotal={orderDetail?.subtotal ?? subTotal}
            tax={orderDetail?.taxAmount ?? tax}
            serviceCharge={orderDetail?.serviceCharge ?? serviceCharge}
            discountAmount={orderDetail?.discountAmount ?? discountAmount}
            loyaltyPointsUsed={orderDetail ? 0 : loyaltyPointsUsed}
            grandTotal={orderDetail?.totalAmount ?? finalGrandTotal}
            formatRupiah={formatRupiah} paymentMethod={paymentMethod}
            appliedPromo={appliedPromo}
            customerName={isExistingOrder ? (orderDetail?.ordererName ?? '') : customerName}
            customerPhone={isExistingOrder ? (orderDetail?.ordererPhone ?? '') : customerPhone}
            orderType={isExistingOrder && orderDetail ? TYPE_LABEL[orderDetail.type] : orderType}
            orderNumber={isExistingOrder ? (orderDetail?.queueNo ?? '') : orderNumber}
            orderNo={isExistingOrder ? (orderDetail?.orderNo ?? '') : finalOrderId}
            queueNo={isExistingOrder ? (orderDetail?.queueNo ?? '') : finalQueueNo}
            orderStatus={orderDetail?.status} isLoadingDetail={isOrderDetailLoading}
            onBack={isExistingOrder ? () => navigate({ to: '/tracking' }) : () => setCurrentView('checkout')}
            onConfirmPayment={isExistingOrder ? async () => { navigate({ to: '/tracking' }); } : handleFinishPayment}
            onCancelOrder={() => { setCancelNotes(''); setIsCancelOrderOpen(true); }}
          />
        )}

      </MainLayout>

      {/* OVERLAYS */}
      <AdditionsModal isOpen={isAdditionsOpen} onClose={() => setIsAdditionsOpen(false)} product={selectedProduct} editingItem={editingCartItem} onConfirmAdd={addToCart} onConfirmEdit={editCartItem} formatRupiah={formatRupiah} />
      <PaymentMethodModal isOpen={isPaymentMethodOpen} onClose={() => setIsPaymentMethodOpen(false)} selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />
      <PromoModal isOpen={isPromoOpen} onClose={() => setIsPromoOpen(false)} appliedPromo={appliedPromo} onSelectPromo={setAppliedPromo} />
      
      {/* PERBAIKAN: Pastikan modal menampilkan harga akhir (finalGrandTotal) */}
      <ConfirmationModal isOpen={isConfirmCheckoutOpen} onClose={() => setIsConfirmCheckoutOpen(false)} title="Konfirmasi Checkout" message={`Lanjutkan ke pembayaran sebesar ${formatRupiah(finalGrandTotal)} dengan metode ${paymentMethod}?`} onConfirm={handleConfirmCheckout} confirmText="Lanjut Bayar" loadingText="Membuat Pesanan..." isLoading={createOrder.isPending} closeOnConfirm={false} isDanger={false} />
      
      <ConfirmationModal
        isOpen={isCancelOrderOpen}
        onClose={() => setIsCancelOrderOpen(false)}
        title="Batalkan Pesanan"
        message={`Yakin membatalkan pesanan ${orderDetail?.orderNo ?? finalOrderId}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Batalkan"
        loadingText="Membatalkan..."
        isLoading={cancelOrder.isPending}
        closeOnConfirm={false}
        withNotes
        notesLabel="Catatan Pembatalan (opsional)"
        notesPlaceholder="Contoh: pelanggan batal pesan"
        notesValue={cancelNotes}
        onNotesChange={setCancelNotes}
        onConfirm={handleConfirmCancelOrder}
      />

      <ConfirmationModal isOpen={confirmClear} onClose={() => setConfirmClear(false)} title="Kosongkan Keranjang" message="Semua pesanan akan dihapus." onConfirm={clearCart} confirmText="Hapus Semua" />
      <ConfirmationModal isOpen={!!itemToRemove} onClose={() => setItemToRemove(null)} title="Hapus Item" message="Item ini akan dihapus dari pesanan." onConfirm={() => { if(itemToRemove) removeCartItem(itemToRemove); }} confirmText="Hapus" />
    </>
  );
};