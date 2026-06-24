import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MainLayout } from '../../main/components/MainLayout';
import { useTracking } from '../hooks/useTracking';
import { TrackingTabs } from '../components/TrackingTabs';
import { OrderTrackingList } from '../components/OrderTrackingList';
import { OrderDetailModal } from '../components/modals/OrderDetailModal';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal';
import { ThermalReceipt } from '../../order/components/payment/ThermalReceipt';
import { orderDetailToCart } from '../../order/utils/orderDetailToCart';
import { useCancelOrder } from '../../order/hooks/useCancelOrder';
import type { CreatedOrder } from '@/features/order/api/transaction.schema';
import { ORDER_TYPE_LABEL } from '../schema';

export const TrackingPage = () => {
  const navigate = useNavigate();
  const {
    orders, totalOrders, isLoading, isError, refetch,
    statusFilter, setStatusFilter, typeFilter, setTypeFilter, searchQuery, setSearchQuery,
    selectedOrderId, setSelectedOrderId, orderDetail, isDetailLoading, formatRupiah,
  } = useTracking();

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');
  const cancelOrder = useCancelOrder();

  // Klik order -> buka detail (termasuk PENDING, agar bisa Bayar / Batalkan dari modal).
  const handleOrderClick = (order: CreatedOrder) => setSelectedOrderId(order.id);

  const handlePrintReceipt = () => {
    setTimeout(() => window.print(), 150);
  };

  const handlePay = () => {
    if (orderDetail) navigate({ to: '/pos', search: { orderId: orderDetail.id } });
  };

  const handleConfirmCancel = async () => {
    if (!orderDetail) return;
    try {
      await cancelOrder.mutateAsync({ orderId: orderDetail.id, notes: cancelNotes.trim() || undefined });
      setIsCancelOpen(false);
      setCancelNotes('');
      setSelectedOrderId(null);
      refetch();
    } catch {
      // Error infrastruktur sudah ditangani interceptor global
      setIsCancelOpen(false);
    }
  };

  return (
    <>
      {/* UI web (disembunyikan saat mencetak) */}
      <div className="print:hidden h-full">
        <MainLayout cartItemCount={0} isCartOpen={false} setIsCartOpen={() => {}} showCartPanel={false}>
          <div className="flex flex-col gap-5 md:gap-6 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-customGray-light tracking-tight">Tracking Pesanan</h1>
                <p className="text-xs font-bold text-content-secondary mt-1">Pantau seluruh pesanan. Order Pending dapat dibayar atau dibatalkan, order Selesai dapat dicetak resinya.</p>
              </div>
            </div>

            <TrackingTabs
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalOrders={totalOrders}
            />

            <OrderTrackingList
              orders={orders}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              onOrderClick={handleOrderClick}
              formatRupiah={formatRupiah}
            />
          </div>

          <OrderDetailModal
            isOpen={!!selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
            order={orderDetail}
            isLoading={isDetailLoading}
            formatRupiah={formatRupiah}
            onPrint={handlePrintReceipt}
            onPay={handlePay}
            onRequestCancel={() => setIsCancelOpen(true)}
          />

          <ConfirmationModal
            isOpen={isCancelOpen}
            onClose={() => setIsCancelOpen(false)}
            title="Batalkan Pesanan"
            message={`Yakin membatalkan pesanan ${orderDetail?.orderNo ?? ''}? Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Ya, Batalkan"
            loadingText="Membatalkan..."
            isLoading={cancelOrder.isPending}
            closeOnConfirm={false}
            withNotes
            notesLabel="Catatan Pembatalan (opsional)"
            notesPlaceholder="Contoh: pelanggan batal pesan"
            notesValue={cancelNotes}
            onNotesChange={setCancelNotes}
            onConfirm={handleConfirmCancel}
          />
        </MainLayout>
      </div>

      {/* Area struk (hanya tampil saat print) */}
      <div className="hidden print:block w-full h-full bg-white absolute inset-0 z-[9999]">
        {orderDetail && (
          <ThermalReceipt
            cart={orderDetailToCart(orderDetail)}
            subTotal={orderDetail.subtotal}
            tax={orderDetail.taxAmount}
            serviceCharge={orderDetail.serviceCharge}
            discountAmount={orderDetail.discountAmount}
            loyaltyPointsUsed={0}
            grandTotal={orderDetail.totalAmount}
            formatRupiah={formatRupiah}
            paymentMethod="-"
            appliedPromo={null}
            customerName={orderDetail.ordererName}
            orderNumber={orderDetail.queueNo}
            orderType={ORDER_TYPE_LABEL[orderDetail.type] ?? orderDetail.type}
            orderId={orderDetail.orderNo}
            transactionTime={new Date(orderDetail.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
          />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; }
          body, html { height: auto !important; overflow: visible !important; background: white !important; }
          #root { display: block !important; }
        }
      `}} />
    </>
  );
};
