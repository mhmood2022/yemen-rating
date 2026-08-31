import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (query: string, govId: string, cityId: string) => void;
  selectedGov?: string;
  selectedCity?: string;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  selectedGov = 'all',
  selectedCity = 'all'
}) => {
  const [query, setQuery] = useState('');
  const [locationText, setLocationText] = useState('اليمن، صنعاء');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val, selectedGov, selectedCity);
  };

  return (
    <div dir="rtl" className="w-full max-w-6xl mx-auto px-3 sm:px-4 pt-3 pb-1 font-['Cairo',sans-serif]">
      {/* شريط البحث المودرن الأنيق المطابق للصورة الأولى */}
      <div className="relative flex items-center bg-[#121215] border border-[#222226] hover:border-[#FFC500]/40 rounded-2xl p-2 px-3.5 shadow-xl transition-all">
        
        {/* أيقونة البحث */}
        <Search size={18} className="text-[#8E8E93] shrink-0 ml-2" />

        {/* حقل البحث الرئيسي */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="ابحث عن نشاط، مطعم، بنك، عقار، خدمة..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-[#6B6B75] outline-none font-medium"
        />

        {/* محدد الموقع المدمج على اليسار */}
        <div className="flex items-center gap-1 border-r border-[#27272A] pr-2.5 mr-2 text-[#A1A1AA] hover:text-[#FFC500] cursor-pointer transition-colors">
          <MapPin size={14} className="text-[#FFC500] shrink-0" />
          <span className="text-[11px] font-bold whitespace-nowrap">{locationText}</span>
          <ChevronDown size={12} className="text-[#71717A]" />
        </div>

      </div>
    </div>
  );
};
