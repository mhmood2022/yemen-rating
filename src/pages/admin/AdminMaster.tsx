import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminLogin } from './auth/AdminLogin';
import { Menu, ShieldAlert, LogOut } from 'lucide-react';

export const AdminMaster: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const session = localStorage.getItem('yr_admin_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem('yr_admin_session');
      }
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('yr_admin_session');
    setIsAuthenticated(false);
  };

  if (checking) {
    return <div className="min-h-screen bg-[#070A10] flex items-center justify-center text-white font-['Cairo']">جارٍ التحقق من الصلاحيات...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white flex font-['Cairo',sans-serif]">
      {/* القائمة الجانبية */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:mr-[280px]">
        {/* 🔒 الهيدر الثابت المطلق (Fixed Header) لا يتحرك نهائياً مع التمرير */}
        <header className="fixed top-0 left-0 right-0 lg:right-[280px] h-16 bg-[#0B0F17] flex items-center justify-between px-4 lg:px-8 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-[#161D2B] text-white lg:hidden hover:bg-[#1F2937] transition"
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
            <ShieldAlert size={16} className="text-[#FFC500]" />
            <span>نظام الإدارة الداخلي لمنصة Yemen Rating</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>خروج آمن</span>
          </button>
        </header>

        {/* مساحة المحتوى مع تعويض ارتفاع الهيدر pt-16 */}
        <main className="flex-1 p-4 lg:p-8 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminMaster;
