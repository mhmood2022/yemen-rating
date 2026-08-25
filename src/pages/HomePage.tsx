import React, { useState, useEffect } from 'react';
import { getBusinesses, getCategories } from '../services/businessService';
import { BusinessItem } from '../types/database.types';
import { BusinessCard } from '../components/business/BusinessCard';
import { ComparisonModal } from '../components/business/ComparisonModal';
import { QuoteModal } from '../components/business/QuoteModal';

interface Props {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; icon: string }[]>([
    { id: 'all', label: 'جميع الأنشطة', icon: 'fa-layer-group' },
  ]);
  const [loading, setLoading] = useState(true);
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

  const cities = [
    { id: 'all', label: 'كل المدن', icon: 'fa-location-dot' },
    { id: 'صنعاء', label: 'صنعاء', icon: 'fa-city' },
    { id: 'عدن', label: 'عدن', icon: 'fa-city' },
    { id: 'تعز', label: 'تعز', icon: 'fa-city' },
    { id: 'حضرموت', label: 'المكلا / حضرموت', icon: 'fa-city' },
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getBusinesses({ limit: 50 }),
      getCategories(),
    ]).then(([biz, cats]) => {
      setBusinesses(biz);
      const total = cats.reduce((s, x) => s + x.count, 0);
      setCategories([
        { id: 'all', label: `جميع الأنشطة (${total})`, icon: 'fa-layer-group' },
        ...cats.map(x => ({ id: x.slug, label: x.name, icon: x.icon })),
      ]);
      setLoading(false);
    });
  }, []);

  const filteredBusinesses = businesses.filter(b => {
    const matchesCat = activeCategory === 'all' || b.category === activeCategory;
    const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || (b.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityQuery === 'all' || b.city.includes(cityQuery);
    return matchesCat && matchesSearch && matchesCity;
  });

  const comparedBusinesses = businesses.filter(b => comparedIds.includes(b.id));

  const toggleCompare = (id: string) => {
    setComparedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#FFC107] mb-4"></i>
          <p className="text-neutral-400 text-sm">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E6E6E6] font-sans pb-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 pt-4">

        {/* شريط البحث */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="ابحث عن بنك، صرافة، مطعم، فندق..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-[#FFC107] outline-none"
          />
          <select
            value={cityQuery}
            onChange={e => setCityQuery(e.target.value)}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-3 text-sm text-white focus:border-[#FFC107] outline-none"
          >
            {cities.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {/* التصنيفات */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#FFC107] text-black'
                  : 'bg-[#1A1A1A] border border-[#2A2A2A] text-neutral-300 hover:border-[#FFC107]'
              }`}
            >
              <i className={`fa-solid ${cat.icon}`}></i>
              {cat.label}
            </button>
          ))}
        </div>

        {/* عنوان النتائج */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-black text-white">
            المنشآت والأنشطة المعتمدة في يمن ريتغ ({filteredBusinesses.length})
          </h2>
          <span className="text-xs text-neutral-500">مرتبة حسب: الأفضل ومطابقة البحث</span>
        </div>

        {/* قائمة الأنشطة */}
        <div className="space-y-3 mb-6">
          {filteredBusinesses.map((biz, idx) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              rank={idx + 1}
              isCompared={comparedIds.includes(biz.id)}
              onToggleCompare={() => toggleCompare(biz.id)}
              onOpenQuote={(b) => setSelectedQuoteBiz(b)}
              onOpenProfile={(b) => onNavigate('/businesses/' + b.slug)}
            />
          ))}
          {filteredBusinesses.length === 0 && (
            <div className="text-center py-10 text-neutral-500 text-sm">
              لا توجد نتائج مطابقة لبحثك
            </div>
          )}
        </div>

        {/* زر المقارنة العائم */}
        {comparedIds.length > 0 && (
          <div className="fixed bottom-20 left-4 right-4 max-w-4xl mx-auto z-40">
            <button
              onClick={() => setIsCompareOpen(true)}
              className="w-full bg-[#FFC107] text-black font-black py-3 rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 text-sm"
            >
              <i className="fa-solid fa-scale-balanced"></i>
              مقارنة المنشآت المحددة ({comparedIds.length})
            </button>
          </div>
        )}

        {/* حاسبة الأسعار */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-white">حاسبة أسعار الصرف والذهب</span>
            <div className="flex bg-[#121217] p-0.5 rounded-lg border border-[#2A2A2A] text-[10px]">
              <button onClick={() => setRatesMarket('sanaa')} className={`px-2.5 py-1 rounded-md font-bold transition ${ratesMarket === 'sanaa' ? 'bg-[#FFC107] text-black' : 'text-neutral-400'}`}>صنعاء</button>
              <button onClick={() => setRatesMarket('aden')} className={`px-2.5 py-1 rounded-md font-bold transition ${ratesMarket === 'aden' ? 'bg-[#FFC107] text-black' : 'text-neutral-400'}`}>عدن</button>
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-neutral-400 mb-1 block">المبلغ</label>
              <input type="number" value={calcAmount} onChange={e => setCalcAmount(Number(e.target.value))} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFC107]" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-neutral-400 mb-1 block">العملة</label>
              <select value={calcCurrency} onChange={e => setCalcCurrency(e.target.value)} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFC107]">
                <option value="USD">دولار (USD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[10px] text-neutral-400">المبلغ المقابل:</span>
            <div className="text-lg font-black text-[#FFC107]">
              {calcCurrency === 'USD'
                ? (calcAmount * (ratesMarket === 'sanaa' ? 535 : 1540)).toLocaleString()
                : (calcAmount * (ratesMarket === 'sanaa' ? 140.5 : 410)).toLocaleString()
              } ريال يمني
            </div>
          </div>
        </div>

      </div>

      {/* المودالات */}
      <ComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        businesses={comparedBusinesses}
        onRemove={(id) => toggleCompare(id)}
      />
      <QuoteModal
        isOpen={!!selectedQuoteBiz}
        onClose={() => setSelectedQuoteBiz(null)}
        business={selectedQuoteBiz}
        onSuccess={(name) => { showToast('✅ تم إرسال طلب عرض السعر بنجاح'); setSelectedQuoteBiz(null); }}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#FFC107] text-black px-6 py-2 rounded-full text-sm font-bold z-50 shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
