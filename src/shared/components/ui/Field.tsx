import { useId, useMemo, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { SearchableSelect } from './SearchableSelect';

const baseInput =
  'w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink placeholder:text-muted placeholder:font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all';

interface LabelWrapProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export const FieldWrap = ({ label, required, children, className = '', htmlFor }: LabelWrapProps) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
    )}
    {children}
  </div>
);

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  wrapClass?: string;
}

export const TextField = ({ label, required, wrapClass, className = '', id, ...rest }: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldWrap label={label} required={required} className={wrapClass} htmlFor={inputId}>
      <input id={inputId} className={`${baseInput} ${className}`} {...rest} />
    </FieldWrap>
  );
};

interface SelectFieldProps {
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  wrapClass?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Dropdown bertema (bukan `<select>` polos) — dibangun di atas `SearchableSelect` supaya SEMUA
 * dropdown di app (filter maupun form) konsisten punya input pencarian & popover cantik, bukan
 * default browser. Signature `onChange={(e) => ...e.target.value}` dipertahankan biar drop-in
 * compatible dengan seluruh caller lama.
 */
export const SelectField = ({ label, required, options, wrapClass, value, onChange, disabled, placeholder }: SelectFieldProps) => {
  const searchableOptions = useMemo(() => options.map((o) => ({ value: o.value, label: o.label })), [options]);
  return (
    <SearchableSelect
      label={label}
      required={required}
      wrapClass={wrapClass}
      value={value ?? ''}
      onChange={(v) => onChange?.({ target: { value: v } })}
      options={searchableOptions}
      disabled={disabled}
      placeholder={placeholder ?? 'Pilih...'}
    />
  );
};

// ── NumericField ──────────────────────────────────────────────────────────────
// Solves the "can't clear leading zero" problem of <input type="number">.
// Uses type="text" + inputMode="numeric", stores string internally,
// formats with thousand-separator on blur, exposes number value to parent.

interface NumericFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  wrapClass?: string;
  className?: string;
  placeholder?: string;
  prefix?: string;   // e.g. "Rp"
  suffix?: string;   // e.g. "km"
  min?: number;
  max?: number;
  /** Allow decimal input (for percentages etc.) */
  decimal?: boolean;
  /** Default true (format "1.000.000" ala Rupiah). Set false untuk angka polos non-uang (mis. Tahun) — "2026" bukan "2.026". */
  thousands?: boolean;
  disabled?: boolean;
}

const fmt = (n: number, thousands: boolean) =>
  n === 0 ? '' : (thousands ? n.toLocaleString('id-ID') : String(n));

const parseNum = (s: string, decimal: boolean) => {
  const clean = s.replace(/\./g, '').replace(',', '.');
  const n = decimal ? parseFloat(clean) : parseInt(clean, 10);
  return isNaN(n) ? 0 : n;
};

export const NumericField = ({
  label, value, onChange, required, wrapClass, className = '',
  placeholder = '0', prefix, suffix, min, max, decimal = false, thousands = true, disabled,
}: NumericFieldProps) => {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  // raw: what the user is typing while focused
  const [raw, setRaw] = useState('');

  const displayValue = focused ? raw : fmt(value, thousands);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const s = value === 0 ? '' : String(value);
    setRaw(s);
    setFocused(true);
    setTimeout(() => e.target.select(), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (decimal) {
      // Allow digits + at most one comma or dot
      input = input.replace(/[^0-9,]/g, '');
    } else {
      input = input.replace(/\D/g, '');
    }
    setRaw(input);
    const num = parseNum(input, decimal);
    if (min !== undefined && num < min) return;
    if (max !== undefined && num > max) return;
    onChange(num);
  };

  const handleBlur = () => {
    setFocused(false);
    setRaw('');
  };

  const hasPre = !!prefix;
  const hasSuf = !!suffix;

  return (
    <FieldWrap label={label} required={required} className={wrapClass} htmlFor={inputId}>
      <div className="relative">
        {hasPre && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-[13px] font-bold select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInput} ${hasPre ? 'pl-10' : ''} ${hasSuf ? 'pr-12' : ''} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        {hasSuf && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted text-[13px] font-semibold select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </FieldWrap>
  );
};
