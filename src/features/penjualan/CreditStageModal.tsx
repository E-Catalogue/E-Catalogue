import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { SelectField, TextField } from '@/shared/components/ui/Field';
import { DateField } from '@/shared/components/ui/DateField';
import type { CreditProcessStage, CreditStagePayload, LeadOrder } from '@/features/crm/crm.types';

const today = () => new Date().toISOString().slice(0, 10);
const OPTIONS: Record<CreditProcessStage, Array<{ value: string; label: string }>> = {
  SLIK: [{ value: 'BI_CHECKING', label: 'BI Checking' }, { value: 'LOLOS', label: 'Lolos' }, { value: 'REJECT', label: 'Ditolak' }],
  SURVEY: [{ value: 'PENDING', label: 'Menunggu' }, { value: 'SCHEDULED', label: 'Terjadwal' }, { value: 'PASSED', label: 'Lolos' }, { value: 'REJECTED', label: 'Ditolak' }],
  APPROVAL: [{ value: 'PENDING', label: 'Menunggu' }, { value: 'APPROVED', label: 'Disetujui' }, { value: 'REJECTED', label: 'Ditolak' }],
};

export const CreditStageModal = ({ order, open, onClose, submitting, onSubmit }: { order: LeadOrder | null; open: boolean; onClose: () => void; submitting?: boolean; onSubmit: (body: CreditStagePayload) => void }) => {
  const [stage, setStage] = useState<CreditProcessStage>('SLIK');
  const [status, setStatus] = useState('BI_CHECKING');
  const [effectiveAt, setEffectiveAt] = useState(today());
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const stageEnabled = (value: CreditProcessStage) => value === 'SLIK' || (value === 'SURVEY' ? order?.statusSlik === 'LOLOS' : order?.surveyStatus === 'PASSED');
  const rejected = status === 'REJECT' || status === 'REJECTED';
  const valid = !!effectiveAt && !!status && (!rejected || !!reason.trim());
  const changeStage = (value: CreditProcessStage) => { setStage(value); setStatus(OPTIONS[value][0].value); setReason(''); setNote(''); };
  return <Modal open={open} onClose={onClose} title="Proses Kredit" subtitle={order?.nomorOrder} icon={<ClipboardCheck size={19} />} footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button disabled={!valid || submitting} onClick={() => onSubmit({ stage, status, effectiveAt: new Date(`${effectiveAt}T12:00:00+07:00`).toISOString(), reason: reason.trim() || undefined, note: note.trim() || undefined })}>{submitting ? 'Menyimpan...' : 'Simpan Tahap'}</Button></>}>
    <div className="space-y-4">
      <SelectField label="Tahap" value={stage} onChange={(event) => changeStage(event.target.value as CreditProcessStage)} options={([
        ['SLIK', 'SLIK'], ['SURVEY', 'Survei'], ['APPROVAL', 'Approval'],
      ] as const).filter(([value]) => stageEnabled(value)).map(([value, label]) => ({ value, label }))} />
      <SelectField label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={OPTIONS[stage]} />
      <DateField label="Tanggal Efektif" required value={effectiveAt} onChange={setEffectiveAt} />
      {rejected && <TextField label="Alasan Penolakan" required value={reason} onChange={(event) => setReason(event.target.value)} maxLength={191} />}
      <TextField label="Catatan" value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} />
      <div className="rounded-xl border border-border bg-surface-soft p-3 text-[11px] font-semibold text-muted">Urutan wajib: SLIK lolos → survei lolos → approval. Penolakan tidak otomatis membatalkan order.</div>
    </div>
  </Modal>;
};
