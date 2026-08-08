import { useMemo, useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { SelectField } from '@/shared/components/ui/Field';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';
import { formatCurrency } from '@/core/utils/format';
import { notifyApiError } from '@/core/api/notify';
import { useCorrectUnitFunding, useUnitLookups } from './unit.hooks';
import { FINAL_CYCLE_POLICY_LABEL, type FinalCyclePolicy, type FundingSource, type Unit } from './unit.types';

interface Props {
  open: boolean;
  onClose: () => void;
  unit: Unit;
}

export const FundingCorrectionModal = ({ open, onClose, unit }: Props) => {
  const current = unit.fundingAgreement;
  const headers = unit.branchId ? { 'X-Branch-Id': unit.branchId } : undefined;
  const { data: lookupResult, isLoading } = useUnitLookups(open, unit.branchId, headers);
  const investors = useMemo(() => lookupResult?.data.investors ?? [], [lookupResult]);
  const [fundingSource, setFundingSource] = useState<FundingSource>(current?.fundingSource ?? 'COMPANY_OWNED');
  const [investorId, setInvestorId] = useState(current?.investorId ?? '');
  const [finalCyclePolicy, setFinalCyclePolicy] = useState<FinalCyclePolicy | ''>(current?.finalCyclePolicy ?? '');
  const [reason, setReason] = useState('');
  const correction = useCorrectUnitFunding();
  const investor = investors.find((item) => item.id === investorId);
  const requiresPolicy = fundingSource === 'INVESTOR' && investor?.scheme === 'FIXED_MONTHLY';
  const valid = reason.trim().length >= 5 && (fundingSource === 'COMPANY_OWNED' || (!!investorId && (!requiresPolicy || !!finalCyclePolicy)));

  const close = () => {
    setFundingSource(current?.fundingSource ?? 'COMPANY_OWNED');
    setInvestorId(current?.investorId ?? '');
    setFinalCyclePolicy(current?.finalCyclePolicy ?? '');
    setReason('');
    onClose();
  };

  const submit = () => correction.mutate({
    id: unit.id,
    headers,
    data: {
      fundingSource,
      ...(fundingSource === 'INVESTOR' ? { investorId, ...(requiresPolicy ? { finalCyclePolicy: finalCyclePolicy as FinalCyclePolicy } : {}) } : {}),
      reason: reason.trim(),
    },
  }, { onSuccess: close, onError: (error) => notifyApiError(error) });

  return <Modal
    open={open}
    onClose={close}
    icon={<Repeat2 size={20} />}
    title="Koreksi Investor / Kepemilikan Unit"
    subtitle="Koreksi berlaku retroaktif sejak tanggal pembelian"
    busy={correction.isPending}
    footer={<><Button variant="secondary" onClick={close}>Batal</Button><Button onClick={submit} loading={correction.isPending} disabled={!valid}>Proses Koreksi</Button></>}
  >
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-soft p-3">
        <div><p className="text-[10px] font-bold uppercase text-muted">Pendanaan lama</p><p className="mt-1 text-[12px] font-extrabold text-ink">{current?.fundingSource === 'INVESTOR' ? current.investor?.name ?? 'Investor' : 'Milik Perusahaan'}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-muted">Principal</p><p className="mt-1 text-[12px] font-extrabold text-primary">{formatCurrency(current?.principalAmount ?? unit.purchaseCost)}</p></div>
      </div>
      <p className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3 text-[11px] font-semibold text-ink-soft">Allocation investor lama akan dibalik pada tanggal bisnis aslinya, lalu dialokasikan ulang. Kewajiban yang belum dibayar dihitung kembali. Koreksi ditolak bila settlement atau pembayaran investor sudah ada.</p>
      <SelectField label="Sumber dana baru" required value={fundingSource} onChange={(event) => { const value = event.target.value as FundingSource; setFundingSource(value); if (value === 'COMPANY_OWNED') { setInvestorId(''); setFinalCyclePolicy(''); } }} options={[{ value: 'COMPANY_OWNED', label: 'Milik Perusahaan' }, { value: 'INVESTOR', label: 'Investor' }]} />
      {fundingSource === 'INVESTOR' && <SearchableSelect label="Investor baru" required value={investorId} onChange={(value) => { const selected = investors.find((item) => item.id === value); setInvestorId(value); setFinalCyclePolicy(selected?.scheme === 'FIXED_MONTHLY' ? (current?.finalCyclePolicy ?? 'FULL') : ''); }} loading={isLoading} options={investors.map((item) => ({ value: item.id, label: item.name, sublabel: `${item.scheme} · saldo ${formatCurrency(item.capitalAccounts?.[0]?.availableBalance ?? 0)}` }))} placeholder="Pilih investor" searchPlaceholder="Cari investor..." />}
      {requiresPolicy && <SelectField label="Siklus bulan terakhir" required value={finalCyclePolicy} onChange={(event) => setFinalCyclePolicy(event.target.value as FinalCyclePolicy)} options={(['FULL', 'PRORATA', 'NONE'] as FinalCyclePolicy[]).map((value) => ({ value, label: FINAL_CYCLE_POLICY_LABEL[value] }))} />}
      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted">Alasan koreksi <span className="text-semantic-error">*</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={5} rows={3} placeholder="Jelaskan dasar koreksi kepemilikan" className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-ink" /><span className={`mt-1 block text-[10px] ${reason.trim().length >= 5 ? 'text-muted' : 'text-semantic-error'}`}>Minimal 5 karakter. Tersimpan di audit log.</span></label>
    </div>
  </Modal>;
};
