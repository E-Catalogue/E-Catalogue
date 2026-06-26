import { useMemo } from 'react';
import { useAppSelector } from '@/app/store';

/** Hook untuk cek hak akses dari permissionCodes (hasil /auth/me). */
export const usePermissions = () => {
  const codes = useAppSelector((s) => s.auth.permissionCodes);
  const set = useMemo(() => new Set(codes), [codes]);
  return {
    codes,
    can: (code: string) => set.has(code),
    canAny: (...c: string[]) => c.some((x) => set.has(x)),
    canAll: (...c: string[]) => c.every((x) => set.has(x)),
  };
};
