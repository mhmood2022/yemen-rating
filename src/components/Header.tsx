import React from 'react';
import { Menu, Bell, Star } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onNavigateProfile?: () => void;
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
    <header
      dir="rtl"
      className="sticky top-0 z-50 w-full bg-[#0d0d0d] shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 1. زر القائمة - أبيض ونظيف */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-white hover:text-yellow-400 hover:bg-zinc-900 rounded-xl transition"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* الشعار */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-right group"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500 text-zinc-950 flex items-center justify-center font-black">
              <Star className="w-5 h-5 fill-zinc-950" />
            </div>
            <div>
              <span className="font-black text-base text-white tracking-tight block leading-none">
                يمن ريتنغ
              </span>
              <span className="text-[10px] text-zinc-400 tracking-wider block mt-0.5">
                YEMEN RATING
              </span>
            </div>
          </button>
        </div>

        {/* 2. الإشعارات والملف الشخصي */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateNotifications}
            className="p-2 text-zinc-300 hover:text-yellow-400 hover:bg-zinc-900 rounded-xl relative transition"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-yellow-500 text-zinc-950 font-black text-[10px] flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
