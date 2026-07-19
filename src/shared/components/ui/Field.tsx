import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

const baseInput =
  'w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink placeholder:text-muted placeholder:font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all';

interface LabelWrapProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const FieldWrap = ({ label, required, children, className = '' }: LabelWrapProps) => (
  <div className={className}>
    {label && (
      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
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

export const TextField = ({ label, required, wrapClass, className = '', ...rest }: TextFieldProps) => (
  <FieldWrap label={label} required={required} className={wrapClass}>
    <input className={`${baseInput} ${className}`} {...rest} />
  </FieldWrap>
);

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  wrapClass?: string;
}

export const SelectField = ({ label, required, options, wrapClass, className = '', ...rest }: SelectFieldProps) => (
  <FieldWrap label={label} required={required} className={wrapClass}>
    <select className={`${baseInput} cursor-pointer ${className}`} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </FieldWrap>
);

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
}

const fmt = (n: number) =>
  n === 0 ? '' : n.toLocaleString('id-ID');

const parseNum = (s: string, decimal: boolean) => {
  const clean = s.replace(/\./g, '').replace(',', '.');
  const n = decimal ? parseFloat(clean) : parseInt(clean, 10);
  return isNaN(n) ? 0 : n;
};

export const NumericField = ({
  label, value, onChange, required, wrapClass, className = '',
  placeholder = '0', prefix, suffix, min, max, decimal = false,
}: NumericFieldProps) => {
  const [focused, setFocused] = useState(false);
  // raw: what the user is typing while focused
  const [raw, setRaw] = useState('');

  const displayValue = focused ? raw : fmt(value);

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
    <FieldWrap label={label} required={required} className={wrapClass}>
      <div className="relative">
        {hasPre && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-[13px] font-bold select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`${baseInput} ${hasPre ? 'pl-10' : ''} ${hasSuf ? 'pr-12' : ''} ${className}`}
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
