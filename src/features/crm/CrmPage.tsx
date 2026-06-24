import { useState } from 'react';
import { Plus, Phone, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { LeadFormModal } from './LeadFormModal';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { removeLead } from '@/app/store/dataSlice';
import { formatCurrency, formatDate } from '@/core/utils/format';
import type { Lead, LeadStage } from '@/data/types';

const COLUMNS: { key: LeadStage; label: string; accent: string }[] = [
  { key: 'lead', label: 'Lead / Prospek', accent: 'border-t-primary' },
  { key: 'test_drive', label: 'Test Drive', accent: 'border-t-accent-orange' },
  { key: 'negosiasi', label: 'Negosiasi', accent: 'border-t-accent-amber' },
  { key: 'spk', label: 'SPK / Deal', accent: 'border-t-accent-green' },
];

const SOURCE_COLOR: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-600',
  Facebook: 'bg-blue-100 text-blue-600',
  'Walk-in': 'bg-green-100 text-green-600',
  Referral: 'bg-purple-100 text-purple-600',
  OLX: 'bg-emerald-100 text-emerald-600',
  Website: 'bg-orange-100 text-orange-600',
};

export const CrmPage = () => {
  const leads = useAppSelector((s) => s.data.leads);
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<{ lead: Lead | null } | null>(null);
  const [toDelete, setToDelete] = useState<Lead | null>(null);

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up">
      <PageHeader
        title="CRM / Lead"
        description={`${leads.length} prospek aktif dalam pipeline penjualan`}
        action={<Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ lead: null })}>Tambah Lead</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = leads.filter((l) => l.stage === col.key);
          return (
            <div key={col.key} className={`bg-surface-soft rounded-2xl border border-border border-t-4 ${col.accent} p-3`}>
              <div className="flex items-center justify-between px-1 mb-3">
                <h3 className="text-[12px] font-extrabold uppercase tracking-wide text-ink">{col.label}</h3>
                <span className="text-[11px] font-bold text-muted bg-surface border border-border rounded-lg px-2 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-2.5">
                {items.map((l) => (
                  <div key={l.id} className="group bg-surface rounded-xl border border-border p-3.5 shadow-sm hover:shadow-card transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-extrabold text-ink truncate">{l.name}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${SOURCE_COLOR[l.source] ?? 'bg-muted/10 text-muted'}`}>{l.source}</span>
                    </div>
                    <p className="text-[11px] text-muted font-semibold mt-1 truncate">{l.interestedUnit}</p>
                    <p className="text-[12px] font-extrabold text-primary mt-2">{formatCurrency(l.budget, { compact: true })}</p>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-divider">
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-muted truncate"><Phone size={11} /> {l.phone}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => setForm({ lead: l })} className="p-1.5 rounded-md text-muted hover:text-accent-blue hover:bg-accent-blue/10" title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => setToDelete(l)} className="p-1.5 rounded-md text-muted hover:text-semantic-error hover:bg-semantic-error/10" title="Hapus"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {l.followUpAt && (
                      <p className="text-[10px] font-semibold text-accent-blue mt-1.5">Follow up: {formatDate(l.followUpAt)}</p>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm({ lead: null })} className="w-full py-2 rounded-xl border border-dashed border-border text-[11px] font-bold text-muted hover:text-primary hover:border-primary transition-colors">
                  + Tambah
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <LeadFormModal open={!!form} lead={form?.lead} onClose={() => setForm(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && dispatch(removeLead(toDelete.id))}
        title="Hapus Lead"
        message={toDelete ? `Hapus lead ${toDelete.name}?` : ''}
      />
    </div>
  );
};
