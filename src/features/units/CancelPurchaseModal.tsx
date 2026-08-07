import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import type { Unit } from './unit.types';
import { useCancelPurchaseUnit } from './unit.hooks';
import { unitDisplayName } from './unit.display';
import { AlertOctagon, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/core/utils/format';

interface CancelPurchaseModalProps {
  open: boolean;
  unit: Unit | null;
  onClose: () => void;
}

export const CancelPurchaseModal: React.FC<CancelPurchaseModalProps> = ({ open, unit, onClose }) => {
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cancelPurchase = useCancelPurchaseUnit();

  if (!unit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Alasan pembatalan pembelian wajib diisi');
      return;
    }
    setErrorMessage(null);
    cancelPurchase.mutate(
      { id: unit.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || err.message || 'Gagal membatalkan pembelian unit');
        },
      }
    );
  };

  const isInvestorFunded = unit.fundingAgreement?.fundingSource === 'INVESTOR';

  return (
    <Modal open={open} onClose={onClose} title="Batalkan Pembelian Unit" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 text-red-800 bg-red-50 rounded-lg dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
          <AlertOctagon className="w-5 h-5 mt-0.5 text-red-600 dark:text-red-400 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Pembatalan Pembelian & Reversal Keuangan</p>
            <p className="mt-1 text-xs text-red-700 dark:text-red-400">
              Tindakan ini akan membatalkan pembelian unit <span className="font-semibold">{unitDisplayName(unit)} ({unit.platNomor})</span> senilai <span className="font-semibold">{formatCurrency(unit.purchaseCost)}</span>.
            </p>
            <ul className="mt-2 text-xs space-y-1 list-disc list-inside">
              <li>Mencatat transaksi <strong>Reversal Kas OUT</strong> pada akun kas pembelian.</li>
              {isInvestorFunded && (
                <li>Melepaskan alokasi modal investor (<strong>Allocated → Available</strong>) dan menandai histori usage sebagai dibalik.</li>
              )}
              <li>Mengubah status agreement pendanaan menjadi <strong>CANCELLED</strong>.</li>
            </ul>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <TextField
            label="Alasan Pembatalan Pembelian"
            required
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            placeholder="Contoh: Pembelian dibatalkan oleh penjual / salah input data transaksi"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={cancelPurchase.isPending}>
            Batal
          </Button>
          <Button type="submit" variant="danger" loading={cancelPurchase.isPending} icon={<RefreshCw className="w-4 h-4" />}>
            Batalkan Pembelian & Reverse Kas
          </Button>
        </div>
      </form>
    </Modal>
  );
};
