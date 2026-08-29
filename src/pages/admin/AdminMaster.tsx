import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Menu, ShieldAlert, LogOut } from 'lucide-react';

export const AdminMaster: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white flex font-['Cairo',sans-serif]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:mr-[280px]">
        <header className="h-16 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1F2937] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-[#161D2B] text-white lg:hidden hover:bg-[#1F2937]"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
            <ShieldAlert size={16} className="text-[#FFC500]" />
            <span>نظام الإدارة الداخلي لمنصة Yemen Rating</span>
          </div>

          <button 
            onClick={() => { window.location.href = '/'; }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 text-xs font-bold transition-colors"
          >
            <LogOut size={15} />
            <span>خروج</span>
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
