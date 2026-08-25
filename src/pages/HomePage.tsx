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
  const [cityQuery, setCityQuery] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedQuoteBiz, setSelectedQuoteBiz] = useState<BusinessItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ratesMarket, setRatesMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState('USD');

  const categories = [
    { id: 'all', label: 'جميع الأنشطة (12)', icon: 'fa-layer-group' },
    { id: 'banks', label: 'بنوك ومصارف', icon: 'fa-building-columns' },
    { id: 'exchanges', label: 'شركات صرافة', icon: 'fa-money-bill-transfer' },
    { id: 'wallets', label: 'محافظ إلكترونية', icon: 'fa-wallet' },
    { id: 'restaurants', label: 'مطاعم ومقاهي', icon: 'fa-utensils' },
    { id: 'hotels', label: 'فنادق وسياحة', icon: 'fa-hotel' },
    { id: 'health', label: 'مستشفيات وصحة', icon: 'fa-hospital' },
    { id: 'shops', label: 'متاجر وتسوق', icon: 'fa-bag-shopping' },
    { id: 'transport', label: 'سيارات ونقل', icon: 'fa-car' },
  ];

  const cities = [
    { id: 'all', label: 'كل المدن 📍' },
    { id: 'صنعاء', label: 'صنعاء' },
    { id: 'عدن', label: 'عدن' },
    { id: 'تعز', label: 'تعز' },
    { id: 'حضرموت', label: 'المكلا / حضرموت' },
  ];

  const filteredBusinesses = mockBusinesses.filter(b => {
    const matchesCat = activeCategory === 'all' || b.category === activeCategory;
    const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase()) || b.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCity = cityQuery === 'all' || b.city.includes(cityQuery);
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
      showToast('✓ تم إضافة المنشأة لجدول المقارنة المباشرة');
    }
  };

  const comparedBusinesses = mockBusinesses.filter(b => comparedIds.includes(b.id));

  // حساب محول العملات اللحظي
  const currentRate = calcCurrency === 'USD' ? (ratesMarket === 'aden' ? 1540 : 535) : (ratesMarket === 'aden' ? 410 : 140.5);
  const totalConverted = (calcAmount * currentRate).toLocaleString();

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24" dir="rtl">
      
      {/* 1. هيدر الاستكشاف المزدوج Yelp-Style Search Header */}
      <div className="bg-[#0E0E14] border-b border-[#22222E] p-4 md:p-6 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-2.5">
            <div className="relative bg-[#101017] border border-[#22222E] rounded-xl flex items-center px-3.5 focus-within:border-amber-400 transition">
              <i className="fa-solid fa-magnifying-glass text-neutral-400 text-xs ml-2"></i>
              <input
                type="text"
                placeholder="ابحث عن بنك، صرافة، مطعم، فندق، مستشفى، خدمة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {cities.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCityQuery(c.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${cityQuery === c.id ? 'bg-[#FFB800] text-black font-black' : 'bg-[#101017] border border-[#22222E] text-neutral-400 hover:text-white'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => showToast(`تم تصفية (${filteredBusinesses.length}) منشأة معتمدة`)}
              className="bg-[#FFB800] hover:bg-[#E5A600] text-black font-black text-xs px-6 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition active:scale-95"
            >
              <span>استكشاف</span>
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
            </button>
          </div>

          {/* فلاتر التصنيفات الأفقية */}
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

      {/* 2. مساحة العرض الرئيسية المتجاوبة بكامل العرض */}
      <div className="max-w-6xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        
        {/* عمود كروت المنشآت والمنافسين */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-amber-400 text-sm"></i>
              <span>المنشآت والأنشطة المعتمدة في يمن ريتغ ({filteredBusinesses.length})</span>
            </h2>
            <span className="text-xs text-amber-400 font-bold">مرتبة حسب: الأفضل ومطابقة البحث</span>
          </div>

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
        </div>

        {/* الشريط الجانبي الذكي: المقارنة المباشرة + حاسبة الصرف */}
        <div className="space-y-5">
          
          {/* صندوق المقارنة المباشرة Side-by-Side */}
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-white font-black text-sm mb-2">
              <i className="fa-solid fa-scale-balanced text-amber-400"></i>
              <span>المقارنة المباشرة بين الأنشطة</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              قارن بين المنشآت المتنافسة في التقييمات، الأسعار، مؤشر `YR Score`، والموقع لاختيار الأنسب.
            </p>

            <div className="space-y-2 mb-3">
              {comparedBusinesses.length === 0 ? (
                <div className="p-3 bg-[#101015] border border-dashed border-[#22222E] rounded-xl text-center text-xs text-neutral-500">
                  انقر على زر "مقارنة" في أي منشأة لإضافتها هنا
                </div>
              ) : (
                comparedBusinesses.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-2 rounded-lg bg-[#101015] border border-[#22222E] text-xs">
                    <span className="font-bold text-white line-clamp-1">{b.name}</span>
                    <button onClick={() => handleToggleCompare(b.id)} className="text-rose-400 font-bold mr-2">✕</button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsCompareOpen(true)}
              disabled={comparedIds.length < 2}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-black text-xs transition disabled:opacity-40 shadow"
            >
              مقارنة المنشآت المحددة ({comparedIds.length})
            </button>
          </div>

          {/* حاسبة أسعار الصرف الحية (صنعاء / عدن) */}
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-[#22222E] pb-2">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <i className="fa-solid fa-calculator text-amber-400"></i>
                <span>حاسبة أسعار الصرف والذهب</span>
              </div>
              <div className="flex bg-[#101015] p-0.5 rounded-lg text-[10px]">
                <button onClick={() => setRatesMarket('sanaa')} className={`px-2 py-0.5 rounded font-bold ${ratesMarket === 'sanaa' ? 'bg-amber-400 text-black font-black' : 'text-neutral-400'}`}>صنعاء</button>
                <button onClick={() => setRatesMarket('aden')} className={`px-2 py-0.5 rounded font-bold ${ratesMarket === 'aden' ? 'bg-amber-400 text-black font-black' : 'text-neutral-400'}`}>عدن</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input type="number" value={calcAmount} onChange={e => setCalcAmount(parseFloat(e.target.value) || 0)} className="bg-[#101015] border border-[#22222E] rounded-xl px-2.5 py-1.5 text-white font-bold" />
              <select value={calcCurrency} onChange={e => setCurrency(e.target.value)} className="bg-[#101015] border border-[#22222E] rounded-xl px-2 py-1.5 text-white font-bold">
                <option value="USD">دولار (USD)</option>
                <option value="SAR">سعودي (SAR)</option>
              </select>
            </div>

            <div className="p-2.5 bg-black rounded-xl text-center border border-[#22222E]">
              <span style={{ fontSize: '11px' }} className="text-neutral-400 block mb-0.5">المبلغ المقابل:</span>
              <strong className="text-amber-400 font-black text-sm">{totalConverted} ريال يمني</strong>
            </div>
          </div>

        </div>

      </div>

      {/* النوافذ المنبثقة التفاعلية */}
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
        onSuccess={(author) => showToast(`✅ شكراً ${author}، تم إرسال طلب عرض السعر لإدارة المنشأة بنجاح!`)}
      />

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
