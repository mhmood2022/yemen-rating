import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const YEMEN_GOVERNORATES = [
  'كل المحافظات',
  'أمانة العاصمة (صنعاء)',
  'محافظة صنعاء',
  'عدن',
  'تعز',
  'حضرموت (المكلا / سيئون)',
  'إب',
  'الحديدة',
  'مأرب',
  'ذمار',
  'شبوة',
  'المهرة',
  'أبين',
  'لحج',
  'الضالع',
  'صعدة',
  'حجة',
  'البيضاء',
  'عمران',
  'الجوف',
  'المحويت',
  'ريمة',
  'سقطرى'
];

interface SearchSectionProps {
  onSearch: (query: string, govId: string, cityId: string) => void;
  selectedGov?: string;
  selectedCity?: string;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  selectedGov = 'كل المحافظات',
  selectedCity = 'all'
}) => {
  const [query, setQuery] = useState('');
  const [gov, setGov] = useState(selectedGov);

  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setGov(val);
    onSearch(query, val, selectedCity);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val, gov, selectedCity);
  };

  return (
    <div dir="rtl" className="w-full max-w-6xl mx-auto px-3 sm:px-4 pt-3 pb-1 font-['Cairo',sans-serif]">
      {/* شريط البحث المودرن مع اختيار المحافظة الصريح المباشر */}
      <div className="flex items-center bg-[#121215] border border-[#242428] hover:border-[#FFC500]/40 rounded-2xl p-1.5 px-3 shadow-xl transition-all">
        
        {/* أيقونة البحث */}
        <Search size={16} className="text-[#8E8E93] shrink-0 ml-2" />

        {/* حقل البحث الرئيسي */}
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="ابحث عن شركة، مطعم، عقار، مزاد، وظيفة..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-[#6B6B75] outline-none font-medium"
        />

        {/* اختيار المحافظة بشكل مباشر وصريح */}
        <div className="flex items-center gap-1 border-r border-[#27272A] pr-2 mr-1">
          <MapPin size={14} className="text-[#FFC500] shrink-0" />
          <select
            value={gov}
            onChange={handleGovChange}
            className="bg-transparent text-[#D1D5DB] text-[11px] font-bold outline-none cursor-pointer max-w-[110px]"
          >
            {YEMEN_GOVERNORATES.map((g) => (
              <option key={g} value={g} className="bg-[#121215] text-white">
                {g}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};
