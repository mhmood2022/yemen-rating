import React, { useState, useEffect, useRef } from 'react';
import { YRBusiness } from '../types/database.types';
import { fetchBusinesses } from '../services/businessService';
import { useComparison } from '../context/ComparisonContext';
import { ComparisonModal } from '../components/business/ComparisonModal';

interface HomePageProps {
  onSelectBusiness: (business: YRBusiness) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectBusiness }) => {
  const [businesses, setBusinesses] = useState<YRBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { addToCompare, removeFromCompare, selectedBusinesses } = useComparison() || {
    addToCompare: () => {},
    removeFromCompare: () => {},
    selectedBusinesses: []
  };

  useEffect(() => {
    fetchBusinesses().then((data) => setBusinesses(data || []));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'الكل' || b.city === selectedCity;
    const matchesCategory = selectedCategory === 'الكل' || b.category_id === selectedCategory;

    return matchesSearch && matchesCity && matchesCategory;
  });

  const categories = [
    { id: 'الكل', name: 'جميع الأقسام', icon: 'fa-solid fa-border-all' },
    { id: 'companies', name: 'الشركات', icon: 'fa-solid fa-building' },
    { id: 'banks', name: 'البنوك', icon: 'fa-solid fa-building-columns' },
    { id: 'restaurants', name: 'المطاعم', icon: 'fa-solid fa-utensils' },
    { id: 'exchanges', name: 'الصرافة', icon: 'fa-solid fa-money-bill-transfer' },
    { id: 'hotels', name: 'الفنادق', icon: 'fa-solid fa-hotel' },
    { id: 'health', name: 'الصحة', icon: 'fa-solid fa-heart-pulse' }
  ];

  const cities = [
    'الكل', 'أمانة العاصمة (صنعاء)', 'صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب',
    'حضرموت (المكلا)', 'ذمار', 'حجة', 'عمران', 'صعدة', 'البيضاء', 'لحج', 'أبين',
    'شبوة', 'المهرة', 'سقطرى', 'مأرب', 'الجوف', 'الضالع', 'محويت', 'ريمة'
  ];

  const isCompared = (id: string) => selectedBusinesses?.some((item) => item.id === id);

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white p-4 md:p-8 dir-rtl">
      
      {/* Header Section */}
      <header className="max-w-6xl mx-auto mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full text-amber-400 font-bold text-xs">
          <i className="fa-solid fa-icons text-xs"></i>
          دليل يمن ريتينغ التفاعلي
        </div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-amber-400 flex items-center justify-center gap-3">
          <i className="fa-solid fa-store text-xl md:text-3xl"></i>
          دليل الأنشطة التجارية في اليمن
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          ابحث وقارن بين أفضل الشركات، المطاعم، والمؤسسات في كافة المحافظات اليمنية
        </p>
      </header>

      {/* Control Panel: Search & Filters */}
      <div className="max-w-6xl mx-auto mb-8 bg-[#14141C] border border-[#2A2A2A] p-4 md:p-6 rounded-2xl shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 text-base"></i>
            <input
              type="text"
              placeholder="ابحث باسم النشاط التجاري أو الخدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pr-11 pl-4 rounded-xl bg-[#0D0D12] border border-[#2A2A2A] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* City Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className={`w-full h-12 px-4 rounded-xl font-bold text-sm transition flex items-center justify-between border ${
                selectedCity !== 'الكل'
                  ? 'bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-400/20'
                  : 'bg-[#0D0D12] text-amber-400 border-[#2A2A2A] hover:border-amber-400'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <i className="fa-solid fa-location-dot text-sm"></i>
                {selectedCity === 'الكل' ? 'جميع المحافظات (22)' : selectedCity}
              </span>
              <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${isCityDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isCityDropdownOpen && (
              <div className="absolute top-full right-0 left-0 mt-2 z-50 max-h-60 overflow-y-auto rounded-xl bg-[#14141C] border border-amber-400/40 shadow-2xl p-1.5 space-y-1">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-right h-10 px-3 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-between ${
                      selectedCity === city
                        ? 'bg-amber-400 text-black font-black'
                        : 'text-amber-400 hover:bg-amber-400/10 hover:text-white'
                    }`}
                  >
                    <span>{city === 'الكل' ? '📍 جميع المحافظات (22)' : city}</span>
                    {selectedCity === city && <i className="fa-solid fa-check text-xs"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-10 px-4 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 border ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 border-amber-400 scale-[1.02]'
                  : 'bg-[#0D0D12] text-amber-400 border-[#2A2A2A] hover:border-amber-400/60 hover:bg-amber-400/10'
              }`}
            >
              <i className={`${cat.icon} text-xs`}></i>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((b) => (
          <div
            key={b.id}
            onClick={() => onSelectBusiness(b)}
            className="bg-[#14141C] border border-[#2A2A2A] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-400/80 transition-all duration-300 cursor-pointer group shadow-xl"
          >
            <div>
              <div className="h-48 md:h-52 overflow-hidden relative">
                <img
                  src={b.cover_url}
                  alt={b.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-400/30 font-bold">
                  {b.category_name}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base md:text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">{b.name}</h3>
                  <span className="flex items-center gap-1 text-xs bg-amber-400/10 text-amber-400 px-2 py-1 rounded-lg border border-amber-400/20 font-bold shrink-0">
                    <i className="fa-solid fa-star text-[10px]"></i>
                    {b.rating}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{b.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <i className="fa-solid fa-location-dot text-amber-400 text-sm"></i>
                  <span>{b.city}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => (isCompared(b.id) ? removeFromCompare(b.id) : addToCompare(b))}
                className={`flex-1 h-11 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
                  isCompared(b.id)
                    ? 'bg-amber-400/20 text-amber-400 border-amber-400'
                    : 'bg-[#0D0D12] text-gray-300 border-[#2A2A2A] hover:border-amber-400 hover:text-amber-400'
                }`}
              >
                <i className="fa-solid fa-code-compare text-xs"></i>
                {isCompared(b.id) ? 'تمت الإضافة' : 'مقارنة'}
              </button>
            </div>
          </div>
        ))}
      </main>

      <ComparisonModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} />
    </div>
  );
};
