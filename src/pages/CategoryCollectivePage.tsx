import React, { useState, useEffect } from 'react';
import { useComparison } from '../context/ComparisonContext';
import { YRBusiness } from '../types/database.types';
import { QuoteModal } from '../components/business/QuoteModal';
import { SendMessageModal } from '../components/business/SendMessageModal';
import { ComparisonModal } from '../components/business/ComparisonModal';
import { fetchBusinesses } from '../services/businessService';

export const CategoryCollectivePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<YRBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Modals state
  const [activeQuoteBusiness, setActiveQuoteBusiness] = useState<YRBusiness | null>(null);
  const [activeMsgBusiness, setActiveMsgBusiness] = useState<YRBusiness | null>(null);

  const { addToCompare, selectedBusinesses, setIsCompareOpen, isCompareOpen } = useComparison();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchBusinesses();
    setBusinesses(data || []);
    setLoading(false);
  };

  const filtered = businesses.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.services && b.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCity = !selectedCity || b.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans dir-rtl pb-20">
      {/* Search Header */}
      <div className="border-b border-gray-800 bg-gray-900/90 sticky top-0 z-30 backdrop-blur-md py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h1 className="text-2xl font-black text-yellow-400 tracking-tight">استكشاف الأنشطة المحلية</h1>
            <span className="bg-gray-800 text-yellow-400 text-xs px-2.5 py-1 rounded-full border border-yellow-400/20">
              {filtered.length} نشاط متاح
            </span>
          </div>

          <div className="flex flex-1 items-center gap-3 w-full md:w-auto max-w-2xl">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute right-3 top-3 text-gray-500"></i>
              <input
                type="text"
                placeholder="ابحث عن خدمة، شركة، أو نشاط..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white pr-10 pl-4 py-2.5 rounded-xl border border-gray-700 focus:border-yellow-400 focus:outline-none text-sm"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2.5 rounded-xl border border-gray-700 focus:border-yellow-400 focus:outline-none text-sm"
            >
              <option value="">جميع المدن</option>
              <option value="صنعاء">صنعاء</option>
              <option value="عدن">عدن</option>
              <option value="تعز">تعز</option>
              <option value="المكلا">المكلا</option>
            </select>
          </div>

          {selectedBusinesses.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="w-full md:w-auto bg-yellow-400 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-yellow-500 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-code-compare"></i>
              <span>المقارنة ({selectedBusinesses.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-yellow-400 mb-4"></i>
            <p>جاري تحميل الأنشطة المحلية...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <i className="fa-solid fa-store-slash text-5xl text-gray-600 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-300">لم يتم العثور على أنشطة مطابقة</h3>
            <p className="text-gray-500 mt-1">جرب البحث بكلمات مختلفة أو اختر مدينة أخرى.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const isComparing = selectedBusinesses.some((b) => b.id === item.id);
              return (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header Image / Badge */}
                    <div className="relative h-48 bg-gray-800">
                      <img
                        src={item.cover_url || item.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-400 border border-yellow-400/20">
                        {item.category_name || 'نشاط تجاري'}
                      </div>
                      {item.is_verified && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                          <i className="fa-solid fa-circle-check"></i>
                          <span>موثق</span>
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-xl font-bold text-white hover:text-yellow-400 transition cursor-pointer">
                          {item.name}
                        </h2>
                        <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">
                          <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                          <span className="text-sm font-bold text-white">{item.rating || '5.0'}</span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                        <i className="fa-solid fa-location-dot text-yellow-400/80"></i>
                        <span>{item.city || 'صنعاء'} - {item.address || 'العنوان الرئيسي'}</span>
                      </p>

                      <p className="text-gray-300 text-sm mt-3 line-clamp-2 leading-relaxed">
                        {item.description || 'يقدم هذا النشاط خدمات احترافية متكاملة لجميع العملاء بكفاءة عالية.'}
                      </p>

                      {/* Services badges */}
                      {item.services && item.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {item.services.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-md border border-gray-700/50">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 border-t border-gray-800/60 mt-4">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => setActiveQuoteBusiness(item)}
                        className="bg-yellow-400/10 hover:bg-yellow-400 text-yellow-400 hover:text-black font-bold py-2 px-3 rounded-xl border border-yellow-400/30 text-xs transition text-center"
                      >
                        طلب عرض سعر
                      </button>
                      <button
                        onClick={() => setActiveMsgBusiness(item)}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-2 px-3 rounded-xl text-xs border border-gray-700 transition text-center"
                      >
                        مراسلة
                      </button>
                    </div>

                    <button
                      onClick={() => addToCompare(item)}
                      disabled={isComparing}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                        isComparing
                          ? 'bg-gray-800 text-green-400 border-green-500/30 cursor-default'
                          : 'bg-gray-800/80 hover:bg-gray-800 text-gray-300 border-gray-700'
                      }`}
                    >
                      <i className={`fa-solid ${isComparing ? 'fa-check' : 'fa-code-compare'}`}></i>
                      <span>{isComparing ? 'مضاف للمقارنة' : 'مقارنة مع المنافسين'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Modals */}
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
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
};
