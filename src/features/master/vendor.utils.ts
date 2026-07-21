import type { Vendor, VendorCreateInput, VendorUpdateInput } from './types';

export const changedVendorFields = (item: Vendor, values: VendorCreateInput): VendorUpdateInput => {
  const next: VendorUpdateInput = {};
  if (values.code !== item.code) next.code = values.code;
  if (values.name !== item.name) next.name = values.name;
  if ((values.address ?? null) !== (item.address ?? null)) next.address = values.address ?? null;
  if ((values.phone ?? null) !== (item.phone ?? null)) next.phone = values.phone ?? null;
  if ((values.isActive ?? true) !== item.isActive) next.isActive = values.isActive;
  return next;
};
