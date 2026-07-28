import { useState } from 'react';
import { BadgeCheck, Calendar, Car, CheckCircle, Cog, Fuel, Gauge, Hash, Palette, Pencil, Receipt, Save, TrendingUp } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { usePermissions } from '@/features/auth/usePermissions';
import { UnitGalleryManager } from './UnitGalleryManager';
import { BAHAN_BAKAR_LABEL, FINAL_CYCLE_POLICY_DESCRIPTION, FINAL_CYCLE_POLICY_LABEL, type FinalCyclePolicy, type Unit } from '@/features/units/unit.types';
import { unitDisplayName } from '@/features/units/unit.display';
import { formatCurrency, formatNumber } from '@/core/utils/format';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { API_ORIGIN } from '@/core/api/client';
import { notifyApiError } from '@/core/api/notify';
import { getApiErrorCode } from '@/core/api/apiError';
import { useFinalizeInitialPricing, useUnit, useUnitImageMutations, useUpdateUnitFunding } from './unit.hooks';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import { SelectField } from '@/shared/components/ui/Field';
import { InvestorFundingPanel } from '@/features/investor-funding/InvestorFundingPanel';

interface UnitDetailModalProps {
  open: boolean;
  onClose: () => void;
  unit: Unit | null;
  onEdit?: (unit: Unit) => void;
}

const Spec = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft">
    <div className="w-9 h-9 rounded-lg bg-surface text-primary flex items-center justify-center shrink-0 border border-border">
      <Icon size={16} strokeWidth={2.3} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[13px] font-extrabold text-ink truncate">{value}</p>
    </div>
  </div>
);

export const UnitDetailModal = ({ open, onClose, unit, onEdit }: UnitDetailModalProps) => {
  const { data: detailRes, refetch: refetchUnit } = useUnit(open ? unit?.id : undefined);
  const current = detailRes?.data ?? unit;
  const imageMutations = useUnitImageMutations(current?.id ?? '');
  const finalizePricing = useFinalizeInitialPricing();
  const updateFunding = useUpdateUnitFunding();
  const confirmAction = useConfirmedAction();
  const { can } = usePermissions();
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [confirmNoRekondisi, setConfirmNoRekondisi] = useState(false);
  const [cyclePolicy, setCyclePolicy] = useState<FinalCyclePolicy | ''>('');

  if (!current) return null;

  const images = [...(current.unitImages ?? [])].sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
  const mainImage = images.find((img) => img.isMain) ?? images[0];
  const otrPrice = current.otrPrice ?? null;
  const targetPrice = current.targetPrice ?? null;
  const marginBase = targetPrice ?? otrPrice;
  const hpp = current.pricingCostBasis ?? null;
  const margin = hpp && marginBase && marginBase > hpp ? marginBase - hpp : null;
  const canFinalizePricing = !current.pricingFinalizedAt && can('UNIT_PRICING_FINALIZE');
  const funding = current.fundingAgreement;
  const isFixedMonthlyInvestor = funding?.fundingSource === 'INVESTOR' && funding.scheme === 'FIXED_MONTHLY';
  const canEditCyclePolicy = isFixedMonthlyInvestor && funding.status === 'DRAFT' && can('UNIT_FUNDING_MANAGE');
  const selectedCyclePolicy = cyclePolicy || funding?.finalCyclePolicy || '';

  const handleFinalizePricing = () => {
    finalizePricing.mutate(
      { id: current.id, data: { confirmNoInitialReconditioning: confirmNoRekondisi } },
      {
        onSuccess: () => { setConfirmFinalize(false); setConfirmNoRekondisi(false); },
        onError: (err) => notifyApiError(err),
      },
    );
  };

  const imageUrl = mainImage
    ? `${API_ORIGIN}/public/unit/${mainImage.filename}`
    : DEFAULT_CAR_IMAGE;

  const isNew = new Date().getTime() - new Date(current.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const deleteImage = (imageId: string) => confirmAction({
    title: 'Hapus Foto Unit',
    message: 'Foto ini akan dihapus permanen dari unit. Lanjutkan?',
    confirmLabel: 'Hapus Foto',
    tone: 'danger',
    execute: () => imageMutations.remove.mutateAsync(imageId),
    onError: notifyApiError,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      icon={<Car size={20} />}
      title={unitDisplayName(current)}
      subtitle={`${[current.merek?.name, current.tipe?.name].filter(Boolean).join(' ') || '—'} · ${current.platNomor}`}
      busy={imageMutations.uploadMany.isPending || imageMutations.reorder.isPending || imageMutations.remove.isPending || imageMutations.setMain.isPending || finalizePricing.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          {onEdit && <Button icon={<Pencil size={15} />} onClick={() => onEdit(current)}>Edit Unit</Button>}
        </>
      }
    >
      {/* Ringkasan: hero + info harga & spesifikasi utama */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-soft border border-border">
          <img
            src={imageUrl}
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CAR_IMAGE; }}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {isNew && <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-glow">Baru</span>}
            <span className="bg-surface/90 backdrop-blur text-ink text-[10px] font-bold px-2.5 py-1 rounded-lg">{current.platNomor}</span>
          </div>
          <div className="absolute top-3 right-3"><StatusBadge status={current.statusUnit} /></div>
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-ink/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg">{images.length} foto</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary p-4 text-white shadow-glow">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">OTR</p>
              <p className="text-2xl font-extrabold leading-tight mt-1">{otrPrice ? formatCurrency(otrPrice, { compact: true }) : '-'}</p>
            </div>
            <div className="rounded-2xl bg-surface-soft border border-border p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Target</p>
              <p className="text-2xl font-extrabold text-ink leading-tight mt-1">{targetPrice ? formatCurrency(targetPrice, { compact: true }) : '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Spec icon={Calendar} label="Tahun" value={`${current.tahun}`} />
            <Spec icon={Gauge} label="Kilometer" value={`${formatNumber(current.kilometer)} KM`} />
            <Spec icon={Cog} label="Transmisi" value={current.transmisi === 'AUTOMATIC' ? 'Automatic (AT)' : 'Manual (MT)'} />
            <Spec icon={Fuel} label="Bahan Bakar" value={current.bahanBakar ? BAHAN_BAKAR_LABEL[current.bahanBakar] : '-'} />
          </div>
        </div>
      </div>

      {/* Spesifikasi & biaya lengkap */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4">
        <Spec icon={Receipt} label="Pajak" value={current.tanggalPajak ? new Date(current.tanggalPajak).toLocaleDateString('id-ID') : '-'} />
        <Spec icon={Palette} label="Warna" value={current.warna || '-'} />
        <Spec icon={Hash} label="Plat" value={current.platNomor || '-'} />
        {current.purchaseCost ? <Spec icon={TrendingUp} label="Harga Beli" value={formatCurrency(current.purchaseCost, { compact: true })} /> : null}
        {hpp ? <Spec icon={TrendingUp} label="HPP" value={formatCurrency(hpp, { compact: true })} /> : null}
        {margin !== null ? <Spec icon={TrendingUp} label="Est. Margin" value={formatCurrency(margin, { compact: true })} /> : null}
      </div>

      <div className="mt-5 border-t border-divider pt-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[13px] font-extrabold text-ink">Pendanaan &amp; Harga Awal</p>
            <p className="text-[11px] font-semibold text-muted">
              {current.fundingAgreement?.fundingSource === 'INVESTOR'
                ? `Investor: ${current.fundingAgreement.investor?.name ?? '-'} (${current.fundingAgreement.status})`
                : 'Milik perusahaan'}
              {current.pricingFinalizedAt ? ` · Difinalisasi ${new Date(current.pricingFinalizedAt).toLocaleDateString('id-ID')}` : ' · Belum difinalisasi'}
            </p>
          </div>
          {canFinalizePricing && (
            <Button size="sm" icon={<BadgeCheck size={14} />} onClick={() => setConfirmFinalize(true)}>
              Finalisasi Harga
            </Button>
          )}
        </div>
        {isFixedMonthlyInvestor && (
          <div className="rounded-2xl border border-border bg-surface-soft p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <SelectField
                label="Tipe Pembayaran Investor"
                value={selectedCyclePolicy}
                disabled={!canEditCyclePolicy}
                wrapClass="flex-1"
                onChange={(event) => setCyclePolicy(event.target.value as FinalCyclePolicy)}
                options={(['FULL', 'PRORATA', 'NONE'] as FinalCyclePolicy[]).map((value) => ({ value, label: FINAL_CYCLE_POLICY_LABEL[value] }))}
              />
              {canEditCyclePolicy && (
                <Button
                  size="sm"
                  icon={<Save size={14} />}
                  loading={updateFunding.isPending}
                  disabled={!selectedCyclePolicy || selectedCyclePolicy === funding.finalCyclePolicy}
                  onClick={() => updateFunding.mutate({ id: current.id, data: { finalCyclePolicy: selectedCyclePolicy as FinalCyclePolicy }, headers: current.branchId ? { 'X-Branch-Id': current.branchId } : undefined }, { onSuccess: () => setCyclePolicy(''), onError: (error) => { if (getApiErrorCode(error) === 'UNIT_FUNDING_NOT_EDITABLE') { setCyclePolicy(''); void refetchUnit(); } notifyApiError(error); } })}
                >Simpan Tipe</Button>
              )}
            </div>
            <p className="mt-2 text-[11px] font-semibold text-muted">
              {selectedCyclePolicy ? FINAL_CYCLE_POLICY_DESCRIPTION[selectedCyclePolicy as FinalCyclePolicy] : 'Belum ditentukan.'}
            </p>
          </div>
        )}
      </div>

      {can('UNIT_FUNDING_READ') && (
        <InvestorFundingPanel
          resourceType="UNIT_PURCHASE"
          resourceId={current.id}
          branchId={current.branchId}
          paid={!!current.purchaseCashTransactionId}
          canAllocate={can('UNIT_FUNDING_MANAGE')}
          fundingSource={current.fundingAgreement?.fundingSource}
        />
      )}

      <div className="mt-5 border-t border-divider pt-4">
        <div className="mb-3">
          <p className="text-[13px] font-extrabold text-ink">Galeri Unit</p>
          <p className="text-[11px] font-semibold text-muted">Upload beberapa foto sekaligus, urutkan, dan pilih gambar utama</p>
        </div>
        <UnitGalleryManager
          images={images}
          uploading={imageMutations.uploadMany.isPending}
          reordering={imageMutations.reorder.isPending}
          deleting={imageMutations.remove.isPending}
          settingMain={imageMutations.setMain.isPending}
          onUpload={(files, mainIndex) => imageMutations.uploadMany.mutateAsync({ files, mainIndex }).catch((err) => { notifyApiError(err); throw err; })}
          onReorder={(next) => imageMutations.reorder.mutate(next, { onError: (err) => notifyApiError(err) })}
          onSetMain={(imageId) => imageMutations.setMain.mutate(imageId, { onError: (err) => notifyApiError(err) })}
          onDelete={deleteImage}
          emptyHint="Belum ada gambar unit"
        />
      </div>

      <ConfirmDialog
        open={confirmFinalize}
        onClose={() => setConfirmFinalize(false)}
        onConfirm={handleFinalizePricing}
        closeOnConfirm={false}
        loading={finalizePricing.isPending}
        tone="primary"
        icon={CheckCircle}
        title="Finalisasi Harga Awal"
        confirmLabel="Ya, Finalisasi"
        message={`Harga beli Rp ${formatNumber(current.purchaseCost)} ditambah rekondisi pertama akan dikunci sebagai basis HPP, lalu target dan OTR dihitung dari pricing policy cabang. Tindakan ini tidak dapat dibatalkan.`}
      >
        <label className="mt-3 flex items-start gap-2.5 text-[12px] font-semibold text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={confirmNoRekondisi}
            onChange={(e) => setConfirmNoRekondisi(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Unit ini tidak memiliki rekondisi pertama — lanjutkan tanpa rekondisi.
        </label>
      </ConfirmDialog>
    </Modal>
  );
};
