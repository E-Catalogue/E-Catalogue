import { useState, useEffect } from 'react';
import { Calculator, Save, Loader2, Percent, Wallet, Calendar, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { TextArea } from './CmsKit';
import { useCreditSimConfig, useCreditSimMutations } from './cms.hooks';
import type { CreditSimConfig } from './cms.types';

export const CreditSimPage = () => {
  const { data, isLoading, isError } = useCreditSimConfig();
  const { update } = useCreditSimMutations();
  const [f, setF] = useState<CreditSimConfig | null>(null);
  const [tenorText, setTenorText] = useState('');

  useEffect(() => {
    if (data && !f) { setF(structuredClone(data)); setTenorText(data.tenorOptions.join(', ')); }
  }, [data, f]);

  if (isLoading || !f) {
    if (isError) return <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat konfigurasi.</div>;
    return <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={24} className="animate-spin" /></div>;
  }

  const set = <K extends keyof CreditSimConfig>(k: K, v: CreditSimConfig[K]) => setF((p) => (p ? { ...p, [k]: v } : p));
  const num = (k: keyof CreditSimConfig) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never);

  const save = () => {
    const tenorOptions = tenorText.split(',').map((s) => Number(s.trim())).filter((n) => n > 0);
    update.mutate({ ...f, tenorOptions }, { onError: (e) => notifyApiError(e) });
  };

  return (
    <div className="max-w-[900px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Simulasi Kredit" description="Atur parameter, rumus, dan disclaimer simulasi kredit di website."
        action={
          <div className="flex gap-2">
            <a href="/simulasi" target="_blank" rel="noopener noreferrer"><Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button></a>
            <Button icon={<Save size={16} />} onClick={save} disabled={update.isPending}>{update.isPending ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        } />

      <SectionCard title="Tenor & Metode" icon={<Calendar size={16} />}>
        <TextField label="Pilihan Tenor (bulan, pisah koma)" value={tenorText} onChange={(e) => setTenorText(e.target.value)} placeholder="12, 24, 36, 48, 60" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Metode Perhitungan" value={f.method} onChange={(e) => set('method', e.target.value as CreditSimConfig['method'])}
            options={[{ value: 'FLAT', label: 'Flat' }, { value: 'EFEKTIF', label: 'Efektif' }, { value: 'ANUITAS', label: 'Anuitas' }]} />
          <TextField label="Faktor 'Cicilan mulai' (mis. 0.022)" type="number" value={String(f.installmentFromFactor)} onChange={num('installmentFromFactor')} />
        </div>
      </SectionCard>

      <SectionCard title="Uang Muka (DP)" icon={<Wallet size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextField label="Min %" type="number" value={String(f.dpMinPercent)} onChange={num('dpMinPercent')} />
          <TextField label="Max %" type="number" value={String(f.dpMaxPercent)} onChange={num('dpMaxPercent')} />
          <TextField label="Default %" type="number" value={String(f.dpDefaultPercent)} onChange={num('dpDefaultPercent')} />
          <TextField label="Step %" type="number" value={String(f.dpStep)} onChange={num('dpStep')} />
        </div>
      </SectionCard>

      <SectionCard title="Bunga (Rate)" icon={<Percent size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextField label="Min %" type="number" value={String(f.rateMin)} onChange={num('rateMin')} />
          <TextField label="Max %" type="number" value={String(f.rateMax)} onChange={num('rateMax')} />
          <TextField label="Default %" type="number" value={String(f.rateDefault)} onChange={num('rateDefault')} />
          <TextField label="Step %" type="number" value={String(f.rateStep)} onChange={num('rateStep')} />
        </div>
      </SectionCard>

      <SectionCard title="Disclaimer" icon={<Calculator size={16} />}>
        <TextArea label="Teks disclaimer" value={f.disclaimer} onChange={(v) => set('disclaimer', v)} rows={2} />
      </SectionCard>
    </div>
  );
};
