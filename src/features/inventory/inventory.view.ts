export type InventoryView = 'table' | 'card';

export const resolveInventoryView = (cardOnly: boolean, storedView: string | null, compactViewport: boolean): InventoryView => {
  if (cardOnly) return 'card';
  if (storedView === 'table' || storedView === 'card') return storedView;
  return compactViewport ? 'card' : 'table';
};
