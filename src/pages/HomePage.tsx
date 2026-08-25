import React, { useState } from 'react';
import { mockBusinesses } from '../services/businessService';
import { BusinessItem } from '../types/database.types';
import { BusinessCard } from '../components/business/BusinessCard';
import { ComparisonModal } from '../components/business/ComparisonModal';
import { QuoteModal } from '../components/business/QuoteModal';

interface Props {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('صنعاء');
  const [activeCategory, setActiveCategory] = useState('all');
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedQuoteBiz, setSelectedQuoteBiz] = useState<BusinessItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'جميع الأنشطة', icon: 'fa-layer-group' },
    { id: 'restaurants', label: 'مطاعم ومقاهي', icon: 'fa-utensils' },
    { id: 'banks', label: 'بنوك ومصارف', icon: 'fa-building-columns' },
    { id: 'hotels', label: 'فنادق وسياحة', icon: 'fa-hotel' },
    { id: 'shops', label: 'متاجر وتسوق', icon: 'fa-bag-shopping' },
    { id: 'services', label: 'خدمات عامة', icon: 'fa-wrench' }
  ];

  const filteredBusinesses = mockBusinesses.filter(b => {
    const matchesCat = activeCategory === 'all' || b.category === activeCategory;
    const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCity = !cityQuery || b.city.includes(cityQuery) || cityQuery === 'all';
    return matchesCat && matchesSearch && matchesCity;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleCompare = (id: string) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter(x => x !== id));
    } else {
      if (comparedIds.length >= 3) {
        showToast('⚠️ الحد الأقصى للمقارنة هو 3 منشآت معاً');
        return;
      }
      setComparedIds([...comparedIds, id]);
      showToast('✓ تم إضافة المنشأة لجدول المقارنة');
    }
  };

  const comparedBusinesses = mockBusinesses.filter(b => comparedIds.includes(b.id));

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24" dir="rtl">
      
      {/* 1. الهيدر المزدوج من طراز Yelp */}
      <div className="bg-[#0E0E14] border-b border-[#22222E] p-4 md:p-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-2.5">
            <div className="relative bg-[#101017] border border-[#22222E] rounded-xl flex items-center px-3.5">
              <i className="fa-solid fa-magnifying-glass text-neutral-400 text-xs ml-2"></i>
              <input
                type="text"
                placeholder="ابحث عن مطعم، بنك، فندق، صيانة سيارات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <div className="relative bg-[#101017] border border-[#22222E] rounded-xl flex items-center px-3.5">
              <i className="fa-solid fa-location-dot text-amber-400 text-xs ml-2"></i>
              <input
                type="text"
                placeholder="المحافظة (صنعاء، عدن، تعز...)"
                value={cityQuery}
                onChange={e => setCityQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => showToast(`تم العثور على (${filteredBusinesses.length}) منشآت`)}
              className="bg-[#FFB800] hover:bg-[#E5A600] text-black font-black text-xs px-6 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition active:scale-95"
            >
              <span>استكشاف</span>
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeCategory === c.id
                    ? 'bg-amber-400 text-black font-black shadow'
                    : 'bg-[#14141C] text-neutral-400 hover:text-white border border-[#22222E]'
                }`}
              >
                <i className={`fa-solid ${c.icon} text-xs`}></i>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. مساحة العرض الرئيسية */}
      <div className="max-w-6xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        
        {/* قائمة بطاقات المنافسين */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-black text-white">
              أبرز المنشآت والأنشطة المنافسة المعتمدة ({filteredBusinesses.length})
            </h2>
            <span className="text-xs text-amber-400 font-bold">ترتيب حسب: الأفضل تقييماً</span>
          </div>

          <div className="space-y-4">
            {filteredBusinesses.map((biz, idx) => (
              <BusinessCard
                key={biz.id}
                business={biz}
                rank={idx + 1}
                onOpenProfile={(b) => showToast(`فتح بروفايل: ${b.name}`)}
                onOpenQuote={(b) => setSelectedQuoteBiz(b)}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedIds.includes(biz.id)}
              />
            ))}
          </div>
        </div>

        {/* الشريط الجانبي للمقارنة وويدجت الأسعار */}
        <div className="space-y-5">
          {/* صندوق المقارنة السريعة */}
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white font-black text-sm mb-2">
              <i className="fa-solid fa-scale-balanced text-amber-400"></i>
              <span>المقارنة المباشرة بين المنافسين</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              قارن بين المنشآت في الخدمات، الأسعار، تقييم `YR Score`، والموقع لاختيار الأنسب.
            </p>

            <div className="space-y-2 mb-3">
              {comparedBusinesses.length === 0 ? (
                <div className="p-3 bg-[#101015] border border-dashed border-[#22222E] rounded-xl text-center text-xs text-neutral-500">
                  انقر على زر "مقارنة" في أي منشأة لإضافتها هنا
                </div>
              ) : (
                comparedBusinesses.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-2 rounded-lg bg-[#101015] border border-[#22222E] text-xs">
                    <span className="font-bold text-white">{b.name}</span>
                    <button onClick={() => handleToggleCompare(b.id)} className="text-rose-400 font-bold">✕</button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsCompareOpen(true)}
              disabled={comparedIds.length < 2}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-black text-xs transition disabled:opacity-40"
            >
              مقارنة المنشآت المحددة ({comparedIds.length})
            </button>
          </div>

          {/* ويدجت أسعار الصرف الحية */}
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <i className="fa-solid fa-coins text-amber-400"></i>
                <span>أسعار الصرف (صنعاء / عدن)</span>
              </div>
              <button onClick={() => onNavigate('/prices')} className="text-[10px] text-amber-400 font-bold hover:underline">المحول</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-[#101015]">
                <span className="text-neutral-400">دولار أمريكي (عدن)</span>
                <span className="font-black text-amber-400">1,540 / 1,530</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#101015]">
                <span className="text-neutral-400">ريال سعودي (عدن)</span>
                <span className="font-black text-amber-400">410 / 408</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* النوافذ التفاعلية */}
      <ComparisonModal
        businesses={comparedBusinesses}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRemove={handleToggleCompare}
      />

      <QuoteModal
        business={selectedQuoteBiz}
        isOpen={!!selectedQuoteBiz}
        onClose={() => setSelectedQuoteBiz(null)}
        onSuccess={(author) => showToast(`✅ شكراً ${author}، تم إرسال طلب السعر لإدارة المنشأة بنجاح!`)}
      />

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
