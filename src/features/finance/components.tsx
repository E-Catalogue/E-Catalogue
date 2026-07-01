import { useMemo } from 'react';
import { SelectField, TextField } from '@/shared/components/ui/Field';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { useLookupCashAccounts, useLookupDealOrders, useLookupExpenseCategories, useLookupPayrollUsers, useLookupSales } from './finance.hooks';
import { formatCurrency, formatDate } from '@/core/utils/format';

export const CashAccountSelect = ({ value, onChange, label = 'Akun Kas', required, disabled }: { value: string; onChange: (value: string) => void; label?: string; required?: boolean; disabled?: boolean }) => {
  const { data, isLoading } = useLookupCashAccounts({ isActive: 'true' });
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat akun kas...' : 'Pilih akun kas' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: `${x.name} (${x.code} - ${x.type})` })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const ExpenseCategorySelect = ({ value, onChange, label = 'Kategori', required, disabled }: { value: string; onChange: (value: string) => void; label?: string; required?: boolean; disabled?: boolean }) => {
  const { data, isLoading } = useLookupExpenseCategories({ isActive: 'true' });
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat kategori...' : 'Pilih kategori' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: x.code ? `${x.name} (${x.code})` : x.name })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const PayrollUserSelect = ({ value, onChange, label = 'User', required, disabled }: { value: string; onChange: (value: string) => void; label?: string; required?: boolean; disabled?: boolean }) => {
  const { data, isLoading } = useLookupPayrollUsers({ isActive: 'true' });
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat user...' : 'Pilih user' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: `${x.name} (${x.username}${x.roleName ? ` - ${x.roleName}` : ''})` })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const SalesSelect = ({ value, onChange, label = 'Sales', required, disabled }: { value: string; onChange: (value: string) => void; label?: string; required?: boolean; disabled?: boolean }) => {
  const { data, isLoading } = useLookupSales({ isActive: 'true' });
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat sales...' : 'Pilih sales' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: `${x.name} (${x.username})` })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const DealOrderSelect = ({ value, onChange, salesId, period, label = 'Sales Order', required, disabled }: { value: string; onChange: (value: string) => void; salesId?: string; period?: string; label?: string; required?: boolean; disabled?: boolean }) => {
  const { data, isLoading } = useLookupDealOrders({ salesId: salesId || undefined, period: period || undefined, withoutIncentive: 'true' });
  const options = useMemo(
    () => [
      { value: '', label: isLoading ? 'Memuat order DEAL...' : 'Pilih order DEAL' },
      ...((data?.data ?? []).map((x) => ({
        value: x.id,
        label: `${x.nomorOrder} - ${x.customerName ?? '-'} (${formatCurrency(x.hargaFinal, { compact: true })}${x.dealDate ? `, ${formatDate(x.dealDate)}` : ''})`,
      }))),
    ],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const CurrencyField = (props: Omit<Parameters<typeof TextField>[0], 'type' | 'min'>) => (
  <TextField type="number" min={0} inputMode="numeric" {...props} />
);

export const FinanceStatusBadge = ({ status }: { status: string }) => <StatusBadge status={status} />;
