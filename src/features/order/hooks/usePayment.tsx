import { useState, useEffect } from 'react';

interface UsePaymentProps {
  grandTotal: number;
  paymentMethod: string;
}

export const usePayment = ({ grandTotal, paymentMethod }: UsePaymentProps) => {
  const [receivedAmount, setReceivedAmount] = useState<number | ''>('');
  const [virtualAccountCode, setVirtualAccountCode] = useState('');
  const [transactionTime, setTransactionTime] = useState('');
  const [orderId, setOrderId] = useState('');
  
  // State baru untuk mengontrol loading transisi
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const randomCode = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    setVirtualAccountCode(randomCode);

    const now = new Date();
    setTransactionTime(now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB');

    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }).replace(/\//g, '');
    setOrderId(`ORD-${today}-${randomChars}`);
  }, []);

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    setReceivedAmount(val === '' ? '' : Number(val));
  };

  const handleQuickAmount = (amount: number) => setReceivedAmount(amount);
  const resetAmount = () => setReceivedAmount('');

  const isCashValid = typeof receivedAmount === 'number' && receivedAmount >= grandTotal;
  const canConfirm = paymentMethod === 'Cash' ? isCashValid : true;
  const cashChange = typeof receivedAmount === 'number' && receivedAmount > grandTotal ? receivedAmount - grandTotal : 0;

  const isEWallet = ['GoPay', 'OVO', 'ShopeePay', 'QRIS'].includes(paymentMethod);
  const isTransferVA = ['BCA', 'Mandiri'].includes(paymentMethod);
  const isEDC = paymentMethod === 'Debit';

  return {
    receivedAmount, virtualAccountCode, transactionTime, orderId, 
    isProcessing, setIsProcessing,
    isCashValid, canConfirm, cashChange, isEWallet, isTransferVA, isEDC,
    handleCashInput, handleQuickAmount, resetAmount
  };
};