import React, { useState, useEffect } from 'react';
import { YRBusiness } from '../types/database.types';

interface BusinessDetailPageProps {
  business: YRBusiness | null;
  onBack: () => void;
}

export const BusinessDetailPage: React.FC<BusinessDetailPageProps> = ({ business, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');

  if (!business) {
    return (
      <div className="min-h-screen bg-[#0D0D12] text-white p-8 text-center dir-rtl flex flex-col items-center justify-center">
        <p className="text-xl font-bold mb-4">لم يتم العثور على النشاط التجاري المطلوبة</p>
        <button onClick={onBack} className="bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white dir-rtl pb-12">
      {/* Top Navigation */}
      <div className="bg-[#14141C] border-b border-[#2A2A2A] px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-amber-400 font-bold hover:underline">
          <i className="fa-solid fa-arrow-right"></i>
          العودة للنتائج
        </button>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-[#0D0D12] border border-[#2A2A2A] hover:border-amber-400 text-amber-400">
            <i className="fa-solid fa-[#2A2A2A] fa-share-nodes"></i>
          </button>
          <button className="p-2 rounded-xl bg-[#0D0D12] border border-[#2A2A2A] hover:border-amber-400 text-amber-400">
            <i className="fa-regular fa-bookmark"></i>
          </button>
        </div>
      </div>

      {/* Hero Header - Yelp Style */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/60 to-transparent"></div>
        
        <div className="absolute bottom-6 right-4 left-4 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="bg-amber-400 text-black px-3 py-1 rounded-full font-bold text-xs mb-2 inline-block">
              {business.category_name}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{business.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 bg-amber-400/20 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-400/30 font-bold">
                <i className="fa-solid fa-star text-xs"></i>
                {business.rating} (128 تقييم)
              </span>
              <span className="text-gray-300 font-bold flex items-center gap-1">
                <i className="fa-solid fa-location-dot text-amber-400"></i>
                {business.city}
              </span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex items-center gap-3">
            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition shadow-lg"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                تواصل عبر واتساب
              </a>
            )}
            <button className="bg-amber-400 text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-300 transition shadow-lg">
              <i className="fa-solid fa-star"></i>
              اكتب مراجعة
            </button>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left / Main Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-[#2A2A2A] gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 transition border-b-2 ${activeTab === 'overview' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'}`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition border-b-2 ${activeTab === 'reviews' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'}`}
            >
              المراجعات والتقييمات
            </button>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#14141C] border border-[#2A2A2A] p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-3 text-amber-400">عن المنشأة والخدمات</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{business.description}</p>
              </div>

              {/* Photos Grid Sample */}
              <div className="bg-[#14141C] border border-[#2A2A2A] p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
                  <i className="fa-solid fa-images"></i>
                  معرض الصور
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <img src={business.cover_url} alt="Gallery" className="rounded-xl h-28 w-full object-cover border border-[#2A2A2A]" />
                  <div className="bg-[#0D0D12] rounded-xl h-28 border border-[#2A2A2A] flex items-center justify-center text-gray-500 text-xs font-bold">
                    + صور أخرى
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab Content */}
          {activeTab === 'reviews' && (
            <div className="bg-[#14141C] border border-[#2A2A2A] p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-amber-400 mb-2">تقييمات العملاء</h3>
              <div className="border-b border-[#2A2A2A] pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-amber-400 font-bold text-sm">محمد المقطري</div>
                  <span className="text-xs text-gray-500">مذ يومين</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  خدمة ممتازة وتجربة راقية، التعامل احترافي جداً والاهتمام بالتفاصيل عالي.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info - Yelp Style */}
        <div className="space-y-6">
          <div className="bg-[#14141C] border border-[#2A2A2A] p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-lg text-white border-b border-[#2A2A2A] pb-3">معلومات الاتصال والموقع</h3>
            
            <div className="flex items-start gap-3 text-sm text-gray-300">
              <i className="fa-solid fa-location-dot text-amber-400 mt-1"></i>
              <div>
                <p className="font-bold text-white">الموقع</p>
                <p className="text-xs text-gray-400">{business.city} - المركز الرئيسي</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-gray-300">
              <i className="fa-solid fa-clock text-amber-400 mt-1"></i>
              <div>
                <p className="font-bold text-white">ساعات العمل</p>
                <p className="text-xs text-amber-400 font-bold">مفتوح الآن (8:00 ص - 9:00 م)</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
