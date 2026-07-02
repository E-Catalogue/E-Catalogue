import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Search, Loader2, CheckCircle2, Archive, Reply, Trash2, Eye } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { contactMessageApi } from './cms.api';
import type { ContactMessage, ContactStatus } from './cms.types';
import { formatDate } from '@/core/utils/format';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';

const STATUS_CONFIG: Record<ContactStatus, { label: string; color: string; icon: any }> = {
  NEW: { label: 'Baru', color: 'bg-primary-light text-primary', icon: Mail },
  READ: { label: 'Dibaca', color: 'bg-accent-blue/10 text-accent-blue', icon: Eye },
  REPLIED: { label: 'Dibalas', color: 'bg-accent-green/10 text-accent-green', icon: Reply },
  ARCHIVED: { label: 'Diarsipkan', color: 'bg-muted/10 text-muted', icon: Archive },
};

export const InboxPage = () => {
  const { can } = usePermissions();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['/cms/contact-messages', { page, search: debounced }],
    queryFn: () => contactMessageApi.list({ page, limit: 10, search: debounced }),
  });
  const rows = data?.data ?? [];

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) => contactMessageApi.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/cms/contact-messages'] }),
  });
  
  const remove = useMutation({
    mutationFn: contactMessageApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/cms/contact-messages'] }),
  });

  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const [viewDetail, setViewDetail] = useState<ContactMessage | null>(null);

  const handleSetStatus = (msg: ContactMessage, status: ContactStatus) => {
    setStatus.mutate({ id: msg.id, status }, { onError: (e) => notifyApiError(e) });
  };

  const openDetail = (msg: ContactMessage) => {
    setViewDetail(msg);
    if (msg.status === 'NEW' && can('KONTAK_UPDATE')) {
      handleSetStatus(msg, 'READ');
    }
  };

  const columns: Column<ContactMessage>[] = [
    {
      header: 'Tanggal',
      cell: (r) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{formatDate(r.createdAt)}</p>
          <p className="text-[11px] text-muted">{new Date(r.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      ),
    },
    {
      header: 'Pengirim',
      cell: (r) => (
        <div>
          <p className="font-bold text-ink text-[13px]">{r.name}</p>
          <p className="text-[11px] font-medium text-muted">{r.phone} {r.email ? `• ${r.email}` : ''}</p>
        </div>
      ),
    },
    {
      header: 'Pesan',
      cell: (r) => <p className="text-[12px] font-medium text-ink-soft max-w-xs truncate">{r.message}</p>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (r) => {
        const conf = STATUS_CONFIG[r.status];
        const Icon = conf.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${conf.color}`}>
            <Icon size={12} /> {conf.label}
          </span>
        );
      },
    },
    {
      header: '',
      align: 'right',
      cell: (r) => {
        const canUpdate = can('KONTAK_UPDATE');
        return (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => openDetail(r)} className="p-1.5 text-muted hover:text-primary transition-colors bg-surface-soft hover:bg-primary-light rounded-lg">
              <Eye size={15} />
            </button>
            <ActionMenu items={[
              { icon: <CheckCircle2 size={14} />, label: 'Tandai Dibaca', onClick: () => handleSetStatus(r, 'READ'), hidden: !canUpdate || r.status === 'READ' || r.status === 'REPLIED' },
              { icon: <Reply size={14} />, label: 'Tandai Dibalas', onClick: () => handleSetStatus(r, 'REPLIED'), hidden: !canUpdate || r.status === 'REPLIED' },
              { icon: <Archive size={14} />, label: 'Arsipkan', onClick: () => handleSetStatus(r, 'ARCHIVED'), hidden: !canUpdate || r.status === 'ARCHIVED' },
              { icon: <Trash2 size={14} />, label: 'Hapus', onClick: () => setToDelete(r), variant: 'danger' as const, dividerAfter: true, hidden: !can('KONTAK_DELETE') },
            ].filter(x => !x.hidden) as any} />
          </div>
        );
      },
    },
  ];

  return (
    <RequirePermission code="KONTAK_READ">
      <div className="max-w-[1200px] mx-auto space-y-5">
        <PageHeader
          title="Inbox Kontak"
          description="Pesan dari pengunjung website melalui formulir kontak."
        />

        <div className="relative max-w-xs">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari pesan, nama, email..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <SectionCard title="Daftar Pesan" icon={<Mail size={16} />} bodyClassName="p-0 md:p-0">
          {isLoading ? <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
            : isError ? <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat pesan.</div>
            : rows.length === 0 ? <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada pesan masuk.</div>
            : <><DataTable columns={columns} data={rows} rowKey={(r) => r.id} /><div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div></>}
        </SectionCard>

        {/* Detail Modal */}
        <Modal open={!!viewDetail} onClose={() => setViewDetail(null)} title="Detail Pesan" icon={<Mail size={18} />}>
          {viewDetail && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-ink text-base">{viewDetail.name}</p>
                  <p className="text-sm font-semibold text-muted mt-1">{viewDetail.phone} {viewDetail.email ? `• ${viewDetail.email}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{formatDate(viewDetail.createdAt)}</p>
                  <p className="text-[11px] text-muted">{new Date(viewDetail.createdAt).toLocaleTimeString('id-ID')}</p>
                </div>
              </div>
              <div className="bg-surface-soft p-4 rounded-xl border border-border">
                <p className="text-[13px] text-ink whitespace-pre-wrap leading-relaxed">{viewDetail.message}</p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <a href={`https://wa.me/${viewDetail.phone.replace(/^0/, '62')}`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" icon={<Reply size={16} />}>Balas via WA</Button>
                </a>
                {can('KONTAK_UPDATE') && viewDetail.status !== 'REPLIED' && (
                  <Button icon={<CheckCircle2 size={16} />} onClick={() => { handleSetStatus(viewDetail, 'REPLIED'); setViewDetail(null); }}>Tandai Dibalas</Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id, { onError: (e) => notifyApiError(e) })} title="Hapus Pesan" message={toDelete ? `Hapus pesan dari ${toDelete.name}?` : ''} />
      </div>
    </RequirePermission>
  );
};
