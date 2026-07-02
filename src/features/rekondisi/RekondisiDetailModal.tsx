import { useState, useMemo, type FormEvent } from 'react';
import {
  Wrench, Plus, Pencil, Trash2, PlayCircle, CheckCircle2, Loader2,
  Receipt, FilePlus2, ListChecks, ChevronDown, ChevronUp, Check, Car,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import {
  useRekondisi, useRekondisiMutations, useRekondisiDetails, useRekondisiDetailMutations, useRekondisis,
} from './rekondisi.hooks';
import { useVendors, usePengecekan } from '@/features/master/master.hooks';
import { useCreateRekondisi } from '@/features/units/unit.hooks';
import { notifyApiError } from '@/core/api/notify';
import {
  REKONDISI_STATUS_LABEL, REKONDISI_STATUS_COLOR,
  type Rekondisi, type RekondisiDetail, type RekondisiDoneFormData, type RekondisiStatus,
} from './rekondisi.types';

const idr = (n?: number | null) =>
  n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

/* ── Stepper header ── */
const STEPS = [
  { key: 'create', label: 'Buat', icon: FilePlus2 },
  { key: 'items', label: 'Isi Item', icon: ListChecks },
  { key: 'progress', label: 'Pengerjaan', icon: PlayCircle },
  { key: 'done', label: 'Selesai', icon: CheckCircle2 },
] as const;

const stepIndexOf = (status?: RekondisiStatus): number => {
  if (!status) return 0;
  if (status === 'PENDING') return 1;
  if (status === 'IN_PROGRESS') return 2;
  return 3; // COMPLETED
};

const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center px-1">
    {STEPS.map((s, i) => {
      const Icon = s.icon;
      const done = i < current;
      const active = i === current;
      return (
        <div key={s.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              done ? 'bg-accent-green text-white'
                : active ? 'bg-primary text-white shadow-glow'
                : 'bg-surface-soft text-muted border border-border'
            }`}>
              {done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
            </div>
            <span className={`text-[10.5px] font-bold ${active ? 'text-primary' : done ? 'text-accent-green' : 'text-muted'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-colors ${i < current ? 'bg-accent-green' : 'bg-border'}`} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Inline detail item row ── */
const DetailItemRow = ({
  item, rekondisiId, canEdit, onDelete,
}: { item: RekondisiDetail; rekondisiId: string; canEdit: boolean; onDelete: (id: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(item.description ?? '');
  const [nom, setNom] = useState(String(item.nominal));
  const m = useRekondisiDetailMutations(rekondisiId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    m.update.mutate({ id: item.id, data: { description: desc || undefined, nominal: Number(nom) } },
      { onSuccess: () => setEditing(false), onError: (err) => notifyApiError(err) });
  };

  if (editing) {
    return (
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-2.5 bg-surface-soft/60 border-b border-divider">
        <span className="text-[12px] font-semibold text-muted shrink-0 w-28 truncate">{item.pengecekan?.name}</span>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi"
          className="flex-1 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
        <input value={nom} onChange={(e) => setNom(e.target.value)} type="number" min={0} required placeholder="Nominal"
          className="w-32 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
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

/* ── Item list + add (dipakai step Isi Item & Pengerjaan) ── */
const ItemsPanel = ({ rekondisiId, canEdit }: { rekondisiId: string; canEdit: boolean }) => {
  const { data: itemsRes } = useRekondisiDetails(rekondisiId);
  const items: RekondisiDetail[] = itemsRes?.data ?? [];
  const { data: pengecekanRes } = usePengecekan({ limit: 100 });
  const pengecekans = (pengecekanRes?.data ?? []) as { id: string; name: string }[];
  const dm = useRekondisiDetailMutations(rekondisiId);

  const [addForm, setAddForm] = useState(false);
  const [pid, setPid] = useState('');
  const [desc, setDesc] = useState('');
  const [nom, setNom] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dm.create.mutate({ pengecekanId: pid, description: desc || undefined, nominal: Number(nom) },
      { onSuccess: () => { setPid(''); setDesc(''); setNom(''); setAddForm(false); }, onError: (err) => notifyApiError(err) });
  };

  const total = items.reduce((s, it) => s + (it.nominal ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-bold text-ink">Item Pekerjaan ({items.length})</p>
        {canEdit && (
          <button onClick={() => setAddForm((v) => !v)} className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            <Plus size={13} /> Tambah Item
          </button>
        )}
      </div>

      {addForm && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-surface border border-border rounded-xl">
          <select required value={pid} onChange={(e) => setPid(e.target.value)}
            className="flex-1 min-w-[140px] h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary">
            <option value="">Pilih pengecekan...</option>
            {pengecekans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi (opsional)"
            className="w-40 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
          <input required type="number" min={0} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nominal"
            className="w-28 h-8 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
          <button type="submit" disabled={dm.create.isPending} className="h-8 px-3 rounded-lg bg-primary text-white text-[11px] font-bold">
            {dm.create.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Tambah'}
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-center py-6 text-[12px] text-muted border border-dashed border-border rounded-xl">Belum ada item pekerjaan.</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {items.map((it) => <DetailItemRow key={it.id} item={it} rekondisiId={rekondisiId} canEdit={canEdit} onDelete={setToDelete} />)}
          <div className="px-4 py-2.5 bg-surface border-t border-border flex justify-between text-[13px] font-extrabold text-ink">
            <span>Subtotal Pekerjaan</span><span>{idr(total)}</span>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && dm.remove.mutate(toDelete, { onSuccess: () => setToDelete(null), onError: (err) => notifyApiError(err) })}
        title="Hapus Item" message="Hapus item pekerjaan ini?" tone="danger" />
    </div>
  );
};

/* ── Done form ── */
const DoneForm = ({ rekondisiId, onDone }: { rekondisiId: string; onDone: () => void }) => {
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
    m.done.mutate({ id: rekondisiId, data }, { onSuccess: onDone, onError: (err) => notifyApiError(err) });
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-surface-soft rounded-xl border border-border">
      <p className="text-[12px] font-bold text-ink">Selesaikan &amp; hitung total biaya</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Pajak', val: tax, set: setTax },
          { label: 'Biaya Admin', val: adminFee, set: setAdminFee },
          { label: 'Biaya Lain', val: additionalFee, set: setAdditionalFee },
        ].map((f) => (
          <div key={f.label}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">{f.label}</p>
            <input type="number" min={0} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder="0"
              className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] bg-surface focus:outline-none focus:border-primary" />
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Invoice (opsional)</p>
        <input type="file" accept="image/*,.pdf" onChange={(e) => setInvoice(e.target.files?.[0] ?? null)}
          className="w-full text-[12px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-[11px] file:font-bold file:px-3 file:py-1.5" />
      </div>
      <button type="submit" disabled={m.done.isPending}
        className="w-full h-10 rounded-xl bg-accent-green text-white text-[13px] font-bold flex items-center justify-center gap-1.5">
        {m.done.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />} Selesaikan Rekondisi
      </button>
    </form>
  );
};

/* ── Active rekondisi (stepper content) ── */
const ActivePanel = ({ rekondisi }: { rekondisi: Rekondisi }) => {
  const { data: detailRes } = useRekondisi(rekondisi.id);
  const r = (detailRes?.data as Rekondisi | undefined) ?? rekondisi;
  const { data: vendorsRes } = useVendors({ limit: 100 });
  const vendors = (vendorsRes?.data ?? []) as { id: string; name: string }[];
  const m = useRekondisiMutations();

  const [editInfo, setEditInfo] = useState(false);
  const [vendorId, setVendorId] = useState(r.vendorId ?? '');
  const [keterangan, setKeterangan] = useState(r.keterangan ?? '');

  const submitInfo = (e: FormEvent) => {
    e.preventDefault();
    m.update.mutate({ id: r.id, data: { vendorId: vendorId || null, keterangan: keterangan || null } },
      { onSuccess: () => setEditInfo(false), onError: (err) => notifyApiError(err) });
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      {editInfo ? (
        <form onSubmit={submitInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-soft rounded-xl border border-border">
          <SelectField label="Vendor / Bengkel" value={vendorId} onChange={(e) => setVendorId(e.target.value)}
            options={[{ value: '', label: 'Pilih vendor...' }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]} />
          <TextField label="Keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Perbaikan AC dan kaki-kaki" />
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={m.update.isPending}>Simpan</Button>
            <Button variant="secondary" onClick={() => setEditInfo(false)}>Batal</Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-surface-soft border border-border">
          <div className="space-y-0.5 text-[12px]">
            <p className="text-muted font-medium">Vendor: <span className="text-ink font-bold">{r.vendor?.name ?? '—'}</span></p>
            <p className="text-muted font-medium">Keterangan: <span className="text-ink font-semibold">{r.keterangan ?? '—'}</span></p>
          </div>
          <button onClick={() => setEditInfo(true)} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10"><Pencil size={14} /></button>
        </div>
      )}

      <ItemsPanel rekondisiId={r.id} canEdit />

      {/* Step action */}
      {r.status === 'PENDING' && (
        <button onClick={() => m.progress.mutate(r.id, { onError: (err) => notifyApiError(err) })} disabled={m.progress.isPending}
          className="w-full h-11 rounded-xl bg-accent-blue text-white font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-accent-blue/90 transition-colors disabled:opacity-60">
          {m.progress.isPending ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={16} />} Mulai Pengerjaan
        </button>
      )}
      {r.status === 'IN_PROGRESS' && <DoneForm rekondisiId={r.id} onDone={() => { /* refetch via invalidate */ }} />}
    </div>
  );
};

/* ── History (completed) ── */
const HistoryCard = ({ r }: { r: Rekondisi }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors text-left">
        <span className="text-[11px] font-bold text-muted shrink-0">#{r.seq}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${REKONDISI_STATUS_COLOR[r.status]}`}>{REKONDISI_STATUS_LABEL[r.status]}</span>
        <span className="text-[13px] font-semibold text-ink-soft truncate flex-1">{r.vendor?.name ?? (r.keterangan || '—')}</span>
        <span className="font-bold text-ink text-[13px] shrink-0">{idr(r.total)}</span>
        {open ? <ChevronUp size={15} className="text-muted shrink-0" /> : <ChevronDown size={15} className="text-muted shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border bg-surface-soft/30 p-4 space-y-2 text-[12px]">
          <div className="flex justify-between text-muted font-medium"><span>Nominal pekerjaan</span><span>{idr(r.nominal)}</span></div>
          {r.tax != null && <div className="flex justify-between text-muted font-medium"><span>Pajak</span><span>{idr(r.tax)}</span></div>}
          {r.adminFee != null && <div className="flex justify-between text-muted font-medium"><span>Biaya admin</span><span>{idr(r.adminFee)}</span></div>}
          {r.additionalFee != null && <div className="flex justify-between text-muted font-medium"><span>Biaya lain</span><span>{idr(r.additionalFee)}</span></div>}
          <div className="flex justify-between text-[13px] font-extrabold text-ink pt-1.5 border-t border-border"><span>Total</span><span>{idr(r.total)}</span></div>
          {r.invoiceUrl && <a href={r.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline pt-1"><Receipt size={13} /> Lihat Invoice</a>}
        </div>
      )}
    </div>
  );
};

/* ── Main Modal ── */
interface Props {
  open: boolean;
  onClose: () => void;
  unitId: string | null;
  unitLabel?: string;
}

export const RekondisiDetailModal = ({ open, onClose, unitId, unitLabel }: Props) => {
  const { data, isLoading } = useRekondisis(open && unitId ? { unitId, limit: 50 } : undefined);
  const list: Rekondisi[] = (data?.data ?? []) as Rekondisi[];
  const createM = useCreateRekondisi();

  const active = useMemo(() => list.find((r) => r.status !== 'COMPLETED') ?? null, [list]);
  const history = useMemo(() => list.filter((r) => r.status === 'COMPLETED'), [list]);
  const currentStep = stepIndexOf(active?.status);

  const handleCreate = () => { if (unitId) createM.mutate(unitId, { onError: (err) => notifyApiError(err) }); };

  return (
    <Modal open={open} onClose={onClose} icon={<Wrench size={20} />}
      title="Kelola Rekondisi" subtitle={unitLabel ?? 'Ikuti tahapan di bawah untuk mengelola rekondisi unit'} size="xl"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}>
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : (
        <div className="space-y-5">
          {/* Stepper */}
          <div className="pt-1"><Stepper current={currentStep} /></div>

          {/* Step content */}
          {!active ? (
            <div className="text-center py-10 border border-dashed border-border rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
                <Car size={26} className="text-primary" />
              </div>
              <p className="font-extrabold text-ink text-[15px]">
                {list.length === 0 ? 'Belum ada rekondisi' : 'Semua rekondisi selesai'}
              </p>
              <p className="text-muted text-[13px] font-medium mt-1 max-w-xs mx-auto leading-relaxed">
                Mulai rekondisi baru untuk mencatat vendor, item pekerjaan, dan biaya perbaikan unit ini.
              </p>
              <Button icon={<Plus size={15} />} onClick={handleCreate} disabled={createM.isPending} className="mt-4">
                {createM.isPending ? 'Membuat…' : 'Buat Rekondisi Baru'}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-muted">Rekondisi #{active.seq}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${REKONDISI_STATUS_COLOR[active.status]}`}>{REKONDISI_STATUS_LABEL[active.status]}</span>
              </div>
              <ActivePanel rekondisi={active} />
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wide">Riwayat Selesai ({history.length})</p>
              {history.map((r) => <HistoryCard key={r.id} r={r} />)}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
