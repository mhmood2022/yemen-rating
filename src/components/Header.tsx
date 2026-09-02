import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { YRLogo } from './common/YRLogo';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onNavigateNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateNotifications,
  unreadNotificationsCount = 3
}) => {
  return (
    <header dir="rtl" className="w-full bg-[#070A10]/98 backdrop-blur-md px-3 sm:px-4 py-2 font-['Cairo',sans-serif]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* اليمين: زر القائمة الجانبية (☰) + الشعار الرسمي المعتمد */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* 1. زر القائمة الجانبية في اليمين */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-xl bg-[#121215] border border-[#222226] text-white hover:text-[#FFC500] hover:border-[#FFC500]/40 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="القائمة"
          >
            <Menu size={20} />
          </button>

          {/* 2. الشعار الرسمي المعتمد */}
          <div 
            onClick={onNavigateHome}
            className="cursor-pointer group flex items-center"
          >
            <YRLogo />
          </div>
        </div>

        {/* اليسار: جرس الإشعارات */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateNotifications}
            className="w-9 h-9 rounded-xl bg-[#121215] border border-[#222226] text-zinc-300 hover:text-[#FFC500] hover:border-[#FFC500]/40 flex items-center justify-center relative transition-all active:scale-95 cursor-pointer"
            title="الإشعارات"
          >
            <Bell size={17} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center border-2 border-[#070A10]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
