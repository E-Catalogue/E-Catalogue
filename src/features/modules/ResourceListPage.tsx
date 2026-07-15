import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { RowActions } from '@/shared/components/ui/RowActions';
import { usePermissions } from '@/features/auth/usePermissions';
import { formatCurrency } from '@/core/utils/format';
import { getModule } from './registry';
import type { ColumnSpec, MockRow } from './types';

/**
 * TDD UI (rules.md §4): endpoint tenant untuk modul operasional masih dikerjakan,
 * jadi data diambil dari mock + simulasi latency. Saat API siap, tukar `queryFn`
 * ke service modul terkait — kontrak kolomnya sudah disiapkan di registry.
 */
const fetchMockRows = async (rows: MockRow[]): Promise<MockRow[]> =>
  new Promise((resolve) => setTimeout(() => resolve(rows), 500));

const renderCell = (row: MockRow, col: ColumnSpec) => {
  const value = row[col.key];

  if (value === null || value === undefined || value === '') {
    return <span className="text-muted">—</span>;
  }

  switch (col.kind) {
    case 'bold':
      return <span className="font-bold text-ink">{String(value)}</span>;
    case 'mono':
      return <span className="font-mono text-[11px] font-bold text-ink-soft">{String(value)}</span>;
    case 'muted':
      return <span className="text-[11px] font-medium text-muted">{String(value)}</span>;
    case 'money':
      return <span className="font-bold text-ink tabular-nums">{formatCurrency(Number(value))}</span>;
    case 'number':
      return <span className="font-bold text-ink tabular-nums">{String(value)}</span>;
    case 'status':
      return <StatusBadge status={String(value)} />;
    case 'date':
    case 'text':
    default:
      return <span className="text-ink-soft font-semibold">{String(value)}</span>;
  }
};

export const ResourceListPage = ({ path }: { path: string }) => {
  const spec = getModule(path);
  const { can } = usePermissions();

  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['module', path],
    queryFn: () => fetchMockRows(spec?.rows ?? []),
    enabled: !!spec,
  });

  const canUpdate = spec ? can(`${spec.resource}.update`) : false;
  const canDelete = spec ? can(`${spec.resource}.delete`) : false;
  const canCreate = spec ? can(`${spec.resource}.create`) : false;

  const columns = useMemo<Column<MockRow>[]>(() => {
    if (!spec) return [];

    const cols: Column<MockRow>[] = spec.columns.map((col) => ({
      header: col.header,
      align: col.align,
      cell: (row) => renderCell(row, col),
    }));

    // Kolom aksi hanya muncul bila user punya minimal satu izin aksi.
    if (canUpdate || canDelete) {
      cols.push({
        header: 'Aksi',
        align: 'right',
        cell: (row) => (
          <RowActions
            label="Aksi"
            onEdit={canUpdate ? () => console.log('Edit', row.id) : undefined}
            onDelete={canDelete ? () => console.log('Hapus', row.id) : undefined}
          />
        ),
      });
    }

    return cols;
  }, [spec, canUpdate, canDelete]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * limit, page * limit),
    [filtered, page, limit],
  );

  const totalPages = Math.ceil(filtered.length / limit) || 1;

  if (!spec) {
    return <div className="p-6 text-center text-semantic-error">Modul tidak dikenal: {path}</div>;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={spec.title}
        description={spec.description}
        action={
          spec.createLabel && canCreate ? (
            <Button icon={<Plus size={16} />} onClick={() => console.log('Tambah', spec.path)}>
              {spec.createLabel}
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="bg-surface border border-border rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted">Memuat data...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={paginated}
          rowKey={(row) => row.id}
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={`Cari ${spec.title.toLowerCase()}...`}
          limit={limit}
          onLimitChange={(v) => {
            setLimit(v);
            setPage(1);
          }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
