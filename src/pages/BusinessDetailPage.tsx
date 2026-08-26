import React, { useState } from 'react';
import { YRBusiness } from '../types/database.types';

interface BusinessDetailPageProps {
  business: YRBusiness | null;
  onBack: () => void;
}

export const BusinessDetailPage: React.FC<BusinessDetailPageProps> = ({ business, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');

  if (!business) {
    return (
      <div className="min-h-screen bg-[#0D0D12] text-white p-6 text-center dir-rtl flex flex-col items-center justify-center">
        <i className="fa-solid fa-building-circle-exclamation text-4xl text-amber-400 mb-3"></i>
        <p className="text-base font-bold mb-4">لم يتم العثور على النشاط التجاري المطلوب</p>
        <button onClick={onBack} className="bg-amber-400 text-black px-5 py-2.5 rounded-xl font-bold text-xs">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // Render Star Rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fa-solid fa-star text-amber-400 text-xs"></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star text-gray-600 text-xs"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white dir-rtl pb-16 font-sans">
      
      {/* Top Header Navigation */}
      <div className="bg-[#14141C] border-b border-[#2A2A2A] px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-amber-400 text-xs font-bold hover:underline">
            <i className="fa-solid fa-arrow-right text-xs"></i>
            العودة للنتائج
          </button>
          <div className="flex items-center gap-2">
            <button className="h-9 px-3 rounded-lg bg-[#0D0D12] border border-[#2A2A2A] text-amber-400 text-xs font-bold flex items-center gap-1.5 hover:border-amber-400 transition">
              <i className="fa-solid fa-share-nodes text-xs"></i>
              مشاركة
            </button>
            <button className="h-9 px-3 rounded-lg bg-[#0D0D12] border border-[#2A2A2A] text-amber-400 text-xs font-bold flex items-center gap-1.5 hover:border-amber-400 transition">
              <i className="fa-regular fa-bookmark text-xs"></i>
              حفظ
            </button>
          </div>
        </div>
      </div>

      {/* Cover Banner */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="h-44 md:h-64 w-full rounded-2xl overflow-hidden border border-[#2A2A2A] relative bg-[#14141C]">
          <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Business Main Identity */}
      <div className="max-w-6xl mx-auto px-4 relative -mt-8 md:-mt-12 mb-6">
        <div className="bg-[#14141C] border border-[#2A2A2A] rounded-2xl p-5 md:p-6 shadow-2xl space-y-4">
          
          <div className="flex items-start md:items-center gap-4 flex-col md:flex-row justify-between">
            <div className="flex items-center gap-4">
              {/* Logo Avatar */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-amber-400 bg-[#0D0D12] p-1 overflow-hidden shrink-0 shadow-lg">
                <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover rounded-xl" />
              </div>

              <div className="space-y-1">
                {/* Title + Verified Badge inline like X */}
                <h1 className="text-lg md:text-2xl font-black text-white flex items-center gap-1.5">
                  <span>{business.name}</span>
                  <i className="fa-solid fa-circle-check text-blue-500 text-base md:text-lg" title="حساب موثق"></i>
                </h1>

                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap pt-0.5">
                  {/* Category Pill */}
                  <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <i className="fa-solid fa-layer-group text-[10px]"></i>
                    {business.category_name}
                  </span>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-1.5 bg-[#0D0D12] px-2.5 py-1 rounded-lg border border-[#2A2A2A]">
                    <div className="flex items-center gap-0.5">{renderStars(business.rating)}</div>
                    <span className="text-amber-400 font-bold text-xs">{business.rating}</span>
                    <span className="text-gray-500 text-[11px]">(48 تقييم)</span>
                  </div>

                  <span className="flex items-center gap-1 text-gray-300">
                    <i className="fa-solid fa-location-dot text-amber-400 text-xs"></i>
                    {business.city}
                  </span>

                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <i className="fa-solid fa-circle text-[8px]"></i>
                    مفتوح الآن
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 md:flex-none h-10 px-4 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                  واتساب
                </a>
              )}
              <button className="flex-1 md:flex-none h-10 px-4 rounded-xl font-bold text-xs bg-amber-400 text-black hover:bg-amber-300 transition flex items-center justify-center gap-1.5 shadow-md">
                <i className="fa-solid fa-star text-xs"></i>
                أضف مراجعة
              </button>
              <button className="h-10 px-3 rounded-xl font-bold text-xs bg-[#0D0D12] text-gray-400 border border-[#2A2A2A] hover:border-amber-400 hover:text-amber-400 transition flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-user-shield text-xs"></i>
                مطالبة
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-[#2A2A2A] gap-6 text-xs md:text-sm font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 transition border-b-2 flex items-center gap-2 ${
                activeTab === 'overview' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-circle-info text-xs"></i>
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition border-b-2 flex items-center gap-2 ${
                activeTab === 'reviews' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-comments text-xs"></i>
              المراجعات (48)
            </button>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <i className="fa-solid fa-align-right text-xs"></i>
                  عن النشاط التجاري
                </h3>
                <p className="text-gray-300 leading-relaxed text-xs md:text-sm">{business.description}</p>
              </div>

              {/* Photo Gallery Grid */}
              <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <i className="fa-solid fa-images text-xs"></i>
                  معرض الصور
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  <div className="h-24 rounded-xl overflow-hidden border border-[#2A2A2A]">
                    <img src={business.cover_url} alt="Gallery 1" className="w-full h-full object-cover hover:scale-105 transition" />
                  </div>
                  <div className="h-24 rounded-xl bg-[#0D0D12] border border-[#2A2A2A] flex flex-col items-center justify-center text-gray-500 text-[11px] font-bold cursor-pointer hover:border-amber-400/50 transition">
                    <i className="fa-solid fa-plus text-sm mb-1 text-amber-400"></i>
                    إضافة صورة
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Reviews Tab Content */}
          {activeTab === 'reviews' && (
            <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <i className="fa-solid fa-star text-xs"></i>
                تقييمات ومراجعات العملاء
              </h3>

              {/* Individual Comment Box */}
              <div className="border-b border-[#2A2A2A] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-400/30">
                      م
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">مهندس علي المقطري</h4>
                      <div className="flex items-center gap-1 mt-0.5">{renderStars(5)}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">منذ 3 أيام</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pr-10">
                  خدمة ممتازة جداً واستجابة سريعة. التعامل راقي جداً وأنصح بالتواصل معهم.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Section: Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-xs text-amber-400 border-b border-[#2A2A2A] pb-3 flex items-center gap-2">
              <i className="fa-solid fa-address-card"></i>
              تفاصيل التواصل والموقع
            </h3>

            <div className="flex items-start gap-3 text-xs text-gray-300">
              <i className="fa-solid fa-location-dot text-amber-400 mt-1"></i>
              <div>
                <p className="font-bold text-white">العنوان الجغرافي</p>
                <p className="text-gray-400 mt-0.5">{business.city} - الشارع الرئيسي</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-300">
              <i className="fa-solid fa-clock text-amber-400 mt-1"></i>
              <div>
                <p className="font-bold text-white">ساعات العمل</p>
                <p className="text-emerald-400 font-bold mt-0.5">08:00 صباحاً - 09:00 مساءً</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-300">
              <i className="fa-solid fa-shield-halved text-amber-400 mt-1"></i>
              <div>
                <p className="font-bold text-white">حالة الملكية</p>
                <p className="text-gray-400 mt-0.5">منشأة موثقة ومسجلة في الدليل</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
