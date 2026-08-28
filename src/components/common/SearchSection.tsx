import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, Sparkles, Navigation } from 'lucide-react';
import { YEMEN_LOCATIONS } from '../../data/locations';

interface SearchSectionProps {
  onSearch: (query: string, governorateId: string, cityId: string) => void;
  selectedGov: string;
  selectedCity: string;
  onGovChange: (govId: string) => void;
  onCityChange: (cityId: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  selectedGov,
  selectedCity,
  onGovChange,
  onCityChange
}) => {
  const [query, setQuery] = useState('');

  const currentGov = YEMEN_LOCATIONS.find(g => g.id === selectedGov);
  const cities = currentGov ? currentGov.cities : [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedGov, selectedCity);
  };

  return (
    <section dir="rtl" className="w-full bg-gradient-to-b from-[#111111] via-[#151515] to-[#0d0d0d] border-b border-[#262626] py-4 sm:py-5 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
        
        {/* Header Title */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 bg-[#f5b800] rounded-full"></span>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide">
              محرك البحث الوطني الشامل للخدمات والأنشطة في اليمن
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 bg-[#1b1b1b] px-2.5 py-1 rounded-lg border border-[#262626] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#f5b800]" />
            <span>22 محافظة يمنية • 26 تصنيفاً معتمداً</span>
          </span>
        </div>

        {/* The Search Form */}
        <form onSubmit={handleFormSubmit} className="bg-[#111111] border border-[#262626] rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col md:flex-row items-stretch gap-2">
          
          {/* Text Input Field */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منشأة، فندق، مطعم، بنك، مستشفى، عقار، وظيفة..."
              className="w-full bg-[#181818] border border-[#282828] rounded-xl pr-10 pl-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#f5b800] transition-all font-medium"
            />
          </div>

          {/* Governorate Dropdown */}
          <div className="w-full md:w-52 relative group">
            <MapPin className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#f5b800] pointer-events-none" />
            
            <select
              value={selectedGov}
              onChange={(e) => {
                onGovChange(e.target.value);
                onCityChange('all');
              }}
              className="w-full appearance-none bg-[#181818] border border-[#282828] group-hover:border-zinc-700 rounded-xl pr-10 pl-8 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-100 font-medium focus:outline-none focus:border-[#f5b800] cursor-pointer transition-colors"
            >
              <option value="all" className="bg-[#111111] text-[#f5b800] font-bold py-2">
                كل المحافظات
              </option>
              {YEMEN_LOCATIONS.map((gov) => (
                <option key={gov.id} value={gov.id} className="bg-[#111111] text-zinc-100 py-2">
                  {gov.name}
                </option>
              ))}
            </select>

            <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-[#f5b800] pointer-events-none transition-colors" />
          </div>

          {/* City / District Dropdown */}
          <div className="w-full md:w-48 relative group">
            <Navigation className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />

            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              disabled={selectedGov === 'all'}
              className="w-full appearance-none bg-[#181818] border border-[#282828] group-hover:border-zinc-700 rounded-xl pr-9 pl-8 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-100 font-medium focus:outline-none focus:border-[#f5b800] disabled:opacity-40 disabled:bg-[#111111] disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <option value="all" className="bg-[#111111] text-zinc-300 py-2">
                {selectedGov === 'all' ? 'المدينة / المديرية' : 'كل المناطق'}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id} className="bg-[#111111] text-zinc-100 py-2">
                  {city.name}
                </option>
              ))}
            </select>

            <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-[#f5b800] pointer-events-none transition-colors" />
          </div>

          {/* Golden Yellow Search Action Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 sm:py-3 bg-[#f5b800] hover:bg-[#e5aa00] active:scale-95 text-zinc-950 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#f5b800]/20 flex-shrink-0"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>بحث</span>
          </button>
        </form>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-zinc-400 scrollbar-none">
          <span className="text-zinc-500 text-[11px] flex-shrink-0">الأكثر بحثاً:</span>
          {[
            { label: 'بنوك وصرافة', query: 'بنوك وصرافة' },
            { label: 'أسعار الصرف', query: 'أسعار الصرف' },
            { label: 'فنادق المكلا', query: 'فنادق المكلا' },
            { label: 'مطاعم عدن', query: 'مطاعم عدن' },
            { label: 'مستشفيات صنعاء', query: 'مستشفيات صنعاء' },
            { label: 'شقق للإيجار', query: 'عقارات' }
          ].map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                setQuery(tag.query);
                onSearch(tag.query, selectedGov, selectedCity);
              }}
              className="bg-[#181818] hover:bg-[#202020] hover:text-[#f5b800] border border-[#282828] px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
