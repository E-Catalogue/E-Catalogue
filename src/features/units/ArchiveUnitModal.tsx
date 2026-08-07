import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import type { Unit } from './unit.types';
import { useArchiveUnit } from './unit.hooks';
import { unitDisplayName } from './unit.display';
import { Archive, AlertCircle } from 'lucide-react';

interface ArchiveUnitModalProps {
  open: boolean;
  unit: Unit | null;
  onClose: () => void;
}

export const ArchiveUnitModal: React.FC<ArchiveUnitModalProps> = ({ open, unit, onClose }) => {
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const archiveUnit = useArchiveUnit();

  if (!unit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Alasan pengarsipan wajib diisi');
      return;
    }
    setErrorMessage(null);
    archiveUnit.mutate(
      { id: unit.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || err.message || 'Gagal mengarsipkan unit');
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Arsipkan Unit" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 text-amber-800 bg-amber-50 rounded-lg dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
          <Archive className="w-5 h-5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Pengarsipan Unit (Non-Keuangan)</p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Unit <span className="font-semibold">{unitDisplayName(unit)} ({unit.platNomor})</span> akan disembunyikan dari inventori dan katalog publik. <strong>Kas, transaksi pembelian, agreement, maupun saldo investor tidak akan diubah atau dibalik.</strong>
            </p>
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
            label="Alasan Pengarsipan"
            required
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            placeholder="Contoh: Unit rusak berat, hilang dokumen, atau dipindahkan ke keperluan internal"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={archiveUnit.isPending}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={archiveUnit.isPending}>
            Arsipkan Unit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
