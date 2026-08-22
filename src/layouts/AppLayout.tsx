import React from 'react';
import { Header } from '../components/navigation/Header';
import { DesktopSidebar } from '../components/navigation/DesktopSidebar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { MobileMoreDrawer } from '../components/navigation/MobileMoreDrawer';
import { Footer } from '../components/navigation/Footer';
import { AdminLoginModal } from '../components/modals/AdminLoginModal';

interface AppLayoutProps {
  children: React.ReactNode;
  onNavigate?: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#000000] text-[#0F172A] dark:text-white transition-colors">
      <Header onNavigate={onNavigate} />
      
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <DesktopSidebar onNavigate={onNavigate} />
        <main className="flex-1 p-4 lg:p-6 w-full max-w-full overflow-hidden">
          {children}
        </main>
      </div>

      <div className="w-full pb-[calc(76px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <Footer />
      </div>

      <MobileBottomNav onNavigate={onNavigate} />
      <MobileMoreDrawer onNavigate={onNavigate} />
      <AdminLoginModal />
    </div>
  );
};
