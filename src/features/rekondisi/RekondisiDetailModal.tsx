import { useState, type FormEvent } from 'react';
import {
  Wrench, Plus, Pencil, Trash2, Play, CheckCircle, Loader2,
  ChevronDown, ChevronUp, Receipt,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { CashAccountSelect } from '@/features/finance/components';
import { API_ORIGIN } from '@/core/api/client';
import { useRekondisi, useRekondisiMutations, useRekondisiDetails, useRekondisiDetailMutations } from './rekondisi.hooks';
import { useRekondisis } from './rekondisi.hooks';
import { useVendors, usePengecekan } from '@/features/master/master.hooks';
import type { Vendor } from '@/features/master/types';
import type { SimpleMaster } from '@/features/master/simpleMaster.api';
import { useCreateRekondisi } from '@/features/units/unit.hooks';
import { unitApi } from '@/features/units/unit.api';
import { notifyApiError } from '@/core/api/notify';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
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

const DetailItemRow = ({
  item, rekondisiId, canEdit, onDelete,
}: { item: RekondisiDetail; rekondisiId: string; canEdit: boolean; onDelete: (id: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(item.description ?? '');
  const [nom, setNom] = useState(String(item.nominal));
  const m = useRekondisiDetailMutations(rekondisiId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    m.update.mutate(
      { id: item.id, data: { description: desc || undefined, nominal: Number(nom) } },
      { onSuccess: () => setEditing(false), onError: (err) => notifyApiError(err) },
    );
  };

  if (editing) {
    return (
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-2.5 bg-surface-soft/60 border-b border-divider">
        <span className="text-[12px] font-semibold text-muted shrink-0 w-28 truncate">{item.pengecekan?.name}</span>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi" className="flex-1 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
        <input value={nom} onChange={(e) => setNom(e.target.value)} type="number" min={0} required placeholder="Nominal" className="w-32 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
        <button type="submit" disabled={m.update.isPending} className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold">Simpan</button>
        <button type="button" onClick={() => setEditing(false)} className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-bold text-muted">Batal</button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-soft/50 border-b border-divider last:border-0 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-ink truncate">{item.pengecekan?.name ?? '-'}</p>
        {item.description && <p className="text-[11px] text-muted font-medium">{item.description}</p>}
      </div>
      <span className="font-bold text-ink text-[13px] shrink-0">{idr(item.nominal)}</span>
      {canEdit && (
        <div className="flex gap-1 shrink-0">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10 transition-colors"><Trash2 size={13} /></button>
        </div>
      )}
    </div>
  );
};

const DoneForm = ({ rekondisiId, onClose }: { rekondisiId: string; onClose: () => void }) => {
  const [tax, setTax] = useState('');
  const [adminFee, setAdminFee] = useState('');
  const [additionalFee, setAdditionalFee] = useState('');
  const [invoice, setInvoice] = useState<File | null>(null);
  const m = useRekondisiMutations();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data: RekondisiDoneFormData = {};
    if (tax) data.tax = Number(tax);
    if (adminFee) data.adminFee = Number(adminFee);
    if (additionalFee) data.additionalFee = Number(additionalFee);
    if (invoice) data.invoice = invoice;
    m.done.mutate({ id: rekondisiId, data }, { onSuccess: onClose, onError: (err) => notifyApiError(err) });
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-surface-soft rounded-xl border border-border mt-2">
      <p className="text-[12px] font-bold text-ink">Selesaikan &amp; hitung total biaya</p>
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
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="px-3 h-9 rounded-lg border border-border text-muted text-[12px] font-bold">Batal</button>
        <button type="submit" disabled={m.done.isPending} className="flex-1 h-9 rounded-lg bg-accent-green text-white text-[12px] font-bold flex items-center justify-center gap-1.5">
          {m.done.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Selesaikan
        </button>
      </div>
    </form>
  );
};

const PayForm = ({ rekondisiId, onClose }: { rekondisiId: string; onClose: () => void }) => {
  const [cashAccountId, setCashAccountId] = useState('');
  const [paidDate, setPaidDate] = useState(today());
  const m = useRekondisiMutations();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    m.pay.mutate({ id: rekondisiId, data: { cashAccountId, paidDate } }, { onSuccess: onClose, onError: (err) => notifyApiError(err) });
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-surface-soft rounded-xl border border-border mt-2">
      <p className="text-[12px] font-bold text-ink">Pembayaran rekondisi</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CashAccountSelect label="Akun Kas" required value={cashAccountId} onChange={setCashAccountId} />
        <TextField label="Tanggal Bayar" required type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="px-3 h-9 rounded-lg border border-border text-muted text-[12px] font-bold">Batal</button>
        <button type="submit" disabled={m.pay.isPending || !cashAccountId || !paidDate} className="flex-1 h-9 rounded-lg bg-primary text-white text-[12px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
          {m.pay.isPending ? <Loader2 size={14} className="animate-spin" /> : <Receipt size={14} />}
          Bayar Rekondisi
        </button>
      </div>
    </form>
  );
};

const RekondisiCard = ({ r }: { r: Rekondisi }) => {
  const [open, setOpen] = useState(false);
  const [addForm, setAddForm] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [editInfo, setEditInfo] = useState(!r.vendorId);
  const [vendorId, setVendorId] = useState(r.vendorId ?? '');
  const [keterangan, setKeterangan] = useState(r.keterangan ?? '');
  const [newPengecekanId, setNewPengecekanId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newNom, setNewNom] = useState('');

  const { data: detailRes, isLoading: detailLoading } = useRekondisi(open ? r.id : undefined);
  const rekondisi = (detailRes?.data as Rekondisi | undefined) ?? r;
  const { data: itemsRes } = useRekondisiDetails(open ? r.id : undefined);
  const items: RekondisiDetail[] = itemsRes?.data ?? rekondisi.rekondisiDetails ?? [];

  const { data: vendorsRes } = useVendors({ limit: 100 });
  const { data: pengecekanRes } = usePengecekan({ limit: 100 });
  const vendors: Vendor[] = vendorsRes?.data ?? [];
  const pengecekans: SimpleMaster[] = pengecekanRes?.data ?? [];

  const m = useRekondisiMutations();
  const dm = useRekondisiDetailMutations(r.id);
  const canEdit = r.status !== 'COMPLETED';
  const canPay = rekondisi.status === 'COMPLETED' && !rekondisi.paidAt && !rekondisi.cashTransactionId;
  const hasVendor = !!rekondisi.vendorId;
  const showInfoForm = canEdit && (!hasVendor || editInfo);

  const submitInfo = (e: FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    m.update.mutate(
      { id: r.id, data: { vendorId, keterangan: keterangan || null } },
      { onSuccess: () => setEditInfo(false), onError: (err) => notifyApiError(err) },
    );
  };

  const submitItem = (e: FormEvent) => {
    e.preventDefault();
    dm.create.mutate(
      { pengecekanId: newPengecekanId, description: newDesc || undefined, nominal: Number(newNom) },
      { onSuccess: () => { setNewPengecekanId(''); setNewDesc(''); setNewNom(''); setAddForm(false); }, onError: (err) => notifyApiError(err) },
    );
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-soft transition-colors text-left">
        <span className="text-[11px] font-bold text-muted shrink-0">#{r.seq}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${REKONDISI_STATUS_COLOR[r.status]}`}>{REKONDISI_STATUS_LABEL[r.status]}</span>
        <span className="text-[13px] font-semibold text-ink-soft truncate flex-1">{r.vendor?.name ?? (r.keterangan || 'Belum diisi')}</span>
        {r.total > 0 && <span className="font-bold text-ink text-[13px] shrink-0">{idr(r.total)}</span>}
        {open ? <ChevronUp size={15} className="text-muted shrink-0" /> : <ChevronDown size={15} className="text-muted shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border bg-surface-soft/30">
          {detailLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-muted" /></div>
          ) : (
            <div className="p-4 space-y-4">
              {showInfoForm ? (
                <form onSubmit={submitInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField label="Vendor / Bengkel" required value={vendorId} onChange={(e) => setVendorId(e.target.value)} options={[{ value: '', label: 'Pilih vendor...' }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]} />
                  <TextField label="Keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Contoh: Perbaikan AC dan kaki-kaki" />
                  <div className="sm:col-span-2 flex gap-2">
                    <Button type="submit" disabled={m.update.isPending || !vendorId}>Simpan</Button>
                    {hasVendor && <Button variant="secondary" onClick={() => setEditInfo(false)}>Batal</Button>}
                  </div>
                </form>
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-bold text-ink">Item Pekerjaan ({items.length})</p>
                  {canEdit && <button onClick={() => setAddForm((v) => !v)} className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"><Plus size={13} /> Tambah Item</button>}
                </div>

                {addForm && (
                  <form onSubmit={submitItem} className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-surface border border-border rounded-xl">
                    <select required value={newPengecekanId} onChange={(e) => setNewPengecekanId(e.target.value)} className="flex-1 min-w-[140px] h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary">
                      <option value="">Pilih pengecekan...</option>
                      {pengecekans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Deskripsi (opsional)" className="w-40 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
                    <input required type="number" min={0} value={newNom} onChange={(e) => setNewNom(e.target.value)} placeholder="Nominal" className="w-28 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
                    <button type="submit" disabled={dm.create.isPending} className="h-8 px-3 rounded-lg bg-primary text-white text-[11px] font-bold">{dm.create.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Tambah'}</button>
                    <button type="button" onClick={() => setAddForm(false)} className="h-8 px-2.5 rounded-lg border border-border text-[11px] font-bold text-muted">Batal</button>
                  </form>
                )}

                {items.length === 0 ? (
                  <p className="text-center py-6 text-[12px] text-muted border border-dashed border-border rounded-xl">Belum ada item pekerjaan.</p>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden">
                    {items.map((it) => <DetailItemRow key={it.id} item={it} rekondisiId={r.id} canEdit={canEdit} onDelete={setToDelete} />)}
                    {rekondisi.status === 'COMPLETED' && (
                      <div className="px-4 py-2.5 bg-surface border-t border-border space-y-1">
                        <div className="flex justify-between text-[12px] text-muted font-medium"><span>Nominal pekerjaan</span><span>{idr(rekondisi.nominal)}</span></div>
                        {rekondisi.tax != null && <div className="flex justify-between text-[12px] text-muted font-medium"><span>Pajak</span><span>{idr(rekondisi.tax)}</span></div>}
                        {rekondisi.adminFee != null && <div className="flex justify-between text-[12px] text-muted font-medium"><span>Biaya admin</span><span>{idr(rekondisi.adminFee)}</span></div>}
                        {rekondisi.additionalFee != null && <div className="flex justify-between text-[12px] text-muted font-medium"><span>Biaya lain</span><span>{idr(rekondisi.additionalFee)}</span></div>}
                        <div className="flex justify-between text-[13px] font-extrabold text-ink pt-1.5 border-t border-border"><span>Total</span><span>{idr(rekondisi.total)}</span></div>
                        <div className="flex justify-between text-[12px] text-muted font-medium"><span>Status bayar</span><span>{rekondisi.paidAt ? 'Sudah dibayar' : 'Belum dibayar'}</span></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  {r.status === 'PENDING' && (
                    <button onClick={() => m.progress.mutate(r.id)} disabled={m.progress.isPending || !hasVendor} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-blue text-white font-bold text-[12px] hover:bg-accent-blue/90 transition-colors disabled:opacity-60" title={!hasVendor ? 'Vendor wajib diisi sebelum mulai pengerjaan' : undefined}>
                      {m.progress.isPending ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                      Mulai Pengerjaan
                    </button>
                  )}
                  {r.status === 'IN_PROGRESS' && !showDone && (
                    <button onClick={() => setShowDone(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-green text-white font-bold text-[12px] hover:bg-accent-green/90 transition-colors">
                      <CheckCircle size={13} /> Selesaikan Rekondisi
                    </button>
                  )}
                </div>
              )}
              {showDone && <DoneForm rekondisiId={r.id} onClose={() => setShowDone(false)} />}
              {canPay && !showPay && <button onClick={() => setShowPay(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white font-bold text-[12px] hover:bg-primary/90 transition-colors"><Receipt size={13} /> Bayar Rekondisi</button>}
              {showPay && <PayForm rekondisiId={r.id} onClose={() => setShowPay(false)} />}
              {rekondisi.invoiceUrl && <a href={mediaUrl(rekondisi.invoiceUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"><Receipt size={13} /> Lihat Invoice</a>}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && dm.remove.mutate(toDelete, { onSuccess: () => setToDelete(null), onError: (err) => notifyApiError(err) })} title="Hapus Item" message="Hapus item pekerjaan ini?" tone="danger" />
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

  const handleCreate = async () => {
    if (!unitId) return;
    try {
      const check = await unitApi.rekondisiStatusCheck(unitId);
      if (check.data.hasUnfinishedRekondisi) {
        store.dispatch(showToast({
          type: 'general',
          title: 'Rekondisi masih berjalan',
          message: 'Unit ini masih memiliki rekondisi PENDING atau IN_PROGRESS.',
        }));
        return;
      }
      await createM.mutateAsync(unitId);
    } catch (err) {
      notifyApiError(err);
    }
  };

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
          <Button icon={<Plus size={15} />} onClick={() => { void handleCreate(); }} disabled={createM.isPending}>
            {createM.isPending ? 'Membuat...' : 'Buat Rekondisi'}
          </Button>
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
          <p className="text-muted text-[13px] font-medium mt-1">Klik "Buat Rekondisi" untuk memulai entri biaya.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rekondisiList.map((r) => <RekondisiCard key={r.id} r={r} />)}
        </div>
      )}
    </Modal>
  );
};
