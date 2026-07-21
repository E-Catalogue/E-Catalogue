import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { VendorFormModal } from './VendorFormModal';

describe('VendorFormModal', () => {
  it('trim code dan nama sebelum submit', () => {
    const onSubmit = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <VendorFormModal open onClose={() => undefined} onSubmit={onSubmit} />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText(/Code Vendor/i), { target: { value: '  VND-001  ' } });
    fireEvent.change(screen.getByLabelText(/Nama Vendor/i), { target: { value: '  Bengkel Utama  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ code: 'VND-001', name: 'Bengkel Utama' }));
  });

  it('menahan submit dan menampilkan validasi code', () => {
    const onSubmit = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <VendorFormModal open onClose={() => undefined} onSubmit={onSubmit} />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText(/Code Vendor/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/Nama Vendor/i), { target: { value: 'Valid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Code vendor minimal 2 karakter.')).toBeInTheDocument();
  });
});
