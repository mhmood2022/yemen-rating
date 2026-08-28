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
      className="sticky top-0 z-50 w-full bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#202020] shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 1. زر القائمة - أبيض ونظيف */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-white hover:text-zinc-300 transition-colors focus:outline-none flex items-center justify-center"
          aria-label="فتح القائمة"
        >
          <Menu className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* 2. الشعار المنسق الأنيق (بدون دليل اليمن) */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 focus:outline-none group"
        >
          <div className="flex flex-col items-end leading-tight">
            <span className="text-base font-black text-white tracking-wide">يمن ريتينغ</span>
            <span className="text-[9px] font-bold text-zinc-400 font-mono tracking-wider">YEMEN RATING</span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-[#f5b800] flex items-center justify-center text-zinc-950 shadow-md shadow-[#f5b800]/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Star className="w-4 h-4 fill-zinc-950 stroke-zinc-950" />
          </div>
        </button>

        {/* 3. جرس الإشعارات - بدون إطارات أو دوائر ضخمة حوله */}
        <button
          onClick={onNavigateNotifications}
          className="relative p-2 text-zinc-300 hover:text-white transition-colors focus:outline-none flex items-center justify-center"
          aria-label="الإشعارات"
        >
          <Bell className="w-6 h-6 stroke-[1.8]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#f5b800] text-zinc-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
};

export default Header;
