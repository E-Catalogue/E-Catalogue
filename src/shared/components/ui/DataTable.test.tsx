import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DataTable, type Column } from './DataTable';

type Row = { id: string; name: string };
const columns: Column<Row>[] = [{ header: 'Nama', cell: (row) => row.name }];

describe('DataTable states', () => {
  it('menampilkan skeleton saat initial loading', () => {
    const { container } = render(<DataTable columns={columns} data={[]} rowKey={(row) => row.id} loading />);
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('menampilkan empty state informatif', () => {
    render(<DataTable columns={columns} data={[]} rowKey={(row) => row.id} emptyState={{ title: 'Data kosong', description: 'Tambahkan data baru.' }} />);
    expect(screen.getByText('Data kosong')).toBeInTheDocument();
    expect(screen.getByText('Tambahkan data baru.')).toBeInTheDocument();
  });

  it('menyediakan retry pada error state', () => {
    const retry = vi.fn();
    render(<DataTable columns={columns} data={[]} rowKey={(row) => row.id} error onRetry={retry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Coba Lagi' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
