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
    <div dir="rtl" className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between font-['Cairo',sans-serif]">
      
      {/* اليمين: زر القائمة الجانبية الحر (بدون أطر) + الشعار الرسمي بالدرع أولاً */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-white hover:text-[#FFC500] transition-colors p-1 cursor-pointer bg-transparent border-0 outline-none active:scale-95"
          title="القائمة"
        >
          <Menu size={24} className="stroke-[2.5]" />
        </button>

        <div onClick={onNavigateHome} className="cursor-pointer">
          <YRLogo />
        </div>
      </div>

      {/* اليسار: جرس الإشعارات الحر (بدون أطر) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNavigateNotifications}
          className="text-zinc-200 hover:text-[#FFC500] transition-colors p-1 relative cursor-pointer bg-transparent border-0 outline-none active:scale-95"
          title="الإشعارات"
        >
          <Bell size={21} className="stroke-[2.2]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
          )}
        </button>
      </div>

    </div>
  );
};
