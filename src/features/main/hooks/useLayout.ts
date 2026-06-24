import { useState, useEffect } from 'react';

export const useLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // STATE INITIALIZATION LOCAL STORAGE
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adonara_sidebar_open');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    }
    return true; 
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adonara_sidebar_open', JSON.stringify(isDesktopSidebarOpen));
    }
  }, [isDesktopSidebarOpen]);

  // Waktu
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isDesktopSidebarOpen,
    setIsDesktopSidebarOpen,
    isProfileOpen,
    setIsProfileOpen,
    currentTime,
  };
};