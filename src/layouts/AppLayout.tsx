import React from 'react';
import { Header } from '../components/navigation/Header';
import { DesktopSidebar } from '../components/navigation/DesktopSidebar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { MobileMoreDrawer } from '../components/navigation/MobileMoreDrawer';
import { Footer } from '../components/navigation/Footer';
import { AdminLoginModal } from '../components/modals/AdminLoginModal';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#0F172A]">
      <Header />
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <DesktopSidebar activeId="home" />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-8 w-full max-w-full overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />
      <MobileBottomNav activeTab="home" />
      <MobileMoreDrawer />
      <AdminLoginModal />
    </div>
  );
};
