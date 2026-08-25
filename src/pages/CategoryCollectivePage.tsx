import React, { useState, useEffect } from 'react';
import { getBusinesses } from '../services/businessService';
import { BusinessItem } from '../types/database.types';
import { BusinessCard } from '../components/business/BusinessCard';
import { CategoryAdBanner } from '../components/ads/CategoryAdBanner';
import { ComparisonModal } from '../components/business/ComparisonModal';
import { QuoteModal } from '../components/business/QuoteModal';

interface Props {
  categorySlug: string;
  categoryTitle: string;
  categoryIcon: string;
  onNavigate: (path: string) => void;
}

export const CategoryCollectivePage: React.FC<Props> = ({
  categorySlug,
  categoryTitle,
  categoryIcon,
  onNavigate,
}) => {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getBusinesses({ category: categorySlug, limit: 50 }).then(d => { setBusinesses(d); setLoading(false); }); }, [categorySlug]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedQuoteBiz, setSelectedQuoteBiz] = useState<BusinessItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cities = [
    { id: 'all', label: 'جميع المحافظات' },
    { id: 'صنعاء', label: 'صنعاء' },
    { id: 'عدن', label: 'عدن' },
    { id: 'تعز', label: 'تعز' },
    { id: 'حضرموت', label: 'المكلا / حضرموت' },
  ];

  const filteredBusinesses = businesses.filter(b => {
    const matchesCategory = categorySlug === 'all' || b.category === categorySlug;
    const matchesCity = selectedCity === 'all' || b.city.includes(selectedCity);
    const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCity && matchesSearch;
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
      showToast('✓ تم إضافة المنشأة لجدول المقارنة المباشرة');
    }
  };

  const comparedBusinesses = businesses.filter(b => comparedIds.includes(b.id));

  return (
    <div className="min-h-screen bg-[#08080B] text-[#E6E6E6] font-sans pb-24" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        
        {/* ترويسة التصنيف والعودة */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center text-xl">
              <i className={`fa-solid ${categoryIcon}`}></i>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{categoryTitle}</h1>
              <p className="text-xs text-neutral-400 mt-0.5">الدليل المعتمد والتقييمات الحقيقية</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 rounded-xl bg-[#14141C] border border-[#22222E] hover:border-amber-400 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-house text-amber-400"></i>
            <span>الرئيسية</span>
          </button>
        </div>

        {/* البانر الإعلاني العلوي للتصنيف */}
        <CategoryAdBanner categoryTitle={categoryTitle} categorySlug={categorySlug} />

        {/* شريط البحث والفلترة */}
        <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4 space-y-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
            <input
              type="text"
              placeholder={`بحث داخل ${categoryTitle}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#101017] border border-[#22222E] rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCity === city.id
                    ? 'bg-[#FFB800] text-black font-black shadow-md'
                    : 'bg-[#101017] text-neutral-400 hover:text-white border border-[#22222E]'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* قائمة النتائج */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black text-white">
              المنشآت المعتمدة المسجلة ({filteredBusinesses.length})
            </h2>
            <span className="text-xs text-amber-400 font-bold">مرتبة حسب: الأفضل تقييماً</span>
          </div>

          {filteredBusinesses.length > 0 ? (
            <div className="space-y-4">
              {filteredBusinesses.map((biz, idx) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  rank={idx + 1}
                  onOpenProfile={(b) => onNavigate(`/businesses/${b.slug}`)}
                  onOpenQuote={(b) => setSelectedQuoteBiz(b)}
                  onToggleCompare={handleToggleCompare}
                  isCompared={comparedIds.includes(biz.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-500 bg-[#14141C] rounded-2xl border border-[#22222E]">
              <i className="fa-solid fa-folder-open text-3xl mb-2 text-neutral-600"></i>
              <p className="text-xs font-bold">لا توجد منشآت مطابقة لهذا التصنيف أو الفلتر حالياً</p>
            </div>
          )}
        </div>

      </div>

      {/* النوافذ المنبثقة */}
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
