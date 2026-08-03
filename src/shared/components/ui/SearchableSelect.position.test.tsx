import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchableSelect } from './SearchableSelect';

describe('SearchableSelect anchored overlay', () => {
  it('menghitung ulang posisi ketika container modal di-scroll', async () => {
    let top = 100;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if ((this as HTMLElement).tagName === 'BUTTON') return { top, bottom: top + 44, left: 20, right: 220, width: 200, height: 44, x: 20, y: top, toJSON: () => ({}) } as DOMRect;
      return { top: 150, bottom: 300, left: 20, right: 280, width: 260, height: 150, x: 20, y: 150, toJSON: () => ({}) } as DOMRect;
    });
    render(<SearchableSelect label="Merek" value="" onChange={() => undefined} options={[{ value: '1', label: 'Toyota' }]} />);
    fireEvent.click(screen.getByRole('button', { name: /Pilih/i }));
    const panel = (await screen.findByPlaceholderText('Cari...')).closest('[style]') as HTMLElement;
    expect(panel.style.top).toBe('150px');
    top = 40;
    fireEvent.scroll(document);
    fireEvent(window, new Event('resize'));
    await waitFor(() => expect(panel.style.top).toBe('90px'));
  });
});
