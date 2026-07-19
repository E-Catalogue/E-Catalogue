import { useState } from 'react';
import {
  Wrench, Plus, Pencil, Trash2, Play, CheckCircle, Loader2, Check,
  ChevronDown, ChevronUp, Receipt, Send, XCircle, Info,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { CashAccountSelect } from '@/features/finance/components';
import { usePermissions } from '@/features/auth/usePermissions';
import { API_ORIGIN } from '@/core/api/client';
import { useRekondisi, useRekondisiMutations, useRekondisiDetails, useRekondisiDetailMutations } from './rekondisi.hooks';
import { useRekondisis } from './rekondisi.hooks';
import { useVendors, usePengecekan } from '@/features/master/master.hooks';
import type { Vendor } from '@/features/master/types';
import type { SimpleMaster } from '@/features/master/simpleMaster.api';
import { useCreateRekondisi, useRekondisiStatusCheck } from '@/features/units/unit.hooks';
import { notifyApiError } from '@/core/api/notify';
import {
  REKONDISI_STATUS_LABEL, REKONDISI_STATUS_COLOR,
  type Rekondisi, type RekondisiDetail, type RekondisiDoneFormData,
} from './rekondisi.types';

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const today = () => new Date().toISOString().slice(0, 10);
const mediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}/${url.replace(/^\/+/, '')}`;
};

/* ── Stepper: 6 langkah, dipetakan langsung dari status backend ── */
type StepKey = 'info' | 'item' | 'approval' | 'progress' | 'done' | 'payment';
const STEPS: { key: StepKey; label: string }[] = [
  { key: 'info', label: 'Info Rekondisi' },
  { key: 'item', label: 'Item Pekerjaan' },
  { key: 'approval', label: 'Persetujuan' },
  { key: 'progress', label: 'Pengerjaan' },
  { key: 'done', label: 'Selesai & Biaya' },
  { key: 'payment', label: 'Pembayaran' },
];

/** Index step yang sedang aktif. DRAFT mencakup step 0 & 1 sekaligus (info + item, bebas dinavigasi). */
const activeStepIndex = (r: Rekondisi): number => {
  if (r.status === 'DRAFT') return r.vendorId ? 1 : 0;
  if (r.status === 'PENDING') return 2;
  if (r.status === 'APPROVED') return 3;
  if (r.status === 'IN_PROGRESS') return 4;
  if (r.status === 'COMPLETED') return r.paidAt ? 6 : 5;
  return 0;
};

const StepIndicator = ({ activeIndex }: { activeIndex: number }) => (
  <div className="flex items-start overflow-x-auto pb-1">
    {STEPS.map((s, i) => {
      const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming';
      return (
        <div key={s.key} className="flex items-start shrink-0">
          <div className="flex flex-col items-center gap-1 w-[76px]">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0 transition-colors ${
              state === 'done' ? 'bg-accent-green border-accent-green text-white'
                : state === 'active' ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border text-muted'
            }`}>
              {state === 'done' ? <Check size={13} strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-[10px] font-bold text-center leading-tight ${state === 'upcoming' ? 'text-muted' : 'text-ink'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-0.5 w-5 sm:w-8 mt-3.5 shrink-0 ${i < activeIndex ? 'bg-accent-green' : 'bg-border'}`} />}
        </div>
      );
    })}
  </div>
);

const Locked = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 py-6 px-4 text-center justify-center text-[12px] font-semibold text-muted border border-dashed border-border rounded-xl">
    <Info size={14} className="shrink-0" /> {text}
  </div>
);

/* ── Step content: Item Pekerjaan (tambah/edit/hapus) ── */
const DetailItemRow = ({
  item, canEdit, onEdit, onDelete,
}: { item: RekondisiDetail; canEdit: boolean; onEdit: (item: RekondisiDetail) => void; onDelete: (id: string) => void }) => (
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-soft/50 border-b border-divider last:border-0 transition-colors">
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-ink truncate">{item.pengecekan?.name ?? '-'}</p>
      {item.description && <p className="text-[11px] text-muted font-medium">{item.description}</p>}
    </div>
    <span className="font-bold text-ink text-[13px] shrink-0">{idr(item.nominal)}</span>
    {canEdit && (
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"><Pencil size={13} /></button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10 transition-colors"><Trash2 size={13} /></button>
      </div>
    )}
  </div>
);

/* ── Step content: Selesai & Biaya ── */
const DoneForm = ({ rekondisiId, onDone }: { rekondisiId: string; onDone: () => void }) => {
  const [tax, setTax] = useState('');
  const [adminFee, setAdminFee] = useState('');
  const [additionalFee, setAdditionalFee] = useState('');
  const [invoice, setInvoice] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const m = useRekondisiMutations();

  const data: RekondisiDoneFormData = {};
  if (tax) data.tax = Number(tax);
  if (adminFee) data.adminFee = Number(adminFee);
  if (additionalFee) data.additionalFee = Number(additionalFee);
  if (invoice) data.invoice = invoice;

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="space-y-3">
        <p className="text-[12px] text-muted font-medium">Masukkan komponen biaya akhir sebelum menutup pekerjaan rekondisi ini.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Pajak', val: tax, set: setTax },
            { label: 'Biaya Admin', val: adminFee, set: setAdminFee },
            { label: 'Biaya Lain', val: additionalFee, set: setAdditionalFee },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">{f.label}</p>
              <input type="number" min={0} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder="0" className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Invoice (opsional)</p>
          <input type="file" accept="image/*,.pdf" onChange={(e) => setInvoice(e.target.files?.[0] ?? null)} className="w-full text-[12px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-[11px] file:font-bold file:px-3 file:py-1.5" />
        </div>
        <button type="submit" className="w-full h-10 rounded-xl bg-accent-green text-white text-[12px] font-bold flex items-center justify-center gap-1.5">
          <CheckCircle size={14} /> Selesaikan Rekondisi
        </button>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => m.done.mutate({ id: rekondisiId, data }, { onSuccess: () => { setConfirmOpen(false); onDone(); }, onError: (err) => notifyApiError(err) })}
        closeOnConfirm={false}
        loading={m.done.isPending}
        tone="primary"
        icon={CheckCircle}
        title="Selesaikan Rekondisi"
        message="Total biaya akan dihitung final dan rekondisi ditandai Selesai. Lanjutkan?"
        confirmLabel="Ya, Selesaikan"
      />
    </>
  );
};

/* ── Step content: Pembayaran ── */
const PayForm = ({ rekondisiId }: { rekondisiId: string }) => {
  const [cashAccountId, setCashAccountId] = useState('');
  const [paidDate, setPaidDate] = useState(today());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const m = useRekondisiMutations();

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="space-y-3">
        <p className="text-[12px] text-muted font-medium">Catat pembayaran rekondisi ke vendor dari akun kas.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CashAccountSelect label="Akun Kas" required value={cashAccountId} onChange={setCashAccountId} />
          <TextField label="Tanggal Bayar" required type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
        </div>
        <button type="submit" disabled={!cashAccountId || !paidDate} className="w-full h-10 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
          <Receipt size={14} /> Bayar Rekondisi
        </button>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => m.pay.mutate({ id: rekondisiId, data: { cashAccountId, paidDate } }, { onSuccess: () => setConfirmOpen(false), onError: (err) => notifyApiError(err) })}
        closeOnConfirm={false}
        loading={m.pay.isPending}
        tone="primary"
        icon={Receipt}
        title="Konfirmasi Pembayaran"
        message="Rekondisi ini akan ditandai lunas dan transaksi kas akan tercatat. Tindakan ini tidak dapat dibatalkan langsung. Lanjutkan?"
        confirmLabel="Ya, Bayar"
      />
    </>
  );
};

const RekondisiCard = ({ r }: { r: Rekondisi }) => {
  const [open, setOpen] = useState(false);
  const [addForm, setAddForm] = useState(false);
  const [editItem, setEditItem] = useState<RekondisiDetail | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [editInfo, setEditInfo] = useState(!r.vendorId);
  const [vendorId, setVendorId] = useState(r.vendorId ?? '');
  const [keterangan, setKeterangan] = useState(r.keterangan ?? '');
  const [newPengecekanId, setNewPengecekanId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newNom, setNewNom] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemNom, setItemNom] = useState('');
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [confirmAddItem, setConfirmAddItem] = useState(false);
  const [confirmEditItem, setConfirmEditItem] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmProgress, setConfirmProgress] = useState(false);

  const { data: detailRes, isLoading: detailLoading } = useRekondisi(open ? r.id : undefined);
  const rekondisi = (detailRes?.data as Rekondisi | undefined) ?? r;
  const { data: itemsRes } = useRekondisiDetails(open ? r.id : undefined);
  const items: RekondisiDetail[] = itemsRes?.data ?? rekondisi.rekondisiDetails ?? [];

  const { data: vendorsRes } = useVendors({ limit: 100 });
  const { data: pengecekanRes } = usePengecekan({ limit: 100 });
  const vendors: Vendor[] = vendorsRes?.data ?? [];
  const pengecekans: SimpleMaster[] = pengecekanRes?.data ?? [];

  const { can } = usePermissions();
  const m = useRekondisiMutations();
  const dm = useRekondisiDetailMutations(r.id);
  const canEdit = rekondisi.status === 'DRAFT';
  const canPay = rekondisi.status === 'COMPLETED' && !rekondisi.paidAt && !rekondisi.cashTransactionId;
  const hasVendor = !!rekondisi.vendorId;
  const showInfoForm = canEdit && (!hasVendor || editInfo);
  const canSubmit = rekondisi.status === 'DRAFT' && hasVendor && items.length > 0;
  const step = activeStepIndex(rekondisi);

  const startEditItem = (item: RekondisiDetail) => {
    setEditItem(item);
    setItemDesc(item.description ?? '');
    setItemNom(String(item.nominal));
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-soft transition-colors text-left">
        <span className="text-[11px] font-bold text-muted shrink-0">#{r.seq}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${REKONDISI_STATUS_COLOR[rekondisi.status]}`}>{REKONDISI_STATUS_LABEL[rekondisi.status]}</span>
        <span className="text-[13px] font-semibold text-ink-soft truncate flex-1">{rekondisi.vendor?.name ?? (rekondisi.keterangan || 'Belum diisi')}</span>
        {rekondisi.total > 0 && <span className="font-bold text-ink text-[13px] shrink-0">{idr(rekondisi.total)}</span>}
        {open ? <ChevronUp size={15} className="text-muted shrink-0" /> : <ChevronDown size={15} className="text-muted shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border bg-surface-soft/30">
          {detailLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-muted" /></div>
          ) : (
            <div className="p-4 space-y-5">
              <StepIndicator activeIndex={step} />

              {/* Step 1: Info Rekondisi */}
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">1. Info Rekondisi</p>
                {showInfoForm ? (
                  <>
                    <form onSubmit={(e) => { e.preventDefault(); if (vendorId) setConfirmInfo(true); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SelectField label="Vendor / Bengkel" required value={vendorId} onChange={(e) => setVendorId(e.target.value)} options={[{ value: '', label: 'Pilih vendor...' }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]} />
                      <TextField label="Keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Contoh: Perbaikan AC dan kaki-kaki" />
                      <div className="sm:col-span-2 flex gap-2">
                        <Button type="submit" disabled={!vendorId}>Simpan</Button>
                        {hasVendor && <Button variant="secondary" onClick={() => setEditInfo(false)}>Batal</Button>}
                      </div>
                    </form>
                    <ConfirmDialog
                      open={confirmInfo}
                      onClose={() => setConfirmInfo(false)}
                      onConfirm={() => m.update.mutate({ id: r.id, data: { vendorId, keterangan: keterangan || null } }, { onSuccess: () => { setConfirmInfo(false); setEditInfo(false); }, onError: (err) => notifyApiError(err) })}
                      closeOnConfirm={false}
                      loading={m.update.isPending}
                      tone="primary"
                      title="Simpan Info Rekondisi"
                      message="Simpan vendor & keterangan rekondisi ini?"
                      confirmLabel="Ya, Simpan"
                    />
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 text-[12px]">
                      <p className="text-muted font-medium">Vendor: <span className="text-ink font-bold">{rekondisi.vendor?.name ?? '-'}</span></p>
                      <p className="text-muted font-medium">Keterangan: <span className="text-ink font-semibold">{rekondisi.keterangan ?? '-'}</span></p>
                      <p className="text-muted font-medium">Tanggal: <span className="text-ink font-semibold">{rekondisi.tanggal ? new Date(rekondisi.tanggal).toLocaleDateString('id-ID') : '-'}</span></p>
                    </div>
                    {canEdit && <button onClick={() => setEditInfo(true)} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10"><Pencil size={14} /></button>}
                  </div>
                )}
              </section>

              {/* Step 2: Item Pekerjaan */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">2. Item Pekerjaan ({items.length})</p>
                  {canEdit && <button onClick={() => setAddForm((v) => !v)} className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"><Plus size={13} /> Tambah Item</button>}
                </div>

                {addForm && (
                  <>
                    <form onSubmit={(e) => { e.preventDefault(); if (newPengecekanId && newNom) setConfirmAddItem(true); }} className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-surface border border-border rounded-xl">
                      <select required value={newPengecekanId} onChange={(e) => setNewPengecekanId(e.target.value)} className="flex-1 min-w-[140px] h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary">
                        <option value="">Pilih pengecekan...</option>
                        {pengecekans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Deskripsi (opsional)" className="w-40 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
                      <input required type="number" min={0} value={newNom} onChange={(e) => setNewNom(e.target.value)} placeholder="Nominal" className="w-28 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
                      <button type="submit" className="h-8 px-3 rounded-lg bg-primary text-white text-[11px] font-bold">Tambah</button>
                      <button type="button" onClick={() => setAddForm(false)} className="h-8 px-2.5 rounded-lg border border-border text-[11px] font-bold text-muted">Batal</button>
                    </form>
                    <ConfirmDialog
                      open={confirmAddItem}
                      onClose={() => setConfirmAddItem(false)}
                      onConfirm={() => dm.create.mutate(
                        { pengecekanId: newPengecekanId, description: newDesc || undefined, nominal: Number(newNom) },
                        { onSuccess: () => { setConfirmAddItem(false); setNewPengecekanId(''); setNewDesc(''); setNewNom(''); setAddForm(false); }, onError: (err) => notifyApiError(err) },
                      )}
                      closeOnConfirm={false}
                      loading={dm.create.isPending}
                      tone="primary"
                      title="Tambah Item Pekerjaan"
                      message="Tambahkan item pekerjaan ini ke rekondisi?"
                      confirmLabel="Ya, Tambah"
                    />
                  </>
                )}

                {editItem && (
                  <>
                    <form onSubmit={(e) => { e.preventDefault(); setConfirmEditItem(true); }} className="flex items-center gap-2 mb-3 px-3 py-2.5 bg-surface-soft/60 border border-border rounded-xl">
                      <span className="text-[12px] font-semibold text-muted shrink-0 w-28 truncate">{editItem.pengecekan?.name}</span>
                      <input value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Deskripsi" className="flex-1 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
                      <input value={itemNom} onChange={(e) => setItemNom(e.target.value)} type="number" min={0} required placeholder="Nominal" className="w-32 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
                      <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold">Simpan</button>
                      <button type="button" onClick={() => setEditItem(null)} className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-bold text-muted">Batal</button>
                    </form>
                    <ConfirmDialog
                      open={confirmEditItem}
                      onClose={() => setConfirmEditItem(false)}
                      onConfirm={() => dm.update.mutate(
                        { id: editItem.id, data: { description: itemDesc || undefined, nominal: Number(itemNom) } },
                        { onSuccess: () => { setConfirmEditItem(false); setEditItem(null); }, onError: (err) => notifyApiError(err) },
                      )}
                      closeOnConfirm={false}
                      loading={dm.update.isPending}
                      tone="primary"
                      title="Simpan Perubahan Item"
                      message="Simpan perubahan pada item pekerjaan ini?"
                      confirmLabel="Ya, Simpan"
                    />
                  </>
                )}

                {items.length === 0 ? (
                  <p className="text-center py-6 text-[12px] text-muted border border-dashed border-border rounded-xl">Belum ada item pekerjaan.</p>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden">
                    {items.map((it) => <DetailItemRow key={it.id} item={it} canEdit={canEdit} onEdit={startEditItem} onDelete={setToDelete} />)}
                    {rekondisi.status === 'COMPLETED' && (
                      <div className="px-4 py-2.5 bg-surface border-t border-border space-y-1">
                        <div className="flex justify-between text-[12px] text-muted font-medium"><span>Nominal pekerjaan</span><span>{idr(rekondisi.nominal)}</span></div>
                        {rekondisi.tax != null && <div className="flex justify-between text-[12px] text-muted font-medium"><span>Pajak</span><span>{idr(rekondisi.tax)}</span></div>}
                        {rekondisi.adminFee != null && <div className="flex justify-between text-[12px] text-muted font-medium"><span>Biaya admin</span><span>{idr(rekondisi.adminFee)}</span></div>}
                        {rekondisi.additionalFee != null && <div className="flex justify-between text-[12px] text-muted font-medium"><span>Biaya lain</span><span>{idr(rekondisi.additionalFee)}</span></div>}
                        <div className="flex justify-between text-[13px] font-extrabold text-ink pt-1.5 border-t border-border"><span>Total</span><span>{idr(rekondisi.total)}</span></div>
                      </div>
                    )}
                  </div>
                )}

                {rekondisi.status === 'DRAFT' && (
                  <div className="mt-3">
                    <button
                      onClick={() => setConfirmSubmit(true)}
                      disabled={!canSubmit}
                      title={!canSubmit ? 'Vendor dan minimal satu item pekerjaan wajib diisi sebelum diajukan' : undefined}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white font-bold text-[12px] hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      <Send size={13} /> Ajukan untuk Persetujuan
                    </button>
                    <ConfirmDialog
                      open={confirmSubmit}
                      onClose={() => setConfirmSubmit(false)}
                      onConfirm={() => m.submit.mutate(r.id, { onSuccess: () => setConfirmSubmit(false), onError: (err) => notifyApiError(err) })}
                      closeOnConfirm={false}
                      loading={m.submit.isPending}
                      tone="primary"
                      icon={Send}
                      title="Ajukan Rekondisi"
                      message="Rekondisi akan diajukan untuk persetujuan dan item pekerjaan tidak dapat diubah sampai keputusan diambil. Lanjutkan?"
                      confirmLabel="Ya, Ajukan"
                    />
                  </div>
                )}
              </section>

              {/* Step 3: Persetujuan */}
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">3. Persetujuan</p>
                {step < 2 ? (
                  <Locked text="Menunggu rekondisi diajukan." />
                ) : rekondisi.status === 'PENDING' && can('REKONDISI_APPROVAL') ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setConfirmApprove(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-green text-white font-bold text-[12px] hover:bg-accent-green/90 transition-colors">
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => setConfirmReject(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-semantic-error text-white font-bold text-[12px] hover:bg-semantic-error/90 transition-colors">
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                    <ConfirmDialog
                      open={confirmApprove}
                      onClose={() => setConfirmApprove(false)}
                      onConfirm={() => m.approve.mutate(r.id, { onSuccess: () => setConfirmApprove(false), onError: (err) => notifyApiError(err) })}
                      closeOnConfirm={false}
                      loading={m.approve.isPending}
                      tone="primary"
                      icon={CheckCircle}
                      title="Setujui Rekondisi"
                      message="Rekondisi ini akan disetujui dan lanjut ke tahap pengerjaan. Lanjutkan?"
                      confirmLabel="Ya, Approve"
                    />
                    <ConfirmDialog
                      open={confirmReject}
                      onClose={() => setConfirmReject(false)}
                      onConfirm={() => m.reject.mutate(r.id, { onSuccess: () => setConfirmReject(false), onError: (err) => notifyApiError(err) })}
                      closeOnConfirm={false}
                      loading={m.reject.isPending}
                      tone="danger"
                      icon={XCircle}
                      title="Reject Rekondisi"
                      message="Rekondisi akan dikembalikan ke status Draft untuk direvisi. Lanjutkan?"
                      confirmLabel="Ya, Reject"
                    />
                  </>
                ) : step === 2 ? (
                  <Locked text="Menunggu persetujuan dari pihak berwenang." />
                ) : (
                  <p className="text-[12px] font-semibold text-accent-green flex items-center gap-1.5"><Check size={14} /> Disetujui</p>
                )}
              </section>

              {/* Step 4: Pengerjaan */}
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">4. Pengerjaan</p>
                {step < 3 ? (
                  <Locked text="Menunggu persetujuan sebelum pengerjaan dimulai." />
                ) : rekondisi.status === 'APPROVED' ? (
                  <>
                    <button onClick={() => setConfirmProgress(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-blue text-white font-bold text-[12px] hover:bg-accent-blue/90 transition-colors">
                      <Play size={13} /> Mulai Pengerjaan
                    </button>
                    <ConfirmDialog
                      open={confirmProgress}
                      onClose={() => setConfirmProgress(false)}
                      onConfirm={() => m.progress.mutate(r.id, { onSuccess: () => setConfirmProgress(false), onError: (err) => notifyApiError(err) })}
                      closeOnConfirm={false}
                      loading={m.progress.isPending}
                      tone="primary"
                      icon={Play}
                      title="Mulai Pengerjaan"
                      message="Tandai rekondisi ini sedang dikerjakan?"
                      confirmLabel="Ya, Mulai"
                    />
                  </>
                ) : (
                  <p className="text-[12px] font-semibold text-accent-green flex items-center gap-1.5"><Check size={14} /> Pengerjaan dimulai</p>
                )}
              </section>

              {/* Step 5: Selesai & Biaya */}
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">5. Selesai &amp; Biaya</p>
                {step < 4 ? (
                  <Locked text="Menunggu pengerjaan dimulai." />
                ) : rekondisi.status === 'IN_PROGRESS' ? (
                  <DoneForm rekondisiId={r.id} onDone={() => {}} />
                ) : (
                  <p className="text-[12px] font-semibold text-accent-green flex items-center gap-1.5"><Check size={14} /> Selesai, total {idr(rekondisi.total)}</p>
                )}
              </section>

              {/* Step 6: Pembayaran */}
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">6. Pembayaran</p>
                {step < 5 ? (
                  <Locked text="Menunggu rekondisi diselesaikan." />
                ) : canPay ? (
                  <PayForm rekondisiId={r.id} />
                ) : rekondisi.paidAt ? (
                  <p className="text-[12px] font-semibold text-accent-green flex items-center gap-1.5"><Check size={14} /> Lunas — dibayar {new Date(rekondisi.paidAt).toLocaleDateString('id-ID')}</p>
                ) : (
                  <Locked text="Menunggu rekondisi diselesaikan." />
                )}
              </section>

              {rekondisi.invoiceUrl && (
                <a href={mediaUrl(rekondisi.invoiceUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline">
                  <Receipt size={13} /> Lihat Invoice
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && dm.remove.mutate(toDelete, { onSuccess: () => setToDelete(null), onError: (err) => notifyApiError(err) })}
        title="Hapus Item"
        message="Hapus item pekerjaan ini? Tindakan ini tidak dapat dibatalkan."
        tone="danger"
        loading={dm.remove.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  unitId: string | null;
  unitLabel?: string;
}

export const RekondisiDetailModal = ({ open, onClose, unitId, unitLabel }: Props) => {
  const { data, isLoading } = useRekondisis(unitId ? { unitId, limit: 50 } : undefined, open && !!unitId);
  const rekondisiList: Rekondisi[] = data?.data ?? [];
  const createM = useCreateRekondisi();
  const { data: checkRes } = useRekondisiStatusCheck(open ? unitId ?? undefined : undefined);
  const blocked = !!checkRes?.data.hasUnfinishedRekondisi;
  const [confirmCreate, setConfirmCreate] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Wrench size={20} />}
      title="Manajemen Rekondisi"
      subtitle={unitLabel ?? 'Riwayat & pengelolaan rekondisi unit'}
      size="xl"
      footer={
        <div className="flex gap-2">
          <Button icon={<Plus size={15} />} onClick={() => setConfirmCreate(true)} disabled={blocked}>Buat Rekondisi</Button>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : rekondisiList.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Wrench size={32} className="text-muted mx-auto mb-3" />
          <p className="font-bold text-ink">Belum ada rekondisi</p>
          <p className="text-muted text-[13px] font-medium mt-1">Klik &quot;Buat Rekondisi&quot; untuk memulai entri biaya.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rekondisiList.map((r) => <RekondisiCard key={r.id} r={r} />)}
        </div>
      )}

      <ConfirmDialog
        open={confirmCreate}
        onClose={() => setConfirmCreate(false)}
        onConfirm={() => unitId && createM.mutate({ id: unitId }, { onSuccess: () => setConfirmCreate(false), onError: (err) => notifyApiError(err) })}
        closeOnConfirm={false}
        loading={createM.isPending}
        tone="primary"
        icon={Plus}
        title="Buat Rekondisi Baru"
        message="Buat entri rekondisi baru berstatus Draft untuk unit ini?"
        confirmLabel="Ya, Buat"
      />
    </Modal>
  );
};
