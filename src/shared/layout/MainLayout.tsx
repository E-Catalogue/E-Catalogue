import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const COLLAPSE_KEY = 'master_sidebar_collapsed';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Pilihan lebar sidebar diingat antar kunjungan.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
};
