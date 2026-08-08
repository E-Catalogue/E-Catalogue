import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NameFormModal } from './NameFormModal';

const renderForm = (cycleKey: string, onSubmit = vi.fn()) => (
  <QueryClientProvider client={new QueryClient()}>
    <NameFormModal key={cycleKey} open onClose={() => undefined} title="Tambah Data" label="Nama" onSubmit={onSubmit} />
  </QueryClientProvider>
);

describe('lifecycle form modal dashboard', () => {
  it('mempertahankan input selama siklus yang sama agar error dapat diperbaiki', () => {
    const view = render(renderForm('open-1'));
    fireEvent.change(screen.getByLabelText(/Nama/), { target: { value: 'Input belum valid' } });
    view.rerender(renderForm('open-1'));
    expect(screen.getByLabelText(/Nama/)).toHaveValue('Input belum valid');
  });

  it('kembali ke default ketika dibuka pada siklus baru setelah batal atau sukses', () => {
    const view = render(renderForm('open-1'));
    fireEvent.change(screen.getByLabelText(/Nama/), { target: { value: 'Data lama' } });
    view.rerender(renderForm('closed'));
    view.rerender(renderForm('open-2'));
    expect(screen.getByLabelText(/Nama/)).toHaveValue('');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
