import React, { useState, useEffect } from 'react';
import { YRBusiness } from '../types/database.types';
import { fetchBusinesses } from '../services/businessService';
import { useComparison } from '../context/ComparisonContext';
import { ComparisonModal } from '../components/business/ComparisonModal';

export const HomePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<YRBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { addToCompare, removeFromCompare, selectedBusinesses } = useComparison() || {
    addToCompare: () => {},
    removeFromCompare: () => {},
    selectedBusinesses: []
  };

  useEffect(() => {
    fetchBusinesses().then((data) => setBusinesses(data || []));
  }, []);

  // Filter Logic
  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'الكل' || b.city === selectedCity;
    const matchesCategory = selectedCategory === 'الكل' || b.category_id === selectedCategory;

    return matchesSearch && matchesCity && matchesCategory;
  });

  const categories = [
    { id: 'الكل', name: 'الكل' },
    { id: 'companies', name: 'الشركات' },
    { id: 'banks', name: 'البنوك' },
    { id: 'restaurants', name: 'المطاعم' },
    { id: 'exchanges', name: 'الصرافة' },
    { id: 'hotels', name: 'الفنادق' },
    { id: 'health', name: 'الصحة' }
  ];

  // جميع المحافظات اليمنية الـ 22
  const cities = [
    'الكل',
    'أمانة العاصمة (صنعاء)',
    'صنعاء',
    'عدن',
    'تعز',
    'الحديدة',
    'إب',
    'حضرموت (المكلا)',
    'ذمار',
    'حجة',
    'عمران',
    'صعدة',
    'البيضاء',
    'لحج',
    'أبين',
    'شبوة',
    'المهرة',
    'سقطرى',
    'مأرب',
    'الجوف',
    'الضالع',
    'محويت',
    'ريمة'
  ];

  const isCompared = (id: string) => selectedBusinesses?.some((item) => item.id === id);

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white p-4 md:p-8 dir-rtl">
      
      {/* Header & Title */}
      <header className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-3 text-amber-400">
          دليل الأنشطة التجارية في اليمن
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          ابحث وقارن بين أفضل الشركات، المطاعم، والمؤسسات في كافة المحافظات اليمنية
        </p>
      </header>

      {/* Controls Section: Search & Filters */}
      <div className="max-w-6xl mx-auto mb-8 bg-[#14141C] border border-[#2A2A2A] p-4 md:p-6 rounded-2xl shadow-xl space-y-4">
        
        {/* Search & City Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <i className="fa-solid fa-magnifying-glass absolute right-4 top-3.5 text-gray-500"></i>
            <input
              type="text"
              placeholder="ابحث باسم النشاط التجاري أو الخدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-11 pl-4 py-3 rounded-xl bg-[#0D0D12] border border-[#2A2A2A] text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0D0D12] border border-[#2A2A2A] text-white focus:outline-none focus:border-amber-400 transition cursor-pointer"
            >
              <option value="الكل">جميع المحافظات (22)</option>
              {cities.filter(c => c !== 'الكل').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-[#0D0D12] text-gray-400 border border-[#2A2A2A] hover:border-amber-400/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Compare Floating Trigger */}
      {selectedBusinesses?.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-2 bg-amber-400 text-black px-5 py-3 rounded-2xl font-bold shadow-2xl hover:bg-amber-300 transition"
          >
            <i className="fa-solid fa-code-compare"></i>
            عرض المقارنة ({selectedBusinesses.length})
          </button>
        </div>
      )}

      {/* Businesses Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500">
            <i className="fa-solid fa-building-circle-exclamation text-4xl mb-3 text-amber-400"></i>
            <p className="font-bold text-lg">لم يتم العثور على أنشطة مطابقة للبحث في هذه المحافظة</p>
            <p className="text-xs text-gray-600 mt-1">جرب اختيار محافظة أخرى أو تعديل كلمة البحث.</p>
          </div>
        ) : (
          filteredBusinesses.map((b) => (
            <div
              key={b.id}
              className="bg-[#14141C] border border-[#2A2A2A] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition group"
            >
              <div>
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={b.cover_url}
                    alt={b.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-400/30 font-bold">
                    {b.category_name}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-white">{b.name}</h3>
                    <span className="flex items-center gap-1 text-xs bg-amber-400/10 text-amber-400 px-2 py-1 rounded-lg border border-amber-400/20 font-bold">
                      <i className="fa-solid fa-star text-[10px]"></i>
                      {b.rating}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="fa-solid fa-location-dot text-amber-400"></i>
                    <span>{b.city}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => (isCompared(b.id) ? removeFromCompare(b.id) : addToCompare(b))}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border ${
                    isCompared(b.id)
                      ? 'bg-amber-400/20 text-amber-400 border-amber-400'
                      : 'bg-[#0D0D12] text-gray-300 border-[#2A2A2A] hover:border-amber-400'
                  }`}
                >
                  <i className="fa-solid fa-code-compare"></i>
                  {isCompared(b.id) ? 'تمت الإضافة' : 'مقارنة'}
                </button>

                {b.whatsapp && (
                  <a
                    href={`https://wa.me/${b.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:opacity-90 transition flex items-center gap-1"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />
    </div>
  );
};
