import { useEffect, useMemo, useState, useRef } from 'react';
import { Building2, ChevronDown, Check, Globe } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { useBranchContextOptions } from '@/features/auth/branchContext.api';

/**
 * Branch switcher GLOBAL untuk role OWNER/ADMIN (`.prd/frontend_owner_admin_branch_context_20260721.md`
 * §5). Menjadi satu-satunya kontrol pemilihan cabang; nilainya disimpan di `branchSlice` (Redux +
 * localStorage) dan dibaca seluruh halaman lewat `useBranchScope`. Untuk role non-global, komponen
 * tidak dirender (mereka terikat cabangnya sendiri).
 *
 * Opsi diambil dari `/branch-context/options` (tanpa `BRANCH_READ`). Cabang tersimpan yang sudah
 * tidak ada di options (mis. akses dicabut) otomatis di-reset ke "Semua Cabang" (PRD §3 state).
 */
export const BranchSwitcher = () => {
  const { isOwner, selectedBranchId, setSelectedBranchId } = useBranchScope();
  const { data: options } = useBranchContextOptions();
  const branches = useMemo(() => options?.data ?? [], [options?.data]);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Verifikasi cabang tersimpan terhadap options terbaru — reset kalau tidak valid lagi (PRD §3).
  useEffect(() => {
    if (!isOwner || !selectedBranchId || branches.length === 0) return;
    if (!branches.some((b) => b.id === selectedBranchId)) setSelectedBranchId(null);
  }, [isOwner, selectedBranchId, branches, setSelectedBranchId]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  if (!isOwner) return null;

  const selected = branches.find((b) => b.id === selectedBranchId);
  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 6, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggle}
        title="Pilih cabang aktif"
        className={`inline-flex items-center gap-2 h-11 px-3 rounded-xl border font-bold text-[12px] transition-colors max-w-[190px] ${
          selectedBranchId ? 'bg-primary-light text-primary border-primary/30' : 'bg-surface-soft text-ink-soft border-border'
        } hover:border-primary`}
      >
        {selectedBranchId ? <Building2 size={16} className="shrink-0" /> : <Globe size={16} className="shrink-0" />}
        <span className="truncate">{selected ? selected.nama : 'Semua Cabang'}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ top: pos.top, right: pos.right, position: 'absolute' }}
          className="z-[150] w-60 bg-surface border border-border rounded-2xl shadow-xl py-1.5 max-h-80 overflow-y-auto scrollbar-slim"
        >
          <button
            onClick={() => { setSelectedBranchId(null); setOpen(false); }}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-[12px] font-semibold transition-colors ${!selectedBranchId ? 'text-primary bg-primary-light' : 'text-ink-soft hover:bg-surface-soft'}`}
          >
            <span className="inline-flex items-center gap-2"><Globe size={14} /> Semua Cabang</span>
            {!selectedBranchId && <Check size={14} className="text-primary" />}
          </button>
          <div className="my-1 border-t border-divider mx-2" />
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => { setSelectedBranchId(b.id); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-[12px] font-semibold transition-colors ${b.id === selectedBranchId ? 'text-primary bg-primary-light' : 'text-ink-soft hover:bg-surface-soft'}`}
            >
              <span className="min-w-0"><span className="block truncate">{b.nama}</span><span className="block truncate text-[11px] font-medium text-muted">{b.code}{b.lokasi ? ` · ${b.lokasi}` : ''}</span></span>
              {b.id === selectedBranchId && <Check size={14} className="shrink-0 text-primary" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
};
