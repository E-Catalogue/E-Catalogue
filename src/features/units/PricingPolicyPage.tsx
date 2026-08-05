import { useState } from 'react';
import { Percent, Save, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { NumericField } from '@/shared/components/ui/Field';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { useBranchScope } from '@/features/auth/useBranchScope';
import { usePricingPolicies, useUpdatePricingPolicy } from './unit.hooks';
import { formatDate } from '@/core/utils/format';
import { notifyApiError } from '@/core/api/notify';

const PricingPolicyPageInner = () => {
  const { can } = usePermissions();
  const { isOwner, selectedBranchId, branchHeader, branchKey } = useBranchScope();
  const policies = usePricingPolicies(branchHeader, branchKey);
  const updatePolicy = useUpdatePricingPolicy();
  const policy = policies.data?.data?.[0];
  const [targetMarkupPercent, setTargetMarkupPercent] = useState<number | null>(null);
  const [otrMarkupPercent, setOtrMarkupPercent] = useState<number | null>(null);
  const effectiveTargetMarkupPercent = targetMarkupPercent ?? policy?.targetMarkupPercent ?? 0;
  const effectiveOtrMarkupPercent = otrMarkupPercent ?? policy?.otrMarkupPercent ?? 0;

  const mustSelectBranch = isOwner && !selectedBranchId;
  const changed = !!policy && (effectiveTargetMarkupPercent !== policy.targetMarkupPercent || effectiveOtrMarkupPercent !== policy.otrMarkupPercent);
  const invalid = effectiveTargetMarkupPercent < 0 || effectiveOtrMarkupPercent < effectiveTargetMarkupPercent;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader title="Parameter Harga" description="Default markup harga Target dan OTR untuk finalisasi unit baru." />
      {mustSelectBranch ? (
        <SectionCard title="Pilih Cabang" icon={<SlidersHorizontal size={16} />}>
          <p className="text-sm font-semibold text-muted">Pilih cabang konkret dari pemilih cabang di header sebelum melihat atau mengubah parameter harga.</p>
        </SectionCard>
      ) : (
        <SectionCard title="Markup Default Cabang" icon={<Percent size={16} />} subtitle="Perubahan hanya berlaku untuk unit yang belum difinalisasi; snapshot unit lama tidak diubah.">
          {policies.isLoading ? <p className="py-6 text-sm font-semibold text-muted">Memuat parameter harga…</p> : !policy ? (
            <p className="py-6 text-sm font-semibold text-semantic-error">Policy harga aktif belum tersedia untuk cabang ini.</p>
          ) : (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <NumericField label="Markup Target" value={effectiveTargetMarkupPercent} onChange={setTargetMarkupPercent} decimal suffix="%" min={0} max={1000} disabled={!can('UNIT_PRICING_POLICY_UPDATE')} />
                <NumericField label="Markup OTR" value={effectiveOtrMarkupPercent} onChange={setOtrMarkupPercent} decimal suffix="%" min={0} max={1000} disabled={!can('UNIT_PRICING_POLICY_UPDATE')} />
              </div>
              <div className={`rounded-xl px-3.5 py-3 text-[12px] font-semibold ${invalid ? 'bg-semantic-error/10 text-semantic-error' : 'bg-surface-soft text-muted'}`}>
                {invalid ? 'Markup OTR harus sama dengan atau lebih besar dari markup Target.' : `Policy aktif sejak ${formatDate(policy.effectiveAt)}.`}
              </div>
              {can('UNIT_PRICING_POLICY_UPDATE') && <div className="flex justify-end"><Button icon={<Save size={15} />} loading={updatePolicy.isPending} disabled={!changed || invalid} onClick={() => updatePolicy.mutate({ data: { targetMarkupPercent: effectiveTargetMarkupPercent, otrMarkupPercent: effectiveOtrMarkupPercent }, headers: branchHeader }, { onError: (error) => notifyApiError(error) })}>Simpan Parameter</Button></div>}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
};

export const PricingPolicyPage = () => <RequirePermission code="UNIT_PRICING_POLICY_READ"><PricingPolicyPageInner /></RequirePermission>;
