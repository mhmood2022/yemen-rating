import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LogOut, ShieldAlert, Star } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size={32} className="text-[#F5C400]" />
          <p className="text-sm font-bold text-white">جارٍ التحقق من الصلاحيات الإدارية...</p>
        </div>
      </div>
    );
  }

  // Strict Protection (Must be logged in & Role Admin)
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="bg-[#111111] p-6 rounded-[14px] border border-[#222222] shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-[#EF4444]/15 text-[#EF4444] rounded-full inline-flex">
            <ShieldAlert size={36} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold text-white">وصول محظور — لوحة المشرفين</h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            هذه المنطقة مخصصة لإدارة منصة يمن ريتغ (YR Admin Console). تتطلب صلاحيات مشفرة وموثقة في قاعدة البيانات.
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
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors">
      {/* Top Admin Header Bar */}
      <header className="h-[60px] bg-[#0A0A0A] border-b border-[#222222] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[#111111] border border-[#F5C400]/40 flex items-center justify-center text-[#F5C400] font-black">
            <Star size={16} className="fill-[#F5C400]" />
          </div>
          <div>
            <h1 className="text-sm font-black leading-tight text-white">لوحة الإدارة — يمن ريتغ</h1>
            <p className="text-[9px] text-[#A1A1AA]">Yemen Rating Admin Console · YR Ads</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A1A1AA] hidden sm:inline-block font-mono">{user.email}</span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 border-[#222222] text-[#A1A1AA] hover:text-white"
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            icon={<LogOut size={14} />}
          >
            خروج
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
};
