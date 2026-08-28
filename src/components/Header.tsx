import React, { useState } from 'react';
import { Menu, Bell, Search, Star, MapPin, ChevronDown } from 'lucide-react';
import { YEMEN_LOCATIONS } from '../data/locations';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onNavigateNotifications?: () => void;
  onSearch?: (query: string, govId: string, cityId: string) => void;
  selectedGov: string;
  selectedCity: string;
  onGovChange: (govId: string) => void;
  onCityChange: (cityId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateNotifications,
  onSearch,
  selectedGov,
  selectedCity,
  onGovChange,
  onCityChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const currentGov = YEMEN_LOCATIONS.find(g => g.id === selectedGov);
  const cities = currentGov ? currentGov.cities : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery, selectedGov, selectedCity);
  };

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 w-full bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#222222] shadow-lg transition-all"
    >
      <div className="max-w-5xl mx-auto px-3.5 py-3 space-y-2.5">
        
        {/* Top Row: Menu + Logo + Bell */}
        <div className="flex items-center justify-between">
          
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-[#f5c400] transition-colors focus:outline-none"
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6 stroke-[2]" />
          </button>

          {/* شعار يمن ريتغ مع النجمة الذهبية الموحدة */}
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

          <button
            onClick={onNavigateNotifications}
            className="relative p-1.5 rounded-lg text-zinc-300 hover:text-[#f5c400] transition-colors focus:outline-none"
            aria-label="الإشعارات"
          >
            <Bell className="w-6 h-6 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f5c400] ring-2 ring-[#0f0f0f]" />
          </button>

        </div>

        {/* Search Bar + Location Selectors */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          
          {/* حقل البحث */}
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value, selectedGov, selectedCity);
              }}
              placeholder="ابحث عن منشأة، فندق، مطعم، عقار، وظيفة..."
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#f5c400] transition-colors"
            />
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          {/* فلاتر المحافظة والمدينة المدمجة */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            
            {/* اختيار المحافظة */}
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#f5c400] pointer-events-none" />
              <select
                value={selectedGov}
                onChange={(e) => {
                  onGovChange(e.target.value);
                  onCityChange('all');
                }}
                className="w-full appearance-none bg-[#181818] border border-[#2a2a2a] hover:border-zinc-700 rounded-xl pr-8 pl-7 py-2 text-zinc-200 text-[11px] sm:text-xs font-medium focus:outline-none focus:border-[#f5c400] cursor-pointer"
              >
                <option value="all" className="bg-[#121212] text-[#f5c400] font-bold">كل المحافظات</option>
                {YEMEN_LOCATIONS.map((gov) => (
                  <option key={gov.id} value={gov.id} className="bg-[#121212] text-zinc-200">
                    {gov.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>

            {/* اختيار المدينة / المديرية */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                disabled={selectedGov === 'all'}
                className="w-full appearance-none bg-[#181818] border border-[#2a2a2a] hover:border-zinc-700 rounded-xl px-3 pl-7 py-2 text-zinc-200 text-[11px] sm:text-xs font-medium focus:outline-none focus:border-[#f5c400] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="all" className="bg-[#121212] text-zinc-300">
                  {selectedGov === 'all' ? 'اختر المحافظة أولاً' : 'كل المديريات'}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id} className="bg-[#121212] text-zinc-200">
                    {city.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>

          </div>

        </form>

      </div>
    </header>
  );
};

export default Header;
