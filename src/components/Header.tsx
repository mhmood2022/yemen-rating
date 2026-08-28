import React, { useState } from 'react';
import { Menu, Search, Bell, Star, LogIn } from 'lucide-react';

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
  unreadNotificationsCount = 3
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
      className="sticky top-0 z-50 w-full bg-[#111111] border-b border-[#292929] shadow-md transition-all"
    >
      <div className="max-w-[1400px] h-[64px] md:h-[72px] mx-auto px-3 sm:px-5 flex items-center gap-2.5 sm:gap-4">
        
        {/* 1. زر القائمة */}
        <button
          onClick={onToggleSidebar}
          className="w-[38px] h-[38px] md:w-[42px] md:h-[42px] flex items-center justify-center border border-[#303030] rounded-[10px] bg-[#1b1b1b] text-[#f5c400] hover:border-[#f5c400] transition-colors flex-shrink-0"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 2. الشعار */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-right no-underline text-white min-w-auto md:min-w-[170px] flex-shrink-0 group focus:outline-none"
        >
          <div className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-[10px] bg-[#f5c400] flex items-center justify-center text-zinc-950 font-black shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <Star className="w-5 h-5 fill-zinc-950 text-zinc-950" />
          </div>

          <div className="hidden sm:flex flex-col leading-[1.2]">
            <strong className="text-[15px] md:text-[16px] text-[#f5c400] font-extrabold tracking-wide">
              Yemen Rating
            </strong>
            <span className="text-[11px] text-[#a1a1a1]">
              يمن ريتغ
            </span>
          </div>
        </button>

        {/* 3. شريط البحث المدمج في الهيدر */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-[620px] h-[38px] md:h-[42px] mx-auto flex items-center gap-2.5 px-3 md:px-3.5 bg-[#1b1b1b] border border-[#303030] focus-within:border-[#f5c400] rounded-[10px] text-[#888] transition-all"
        >
          <button type="submit" className="text-[#888] hover:text-[#f5c400] transition-colors">
            <Search className="w-[18px] h-[18px] md:w-[19px] md:h-[19px] flex-shrink-0" />
          </button>
          
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            placeholder="ابحث عن منشأة، خدمة، وظيفة..."
            className="w-full border-0 outline-none bg-transparent text-white text-xs md:text-[14px] placeholder-[#777] font-medium"
          />
        </form>

        {/* 4. إجراءات الهيدر (الإشعارات + الحساب) */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* الإشعارات */}
          <button
            onClick={onNavigateNotifications}
            className="relative w-[38px] h-[38px] md:w-[42px] md:h-[42px] flex items-center justify-center border border-[#303030] hover:border-[#f5c400] rounded-[10px] bg-[#1b1b1b] text-[#ddd] hover:text-[#f5c400] transition-colors"
            aria-label="الإشعارات"
          >
            <Bell className="w-[19px] h-[19px] md:w-[20px] md:h-[20px]" />

            {/* عدد الإشعارات */}
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-[5px] -right-[5px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#f5c400] text-[#000] text-[10px] font-bold shadow-sm">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* الحساب */}
          {isLoggedIn ? (
            <button
              onClick={onNavigateProfile}
              className="h-[38px] md:h-[42px] flex items-center gap-2 px-2 sm:px-2.5 border border-[#303030] hover:border-[#f5c400] rounded-[10px] bg-[#1b1b1b] text-white transition-colors"
            >
              <span className="w-[26px] h-[26px] md:w-[28px] md:h-[28px] flex items-center justify-center rounded-full bg-[#f5c400] text-[#000] font-bold text-xs">
                م
              </span>

              <span className="hidden md:inline text-[13px] font-medium text-zinc-200">
                حسابي
              </span>
            </button>
          ) : (
            <button
              onClick={onNavigateProfile}
              className="h-[38px] md:h-[42px] flex items-center gap-1.5 px-3 rounded-[10px] bg-[#f5c400] text-[#000] font-bold text-xs hover:bg-amber-300 transition-colors"
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
