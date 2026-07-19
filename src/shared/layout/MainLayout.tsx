import type { ReactNode } from 'react';
import { useLayout } from './useLayout';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const {
    isMobileSidebarOpen, setIsMobileSidebarOpen,
    isDesktopSidebarOpen, setIsDesktopSidebarOpen,
    isProfileOpen, setIsProfileOpen,
  } = useLayout();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-ink font-sans">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleDesktop={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isProfileOpen={isProfileOpen}
          onToggleProfile={() => setIsProfileOpen(!isProfileOpen)}
        />
        <div className="flex-1 overflow-y-auto scrollbar-slim px-4 md:px-6 lg:px-8 py-5 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
