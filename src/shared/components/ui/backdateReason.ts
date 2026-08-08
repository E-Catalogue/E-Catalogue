export const BACKDATE_REASON_MIN_LENGTH = 5;

export const backdateReasonRemaining = (value: string) =>
  Math.max(0, BACKDATE_REASON_MIN_LENGTH - value.trim().length);
