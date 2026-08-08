import { useState } from 'react';
import {
  Inbox, Save, Mail, Phone, Trash2, MailOpen, CornerUpLeft, Archive, ExternalLink, MapPin, CircleHelp, Megaphone, FileText, Plus,
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
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { formatDate } from '@/core/utils/format';
import { notifyApiError } from '@/core/api/notify';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import { TextArea, CmsTabs, SectionBar, SectionCardShell } from './CmsKit';
import {
  useContactPage, useUpdateContactPage, useSectionForm,
  useContactMessages, useContactMessageMutations, useContactMessageCount,
} from './cms.hooks';
import type { ContactPage, ContactFormContent, ContactLocations, ContactFaq, ContactCta, ContactMessage, ContactStatus } from './cms.types';

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
  const confirmAction = useConfirmedAction();
  const [draft, setDraft] = useState<ContactPage | null>(null);
  const f = draft ?? data ?? null;
  const setF = setDraft;
  if (isLoading || !f) return null;
  const save = () => confirmAction({
    title: 'Simpan Header Halaman Kontak',
    message: 'Perubahan akan langsung tayang di halaman kontak publik. Lanjutkan?',
    confirmLabel: 'Simpan',
    tone: 'primary',
    execute: () => update.mutateAsync(f),
    onSuccess: () => setDraft(null),
    onError: (e) => notifyApiError(e),
  });
  return (
    <SectionCard title="Header Halaman Kontak" icon={<Mail size={16} />} bodyClassName="space-y-5"
      action={<div className="flex items-center gap-2">{draft && <span className="rounded-full bg-accent-amber/10 px-2.5 py-1 text-[10px] font-extrabold text-accent-amber">Belum disimpan</span>}<Button icon={<Save size={14} />} onClick={save} loading={update.isPending}>{update.isPending ? 'Menyimpan…' : 'Simpan'}</Button></div>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={f.eyebrow} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} />
        <TextField label="Judul" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </div>
      <TextArea label="Subtitle" value={f.subtitle} onChange={(v) => setF({ ...f, subtitle: v })} rows={2} />
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-light to-surface p-5"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Preview hero Kontak</p><h4 className="mt-2 text-2xl font-extrabold text-ink">{f.title || 'Judul halaman Kontak'}</h4><p className="mt-2 text-[12px] font-medium leading-5 text-muted">{f.subtitle || 'Pengantar lokasi dan kontak showroom akan tampil di sini.'}</p></div>
    </SectionCard>
  );
};

const ContactSectionEditor = ({ section }: { section: 'form' | 'locations' | 'faq' | 'cta' }) => {
  const state = useSectionForm<ContactFormContent & ContactLocations & ContactFaq & ContactCta>('contact', section);
  const { form, patch, save, toggleVisible, saving, isLoading } = state; if (isLoading || !form) return null;
  if (section === 'form') return <SectionCardShell><SectionBar title="Konten Form" icon={<FileText size={16} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /><TextArea label="Subtitle" value={form.subtitle} onChange={(subtitle) => patch({ subtitle })} /><div className="grid md:grid-cols-2 gap-4"><TextField label="Label Tombol" value={form.submitLabel} onChange={(e) => patch({ submitLabel: e.target.value })} /><TextField label="Judul Sukses" value={form.successTitle} onChange={(e) => patch({ successTitle: e.target.value })} /></div><TextArea label="Pesan Sukses" value={form.successText} onChange={(successText) => patch({ successText })} /></SectionCardShell>;
  if (section === 'locations') return <SectionCardShell><SectionBar title="Lokasi Cabang" icon={<MapPin size={16} />} hint="Daftar dan marker berasal dari cabang bertanda publik" isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} /><div className="grid md:grid-cols-2 gap-4"><TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /></div><TextArea label="Subtitle" value={form.subtitle} onChange={(subtitle) => patch({ subtitle })} /></SectionCardShell>;
  if (section === 'cta') return <SectionCardShell><SectionBar title="CTA WhatsApp" icon={<Megaphone size={16} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /><TextArea label="Subtitle" value={form.subtitle} onChange={(subtitle) => patch({ subtitle })} /><TextField label="Label Tombol" value={form.label} onChange={(e) => patch({ label: e.target.value })} /></SectionCardShell>;
  const items = form.items ?? [];
  return <SectionCardShell><SectionBar title="FAQ Kontak" icon={<CircleHelp size={16} />} isVisible={form.isVisible} onToggleVisible={toggleVisible} onSave={save} saving={saving} /><div className="grid md:grid-cols-2 gap-4"><TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} /><TextField label="Judul" value={form.title} onChange={(e) => patch({ title: e.target.value })} /></div><div className="space-y-3">{items.map((item, index) => <div key={index} className="space-y-3 rounded-xl border border-border p-4"><TextField label="Pertanyaan" value={item.question} onChange={(e) => patch({ items: items.map((v, i) => i === index ? { ...v, question: e.target.value } : v) })} /><TextArea label="Jawaban" value={item.answer} onChange={(answer) => patch({ items: items.map((v, i) => i === index ? { ...v, answer } : v) })} /><button onClick={() => patch({ items: items.filter((_, i) => i !== index) })} className="text-xs font-bold text-semantic-error">Hapus</button></div>)}<Button variant="secondary" icon={<Plus size={14} />} onClick={() => patch({ items: [...items, { question: '', answer: '' }] })}>Tambah FAQ</Button></div></SectionCardShell>;
};

export const ContactInboxPage = () => {
  const [cmsTab, setCmsTab] = useState<'hero' | 'form' | 'locations' | 'faq' | 'cta'>('hero');
  const [tab, setTab] = useState<ContactStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ msg: ContactMessage; status: ContactStatus; label: string } | null>(null);
  const debounced = useDebouncedValue(search, 400);

  const { data, isLoading, isError } = useContactMessages({
    page,
    limit,
    status: tab === 'ALL' ? undefined : tab,
    search: debounced || undefined,
  });
  const { data: countNew } = useContactMessageCount();
  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? rows.length;
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

      <CmsTabs tabs={[{ key: 'hero', label: 'Hero', icon: <Mail size={14} /> }, { key: 'form', label: 'Form', icon: <FileText size={14} /> }, { key: 'locations', label: 'Lokasi', icon: <MapPin size={14} /> }, { key: 'faq', label: 'FAQ', icon: <CircleHelp size={14} /> }, { key: 'cta', label: 'CTA', icon: <Megaphone size={14} /> }]} active={cmsTab} onChange={setCmsTab} />
      {cmsTab === 'hero' ? <HeaderEditor /> : <ContactSectionEditor section={cmsTab} />}

      {/* Inbox — filter status */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-slim rounded-2xl border border-border bg-surface p-1.5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
            className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all shrink-0 ${
              tab === t.key ? 'bg-primary text-white shadow-glow' : 'text-ink-soft hover:bg-surface-soft'
            }`}>
            {t.label}
            {t.key === 'NEW' && countNew && countNew.new > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{countNew.new}</span>
            )}
          </button>
        ))}
      </div>

      <SectionCard
        title={`Pesan Masuk (${total})`}
        icon={<Inbox size={16} />}
        bodyClassName="p-0 md:p-0"
        action={
          <div className="w-56">
            <SearchInput
              placeholder="Cari pesan..."
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
        }
      >
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat pesan.</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="Belum ada pesan" description={tab === 'ALL' ? 'Pesan yang dikirim melalui formulir kontak akan tampil di sini.' : 'Tidak ada pesan dengan status yang dipilih.'} />
        ) : (
          <>
            <DataTable columns={columns} data={rows} rowKey={(r) => r.id} />
            <div className="px-4 pb-4">
              <Pagination
                meta={data?.meta}
                page={page}
                onChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                itemLabel="pesan"
              />
            </div>
          </>
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
