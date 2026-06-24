import { useState } from 'react';
import { customerApi } from '../api/customer.api';

export const POINT_CONVERSION_RATE = 1;

export interface ExtendedCustomerInfo {
  customerType: 'Guest' | 'Member';
  orderType: 'Dine In' | 'Take Away';
  customerName: string;
  orderNumber: string;
  customerPhone: string;
  isMemberValidated: boolean;
  customerProfileId: string | null;
  loyaltyPointsAvailable: number;
  loyaltyPointsUsed: number;
}

export const useCheckout = (onProceed: () => void) => {
  const [formData, setFormData] = useState<ExtendedCustomerInfo>({
    customerType: 'Guest',
    orderType: 'Dine In',
    customerName: '',
    orderNumber: '',
    customerPhone: '',
    isMemberValidated: false,
    customerProfileId: null,
    loyaltyPointsAvailable: 0,
    loyaltyPointsUsed: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExtendedCustomerInfo, string>>>({});
  const [isCheckingMember, setIsCheckingMember] = useState(false);

  // --- STATE KHUSUS MODAL LOYALTY ---
  const [loyaltyInput, setLoyaltyInput] = useState<string>('');
  const [loyaltyError, setLoyaltyError] = useState<string>('');

  const handleChangeOrderType = (type: 'Dine In' | 'Take Away') => {
    setFormData(prev => ({
      ...prev,
      orderType: type,
      orderNumber: type === 'Take Away' ? `A-${Math.floor(Math.random() * 100) + 1}` : ''
    }));
    setErrors(prev => ({ ...prev, orderNumber: undefined }));
  };

  const handleChangeCustomerType = (type: 'Guest' | 'Member') => {
    setFormData(prev => ({
      ...prev,
      customerType: type,
      customerName: '',
      customerPhone: '',
      isMemberValidated: false,
      customerProfileId: null,
      loyaltyPointsAvailable: 0,
      loyaltyPointsUsed: 0,
    }));
    setErrors({});
    setLoyaltyInput('');
  };

  const handleChange = (field: keyof ExtendedCustomerInfo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    
    if (field === 'customerPhone' && formData.isMemberValidated) {
      setFormData(prev => ({ ...prev, isMemberValidated: false, customerProfileId: null, customerName: '', loyaltyPointsAvailable: 0, loyaltyPointsUsed: 0 }));
      setLoyaltyInput('');
    }
  };

  const handleCheckMember = async () => {
    if (!formData.customerPhone) {
      setErrors({ customerPhone: 'Nomor telepon wajib diisi untuk cek member.' });
      return;
    }
    setIsCheckingMember(true);
    setErrors({});

    try {
      const member = await customerApi.checkByPhone(formData.customerPhone);

      if (member && member.id) {
        setFormData(prev => ({
          ...prev,
          isMemberValidated: true,
          customerProfileId: member.id,
          customerName: member.fullName || prev.customerName || 'Member',
          // Catatan: backend belum mengirim saldo poin; loyaltyPointsAvailable tetap 0.
        }));
      } else {
        setErrors({ customerPhone: 'Nomor tidak terdaftar sebagai member.' });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = status === 404
        ? 'Nomor tidak terdaftar sebagai member.'
        : (err?.response?.data?.message || err?.response?.data?.error || 'Gagal memeriksa member. Coba lagi.');
      setErrors({ customerPhone: message });
    } finally {
      setIsCheckingMember(false);
    }
  };

  // ==========================================
  // KUMPULAN LOGIKA LOYALTY POINTS (TERISOLASI)
  // ==========================================
  
  // 1. Inisialisasi saat modal dibuka
  const initLoyaltyInput = () => {
    setLoyaltyInput(formData.loyaltyPointsUsed > 0 ? formData.loyaltyPointsUsed.toString() : '');
    setLoyaltyError('');
  };

  // 2. Ketikan Manual User
  const handleLoyaltyInputChange = (value: string) => {
    setLoyaltyInput(value);
    if (loyaltyError) setLoyaltyError('');
  };

  // 3. Tombol Preset (25%, 50%, 75%, Semua)
  const handleSetLoyaltyPreset = (percentage: number, baseGrandTotal: number) => {
    const maxPointsByBill = Math.floor(baseGrandTotal / POINT_CONVERSION_RATE);
    const limit = Math.min(formData.loyaltyPointsAvailable, maxPointsByBill);
    
    // Hitung persentasenya
    const points = Math.floor(limit * percentage);
    setLoyaltyInput(points.toString());
    setLoyaltyError('');
  };

  // 4. Proses Validasi & Apply Poin
  const handleApplyLoyalty = (baseGrandTotal: number, onSuccess: () => void) => {
    const points = parseInt(loyaltyInput || '0', 10);
    const maxPointsByBill = Math.floor(baseGrandTotal / POINT_CONVERSION_RATE);

    if (isNaN(points) || points < 0) {
      setLoyaltyError('Format poin tidak valid.');
      return;
    }
    if (points > formData.loyaltyPointsAvailable) {
      setLoyaltyError(`Poin tidak cukup. Sisa poin: ${formData.loyaltyPointsAvailable.toLocaleString('id-ID')}`);
      return;
    }
    if (points > maxPointsByBill) {
      setLoyaltyError(`Maksimal poin untuk tagihan ini: ${maxPointsByBill.toLocaleString('id-ID')} Poin`);
      return;
    }

    setFormData(prev => ({ ...prev, loyaltyPointsUsed: points }));
    onSuccess();
  };

  // 5. Batal Tukar
  const handleCancelLoyalty = (onSuccess: () => void) => {
    setFormData(prev => ({ ...prev, loyaltyPointsUsed: 0 }));
    setLoyaltyInput('');
    setLoyaltyError('');
    onSuccess();
  };

  // ==========================================

  const handleProcessPayment = () => {
    let hasError = false;
    const newErrors: any = {};

    if (!formData.customerName) { newErrors.customerName = 'Nama pemesan wajib diisi'; hasError = true; }
    if (!formData.orderNumber) { newErrors.orderNumber = 'Nomor Meja/Antrean wajib diisi'; hasError = true; }
    if (formData.customerType === 'Member' && !formData.isMemberValidated) {
      newErrors.customerPhone = 'Silakan validasi member terlebih dahulu'; hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onProceed();
  };

  return {
    formData,
    errors,
    isCheckingMember,
    handleChange,
    handleChangeOrderType,
    handleChangeCustomerType,
    handleCheckMember,
    handleProcessPayment,
    loyaltyState: {
      input: loyaltyInput,
      error: loyaltyError,
    },
    loyaltyHandlers: {
      onInit: initLoyaltyInput,
      onChangeInput: handleLoyaltyInputChange,
      onSetPreset: handleSetLoyaltyPreset,
      onApply: handleApplyLoyalty,
      onCancel: handleCancelLoyalty,
    }
  };
};