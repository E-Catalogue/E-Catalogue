import { describe, expect, it } from 'vitest';
import { changedVendorFields } from './vendor.utils';
import type { Vendor, VendorCreateInput } from './types';

const vendor: Vendor = {
  id: 'vendor-1', code: 'VND-001', name: 'Bengkel Utama', address: null,
  phone: '021', isActive: true, createdAt: '2026-07-20T00:00:00.000Z', updatedAt: '2026-07-20T00:00:00.000Z',
};

describe('changedVendorFields', () => {
  it('tidak mengirim field response ketika tidak berubah', () => {
    const values: VendorCreateInput = { code: vendor.code, name: vendor.name, address: null, phone: vendor.phone, isActive: true };
    expect(changedVendorFields(vendor, values)).toEqual({});
  });

  it('hanya mengirim field yang berubah', () => {
    const values: VendorCreateInput = { code: 'VND-002', name: vendor.name, address: 'Jakarta', phone: vendor.phone, isActive: true };
    expect(changedVendorFields(vendor, values)).toEqual({ code: 'VND-002', address: 'Jakarta' });
  });
});
