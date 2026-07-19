import { useState, useEffect } from 'react';
import {
  Inbox, Save, Mail, Phone, Trash2, MailOpen, CornerUpLeft, Archive, ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { formatDate } from '@/core/utils/format';
import { notifyApiError } from '@/core/api/notify';
import { TextArea } from './CmsKit';
import {
  useContactPage, useUpdateContactPage,
  useContactMessages, useContactMessageMutations, useContactMessageCount,
} from './cms.hooks';
import type { ContactPage, ContactMessage, ContactStatus } from './cms.types';

const STATUS_META: Record<ContactStatus, { label: string; cls: string }> = {
  NEW: { label: 'Baru', cls: 'bg-primary/10 text-primary' },
  READ: { label: 'Dibaca', cls: 'bg-accent-blue/10 text-accent-blue' },
  REPLIED: { label: 'Dibalas', cls: 'bg-accent-green/10 text-accent-green' },
  ARCHIVED: { label: 'Arsip', cls: 'bg-muted/10 text-muted' },
};
const TABS: { key: ContactStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Semua' }, { key: 'NEW', label: 'Baru' },
  { key: 'READ', label: 'Dibaca' }, { key: 'REPLIED', label: 'Dibalas' }, { key: 'ARCHIVED', label: 'Arsip' },
];

/* ── Header editor ── */
const HeaderEditor = () => {
  const { data, isLoading } = useContactPage();
  const update = useUpdateContactPage();
  const [f, setF] = useState<ContactPage | null>(null);
  useEffect(() => { if (data && !f) setF(structuredClone(data)); }, [data, f]);
  if (isLoading || !f) return null;
  return (
    <SectionCard title="Header Halaman Kontak" icon={<Mail size={16} />}
      action={<Button icon={<Save size={14} />} onClick={() => update.mutate(f, { onError: (e) => notifyApiError(e) })} loading={update.isPending}>{update.isPending ? 'Menyimpan…' : 'Simpan'}</Button>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={f.eyebrow} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} />
        <TextField label="Judul" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </div>
      <TextArea label="Subtitle" value={f.subtitle} onChange={(v) => setF({ ...f, subtitle: v })} rows={2} />
    </SectionCard>
  );
};

export const ContactInboxPage = () => {
  const [tab, setTab] = useState<ContactStatus | 'ALL'>('ALL');
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ msg: ContactMessage; status: ContactStatus; label: string } | null>(null);

  const { data, isLoading, isError } = useContactMessages({ page: 1, limit: 100, status: tab === 'ALL' ? undefined : tab });
  const { data: countNew } = useContactMessageCount();
  const rows = data?.data ?? [];
  const m = useContactMessageMutations();

  const setStatus = (id: string, status: ContactStatus) => m.setStatus.mutate({ id, status }, { onError: (e) => notifyApiError(e) });

  const columns: Column<ContactMessage>[] = [
    {
      header: 'Pengirim',
      cell: (r) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{r.name}</p>
          <p className="text-[11px] text-muted font-medium mt-0.5 flex items-center gap-1"><Phone size={10} /> {r.phone}</p>
        </div>
      ),
    },
    { header: 'Pesan', cell: (r) => <p className="text-[12px] text-ink-soft font-medium line-clamp-2 max-w-md">{r.message}</p> },
    { header: 'Tanggal', align: 'right', cell: (r) => <span className="text-[12px] font-semibold text-muted">{formatDate(r.createdAt)}</span> },
    { header: 'Status', align: 'center', cell: (r) => <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${STATUS_META[r.status].cls}`}>{STATUS_META[r.status].label}</span> },
    {
      header: '', align: 'right',
      cell: (r) => (
        <ActionMenu items={[
          { icon: <MailOpen size={13} />, label: 'Lihat Pesan', onClick: () => { setDetail(r); if (r.status === 'NEW') setStatus(r.id, 'READ'); }, variant: 'primary', dividerAfter: true },
          { icon: <CornerUpLeft size={13} />, label: 'Tandai Dibalas', onClick: () => setConfirmStatus({ msg: r, status: 'REPLIED', label: 'ditandai sebagai sudah dibalas' }) },
          { icon: <Archive size={13} />, label: 'Arsipkan', onClick: () => setConfirmStatus({ msg: r, status: 'ARCHIVED', label: 'diarsipkan' }), dividerAfter: true },
          { icon: <Trash2 size={13} />, label: 'Hapus', onClick: () => setToDelete(r), variant: 'danger' },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Kontak & Pesan" description="Kelola header halaman kontak dan pesan masuk dari pengunjung."
        action={<a href="/kontak" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>} />

      <HeaderEditor />

      {/* Inbox */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
              tab === t.key ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
            }`}>
            {t.label}
            {t.key === 'NEW' && countNew && countNew.new > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{countNew.new}</span>
            )}
          </button>
        ))}
      </div>

      <SectionCard title={`Pesan Masuk (${rows.length})`} icon={<Inbox size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat pesan.</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16"><Inbox size={32} className="text-muted mx-auto mb-3" /><p className="font-bold text-ink text-[14px]">Belum ada pesan.</p></div>
        ) : (
          <DataTable columns={columns} data={rows} rowKey={(r) => r.id} />
        )}
      </SectionCard>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Pesan" icon={<MailOpen size={18} />} size="md"
        footer={<Button variant="secondary" onClick={() => setDetail(null)}>Tutup</Button>}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Nama</p><p className="font-bold text-ink text-[14px]">{detail.name}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Status</p><span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${STATUS_META[detail.status].cls}`}>{STATUS_META[detail.status].label}</span></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Telepon</p><p className="font-semibold text-ink-soft text-[13px]">{detail.phone}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Email</p><p className="font-semibold text-ink-soft text-[13px]">{detail.email ?? '—'}</p></div>
            </div>
            <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Pesan</p>
              <p className="text-[13px] text-ink-soft font-medium leading-relaxed bg-surface-soft border border-border rounded-xl p-3">{detail.message}</p></div>
            <div className="flex gap-2">
              <a href={`https://wa.me/${detail.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1">
                <Button block icon={<Phone size={15} />} onClick={() => setStatus(detail.id, 'REPLIED')}>Balas via WhatsApp</Button>
              </a>
              <Button variant="secondary" icon={<Archive size={15} />} onClick={() => { setStatus(detail.id, 'ARCHIVED'); setDetail(null); }}>Arsip</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })}
        title="Hapus Pesan" message={`Hapus pesan dari "${toDelete?.name}"?`} tone="danger" confirmLabel="Hapus"
        loading={m.remove.isPending} closeOnConfirm={false} />

      <ConfirmDialog
        open={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() => confirmStatus && m.setStatus.mutate({ id: confirmStatus.msg.id, status: confirmStatus.status }, { onSuccess: () => setConfirmStatus(null), onError: (e) => notifyApiError(e) })}
        loading={m.setStatus.isPending}
        closeOnConfirm={false}
        tone="primary"
        title={confirmStatus?.status === 'REPLIED' ? 'Tandai Sudah Dibalas' : 'Arsipkan Pesan'}
        message={confirmStatus ? `Pesan dari "${confirmStatus.msg.name}" akan ${confirmStatus.label}. Lanjutkan?` : ''}
        confirmLabel="Ya, Lanjutkan"
      />
    </div>
  );
};
