import { useEffect, useState } from 'react';
import { History, UserRound } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { formatDate } from '@/core/utils/format';
import { useLead, useLeadOpportunities } from './crm.hooks';
import {
  LEAD_STATUS_COLOR,
  LEAD_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type LeadOpportunityHistory,
} from './crm.types';

interface Props {
  id: string | null;
  onClose: () => void;
}

const Status = ({ status }: { status: keyof typeof LEAD_STATUS_LABEL }) => (
  <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${LEAD_STATUS_COLOR[status]}`}>
    {LEAD_STATUS_LABEL[status]}
  </span>
);

const OpportunityCard = ({ item }: { item: LeadOpportunityHistory }) => (
  <div className="rounded-2xl border border-divider bg-surface-soft p-4 space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <div className="flex items-center gap-2"><Status status={item.status} /><span className="text-[11px] font-semibold text-muted">Dibuka {formatDate(item.openedAt)}</span></div>
        <p className="mt-2 text-sm font-bold text-ink">PIC: {item.sales?.name ?? '-'}</p>
        {item.closedAt && <p className="text-[11px] text-muted">Ditutup {formatDate(item.closedAt)}</p>}
      </div>
      <span className="text-[11px] font-semibold text-muted">{item._count.testDrives} test drive · {item._count.leadOrders} order</span>
    </div>

    {item.testDrives.length > 0 && (
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">Test Drive</p>
        <div className="space-y-1.5">
          {item.testDrives.map((testDrive) => (
            <p key={testDrive.id} className="text-xs text-ink-soft">
              {formatDate(testDrive.scheduledAt)} · {testDrive.unit?.name ?? testDrive.unit?.platNomor ?? '-'} · {testDrive.status}
            </p>
          ))}
        </div>
      </div>
    )}

    {item.leadOrders.length > 0 && (
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">Sales Order</p>
        <div className="space-y-1.5">
          {item.leadOrders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-bold text-ink">{order.nomorOrder}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</span>
              <span className="text-ink-soft">{order.unit?.name ?? order.unit?.platNomor ?? '-'}</span>
              {(order.dealAt || order.cancelledAt) && <span className="text-muted">{formatDate(order.dealAt || order.cancelledAt || '')}</span>}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export const LeadDetailModal = ({ id, onClose }: Props) => {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [id]);
  const lead = useLead(id);
  const opportunities = useLeadOpportunities(id, page, 10);
  const data = lead.data;
  const rows = opportunities.data?.data ?? [];

  return (
    <Modal open={!!id} onClose={onClose} icon={<UserRound size={20} />} title="Detail Lead" subtitle={data?.nama ?? 'Memuat detail customer'} size="xl">
      {lead.isLoading ? <p className="py-8 text-center text-sm font-semibold text-muted">Memuat detail...</p> : data && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-3 rounded-2xl bg-surface-soft p-4 sm:grid-cols-2">
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-muted">Kontak</p><p className="mt-1 text-sm font-semibold text-ink">{data.noHp ?? '-'}{data.email ? ` · ${data.email}` : ''}</p></div>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-muted">Siklus Aktif</p><div className="mt-1 flex items-center gap-2">{data.activeOpportunity ? <><Status status={data.activeOpportunity.status} /><span className="text-xs text-muted">{data.activeOpportunity.sales?.name ?? 'Belum ada PIC'}</span></> : <span className="text-sm font-semibold text-muted">Tidak ada</span>}</div></div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2"><History size={16} className="text-primary" /><h4 className="font-bold text-ink">Riwayat Siklus Pembelian</h4></div>
            {opportunities.isLoading ? <p className="py-6 text-center text-sm text-muted">Memuat riwayat...</p> : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-divider py-8 text-center text-sm font-semibold text-muted">Belum ada riwayat siklus.</div>
            ) : <div className="space-y-3">{rows.map((item) => <OpportunityCard key={item.id} item={item} />)}</div>}
            {opportunities.data?.meta && <div className="mt-3"><Pagination meta={opportunities.data.meta} page={page} onChange={setPage} /></div>}
          </section>
        </div>
      )}
    </Modal>
  );
};
