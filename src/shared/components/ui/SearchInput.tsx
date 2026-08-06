import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Cari data...',
  className = '',
  wrapperClassName = '',
  size = 'md',
  disabled = false,
}: SearchInputProps) => {
  const sizeClasses = {
    sm: 'h-9 text-[12px] pl-8 pr-7',
    md: 'h-10 text-[13px] pl-9 pr-8',
    lg: 'h-11 text-sm pl-10 pr-9',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 15,
    lg: 16,
  }[size];

  return (
    <div className={`relative flex items-center ${wrapperClassName}`}>
      <Search
        size={iconSizes}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none shrink-0"
        strokeWidth={2}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl bg-surface border border-border text-ink placeholder:text-muted/60 font-medium transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${className}`}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft transition-colors"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
