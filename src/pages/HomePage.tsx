import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Star, Building2, Store, Utensils, Hotel, 
  HeartPulse, Landmark, Layers, ChevronDown, Check, Phone, MessageSquare
} from 'lucide-react';
import { YRBusiness } from '../types/database.types';
import { fetchBusinesses } from '../services/businessService';

interface HomePageProps {
  onSelectBusiness?: (business: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectBusiness }) => {
  const [businesses, setBusinesses] = useState<YRBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBusinesses().then((data) => {
      setBusinesses(data || []);
      setLoading(false);
    });
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

  // فلترة ذكية آمنة 100% ضد القيم الفارغة (No Null Crash)
  const filteredBusinesses = businesses.filter((b) => {
    const name = (b.name || '').toLowerCase();
    const desc = (b.description || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = name.includes(query) || desc.includes(query);
    const matchesCity = selectedCity === 'الكل' || (b.city || '').includes(selectedCity) || selectedCity.includes(b.city || '');
    const matchesCategory = selectedCategory === 'الكل' || b.category_id === selectedCategory || (b.category_name || '').includes(selectedCategory);

    return matchesSearch && matchesCity && matchesCategory;
  });

  const categories = [
    { id: 'الكل', name: 'جميع الأقسام' },
    { id: 'companies', name: 'الشركات' },
    { id: 'banks', name: 'البنوك' },
    { id: 'restaurants', name: 'المطاعم' },
    { id: 'hotels', name: 'الفنادق' },
    { id: 'health', name: 'الصحة' },
    { id: 'transport', name: 'النقل' }
  ];

  const cities = [
    'الكل', 'صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب',
    'المكلا', 'ذمار', 'مأرب', 'حجة', 'عمران', 'صعدة'
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B1224] text-white p-4 md:p-6 font-['Cairo',sans-serif]">

      {/* الرأس والبحث */}
      <div className="max-w-4xl mx-auto mb-6 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl md:text-2xl font-black text-[#FFC500] flex items-center justify-center gap-2">
            <Store size={24} /> دليل المنشآت والأنشطة المعتمدة
          </h1>
          <p className="text-xs text-zinc-400">
            تصفح واستعرض كافة المنشآت والخدمات المسجلة في يمن ريتنغ ({businesses.length} منشأة مسجلة)
          </p>
        </div>

        {/* لوحة التحكم: البحث والفلترة */}
        <div className="bg-[#0A0E1A] border border-[#18233C] p-3.5 rounded-2xl shadow-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* حقل البحث */}
            <div className="md:col-span-2 relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
              <input
                type="text"
                placeholder="ابحث باسم المنشأة أو الخدمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pr-10 pl-3 rounded-xl bg-[#101726] border border-[#1C2844] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#FFC500] transition"
              />
            </div>

            {/* قائمة المدن */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="w-full h-11 px-3 rounded-xl bg-[#101726] border border-[#1C2844] text-xs font-bold flex items-center justify-between text-zinc-200"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin size={14} className="text-[#FFC500]" />
                  {selectedCity === 'الكل' ? 'كافة المحافظات' : selectedCity}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute top-full right-0 left-0 mt-1.5 z-50 max-h-52 overflow-y-auto rounded-xl bg-[#0A0E1A] border border-[#18233C] shadow-2xl p-1 space-y-0.5">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-right h-9 px-3 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                        selectedCity === city
                          ? 'bg-[#FFC500] text-black'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{city === 'الكل' ? 'كافة المحافظات' : city}</span>
                      {selectedCity === city && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* أزرار التصنيفات */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-[#FFC500] text-black border-[#FFC500]'
                    : 'bg-[#101726] text-zinc-300 border-[#1C2844] hover:border-[#FFC500]/50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* عرض المنشآت الحقيقية */}
      <main className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-xs text-zinc-400">جاري تحميل المنشآت الحقيقية...</div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBusinesses.map((b: any) => (
              <div
                key={b.id}
                onClick={() => onSelectBusiness && onSelectBusiness(b)}
                className="rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/60 transition-all overflow-hidden flex flex-col justify-between shadow-lg cursor-pointer group"
              >
                {b.cover_url || b.logo_url ? (
                  <div className="relative h-32 w-full overflow-hidden bg-[#101726]">
                    <img
                      src={b.cover_url || b.logo_url}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm text-[9px] font-bold text-[#FFC500] border border-[#FFC500]/30">
                      {b.category_name || 'منشأة معتمدة'}
                    </span>
                  </div>
                ) : (
                  <div className="h-32 w-full bg-[#101726] flex items-center justify-center text-[#FFC500] border-b border-white/5">
                    <Building2 size={36} />
                  </div>
                )}

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-white group-hover:text-[#FFC500] transition-colors truncate">
                      {b.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1">
                      <MapPin size={11} className="text-[#FFC500]" />
                      <span>{b.city || 'اليمن'}</span>
                    </div>
                    {b.description && (
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {b.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[#FFC500]">
                      <Star size={11} className="fill-[#FFC500]" />
                      <span className="text-[10px] font-mono font-bold">{Number(b.rating || 5).toFixed(1)}</span>
                    </div>

                    <button className="px-3 py-1 rounded-lg bg-[#FFC500] hover:bg-[#E5B200] text-black font-bold text-[10px] transition cursor-pointer">
                      التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#0A0E1A] border border-[#18233C] text-center text-xs text-zinc-400">
            لا توجد منشآت مطابقة لبحثك حالياً.
          </div>
        )}
      </main>

    </div>
  );
};
