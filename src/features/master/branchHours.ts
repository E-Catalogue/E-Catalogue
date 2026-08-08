import type { BranchDay, BranchOperatingHour } from './types';

export const BRANCH_DAYS: { value: BranchDay; label: string; short: string }[] = [
  { value: 'MONDAY', label: 'Senin', short: 'Sen' },
  { value: 'TUESDAY', label: 'Selasa', short: 'Sel' },
  { value: 'WEDNESDAY', label: 'Rabu', short: 'Rab' },
  { value: 'THURSDAY', label: 'Kamis', short: 'Kam' },
  { value: 'FRIDAY', label: 'Jumat', short: 'Jum' },
  { value: 'SATURDAY', label: 'Sabtu', short: 'Sab' },
  { value: 'SUNDAY', label: 'Minggu', short: 'Min' },
];

export const defaultOperatingHours = (): BranchOperatingHour[] => BRANCH_DAYS.map(({ value }, index) => ({
  day: value,
  isOpen: index < 6,
  openTime: index < 6 ? '09:00' : null,
  closeTime: index < 6 ? '17:00' : null,
}));
