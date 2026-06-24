import { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Landmark } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { useAppSelector } from '@/app/store';
import { SALDO_AWAL } from '@/data/mock';
import { formatCurrency, formatDate } from '@/core/utils/format';

interface CashTx {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  category: string;
  desc: string;
  amount: number;
}

export const CashFlowPage = () => {
  const { payments, expenses, units } = useAppSelector((s) => s.data);

  const { txs, kasMasuk, kasKeluar, saldoAkhir } = useMemo(() => {
    const list: CashTx[] = [];

    payments.filter((p) => p.status === 'Sukses').forEach((p) =>
      list.push({ id: `pay-${p.id}`, date: p.date, type: 'masuk', category: 'Pembayaran', desc: `${p.invoice} • ${p.customer}`, amount: p.amount }),
    );
    expenses.forEach((e) =>
      list.push({ id: `exp-${e.id}`, date: e.date, type: 'keluar', category: e.category, desc: e.name, amount: e.amount }),
    );
    units.filter((u) => u.buyPrice).forEach((u, i) =>
      list.push({ id: `buy-${u.id}`, date: `2024-05-${String((i % 27) + 1).padStart(2, '0')}`, type: 'keluar', category: 'Pembelian Unit', desc: `${u.code} • ${u.brand} ${u.model}`, amount: u.buyPrice ?? 0 }),
    );

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const masuk = list.filter((t) => t.type === 'masuk').reduce((a, t) => a + t.amount, 0);
    const keluar = list.filter((t) => t.type === 'keluar').reduce((a, t) => a + t.amount, 0);
    return { txs: list, kasMasuk: masuk, kasKeluar: keluar, saldoAkhir: SALDO_AWAL + masuk - keluar };
  }, [payments, expenses, units]);

  const cards = [
    { icon: Landmark, label: 'Saldo Awal', value: SALDO_AWAL, color: 'bg-accent-blue' },
    { icon: ArrowDownLeft, label: 'Kas Masuk', value: kasMasuk, color: 'bg-accent-green' },
    { icon: ArrowUpRight, label: 'Kas Keluar', value: kasKeluar, color: 'bg-semantic-error' },
    { icon: Wallet, label: 'Saldo Akhir', value: saldoAkhir, color: 'bg-primary' },
  ];

  const columns: Column<CashTx>[] = [
    { header: 'Tanggal', cell: (t) => formatDate(t.date) },
    { header: 'Kategori', cell: (t) => t.category },
    { header: 'Keterangan', cell: (t) => <span className="font-bold text-ink">{t.desc}</span> },
    { header: 'Tipe', align: 'center', cell: (t) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${t.type === 'masuk' ? 'bg-accent-green/10 text-accent-green' : 'bg-semantic-error/10 text-semantic-error'}`}>
        {t.type === 'masuk' ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}{t.type === 'masuk' ? 'Masuk' : 'Keluar'}
      </span>
    ) },
    { header: 'Nominal', align: 'right', cell: (t) => (
      <span className={`font-bold ${t.type === 'masuk' ? 'text-accent-green' : 'text-semantic-error'}`}>
        {t.type === 'masuk' ? '+' : '−'} {formatCurrency(t.amount)}
      </span>
    ) },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Cash Flow" description="Arus kas masuk & keluar showroom" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-surface rounded-2xl border border-border shadow-card p-5">
              <div className={`w-11 h-11 rounded-xl ${c.color} text-white flex items-center justify-center mb-3`}><Icon size={21} strokeWidth={2.3} /></div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{c.label}</p>
              <p className="text-lg md:text-xl font-extrabold text-ink mt-1 whitespace-nowrap">{formatCurrency(c.value, { compact: true })}</p>
            </div>
          );
        })}
      </div>

      <SectionCard title="Riwayat Arus Kas" icon={<Wallet size={16} />} bodyClassName="p-0 md:p-0">
        <DataTable columns={columns} data={txs} rowKey={(t) => t.id} />
      </SectionCard>
    </div>
  );
};
