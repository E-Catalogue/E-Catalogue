import { useMemo, useState } from 'react';
import { Wallet, Search, ChevronRight, Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { useInvestors } from '@/features/master/master.hooks';
import { InvestorCapitalModal } from '@/features/master/InvestorCapitalModal';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { INVESTOR_SCHEME_LABEL, type Investor } from '@/features/master/types';

export const InvestorCapitalPage = () => {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 400);
  const { data, isLoading } = useInvestors({ page: 1, limit: 200, search: debounced });
  const investors = useMemo(() => data?.data ?? [], [data]);
  const [active, setActive] = useState<Investor | null>(null);

  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Modal Investor" description="Pilih investor untuk melihat saldo, mutasi modal, dan melakukan setor/tarik." />

      <SectionCard title="Daftar Investor" icon={<Wallet size={16} />}>
        <div className="relative max-w-sm mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari investor..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted"><Loader2 size={22} className="animate-spin" /></div>
        ) : investors.length === 0 ? (
          <p className="text-center py-10 text-[13px] text-muted font-semibold">Tidak ada investor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {investors.map((inv) => (
              <button key={inv.id} onClick={() => setActive(inv)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface-soft hover:border-primary hover:shadow-card transition-all text-left">
                <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center font-extrabold shrink-0">
                  {inv.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-extrabold text-ink truncate">{inv.name}</p>
                  <p className="text-[11px] font-semibold text-muted">{inv.code} · {INVESTOR_SCHEME_LABEL[inv.scheme]} {inv.defaultRate}%</p>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" />
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <InvestorCapitalModal open={!!active} investor={active} onClose={() => setActive(null)} />
    </div>
  );
};
