import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, Sparkles, Navigation, Layers } from 'lucide-react';
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
    <section dir="rtl" className="w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 py-4 sm:py-5 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
        
        {/* Header Bar inside Search Area */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 bg-amber-400 rounded-sm"></span>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide">
              محرك البحث الوطني للخدمات والأنشطة في اليمن
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-lg border border-zinc-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>دليل موحد لكافة المحافظات والتصنيفات</span>
          </span>
        </div>

        {/* Search Form with Lucide Icons and Dark Theme Dropdowns */}
        <form onSubmit={handleFormSubmit} className="bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col md:flex-row items-stretch gap-2">
          
          {/* 1. Input Field */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منشأة، فندق، مطعم، بنك، مستشفى، عقار..."
              className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-xl pr-10 pl-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all font-medium"
            />
          </div>

          {/* 2. Clean Governorate Dropdown */}
          <div className="w-full md:w-52 relative group">
            <MapPin className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            
            <select
              value={selectedGov}
              onChange={(e) => {
                onGovChange(e.target.value);
                onCityChange('all');
              }}
              className="w-full appearance-none bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 rounded-xl pr-10 pl-8 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-100 font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 cursor-pointer transition-colors"
            >
              <option value="all" className="bg-zinc-950 text-amber-400 font-bold py-2">
                كل المحافظات
              </option>
              {YEMEN_LOCATIONS.map((gov) => (
                <option
                  key={gov.id}
                  value={gov.id}
                  className="bg-zinc-950 text-zinc-100 py-2"
                >
                  {gov.name}
                </option>
              ))}
            </select>

            <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-amber-400 pointer-events-none transition-colors" />
          </div>

          {/* 3. Clean City / District Dropdown */}
          <div className="w-full md:w-48 relative group">
            <Navigation className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />

            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              disabled={selectedGov === 'all'}
              className="w-full appearance-none bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 rounded-xl pr-9 pl-8 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-100 font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 disabled:opacity-40 disabled:bg-zinc-950/60 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <option value="all" className="bg-zinc-950 text-zinc-300 py-2">
                {selectedGov === 'all' ? 'المدينة / المديرية' : 'كل المناطق'}
              </option>
              {cities.map((city) => (
                <option
                  key={city.id}
                  value={city.id}
                  className="bg-zinc-950 text-zinc-100 py-2"
                >
                  {city.name}
                </option>
              ))}
            </select>

            <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-amber-400 pointer-events-none transition-colors" />
          </div>

          {/* 4. Action Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 sm:py-3 bg-amber-400 hover:bg-amber-300 active:scale-98 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>بحث</span>
          </button>
        </form>

        {/* Quick Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-zinc-400 scrollbar-none">
          <span className="text-zinc-500 text-[11px] flex-shrink-0">سريع:</span>
          {[
            { label: 'بنوك وصرافة', query: 'بنوك وصرافة' },
            { label: 'أسعار الصرف', query: 'أسعار الصرف' },
            { label: 'فنادق المكلا', query: 'فنادق المكلا' },
            { label: 'مطاعم عدن', query: 'مطاعم عدن' },
            { label: 'مستشفيات صنعاء', query: 'مستشفيات صنعاء' },
            { label: 'عقارات', query: 'عقارات' }
          ].map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                setQuery(tag.query);
                onSearch(tag.query, selectedGov, selectedCity);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 hover:text-amber-400 border border-zinc-800 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
