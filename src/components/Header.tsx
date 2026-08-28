import React, { useState } from 'react';
import { Menu, Search, Bell, User, Star, LogIn } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onNavigateProfile?: () => void;
  onNavigateNotifications?: () => void;
  onSearch?: (query: string) => void;
  isLoggedIn?: boolean;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateProfile,
  onNavigateNotifications,
  onSearch,
  isLoggedIn = true,
  unreadNotificationsCount = 2
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 shadow-md"
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Right Section: Menu Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800/60 focus:outline-none transition-colors"
            title="القائمة والتصنيفات"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-right group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 fill-zinc-950" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-base tracking-wide text-white flex items-center gap-1">
                يمن ريتينغ
                <span className="text-[10px] text-amber-400 font-normal border border-amber-400/30 px-1 py-0.2 rounded bg-amber-400/10">
                  دليل اليمن
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 -mt-0.5">Yemen Rating</span>
            </div>
          </button>
        </div>

        {/* Center Section: Global Search Bar */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في يمن ريتنغ (مطاعم، عقارات، وظائف، صرافة...)"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Left Section: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onNavigateNotifications}
            className="relative p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-amber-400 text-zinc-950 text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-zinc-950">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <button
              onClick={onNavigateProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-400/50 text-zinc-200 transition-colors"
              title="الحساب الشخصي"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="hidden md:inline text-xs font-medium text-zinc-200">حسابي</span>
            </button>
          ) : (
            <button
              onClick={onNavigateProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>دخول</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
