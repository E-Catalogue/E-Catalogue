import { describe, expect, it } from 'vitest';
import { hasAllBranchScope } from './useBranchScope';

describe('hasAllBranchScope', () => {
  it.each(['OWNER', 'ADMIN'])('memberikan scope semua cabang kepada %s', (roleCode) => {
    expect(hasAllBranchScope(roleCode)).toBe(true);
  });

  it.each(['SALES', 'CASHIER', 'BRANCH_ADMIN', '', null, undefined])(
    'tetap membatasi role %s ke cabang user',
    (roleCode) => {
      expect(hasAllBranchScope(roleCode)).toBe(false);
    },
  );
});
