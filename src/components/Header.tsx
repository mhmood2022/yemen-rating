import React, { useState } from 'react';
import { Menu, Bell, Search, Star, MapPin } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onNavigateProfile?: () => void;
  onNavigateNotifications?: () => void;
  onSearch?: (query: string) => void;
  selectedCityName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateNotifications,
  onSearch,
  selectedCityName = 'صنعاء'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header dir="rtl" className="w-full bg-[#0f0f0f] border-b border-[#222222] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 space-y-2.5">
        
        {/* Top Row: Menu + Logo (Yemen Rating + Star) + Notifications */}
        <div className="flex items-center justify-between">
          
          {/* زر القائمة */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-[#f5c400] transition-colors focus:outline-none"
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6 stroke-[2]" />
          </button>

          {/* شعار يمن ريتغ مع النجمة الذهبية في المنتصف */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 focus:outline-none group"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-extrabold text-white tracking-wide">يمن ريتغ</span>
              <span className="text-[9px] font-bold text-zinc-400 -mt-1 font-mono tracking-wider">YEMEN RATING</span>
            </div>

            <div className="w-7 h-7 rounded-lg bg-[#f5c400] flex items-center justify-center text-zinc-950 shadow-md shadow-[#f5c400]/20 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4 fill-zinc-950 stroke-zinc-950" />
            </div>
          </button>

          {/* أيقونة الإشعارات */}
          <button
            onClick={onNavigateNotifications}
            className="relative p-1.5 rounded-lg text-zinc-300 hover:text-[#f5c400] transition-colors focus:outline-none"
            aria-label="الإشعارات"
          >
            <Bell className="w-6 h-6 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f5c400] ring-2 ring-[#0f0f0f]" />
          </button>

        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            placeholder="ابحث عن نشاط أو شركة أو خدمة..."
            className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#f5c400] transition-colors"
          />
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        </form>

        {/* Location Indicator */}
        <div className="flex items-center justify-start gap-1.5 text-xs text-zinc-300 pt-0.5">
          <MapPin className="w-3.5 h-3.5 text-[#f5c400]" />
          <span className="font-medium">اليمن، {selectedCityName}</span>
        </div>

      </div>
    </header>
  );
};

export default Header;
