import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileFloatingNav } from './MobileFloatingNav';

const mockPathname = vi.fn(() => '/');

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className, ...props }: Record<string, unknown> & { children?: React.ReactNode; to?: string; className?: string }) => (
    <a href={to} className={className} {...props}>{children}</a>
  ),
  useLocation: () => ({ pathname: mockPathname() }),
}));

const mockItems = [
  { to: '/', label: 'Beranda' },
  { to: '/katalog', label: 'Katalog' },
  { to: '/simulasi', label: 'Simulasi' },
  { to: '/testimoni', label: 'Testimoni' },
  { to: '/kontak', label: 'Kontak' },
];

describe('MobileFloatingNav', () => {
  it('merender pill navigasi melayang dengan seluruh item menu', () => {
    mockPathname.mockReturnValue('/');
    render(<MobileFloatingNav items={mockItems} />);

    const nav = screen.getByRole('navigation', { name: 'Navigasi Utama Mobile' });
    expect(nav).toHaveClass('fixed', 'md:hidden');
    expect(nav.querySelector('div')).toHaveClass('rounded-full', 'bg-white/95');
    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Katalog')).toBeInTheDocument();
    expect(screen.getByText('Simulasi')).toBeInTheDocument();
    expect(screen.getByText('Testimoni')).toBeInTheDocument();
    expect(screen.getByText('Kontak')).toBeInTheDocument();
  });

  it('menandai item aktif berdasarkan rute saat ini', () => {
    mockPathname.mockReturnValue('/katalog');
    const { rerender } = render(<MobileFloatingNav items={mockItems} />);

    const katalogLink = screen.getByText('Katalog').closest('a');
    expect(katalogLink).toHaveClass('bg-primary', 'text-white');

    const berandaLink = screen.getByText('Beranda').closest('a');
    expect(berandaLink).not.toHaveClass('bg-primary', 'text-white');

    mockPathname.mockReturnValue('/testimoni');
    rerender(<MobileFloatingNav items={mockItems} />);

    const testimoniLink = screen.getByText('Testimoni').closest('a');
    expect(testimoniLink).toHaveClass('bg-primary', 'text-white');
  });
});
