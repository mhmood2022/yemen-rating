import React from 'react';
import { Menu, Bell, Star, ShieldCheck } from 'lucide-react';

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
    <header dir="rtl" className="sticky top-0 z-50 bg-[#070A10]/95 backdrop-blur-md border-b border-[#1F2937] px-4 py-2.5 font-['Cairo',sans-serif]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* الشعار الرسمي لمنصة يمن ريتنغ */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFC500] to-yellow-300 flex items-center justify-center text-black font-black shadow-lg shadow-[#FFC500]/20 group-hover:scale-105 transition-transform">
            <Star size={20} className="fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-white font-black text-sm sm:text-base tracking-wide leading-none">
                يمن ريتنغ
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFC500]/15 text-[#FFC500] font-black border border-[#FFC500]/30">
                الرسمي
              </span>
            </div>
            <span className="text-[#9CA3AF] text-[9.5px] font-mono tracking-widest block mt-0.5">
              YEMEN RATING
            </span>
          </div>
        </div>

        {/* أزرار الإشعارات والقائمة */}
        <div className="flex items-center gap-2">
          {/* جرس الإشعارات */}
          <button
            onClick={onNavigateNotifications}
            className="w-9 h-9 rounded-xl bg-[#121215] border border-[#222226] text-[#D1D5DB] hover:text-[#FFC500] hover:border-[#FFC500]/40 flex items-center justify-center relative transition-all active:scale-95 cursor-pointer"
            title="الإشعارات"
          >
            <Bell size={17} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center border-2 border-[#070A10] animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* زر القائمة الجانبية */}
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-xl bg-[#121215] border border-[#222226] text-white hover:text-[#FFC500] hover:border-[#FFC500]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="القائمة"
          >
            <Menu size={20} />
          </button>
        </div>

      </div>
    </header>
  );
};
