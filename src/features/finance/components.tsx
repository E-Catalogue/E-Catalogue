import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SelectField, TextField } from '@/shared/components/ui/Field';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { useLookupCashAccounts, useLookupDealOrders, useLookupExpenseCategories, useLookupPayrollUsers, useLookupSales } from './finance.hooks';
import { formatCurrency, formatDate } from '@/core/utils/format';

type BranchHeaders = Record<string, string> | undefined;

/**
 * Pesan banner inline per error code finansial dipakai lintas modul finance (README §17 — jangan
 * hanya toast untuk error finansial; user harus bisa melihat apakah transaksi kemungkinan sudah
 * terposting). Dikonfirmasi dari kode backend (`cash-transaction.service.js` `lockAndAssertBalance`,
 * `assertOpenPeriod`, `cash-account.service.js` `assertActiveCashAccount`, `branch-scope.middleware.js`).
 */
// eslint-disable-next-line react-refresh/only-export-components
export const FINANCE_ERROR_BANNER: Record<string, { title: string; message: string }> = {
  BRANCH_CONTEXT_REQUIRED: { title: 'Cabang belum dipilih', message: 'Pilih cabang konkret terlebih dahulu, lalu coba lagi.' },
  INSUFFICIENT_BALANCE: { title: 'Saldo akun kas tidak mencukupi', message: 'Draft dipertahankan — periksa saldo akun kas sebelum mencoba lagi.' },
  CASH_ACCOUNT_NOT_FOUND: { title: 'Akun kas tidak ditemukan', message: 'Pilih akun kas lain yang aktif pada cabang ini.' },
  CASH_ACCOUNT_INACTIVE: { title: 'Akun kas tidak aktif', message: 'Pilih akun kas lain yang aktif.' },
  BOOK_PERIOD_CLOSED: { title: 'Periode pembukuan sudah ditutup', message: 'Pilih tanggal pada periode pembukuan yang masih terbuka.' },
  CROSS_BRANCH_RELATION: { title: 'Relasi lintas cabang', message: 'Salah satu relasi berasal dari cabang berbeda. Data akan dimuat ulang.' },
  BRANCH_SCOPE_FORBIDDEN: { title: 'Cabang tidak sesuai', message: 'Reset selector cabang lalu muat ulang data.' },
  OPERATIONAL_EXPENSE_ALREADY_PAID: { title: 'Pengeluaran sudah dibayar', message: 'Status pengeluaran telah berubah — daftar akan dimuat ulang.' },
  OPERATIONAL_EXPENSE_CANCELLED: { title: 'Pengeluaran sudah dibatalkan', message: 'Pengeluaran ini tidak dapat dibayar lagi.' },
  OPERATIONAL_EXPENSE_NOT_EDITABLE: { title: 'Pengeluaran tidak dapat diubah', message: 'Pengeluaran yang sudah dibayar tidak dapat diperbarui.' },
  PAYROLL_RUN_NOT_PAYABLE: { title: 'Payroll tidak dapat dibayar', message: 'Status payroll telah berubah — data akan dimuat ulang.' },
  PAYROLL_RUN_NOT_EDITABLE: { title: 'Payroll tidak dapat diubah', message: 'Payroll yang sudah dibayar tidak dapat diubah.' },
  PAYROLL_RUN_ALREADY_EXISTS: { title: 'Payroll periode ini sudah ada', message: 'Payroll untuk periode tersebut sudah pernah digenerate.' },
  PAYROLL_RUN_EMPTY: { title: 'Tidak ada data untuk digenerate', message: 'Tidak ada gapok aktif atau insentif draft pada periode ini.' },
  INVALID_BOOK_PERIOD: { title: 'Format periode tidak valid', message: 'Gunakan format YYYY-MM.' },
  BOOK_PERIOD_NOT_FOUND: { title: 'Periode belum ditutup', message: 'Belum ada snapshot pembukuan tersimpan untuk periode ini.' },
  BOOK_PERIOD_ALREADY_CLOSED: { title: 'Periode sudah ditutup', message: 'Data akan dimuat ulang.' },
  BOOK_PERIOD_NOT_FINISHED: { title: 'Periode belum bisa ditutup', message: 'Hanya periode yang sudah lewat (bukan bulan berjalan/masa depan) yang bisa ditutup.' },
  TAX_ACCOUNTS_MUST_DIFFER: { title: 'Akun sumber & cadangan harus berbeda', message: 'Pilih dua akun kas yang berbeda.' },
  INVALID_TAX_CASH_ACCOUNT: { title: 'Akun kas tidak valid', message: 'Akun harus aktif dan berasal dari cabang yang sama.' },
};
const FINANCE_FALLBACK_5XX_BANNER = { title: 'Permintaan gagal diproses', message: 'Draft dipertahankan — transaksi mungkin sudah terposting di server. Coba lagi manual, jangan mengulang otomatis.' };

export const FinanceErrorBanner = ({ code, message, onDismiss }: { code?: string; message: string; onDismiss: () => void }) => {
  const mapped = (code && FINANCE_ERROR_BANNER[code]) || (!code ? FINANCE_FALLBACK_5XX_BANNER : undefined);
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-semantic-error/10 border border-semantic-error/30 text-semantic-error">
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold">{mapped?.title ?? 'Terjadi kesalahan'}</p>
        <p className="text-[11px] font-medium mt-0.5 leading-relaxed">{mapped?.message ?? message}</p>
      </div>
      <button type="button" onClick={onDismiss} className="text-[11px] font-bold underline shrink-0">Tutup</button>
    </div>
  );
};

/** `branchKey`/`headers` opsional — diteruskan ke lookup query (README §8/§9). Backend
 * `finance/lookups/*` belum memfilter per branch (lihat catatan di finance.api.ts), tapi tetap
 * dikirim untuk konsistensi & agar cache tidak campur ketika Owner berpindah cabang. */
interface SelectBaseProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  branchKey?: string;
  headers?: BranchHeaders;
}

export const CashAccountSelect = ({ value, onChange, label = 'Akun Kas', required, disabled, branchKey = 'all', headers }: SelectBaseProps) => {
  const { data, isLoading } = useLookupCashAccounts(branchKey, { isActive: 'true' }, headers);
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat akun kas...' : 'Pilih akun kas' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: `${x.name} (${x.code} - ${x.type})${x.defaultPayment ? ' - Default Penjualan' : ''}` })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const ExpenseCategorySelect = ({ value, onChange, label = 'Kategori', required, disabled, branchKey = 'all', headers }: SelectBaseProps) => {
  const { data, isLoading } = useLookupExpenseCategories(branchKey, { isActive: 'true' }, headers);
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat kategori...' : 'Pilih kategori' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: x.code ? `${x.name} (${x.code})` : x.name })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const PayrollUserSelect = ({ value, onChange, label = 'User', required, disabled, branchKey = 'all', headers }: SelectBaseProps) => {
  const { data, isLoading } = useLookupPayrollUsers(branchKey, { isActive: 'true' }, headers);
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat user...' : 'Pilih user' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: `${x.name} (${x.username}${x.roleName ? ` - ${x.roleName}` : ''})` })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const SalesSelect = ({ value, onChange, label = 'Sales', required, disabled, branchKey = 'all', headers }: SelectBaseProps) => {
  const { data, isLoading } = useLookupSales(branchKey, { isActive: 'true' }, headers);
  const options = useMemo(
    () => [{ value: '', label: isLoading ? 'Memuat sales...' : 'Pilih sales' }, ...((data?.data ?? []).map((x) => ({ value: x.id, label: `${x.name} (${x.username})` })))],
    [data?.data, isLoading],
  );
  return <SelectField label={label} required={required} value={value} onChange={(e) => onChange(e.target.value)} options={options} disabled={disabled || isLoading} />;
};

export const DealOrderSelect = ({
  value, onChange, salesId, period, label = 'Sales Order', required, disabled, branchKey = 'all', headers,
}: SelectBaseProps & { salesId?: string; period?: string }) => {
  const { data, isLoading } = useLookupDealOrders(branchKey, { salesId: salesId || undefined, period: period || undefined, withoutIncentive: 'true' }, headers);
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
