export interface PublicNavItem {
  to: string;
  label: string;
}

export const PUBLIC_NAV: PublicNavItem[] = [
  { to: '/', label: 'Beranda' },
  { to: '/katalog', label: 'Katalog' },
  { to: '/simulasi', label: 'Simulasi Kredit' },
  { to: '/tentang', label: 'Tentang' },
  { to: '/kontak', label: 'Kontak' },
];
