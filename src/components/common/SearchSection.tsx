import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react';
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
    <section dir="rtl" className="w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 py-5 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* Title / Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 bg-amber-400 rounded-sm"></span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              محرك البحث الوطني للخدمات والأنشطة في اليمن
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
            <Sparkles className="w-3 h-3 text-amber-400" />
            أكثر من 26 تصنيفاً معتمداً
          </span>
        </div>

        {/* The Search Form */}
        <form onSubmit={handleFormSubmit} className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col md:flex-row items-stretch gap-2">
          
          {/* Text Input */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-5 h-5 absolute right-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منشأة، مستشفى، مطعم، عقار، وظيفة، صرافة..."
              className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl pr-11 pl-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Governorate Selector */}
          <div className="w-full md:w-48 relative">
            <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            <select
              value={selectedGov}
              onChange={(e) => {
                onGovChange(e.target.value);
                onCityChange('all');
              }}
              className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-xl pr-9 pl-4 py-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">كل المحافظات</option>
              {YEMEN_LOCATIONS.map((gov) => (
                <option key={gov.id} value={gov.id}>
                  {gov.name}
                </option>
              ))}
            </select>
          </div>

          {/* City / District Selector */}
          <div className="w-full md:w-44 relative">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              disabled={selectedGov === 'all'}
              className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="all">كل المديريات / المناطق</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Action Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>بحث</span>
          </button>
        </form>

        {/* Quick Search Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-zinc-400 scrollbar-none">
          <span className="text-zinc-500 text-[11px] flex-shrink-0">الأكثر بحثاً:</span>
          {['أسعار الصرف', 'مطاعم عائلية', 'شقق للإيجار', 'بنوك وصرافة', 'شاليهات المكلا', 'وظائف بصنعاء'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                onSearch(tag, selectedGov, selectedCity);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 hover:text-amber-400 border border-zinc-800 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
