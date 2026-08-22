import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LogOut, ShieldAlert } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size={32} className="text-[#0B1F3A]" />
          <p className="text-sm font-bold text-[#0B1F3A]">جارٍ التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FA]">
        <div className="bg-white p-6 rounded-[14px] border border-[#DC2626]/30 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] rounded-full inline-flex">
            <ShieldAlert size={36} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold text-[#0B1F3A]">وصول محظور — غير مصرح لك</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            هذه المنطقة مخصصة لإدارة منصة يمن ريتغ فقط، وتتطلب صلاحيات عليا موثقة في قاعدة البيانات.
          </p>
          <div className="pt-2">
            <Button variant="primary" fullWidth onClick={() => (window.location.href = '/')}>
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <header className="h-[64px] bg-[#0B1F3A] text-white px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#F5C400] text-[#0B1F3A] font-black flex items-center justify-center text-base">
            YR
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">لوحة الإدارة — يمن ريتغ</h1>
            <p className="text-[10px] text-[#94A3B8]">Yemen Rating Admin Console</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#E2E8F0] hidden sm:inline-block">{user.email}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            icon={<LogOut size={16} />}
          >
            خروج
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
};
