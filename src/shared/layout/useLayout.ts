import { useState, useEffect } from 'react';

export const useLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gm_sidebar_open');
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gm_sidebar_open', JSON.stringify(isDesktopSidebarOpen));
    }
  }, [isDesktopSidebarOpen]);

  return {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isDesktopSidebarOpen,
    setIsDesktopSidebarOpen,
    isProfileOpen,
    setIsProfileOpen,
  };
};
