import React, { useState, useEffect } from 'react';
import { YRBusiness } from '../types/database.types';
import { fetchBusinesses } from '../services/businessService';
import { useComparison } from '../context/ComparisonContext';
import { AddBusinessModal } from '../components/business/AddBusinessModal';
import { QuoteModal } from '../components/business/QuoteModal';
import { SendMessageModal } from '../components/business/SendMessageModal';
import { ComparisonModal } from '../components/business/ComparisonModal';

interface HomePageProps {
  onNavigate?: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [businesses, setBusinesses] = useState<YRBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeQuoteBusiness, setActiveQuoteBusiness] = useState<YRBusiness | null>(null);
  const [activeMsgBusiness, setActiveMsgBusiness] = useState<YRBusiness | null>(null);

  const { addToCompare, selectedBusinesses = [], setIsCompareOpen, isCompareOpen } = useComparison() || {};

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await fetchBusinesses();
      setBusinesses(data || []);
    } catch (err: any) {
      console.error('Error loading businesses:', err);
      setErrorMsg(err?.message || 'تعذر الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { title: 'المطاعم والكافيهات', icon: 'fa-utensils', path: '/restaurants' },
    { title: 'الفنادق والإقامة', icon: 'fa-hotel', path: '/hotels' },
    { title: 'البنوك والمصارف', icon: 'fa-building-columns', path: '/banks' },
    { title: 'الصرافة والتحويلات', icon: 'fa-money-bill-transfer', path: '/exchanges' },
    { title: 'الشركات والمؤسسات', icon: 'fa-building', path: '/companies' },
    { title: 'الخدمات العامة', icon: 'fa-wrench', path: '/services' },
    { title: 'الصحة والمستشفيات', icon: 'fa-hospital', path: '/health' },
    { title: 'السيارات والنقل', icon: 'fa-car', path: '/transport' },
  ];

  const filtered = (businesses || []).filter((b) => {
    const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((b.services || [])).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = !selectedCity || b.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen text-white font-sans dir-rtl pb-24" style={{ backgroundColor: '#0D0D0D' }}>
      
      {/* Navigation Bar */}
      <header className="border-b sticky top-0 z-40 backdrop-blur-md bg-opacity-90 px-4 sm:px-8 py-3" style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate?.('/')}>
            <div className="w-10 h-10 rounded-xl font-black text-black flex items-center justify-center text-lg shadow-md" style={{ backgroundColor: '#FFC107' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-white leading-none">يمن ريتنج</h1>
              <span className="text-[11px]" style={{ color: '#A1A1AA' }}>الدليل الوطني للخدمات والتقييمات</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-black flex items-center gap-2 transition hover:opacity-90 shadow-lg"
              style={{ backgroundColor: '#FFC107' }}
            >
              <i className="fa-solid fa-circle-plus text-base"></i>
              <span className="hidden sm:inline">إضافة نشاط تجاري</span>
            </button>

            <button
              onClick={() => onNavigate?.('/owner')}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border flex items-center gap-2 transition hover:bg-gray-800"
              style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A', color: '#FFFFFF' }}
            >
              <i className="fa-solid fa-user-gear text-amber-400"></i>
              <span className="hidden md:inline">لوحة المالك</span>
            </button>

            {selectedBusinesses.length > 0 && (
              <button
                onClick={() => setIsCompareOpen?.(true)}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border flex items-center gap-2 transition"
                style={{ backgroundColor: '#14141C', borderColor: '#FFC107', color: '#FFC107' }}
              >
                <i className="fa-solid fa-code-compare"></i>
                <span>المقارنة ({selectedBusinesses.length})</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section & Global Search */}
      <section className="px-4 sm:px-8 py-12 border-b" style={{ borderColor: '#2A2A2A', background: 'linear-gradient(180deg, #14141C 0%, #0D0D0D 100%)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold" style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A', color: '#FFC107' }}>
            <i className="fa-solid fa-shield-halved"></i>
            <span>منصة التقييمات والأداء التجاري في اليمن</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black leading-tight text-white">
            اكتشف أفضل الخيارات والخدمات <br />
            <span style={{ color: '#FFC107' }}>بتقييمات موثوقة ومباشرة</span>
          </h2>

          {/* Search Bar Component */}
          <div className="p-2 rounded-2xl border flex flex-col sm:flex-row items-center gap-2 shadow-2xl" style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A' }}>
            <div className="relative flex-1 w-full">
              <i className="fa-solid fa-magnifying-glass absolute right-4 top-3.5 text-base" style={{ color: '#A1A1AA' }}></i>
              <input
                type="text"
                placeholder="ابحث عن شركة، مطعم، بنك، أو خدمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white pr-11 pl-4 py-3 text-sm focus:outline-none"
              />
            </div>

            <div className="w-full sm:w-48 border-t sm:border-t-0 sm:border-r" style={{ borderColor: '#2A2A2A' }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-white px-4 py-3 text-sm focus:outline-none cursor-pointer"
              >
                <option value="" style={{ backgroundColor: '#14141C' }}>جميع المدن</option>
                <option value="صنعاء" style={{ backgroundColor: '#14141C' }}>صنعاء</option>
                <option value="عدن" style={{ backgroundColor: '#14141C' }}>عدن</option>
                <option value="تعز" style={{ backgroundColor: '#14141C' }}>تعز</option>
                <option value="المكلا" style={{ backgroundColor: '#14141C' }}>المكلا</option>
                <option value="إب" style={{ backgroundColor: '#14141C' }}>إب</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 space-y-12">

        {/* Categories Bar */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-base" style={{ color: '#FFC107' }}></i>
              <span>التصنيفات الرئيسية</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate?.(cat.path)}
                className="p-4 rounded-2xl border text-center transition hover:scale-105 flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A' }}
              >
                <i className={`fa-solid ${cat.icon} text-xl`} style={{ color: '#FFC107' }}></i>
                <span className="text-xs font-bold text-white">{cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Businesses Directory */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-store text-base" style={{ color: '#FFC107' }}></i>
              <span>الأنشطة والمنشآت المتاحة</span>
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A', color: '#FFC107' }}>
              {filtered.length} نشاط
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: '#A1A1AA' }}>
              <i className="fa-solid fa-spinner fa-spin text-3xl mb-3" style={{ color: '#FFC107' }}></i>
              <p className="text-sm">جاري تحميل الأنشطة...</p>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-16 rounded-2xl border border-red-500/30 bg-red-500/10">
              <i className="fa-solid fa-triangle-exclamation text-4xl mb-3 text-red-400"></i>
              <p className="text-red-300 font-bold mb-2">عذراً، حدث خطأ في جلب البيانات.</p>
              <p className="text-xs text-gray-400 mb-4">{errorMsg}</p>
              <button
                onClick={loadData}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-black inline-flex items-center gap-2"
                style={{ backgroundColor: '#FFC107' }}
              >
                <i className="fa-solid fa-rotate-right"></i>
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border" style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A' }}>
              <i className="fa-solid fa-folder-open text-4xl mb-3" style={{ color: '#A1A1AA' }}></i>
              <p className="text-gray-300 font-bold mb-4">لم يتم العثور على أنشطة تجارية مطابقة.</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-black inline-flex items-center gap-2"
                style={{ backgroundColor: '#FFC107' }}
              >
                <i className="fa-solid fa-plus"></i>
                <span>إضافة نشاط تجاري جديد</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const isComparing = (selectedBusinesses || []).some((b) => b.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border overflow-hidden flex flex-col justify-between transition hover:border-gray-600"
                    style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A' }}
                  >
                    <div>
                      <div className="relative h-44 bg-gray-800">
                        <img
                          src={item.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md" style={{ backgroundColor: 'rgba(13, 13, 13, 0.8)', borderColor: '#2A2A2A', color: '#FFC107' }}>
                          {item.category_name || 'نشاط تجاري'}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-lg text-white hover:text-amber-400 transition cursor-pointer" onClick={() => onNavigate?.(`/business/${item.slug || item.id}`)}>
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold" style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A', color: '#FFC107' }}>
                            <i className="fa-solid fa-star"></i>
                            <span>{item.rating || '5.0'}</span>
                          </div>
                        </div>

                        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#A1A1AA' }}>
                          <i className="fa-solid fa-location-dot" style={{ color: '#FFC107' }}></i>
                          <span>{item.city || 'صنعاء'}</span>
                        </p>

                        <p className="text-xs mt-3 line-clamp-2 leading-relaxed" style={{ color: '#A1A1AA' }}>
                          {item.description || 'تقديم خدمات متميزة ومتكاملة للعملاء بأسعار ومواصفات منافسة.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t mt-4" style={{ borderColor: '#2A2A2A' }}>
                      <div className="grid grid-cols-2 gap-2 my-3">
                        <button
                          onClick={() => setActiveQuoteBusiness(item)}
                          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition"
                          style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', borderColor: 'rgba(255, 193, 7, 0.3)', color: '#FFC107' }}
                        >
                          <i className="fa-solid fa-file-signature"></i>
                          <span>طلب عرض سعر</span>
                        </button>

                        <button
                          onClick={() => setActiveMsgBusiness(item)}
                          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition text-white"
                          style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
                        >
                          <i className="fa-solid fa-paper-plane" style={{ color: '#FFC107' }}></i>
                          <span>مراسلة</span>
                        </button>
                      </div>

                      <button
                        onClick={() => addToCompare?.(item)}
                        disabled={isComparing}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition"
                        style={{
                          backgroundColor: '#0D0D0D',
                          borderColor: isComparing ? '#10B981' : '#2A2A2A',
                          color: isComparing ? '#10B981' : '#A1A1AA'
                        }}
                      >
                        <i className={`fa-solid ${isComparing ? 'fa-circle-check' : 'fa-code-compare'}`}></i>
                        <span>{isComparing ? 'مضاف للمقارنة' : 'مقارنة المنشأة'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals Container */}
      <AddBusinessModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadData}
      />

      {activeQuoteBusiness && (
        <QuoteModal
          business={activeQuoteBusiness}
          isOpen={!!activeQuoteBusiness}
          onClose={() => setActiveQuoteBusiness(null)}
        />
      )}

      {activeMsgBusiness && (
        <SendMessageModal
          business={activeMsgBusiness}
          isOpen={!!activeMsgBusiness}
          onClose={() => setActiveMsgBusiness(null)}
        />
      )}

      <ComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen?.(false)}
      />
    </div>
  );
};
