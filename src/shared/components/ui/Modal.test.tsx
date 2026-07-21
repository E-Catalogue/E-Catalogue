import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from './Modal';

const renderModal = (onClose: () => void, busy = false) => render(
  <QueryClientProvider client={new QueryClient()}>
    <Modal open onClose={onClose} title="Editor" busy={busy}>Isi</Modal>
  </QueryClientProvider>,
);

describe('Modal dismissal guard', () => {
  it('tidak dapat ditutup dengan Escape saat busy', () => {
    const onClose = vi.fn();
    renderModal(onClose, true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Tutup dialog' })).toBeDisabled();
  });

  it('dapat ditutup saat tidak busy', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
