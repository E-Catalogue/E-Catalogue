export type CellKind = 'text' | 'bold' | 'mono' | 'muted' | 'money' | 'number' | 'date' | 'status';

export interface ColumnSpec {
  key: string;
  header: string;
  kind?: CellKind;
  align?: 'left' | 'center' | 'right';
}

export type MockRow = Record<string, string | number | boolean | null | undefined> & { id: string };

export interface ModuleSpec {
  /** Path route, sama dengan `path` di menu (lihat tenantMenu.ts). */
  path: string;
  title: string;
  description: string;
  /** Nama ikon (lihat iconMapper). */
  icon: string;
  /**
   * Resource permission menu induk (lihat `.menu/seeded-navigation.md`).
   * Aksi diturunkan darinya: `<resource>.read|create|update|delete`.
   */
  resource: string;
  /** Label tombol tambah. Kosongkan bila modul ini read-only (mis. laporan). */
  createLabel?: string;
  columns: ColumnSpec[];
  rows: MockRow[];
}
