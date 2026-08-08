import { useState } from 'react';
import { AlertTriangle, BadgeCheck, Building2, Calendar, Car, CheckCircle, Cog, Fuel, Gauge, Hash, MapPin, Palette, Pencil, Receipt, Repeat2, Save, Share2, TrendingUp } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { usePermissions } from '@/features/auth/usePermissions';
import { UnitGalleryManager } from './UnitGalleryManager';
import { BAHAN_BAKAR_LABEL, FINAL_CYCLE_POLICY_DESCRIPTION, FINAL_CYCLE_POLICY_LABEL, type FinalCyclePolicy, type PricingInputMode, type Unit } from '@/features/units/unit.types';
import { unitDisplayName } from '@/features/units/unit.display';
import { formatCurrency, formatDate, formatNumber } from '@/core/utils/format';
import { DEFAULT_CAR_IMAGE } from '@/shared/constants';
import { API_ORIGIN } from '@/core/api/client';
import { notifyApiError } from '@/core/api/notify';
import { getApiErrorCode } from '@/core/api/apiError';
import { useFinalizeInitialPricing, usePricingPreview, useReopenPricing, useUnit, useUnitImageMutations, useUpdateUnitFunding } from './unit.hooks';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import { NumericField, SelectField } from '@/shared/components/ui/Field';
import { DateField } from '@/shared/components/ui/DateField';
import { InvestorFundingPanel } from '@/features/investor-funding/InvestorFundingPanel';
import { buildUnitShareMessage, buildWhatsAppShareUrl } from '@/core/utils/whatsapp';
import { FundingCorrectionModal } from './FundingCorrectionModal';
import { HistoricalModeBadge } from '@/shared/components/ui/HistoricalModeBadge';

interface UnitDetailModalProps {
  open: boolean;
  onClose: () => void;
  unit: Unit | null;
  onEdit?: (unit: Unit) => void;
  salesView?: boolean;
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

export const UnitDetailModal = ({ open, onClose, unit, onEdit, salesView = false }: UnitDetailModalProps) => {
  const { data: detailRes, refetch: refetchUnit } = useUnit(open ? unit?.id : undefined);
  const current = detailRes?.data ?? unit;
  // Data dari daftar unit belum memuat `purchaseCashTransactionId`. Jangan
  // menyimpulkan pembayaran belum ada sebelum detail unit selesai dimuat.
  const paymentStatusKnown = detailRes?.data !== undefined;
  const imageMutations = useUnitImageMutations(current?.id ?? '');
  const finalizePricing = useFinalizeInitialPricing();
  const reopenPricing = useReopenPricing();
  const updateFunding = useUpdateUnitFunding();
  const confirmAction = useConfirmedAction();
  const { can } = usePermissions();
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [confirmNoRekondisi, setConfirmNoRekondisi] = useState(false);
  const [cyclePolicy, setCyclePolicy] = useState<FinalCyclePolicy | ''>('');
  const [targetMode, setTargetMode] = useState<PricingInputMode>('PERCENT');
  const [otrMode, setOtrMode] = useState<PricingInputMode>('PERCENT');
  const [targetValue, setTargetValue] = useState<number | null>(null);
  const [otrValue, setOtrValue] = useState<number | null>(null);
  const [selectedReconditioningIds, setSelectedReconditioningIds] = useState<string[]>([]);
  const [reopenDialog, setReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const todayBangkok = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  const [pricingFinalizedDate, setPricingFinalizedDate] = useState(todayBangkok());
  const [pricingBackdateReason, setPricingBackdateReason] = useState('');
  const [showPricingHistory, setShowPricingHistory] = useState(false);
  const [fundingCorrectionOpen, setFundingCorrectionOpen] = useState(false);
  // HPP berubah saat pilihan rekondisi berubah. Nilai Target/OTR dihitung lokal
  // agar mengetik nominal/persentase tidak memicu request, warning, atau flicker modal.
  const pricingPreview = usePricingPreview(confirmFinalize ? unit?.id : undefined, { selectedReconditioningIds }, unit?.branchId ? { 'X-Branch-Id': unit.branchId } : undefined);

  if (!current) return null;

  const images = [...(current.unitImages ?? [])].sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
  const equipmentNames = current.unitKelengkapans?.map((item) => item.perlengkapan?.name).filter(Boolean) as string[] | undefined;
  const documentNames = current.unitDokumens?.map((item) => item.dokumen?.name).filter(Boolean) as string[] | undefined;
  const mainImage = images.find((img) => img.isMain) ?? images[0];
  const otrPrice = current.otrPrice ?? null;
  const targetPrice = current.targetPrice ?? null;
  const hpp = current.pricingCostBasis ?? null;
  const margin = hpp !== null && otrPrice !== null ? otrPrice - hpp : null;
  const canFinalizePricing = current.statusUnit === 'INVENTORY' && !current.pricingFinalizedAt && can('UNIT_PRICING_FINALIZE');
  const funding = current.fundingAgreement;
  const isFixedMonthlyInvestor = funding?.fundingSource === 'INVESTOR' && funding.scheme === 'FIXED_MONTHLY';
  const canEditCyclePolicy = isFixedMonthlyInvestor && funding.status === 'DRAFT' && can('UNIT_FUNDING_MANAGE');
  const canCorrectFunding = can('UNIT_FUNDING_CORRECT') && current.historicalMode !== 'REFERENCE_ONLY' && current.statusUnit !== 'SOLD' && ['INVENTORY', 'READY_STOCK', 'HOLD'].includes(current.statusUnit);
  const selectedCyclePolicy = cyclePolicy || funding?.finalCyclePolicy || '';
  const previewData = pricingPreview.data?.data;
  const effectiveTargetValue = targetValue ?? previewData?.suggestedPricing.targetMarkupPercent ?? 0;
  const effectiveOtrValue = otrValue ?? previewData?.suggestedPricing.otrMarkupPercent ?? 0;
  const previewPrice = (mode: PricingInputMode, value: number) => !previewData ? 0 : mode === 'AMOUNT'
    ? value
    : Math.round(previewData.pricingCostBasis * (1 + value / 100) * 100) / 100;
  const pricingValid = !!previewData && previewPrice(otrMode, effectiveOtrValue) >= previewPrice(targetMode, effectiveTargetValue) && previewPrice(targetMode, effectiveTargetValue) >= previewData.pricingCostBasis;
  const reconditioningReady = !!previewData && (selectedReconditioningIds.length > 0 || confirmNoRekondisi);
  const pricingBackdated = pricingFinalizedDate < todayBangkok();
  const pricingDateValid = !pricingBackdated || (can('TRANSACTION_BACKDATE') && (current.historicalMode === 'POST_LEDGER' || pricingBackdateReason.trim().length >= 5));

  const handleFinalizePricing = () => {
    finalizePricing.mutate(
      {
        id: current.id,
        headers: current.branchId ? { 'X-Branch-Id': current.branchId } : undefined,
        data: {
          confirmNoInitialReconditioning: confirmNoRekondisi,
          selectedReconditioningIds,
          target: { mode: targetMode, value: effectiveTargetValue },
          otr: { mode: otrMode, value: effectiveOtrValue },
          ...(can('TRANSACTION_BACKDATE') ? { finalizedAt: `${pricingFinalizedDate}T00:00:00+07:00`, ...(pricingBackdated && pricingBackdateReason.trim() ? { backdateReason: pricingBackdateReason.trim() } : {}) } : {}),
        },
      },
      {
        onSuccess: () => { setConfirmFinalize(false); setConfirmNoRekondisi(false); },
        onError: (err) => notifyApiError(err),
      },
    );
  };

  const handleReopenPricing = () => {
    reopenPricing.mutate(
      { id: current.id, data: { reason: reopenReason.trim() }, headers: current.branchId ? { 'X-Branch-Id': current.branchId } : undefined },
      { onSuccess: () => { setReopenDialog(false); setReopenReason(''); }, onError: (error) => notifyApiError(error) },
    );
  };

  const handleShare = () => {
    const target = window.open('about:blank', '_blank');
    if (target) target.opener = null;
    refetchUnit().then((result) => {
      const fresh = result.data?.data ?? current;
      const url = buildWhatsAppShareUrl(buildUnitShareMessage(fresh));
      if (target) target.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    }).catch((error) => { target?.close(); notifyApiError(error); });
  };

  const imageUrl = mainImage
    ? `${API_ORIGIN}/public/unit/${mainImage.filename}`
    : DEFAULT_CAR_IMAGE;

  const isNew = new Date().getTime() - new Date(current.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const usesCardStatus = salesView && (current.statusUnit === 'INVENTORY' || current.statusUnit === 'HOLD');
  const visibleStatus = usesCardStatus ? 'INVENTORY' : current.statusUnit;
  const visibleStatusLabel = usesCardStatus ? 'Coming Soon' : undefined;
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
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.97] bg-[#25D366] text-white hover:bg-[#20ba59] shadow-sm"
          >
            <Share2 size={15} /> Bagikan WhatsApp
          </button>
          {!salesView && onEdit && current.statusUnit === 'INVENTORY' && current.historicalMode !== 'REFERENCE_ONLY' && <Button icon={<Pencil size={15} />} onClick={() => onEdit(current)}>Edit Unit</Button>}
          {!salesView && canCorrectFunding && <Button variant="secondary" icon={<Repeat2 size={15} />} onClick={() => setFundingCorrectionOpen(true)}>Koreksi Investor</Button>}
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-soft px-4 py-3 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Status &amp; Cabang</p>
          <p className="mt-0.5 text-[12px] font-semibold text-ink flex items-center gap-1.5">
            {current.branch ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <MapPin size={13} className="shrink-0" /> {current.branch.nama}
              </span>
            ) : (
              'Ketersediaan unit saat ini'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HistoricalModeBadge mode={current.historicalMode} />
          <StatusBadge status={visibleStatus} label={visibleStatusLabel} />
        </div>
      </div>
      {current.historicalMode && current.historicalReason && (
        <div className="mb-4 rounded-xl border border-border bg-surface-soft px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Alasan Data Histori</p>
          <p className="mt-1 text-[12px] font-semibold leading-relaxed text-ink-soft">{current.historicalReason}</p>
        </div>
      )}

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
        <Spec icon={Building2} label="Cabang" value={current.branch?.nama || '-'} />
        <Spec icon={Receipt} label="Tanggal Pajak" value={formatDate(current.tanggalPajak)} />
        <Spec icon={Palette} label="Warna" value={current.warna || '-'} />
        <Spec icon={Hash} label="Plat" value={current.platNomor || '-'} />
        {!salesView && current.purchaseCost ? <Spec icon={TrendingUp} label="Harga Beli" value={formatCurrency(current.purchaseCost, { compact: true })} /> : null}
        {!salesView && hpp ? <Spec icon={TrendingUp} label="HPP" value={formatCurrency(hpp, { compact: true })} /> : null}
        {!salesView && margin !== null ? <Spec icon={TrendingUp} label="Estimasi Margin OTR" value={formatCurrency(margin, { compact: true })} /> : null}
      </div>

      {!salesView && <div className="mt-5 border-t border-divider pt-4">
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
            <Button size="sm" icon={<BadgeCheck size={14} />} onClick={() => { setTargetMode('PERCENT'); setOtrMode('PERCENT'); setTargetValue(null); setOtrValue(null); setSelectedReconditioningIds([]); setConfirmNoRekondisi(false); setConfirmFinalize(true); }}>
              Finalisasi Harga
            </Button>
          )}
          {current.statusUnit === 'INVENTORY' && current.pricingFinalizedAt && can('UNIT_PRICING_FINALIZE') && <Button size="sm" variant="secondary" onClick={() => setReopenDialog(true)} loading={reopenPricing.isPending}>Buka Finalisasi Harga</Button>}
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
                  onClick={() => updateFunding.mutate({ id: current.id, data: { fundingSource: 'INVESTOR', investorId: funding.investorId ?? undefined, finalCyclePolicy: selectedCyclePolicy as FinalCyclePolicy }, headers: current.branchId ? { 'X-Branch-Id': current.branchId } : undefined }, { onSuccess: () => setCyclePolicy(''), onError: (error) => { if (getApiErrorCode(error) === 'UNIT_FUNDING_NOT_EDITABLE') { setCyclePolicy(''); void refetchUnit(); } notifyApiError(error); } })}
                >Simpan Tipe</Button>
              )}
            </div>
            <p className="mt-2 text-[11px] font-semibold text-muted">
              {selectedCyclePolicy ? FINAL_CYCLE_POLICY_DESCRIPTION[selectedCyclePolicy as FinalCyclePolicy] : 'Belum ditentukan.'}
            </p>
          </div>
        )}
      </div>}

      {!salesView && (current.pricingRevisions?.length ?? 0) > 0 && (
        <div className="mt-5 border-t border-divider pt-4">
          <button
            type="button"
            onClick={() => setShowPricingHistory((value) => !value)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-soft px-3.5 py-3 text-left transition hover:border-primary/40 hover:bg-primary-light/30"
          >
            <span>
              <span className="block text-[13px] font-extrabold text-ink">Riwayat Harga</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-muted">{current.pricingRevisions?.length} revisi harga, HPP, dan rekondisi.</span>
            </span>
            <span className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-extrabold text-primary">{showPricingHistory ? 'Tutup' : 'Lihat'}</span>
          </button>

          {showPricingHistory && <div className="mt-3 space-y-3">
            {current.pricingRevisions?.map((revision, index) => {
              const active = !revision.reopenedAt && index === 0;
              return <div key={revision.id} className="relative rounded-2xl border border-border bg-surface p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-extrabold text-ink">Revisi #{revision.revisionNumber}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-muted">Difinalisasi {new Date(revision.finalizedAt).toLocaleString('id-ID')}</p>
                  </div>
                  <span className={`rounded-lg px-2 py-1 text-[10px] font-extrabold ${active ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>{active ? 'Aktif' : 'Digantikan'}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-lg bg-surface-soft p-2"><p className="text-[9px] font-bold uppercase text-muted">Harga Beli</p><p className="mt-0.5 text-[11px] font-extrabold text-ink">{formatCurrency(revision.purchaseCost)}</p></div>
                  <div className="rounded-lg bg-surface-soft p-2"><p className="text-[9px] font-bold uppercase text-muted">Rekondisi</p><p className="mt-0.5 text-[11px] font-extrabold text-ink">{formatCurrency(revision.reconditioningCost)}</p></div>
                  <div className="rounded-lg bg-surface-soft p-2"><p className="text-[9px] font-bold uppercase text-muted">HPP</p><p className="mt-0.5 text-[11px] font-extrabold text-ink">{formatCurrency(revision.pricingCostBasis)}</p></div>
                  <div className="rounded-lg bg-primary-light p-2"><p className="text-[9px] font-bold uppercase text-primary">Margin OTR</p><p className="mt-0.5 text-[11px] font-extrabold text-primary">{formatCurrency(revision.otrPrice - revision.pricingCostBasis)}</p></div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold"><span className="rounded-lg border border-border px-2 py-1.5 text-ink">Target: {formatCurrency(revision.targetPrice)}</span><span className="rounded-lg border border-border px-2 py-1.5 text-ink">OTR: {formatCurrency(revision.otrPrice)}</span></div>
                {revision.selections.length > 0 && <p className="mt-2 text-[10px] font-semibold text-muted">HPP mencakup: {revision.selections.map((item) => `Rekondisi #${item.sequence} (${formatCurrency(item.amountSnapshot)})`).join(' · ')}</p>}
                {revision.reopenReason && <div className="mt-2 rounded-lg border border-accent-amber/20 bg-accent-amber/10 px-2.5 py-2 text-[10px] font-semibold text-ink-soft"><span className="font-extrabold text-accent-amber">Alasan reopen:</span> {revision.reopenReason}</div>}
              </div>;
            })}
          </div>}
        </div>
      )}

      {!salesView && can('UNIT_FUNDING_READ') && (
        <InvestorFundingPanel
          resourceType="UNIT_PURCHASE"
          resourceId={current.id}
          branchId={current.branchId}
          paid={!!current.purchaseCashTransactionId}
          paymentStatusKnown={paymentStatusKnown}
          canAllocate={can('UNIT_FUNDING_MANAGE')}
          fundingSource={current.fundingAgreement?.fundingSource}
        />
      )}

      {salesView && (
        <div className="mt-5 border-t border-divider pt-4">
          <div className="mb-3">
            <p className="text-[13px] font-extrabold text-ink">Kelengkapan &amp; Dokumen</p>
            <p className="text-[11px] font-semibold text-muted">Perlengkapan dan dokumen yang tersedia bersama unit.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-soft p-3.5">
              <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-ink">Kelengkapan</p>
              {equipmentNames?.length ? (
                <div className="flex flex-wrap gap-2">
                  {equipmentNames.map((name) => (
                    <span key={name} className="inline-flex items-center gap-1.5 rounded-lg bg-accent-green/10 px-2.5 py-1.5 text-[11px] font-bold text-accent-green">
                      <CheckCircle size={13} /> {name}
                    </span>
                  ))}
                </div>
              ) : <p className="text-[11px] font-semibold text-muted">Belum ada data kelengkapan.</p>}
            </div>
            <div className="rounded-xl border border-border bg-surface-soft p-3.5">
              <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-ink">Dokumen</p>
              {documentNames?.length ? (
                <div className="flex flex-wrap gap-2">
                  {documentNames.map((name) => (
                    <span key={name} className="inline-flex items-center gap-1.5 rounded-lg bg-accent-blue/10 px-2.5 py-1.5 text-[11px] font-bold text-accent-blue">
                      <CheckCircle size={13} /> {name}
                    </span>
                  ))}
                </div>
              ) : <p className="text-[11px] font-semibold text-muted">Belum ada data dokumen.</p>}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-divider pt-4">
        <div className="mb-3"><p className="text-[13px] font-extrabold text-ink">Penawaran Leasing</p><p className="text-[11px] font-semibold text-muted">Pencairan mengikuti OTR unit dikurangi DP.</p></div>
        {!current.leasingOffers?.length ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-soft px-4 py-5 text-center text-[12px] font-semibold text-muted">Belum ada penawaran leasing. Unit belum dapat menjadi Ready Stock.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {current.leasingOffers.map((offer) => <div key={offer.id} className="rounded-xl border border-border bg-surface-soft p-3">
              <div className="flex items-center justify-between gap-2"><p className="text-[12px] font-extrabold text-ink">{offer.leasing.name}</p><span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-1 rounded-lg">{offer.tenorMonths} bulan</span></div>
              {offer.monthlyInstallmentAmount != null && Number(offer.monthlyInstallmentAmount) > 0 && <p className="mt-2 text-[11px] font-semibold text-muted">Cicilan per bulan: <span className="font-extrabold text-ink">{formatCurrency(offer.monthlyInstallmentAmount)}</span></p>}
              <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]"><div><p className="font-bold uppercase text-muted">DP</p><p className="mt-0.5 font-extrabold text-ink">{formatCurrency(offer.dpAmount)}</p></div><div><p className="font-bold uppercase text-muted">OTR</p><p className="mt-0.5 font-extrabold text-ink">{offer.otrPrice == null ? 'Menunggu finalisasi' : formatCurrency(offer.otrPrice)}</p></div><div><p className="font-bold uppercase text-muted">Pencairan</p><p className="mt-0.5 font-extrabold text-primary">{offer.disbursementAmount == null ? 'Menunggu finalisasi' : formatCurrency(offer.disbursementAmount)}</p></div></div>
            </div>)}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-divider pt-4">
        <div className="mb-3">
          <p className="text-[13px] font-extrabold text-ink">Galeri Unit</p>
          <p className="text-[11px] font-semibold text-muted">{salesView ? 'Klik foto untuk melihat ukuran lebih besar' : 'Upload beberapa foto sekaligus, urutkan, dan pilih gambar utama'}</p>
        </div>
        <UnitGalleryManager
          images={images}
          readOnly={salesView || current.statusUnit !== 'INVENTORY'}
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

      {!salesView && <FundingCorrectionModal open={fundingCorrectionOpen} onClose={() => setFundingCorrectionOpen(false)} unit={current} />}

      {!salesView && <ConfirmDialog
        open={confirmFinalize}
        onClose={() => setConfirmFinalize(false)}
        onConfirm={handleFinalizePricing}
        closeOnConfirm={false}
        loading={finalizePricing.isPending || pricingPreview.isLoading}
        confirmDisabled={!pricingValid || !reconditioningReady || !pricingDateValid}
        tone="primary"
        icon={CheckCircle}
        title="Finalisasi Harga Awal"
        confirmLabel="Ya, Finalisasi"
        message="Periksa harga Target dan OTR sebelum mengunci basis HPP. Tindakan ini tidak dapat dibatalkan."
      >
        {pricingPreview.isLoading ? (
          <p className="mt-3 text-[12px] font-semibold text-muted">Memuat preview harga…</p>
        ) : pricingPreview.data?.data ? (() => {
          const preview = pricingPreview.data.data;
          const price = (mode: PricingInputMode, value: number) => mode === 'AMOUNT'
            ? value
            : Math.round(preview.pricingCostBasis * (1 + value / 100) * 100) / 100;
          const resolvedTarget = price(targetMode, effectiveTargetValue);
          const resolvedOtr = price(otrMode, effectiveOtrValue);
          const valid = resolvedOtr >= resolvedTarget && resolvedTarget >= preview.pricingCostBasis;
          return <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border bg-surface-soft p-3">
              <div><p className="text-[10px] font-bold uppercase text-muted">Basis HPP</p><p className="mt-0.5 text-[13px] font-extrabold text-ink">{formatCurrency(preview.pricingCostBasis)}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-muted">Rekondisi dipilih</p><p className="mt-0.5 text-[13px] font-extrabold text-ink">{formatCurrency(preview.selectedReconditioningCost ?? 0)}</p></div>
            </div>
            <p className="text-[11px] font-semibold text-muted">Default cabang: Target {preview.defaultPolicy.targetMarkupPercent}% · OTR {preview.defaultPolicy.otrMarkupPercent}%.</p>
            {preview.completedReconditionings?.length > 0 && <div className="rounded-xl border border-border p-3"><p className="mb-2 text-[11px] font-extrabold text-ink">Rekondisi yang masuk HPP</p><div className="space-y-1.5">{preview.completedReconditionings.map((item) => <label key={item.id} className="flex items-center justify-between gap-2 text-[11px] font-semibold text-ink cursor-pointer"><span className="flex items-center gap-2"><input type="checkbox" checked={selectedReconditioningIds.includes(item.id)} onChange={(e) => setSelectedReconditioningIds((v) => e.target.checked ? [...v, item.id] : v.filter((id) => id !== item.id))} /> Rekondisi #{item.seq}</span><span>{formatCurrency(item.total)}</span></label>)}</div></div>}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-3 space-y-2">
                <SelectField label="Basis Target" value={targetMode} onChange={(e) => setTargetMode(e.target.value as PricingInputMode)} options={[{ value: 'PERCENT', label: 'Persentase HPP' }, { value: 'AMOUNT', label: 'Nominal' }]} />
                <NumericField label={targetMode === 'PERCENT' ? 'Target (%)' : 'Target'} value={effectiveTargetValue} onChange={setTargetValue} decimal={targetMode === 'PERCENT'} thousands={targetMode === 'AMOUNT'} suffix={targetMode === 'PERCENT' ? '%' : undefined} prefix={targetMode === 'AMOUNT' ? 'Rp' : undefined} min={0} />
                <p className="text-[12px] font-extrabold text-primary">{formatCurrency(resolvedTarget)}</p>
              </div>
              <div className="rounded-xl border border-border p-3 space-y-2">
                <SelectField label="Basis OTR" value={otrMode} onChange={(e) => setOtrMode(e.target.value as PricingInputMode)} options={[{ value: 'PERCENT', label: 'Persentase HPP' }, { value: 'AMOUNT', label: 'Nominal' }]} />
                <NumericField label={otrMode === 'PERCENT' ? 'OTR (%)' : 'OTR'} value={effectiveOtrValue} onChange={setOtrValue} decimal={otrMode === 'PERCENT'} thousands={otrMode === 'AMOUNT'} suffix={otrMode === 'PERCENT' ? '%' : undefined} prefix={otrMode === 'AMOUNT' ? 'Rp' : undefined} min={0} />
                <p className="text-[12px] font-extrabold text-primary">{formatCurrency(resolvedOtr)}</p>
              </div>
            </div>
            <div className={`rounded-xl px-3 py-2 text-[11px] font-bold ${valid ? 'bg-accent-green/10 text-accent-green' : 'bg-semantic-error/10 text-semantic-error'}`}>{valid ? `Estimasi margin OTR: ${formatCurrency(resolvedOtr - preview.pricingCostBasis)}` : 'Harga harus memenuhi OTR ≥ Target ≥ HPP.'}</div>
          </div>;
        })() : <p className="mt-3 text-[12px] font-semibold text-semantic-error">Preview harga tidak tersedia. Coba muat ulang detail unit.</p>}
        <label className="mt-3 flex items-start gap-2.5 text-[12px] font-semibold text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={confirmNoRekondisi}
            onChange={(e) => setConfirmNoRekondisi(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Unit ini tidak memiliki rekondisi pertama — lanjutkan tanpa rekondisi.
        </label>
        {can('TRANSACTION_BACKDATE') && <div className="mt-3 space-y-2 rounded-xl border border-border bg-surface-soft p-3"><DateField label="Tanggal finalisasi harga" required value={pricingFinalizedDate} onChange={setPricingFinalizedDate} />{pricingBackdated && current.historicalMode !== 'POST_LEDGER' && <label className="block text-[11px] font-bold text-ink">Alasan backdate<textarea value={pricingBackdateReason} onChange={(event) => setPricingBackdateReason(event.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" placeholder="Minimal 5 karakter" /></label>}</div>}
      </ConfirmDialog>}

      {!salesView && <ConfirmDialog
        open={reopenDialog}
        onClose={() => { if (!reopenPricing.isPending) { setReopenDialog(false); setReopenReason(''); } }}
        onConfirm={handleReopenPricing}
        closeOnConfirm={false}
        loading={reopenPricing.isPending}
        confirmDisabled={reopenReason.trim().length < 5}
        tone="warning"
        icon={AlertTriangle}
        title="Buka Kembali Finalisasi Harga"
        confirmLabel="Buka Harga"
        message="Harga final akan dibuka kembali agar HPP, Target, OTR, dan pendanaan dapat dikoreksi. Unit harus difinalisasi lagi sebelum Ready Stock."
      >
        <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3 text-[11px] font-semibold text-ink-soft">
          Katalog publik dan status featured akan dicabut. Riwayat harga lama tetap tersimpan.
        </div>
        <label className="mt-3 block text-[12px] font-extrabold text-ink">
          Alasan perubahan <span className="text-semantic-error">*</span>
          <textarea
            autoFocus
            value={reopenReason}
            onChange={(event) => setReopenReason(event.target.value)}
            placeholder="Contoh: harga beli berubah setelah negosiasi"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-[12px] font-medium text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <span className={`mt-1 block text-[10px] ${reopenReason.trim().length >= 5 ? 'text-muted' : 'text-semantic-error'}`}>Minimal 5 karakter.</span>
        </label>
      </ConfirmDialog>}
    </Modal>
  );
};
