import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

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
    <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
      {label} {required && <span className="text-primary">*</span>}
    </label>
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
