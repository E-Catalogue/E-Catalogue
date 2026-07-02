import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Calculator, Percent, Loader2, Info } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { notifyApiError } from '@/core/api/notify';
import { creditSimApi } from './cms.api';
import type { CreditSimConfig } from './cms.types';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';

export const CreditSimCmsPage = () => {
  const { can } = usePermissions();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/cms/credit-simulation/config'],
    queryFn: creditSimApi.get,
  });

  const update = useMutation({
    mutationFn: creditSimApi.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/cms/credit-simulation/config'] }),
  });

  const [form, setForm] = useState<Partial<CreditSimConfig>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof CreditSimConfig>(key: K, value: any) => setForm(p => ({ ...p, [key]: value }));

  const handleSave = () => {
    update.mutate(form, { onError: (err) => notifyApiError(err) });
  };

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-muted" size={24} /></div>;
  if (isError) return <div className="text-center py-24 text-muted">Gagal memuat konfigurasi.</div>;

  return (
    <RequirePermission code="CREDIT_SIM_READ">
      <div className="max-w-[1000px] mx-auto space-y-5">
        <PageHeader
          title="Simulasi Kredit"
          description="Atur parameter default, tenor, DP, dan suku bunga untuk kalkulator kredit di website."
          action={
            can('CREDIT_SIM_UPDATE') && (
              <Button icon={<Save size={16} />} onClick={handleSave} disabled={update.isPending}>
                {update.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </Button>
            )
          }
        />

        <SectionCard title="Parameter Dasar" icon={<Calculator size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField 
              label="Pilihan Tenor (bulan, pisahkan dengan koma)" 
              value={form.tenorOptions?.join(', ') || ''} 
              onChange={(e) => set('tenorOptions', e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)))} 
              placeholder="mis. 12, 24, 36, 48, 60" 
              disabled={!can('CREDIT_SIM_UPDATE')}
            />
            <SelectField 
              label="Metode Perhitungan" 
              value={form.method || 'FLAT'} 
              onChange={(e) => set('method', e.target.value)}
              disabled={!can('CREDIT_SIM_UPDATE')}
              options={[
                { value: 'FLAT', label: 'Flat (Bunga Tetap)' },
                { value: 'EFEKTIF', label: 'Efektif (Bunga Menurun)' },
                { value: 'ANUITAS', label: 'Anuitas' },
              ]}
            />
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SectionCard title="Down Payment (DP)" icon={<Percent size={16} />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <TextField type="number" label="DP Minimal (%)" value={form.dpMinPercent?.toString() || ''} onChange={(e) => set('dpMinPercent', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
                <TextField type="number" label="DP Maksimal (%)" value={form.dpMaxPercent?.toString() || ''} onChange={(e) => set('dpMaxPercent', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField type="number" label="DP Default (%)" value={form.dpDefaultPercent?.toString() || ''} onChange={(e) => set('dpDefaultPercent', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
                <TextField type="number" label="Step Slider DP (%)" value={form.dpStep?.toString() || ''} onChange={(e) => set('dpStep', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Suku Bunga" icon={<Percent size={16} />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <TextField type="number" label="Bunga Minimal (%)" value={form.rateMin?.toString() || ''} onChange={(e) => set('rateMin', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
                <TextField type="number" label="Bunga Maksimal (%)" value={form.rateMax?.toString() || ''} onChange={(e) => set('rateMax', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField type="number" label="Bunga Default (%)" value={form.rateDefault?.toString() || ''} onChange={(e) => set('rateDefault', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
                <TextField type="number" label="Step Slider Bunga (%)" value={form.rateStep?.toString() || ''} onChange={(e) => set('rateStep', parseFloat(e.target.value))} disabled={!can('CREDIT_SIM_UPDATE')} />
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Lainnya" icon={<Info size={16} />}>
          <div className="space-y-4">
            <TextField 
              type="number" 
              label="Faktor Pengali Cicilan Tambahan (mis. asuransi)" 
              value={form.installmentFromFactor?.toString() || ''} 
              onChange={(e) => set('installmentFromFactor', parseFloat(e.target.value))} 
              placeholder="1.0"
              disabled={!can('CREDIT_SIM_UPDATE')}
            />
            <TextField 
              label="Teks Disclaimer Kalkulator" 
              value={form.disclaimer || ''} 
              onChange={(e) => set('disclaimer', e.target.value)} 
              placeholder="Hasil simulasi ini hanyalah perkiraan..."
              disabled={!can('CREDIT_SIM_UPDATE')}
            />
          </div>
        </SectionCard>
      </div>
    </RequirePermission>
  );
};
