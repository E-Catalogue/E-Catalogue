import { useMemo } from 'react';
import { SelectField, TextField } from '@/shared/components/ui/Field';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { useCashAccounts } from './finance.hooks';

export const CashAccountSelect = ({ value, onChange, label = 'Akun Kas', required, disabled }: { value: string; onChange: (value: string) => void; label?: string; required?: boolean; disabled?: boolean }) => {
  const { data, isLoading } = useCashAccounts({ page: 1, limit: 100, isActive: 'true' });
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat akun kas...' : 'Pilih akun kas' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: `${x.name} (${x.code})` })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const CurrencyField = (props: Omit<Parameters<typeof TextField>[0], 'type' | 'min'>) => (
  <TextField type="number" min={0} inputMode="numeric" {...props} />
);

export const FinanceStatusBadge = ({ status }: { status: string }) => <StatusBadge status={status} />;
