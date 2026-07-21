import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfirmedActionProvider, useConfirmedAction } from './ConfirmedActionProvider';

const Harness = ({ execute }: { execute: () => Promise<unknown> }) => {
  const confirm = useConfirmedAction();
  return <button onClick={() => confirm({ title: 'Konfirmasi', message: 'Lanjut?', execute })}>Mulai</button>;
};

const renderHarness = (execute: () => Promise<unknown>) => render(
  <QueryClientProvider client={new QueryClient()}>
    <ConfirmedActionProvider><Harness execute={execute} /></ConfirmedActionProvider>
  </QueryClientProvider>,
);

describe('ConfirmedActionProvider', () => {
  it('cancel tidak menjalankan aksi', () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    renderHarness(execute);
    fireEvent.click(screen.getByText('Mulai'));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(execute).not.toHaveBeenCalled();
  });

  it('klik konfirmasi berulang tetap menjalankan aksi sekali', async () => {
    let release!: () => void;
    const execute = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    renderHarness(execute);
    fireEvent.click(screen.getByText('Mulai'));
    const confirmButton = screen.getByRole('button', { name: 'Lanjutkan' });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    expect(execute).toHaveBeenCalledOnce();
    release();
    await waitFor(() => expect(screen.queryByText('Konfirmasi')).not.toBeInTheDocument());
  });
});
