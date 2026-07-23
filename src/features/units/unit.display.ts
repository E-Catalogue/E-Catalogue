/**
 * Nama tampilan Unit — pakai `name` bila ada, dengan fallback aman untuk data lama yang belum
 * punya `name` selama compatibility window rolling deploy (PRD `frontend_unit_name_20260722.md` §4).
 * Fallback TIDAK mengubah kontrak create (yang tetap wajib `name`) — ini murni untuk display.
 *
 * Compatibility window: fallback boleh dihapus setelah seluruh Unit lama terisi `name` di backend.
 */
export interface UnitNameLike {
  id: string;
  name?: string | null;
  platNomor?: string | null;
  merek?: { name?: string | null } | null;
  tipe?: { name?: string | null } | null;
}

export const unitDisplayName = (unit: UnitNameLike): string =>
  unit.name?.trim() ||
  [unit.merek?.name, unit.tipe?.name].filter(Boolean).join(' ') ||
  unit.platNomor ||
  unit.id;

/** Identitas pendukung baris kedua: "Toyota Avanza · B 1234 ABC". */
export const unitSubtitle = (unit: UnitNameLike): string =>
  [[unit.merek?.name, unit.tipe?.name].filter(Boolean).join(' '), unit.platNomor]
    .filter(Boolean)
    .join(' · ');

/** Label dropdown/autocomplete Unit — nama + plat (nama tidak unique) — PRD §8.7. */
export const unitOptionLabel = (unit: UnitNameLike): string =>
  [unitDisplayName(unit), unit.platNomor].filter(Boolean).join(' · ');
