import { BACKDATE_REASON_MIN_LENGTH, backdateReasonRemaining } from './backdateReason';

export const BackdateReasonHint = ({ value, className = '' }: { value: string; className?: string }) => {
  const remaining = backdateReasonRemaining(value);
  if (remaining === 0) return null;

  return (
    <p role="alert" className={`mt-1.5 text-[11px] font-semibold text-semantic-error ${className}`}>
      Alasan backdate masih kurang {remaining} karakter (minimal {BACKDATE_REASON_MIN_LENGTH} karakter).
    </p>
  );
};
