import { useMemo, useState } from 'react';
import { CheckCircle2, Landmark, Plus, Save, Trash2 } from 'lucide-react';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { notifyApiError } from '@/core/api/notify';
import { formatCurrency } from '@/core/utils/format';
import { Button } from '@/shared/components/ui/Button';
import { NumericField } from '@/shared/components/ui/Field';
import { Modal } from '@/shared/components/ui/Modal';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { unitDisplayName } from './unit.display';
import { useUnitLookups, useUpdateUnit } from './unit.hooks';
import type { Unit, UnitLeasingOfferInput } from './unit.types';

interface UnitLeasingModalProps {
  open: boolean;
  onClose: () => void;
  unit: Unit;
}

export const UnitLeasingModal = ({ open, onClose, unit }: UnitLeasingModalProps) => {
  const [offers, setOffers] = useState<UnitLeasingOfferInput[]>(() =>
    unit.leasingOffers?.map(({ leasingId, tenorMonths, dpAmount }) => ({ leasingId, tenorMonths, dpAmount })) ?? [],
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: lookupsData, isLoading } = useUnitLookups(open);
  const updateUnit = useUpdateUnit();
  const leasings = useMemo(() => lookupsData?.data.leasings ?? [], [lookupsData]);

  const completeOffers = offers.filter((offer) => offer.leasingId);
  const offerKeys = completeOffers.map((offer) => `${offer.leasingId}:${offer.tenorMonths}`);
  const validationError = offers.some((offer) => !offer.leasingId || offer.tenorMonths < 1)
    ? 'Lengkapi leasing dan tenor pada setiap baris.'
    : new Set(offerKeys).size !== offerKeys.length
      ? 'Leasing dan tenor yang sama tidak boleh diduplikasi.'
      : null;

  const updateOffer = (index: number, patch: Partial<UnitLeasingOfferInput>) => {
    setShowSuccess(false);
    setOffers((current) => current.map((offer, offerIndex) => offerIndex === index ? { ...offer, ...patch } : offer));
  };

  const save = () => {
    if (validationError) return;
    updateUnit.mutate(
      { id: unit.id, data: { leasingOffers: offers } },
      {
        onSuccess: (res) => {
          store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message: 'Data leasing berhasil disimpan' }));
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 4000);
          if (res?.data?.leasingOffers) {
            setOffers(res.data.leasingOffers.map(({ leasingId, tenorMonths, dpAmount }) => ({ leasingId, tenorMonths, dpAmount })));
          }
        },
        onError: (error) => notifyApiError(error),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Data Leasing ${unitDisplayName(unit)}`}
      subtitle={unit.platNomor}
      icon={<Landmark size={20} />}
      size="xl"
      busy={updateUnit.isPending}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateUnit.isPending}>Tutup</Button>
          <Button type="button" icon={<Save size={15} />} onClick={save} loading={updateUnit.isPending} disabled={!!validationError}>
            Simpan Data Leasing
          </Button>
        </>
      )}
    >
      <div className="space-y-3">
        {showSuccess && (
          <div className="p-3 bg-accent-green/10 border border-accent-green/30 text-accent-green text-[12px] font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Data leasing berhasil disimpan! Anda dapat melanjutkan menambah atau mengubah data leasing lainnya.</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-[13px] font-extrabold text-ink">Daftar Pencairan Leasing</p>
            <p className="text-[11px] font-semibold text-muted">Leasing yang sama boleh ditambahkan dengan tenor berbeda.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => setOffers((current) => [...current, { leasingId: '', tenorMonths: 12, dpAmount: 0 }])}
          >
            Tambah Leasing
          </Button>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft px-4 py-8 text-center">
            <Landmark size={24} className="mx-auto text-muted" />
            <p className="mt-2 text-[12px] font-bold text-ink">Belum ada penawaran leasing</p>
            <p className="mt-1 text-[11px] font-medium text-muted">Tambahkan keterangan leasing agar unit dapat diproses menjadi Ready Stock.</p>
          </div>
        ) : offers.map((offer, index) => {
          const disbursement = unit.otrPrice == null ? null : unit.otrPrice - offer.dpAmount;
          return (
            <div key={`${offer.leasingId}-${index}`} className="rounded-2xl border border-border bg-surface-soft p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_.7fr_1fr_auto] gap-3 items-end">
                <SearchableSelect
                  label={`Leasing ${index + 1}`}
                  required
                  value={offer.leasingId}
                  onChange={(value) => updateOffer(index, { leasingId: value })}
                  options={leasings.map((item) => ({ value: item.id, label: item.name, sublabel: item.code }))}
                  loading={isLoading}
                  placeholder="Pilih leasing"
                  searchPlaceholder="Cari leasing..."
                />
                <NumericField label="Tenor" required thousands={false} value={offer.tenorMonths} onChange={(value) => updateOffer(index, { tenorMonths: value })} min={1} max={120} suffix="bulan" />
                <NumericField label="DP" required value={offer.dpAmount} onChange={(value) => updateOffer(index, { dpAmount: value })} min={0} prefix="Rp" />
                <button
                  type="button"
                  onClick={() => setOffers((current) => current.filter((_, offerIndex) => offerIndex !== index))}
                  aria-label={`Hapus leasing ${index + 1}`}
                  className="h-11 w-11 rounded-xl border border-border bg-surface text-muted hover:text-semantic-error hover:border-semantic-error/40 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl bg-surface border border-border px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-muted">Harga OTR Unit</p>
                  <p className="text-[12px] font-extrabold text-ink mt-0.5">{unit.otrPrice == null ? 'Menunggu finalisasi harga' : formatCurrency(unit.otrPrice)}</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 ${disbursement != null && disbursement < 0 ? 'bg-semantic-error/8 border-semantic-error/30' : 'bg-surface border-border'}`}>
                  <p className="text-[10px] font-bold uppercase text-muted">Pencairan</p>
                  <p className={`text-[12px] font-extrabold mt-0.5 ${disbursement != null && disbursement < 0 ? 'text-semantic-error' : 'text-primary'}`}>
                    {disbursement == null ? 'Menunggu finalisasi harga' : formatCurrency(disbursement)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {validationError && <p className="text-[11px] font-semibold text-semantic-error">{validationError}</p>}
      </div>
    </Modal>
  );
};
