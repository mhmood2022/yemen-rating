import React from 'react';
import { Menu, Bell, Star, LogIn } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onNavigateProfile?: () => void;
  onNavigateNotifications?: () => void;
  isLoggedIn?: boolean;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateProfile,
  onNavigateNotifications,
  isLoggedIn = true,
  unreadNotificationsCount = 3
}) => {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 w-full bg-[#111111]/95 backdrop-blur-md border-b border-[#262626] shadow-md transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Right Section: Menu Toggle + Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1b1b1b] border border-[#303030] text-[#f5b800] hover:border-[#f5b800] focus:outline-none transition-colors"
            title="القائمة والتصنيفات"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f5b800] flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-[#f5b800]/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Star className="w-5 h-5 fill-zinc-950 text-zinc-950" />
            </div>
            <div className="flex flex-col leading-[1.2]">
              <span className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
                يمن ريتينغ
                <span className="text-[10px] text-[#f5b800] font-normal border border-[#f5b800]/30 px-1.5 py-0.2 rounded bg-[#f5b800]/10">
                  دليل اليمن
                </span>
              </span>
              <span className="text-[10px] text-[#a1a1a1] font-mono">Yemen Rating</span>
            </div>
          </button>
        </div>

        {/* Left Section: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onNavigateNotifications}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#1b1b1b] border border-[#303030] text-zinc-300 hover:text-[#f5b800] hover:border-[#f5b800] transition-colors"
            title="الإشعارات"
            aria-label="الإشعارات"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 bg-[#f5b800] text-zinc-950 text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#111111]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <button
              onClick={onNavigateProfile}
              className="h-10 flex items-center gap-2 px-2.5 sm:px-3 rounded-xl bg-[#1b1b1b] border border-[#303030] hover:border-[#f5b800] text-zinc-200 transition-colors"
              title="الحساب الشخصي"
            >
              <div className="w-6 h-6 rounded-lg bg-[#f5b800] text-zinc-950 flex items-center justify-center font-bold text-xs">
                م
              </div>
              <span className="hidden sm:inline text-xs font-medium text-zinc-200">حسابي</span>
            </button>
          ) : (
            <button
              onClick={onNavigateProfile}
              className="h-10 flex items-center gap-1.5 px-3.5 rounded-xl bg-[#f5b800] text-zinc-950 font-bold text-xs hover:bg-[#e5aa00] transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
