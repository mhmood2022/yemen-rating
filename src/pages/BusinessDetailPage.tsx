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

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white dir-rtl pb-16">
      
      {/* Top Sticky Header */}
      <div className="bg-[#14141C] border-b border-[#2A2A2A] px-4 py-3 sticky top-0 z-40 flex items-center justify-between max-w-6xl mx-auto rounded-b-xl shadow-md">
        <button onClick={onBack} className="flex items-center gap-2 text-amber-400 text-xs md:text-sm font-bold hover:underline">
          <i className="fa-solid fa-arrow-right text-xs"></i>
          العودة للنتائج
        </button>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-lg bg-[#0D0D12] border border-[#2A2A2A] hover:border-amber-400 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <i className="fa-solid fa-share-nodes text-xs"></i>
            <span className="hidden sm:inline">مشاركة</span>
          </button>
          <button className="h-9 px-3 rounded-lg bg-[#0D0D12] border border-[#2A2A2A] hover:border-amber-400 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <i className="fa-regular fa-bookmark text-xs"></i>
            <span className="hidden sm:inline">حفظ</span>
          </button>
        </div>
      </div>

      {/* Clean Cover Banner Image */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="h-48 md:h-72 w-full rounded-2xl overflow-hidden border border-[#2A2A2A] relative bg-[#14141C]">
          <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Business Identity & Main Actions Header */}
      <div className="max-w-6xl mx-auto px-4 relative -mt-10 md:-mt-14 mb-6">
        <div className="bg-[#14141C] border border-[#2A2A2A] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Business Logo Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-amber-400 bg-[#0D0D12] p-1 overflow-hidden shrink-0 shadow-lg">
              <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {business.category_name}
                </span>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                  حساب موثق
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                {business.name}
              </h1>

              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1 bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-md font-bold">
                  <i className="fa-solid fa-star text-[10px]"></i>
                  {business.rating} (48 تقييم)
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <i className="fa-solid fa-location-dot text-amber-400"></i>
                  {business.city}
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-door-open"></i>
                  مفتوح الآن
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:opacity-90 transition flex items-center gap-1.5 shadow-md"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                واتساب
              </a>
            )}
            <button className="h-10 px-4 rounded-xl font-bold text-xs bg-amber-400 text-black hover:bg-amber-300 transition flex items-center gap-1.5 shadow-md">
              <i className="fa-solid fa-star text-xs"></i>
              أضف مراجعة
            </button>
            <button className="h-10 px-3 rounded-xl font-bold text-xs bg-[#0D0D12] text-gray-400 border border-[#2A2A2A] hover:border-amber-400 hover:text-amber-400 transition flex items-center gap-1.5">
              <i className="fa-solid fa-user-shield text-xs"></i>
              مطالبة بالملكية
            </button>
          </div>

        </div>
      </div>

      {/* Main Details Grid */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Overview & Gallery */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-[#2A2A2A] gap-4 text-xs md:text-sm font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'overview' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'
              }`}
            >
              <i className="fa-solid fa-circle-info text-xs"></i>
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'
              }`}
            >
              <i className="fa-solid fa-comments text-xs"></i>
              المراجعات (48)
            </button>
          </div>

          {/* Overview Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-3">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <i className="fa-solid fa-align-right text-xs"></i>
                  عن النشاط التجاري
                </h3>
                <p className="text-gray-300 leading-relaxed text-xs md:text-sm">{business.description}</p>
              </div>

              {/* Photo Gallery Grid */}
              <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-3">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
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

          {/* Reviews Content */}
          {activeTab === 'reviews' && (
            <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-amber-400">تقييمات العملاء</h3>
              <div className="border-b border-[#2A2A2A] pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">علي المقطري</span>
                  <span className="text-[10px] text-gray-500">منذ 3 أيام</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  خدمة رائعة جداً وتعامل احترافي وراقي، من أفضل الخيارات الموصى بها في هذه المحافظة.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Section: Sidebar Business Info */}
        <div className="space-y-4">
          <div className="bg-[#14141C] border border-[#2A2A2A] p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-[#2A2A2A] pb-3 flex items-center gap-2">
              <i className="fa-solid fa-address-card text-amber-400"></i>
              تفاصيل التواصل والموقع
            </h3>

            <div className="flex items-start gap-3 text-xs text-gray-300">
              <i className="fa-solid fa-location-dot text-amber-400 mt-0.5"></i>
              <div>
                <p className="font-bold text-white">العنوان الجغرافي</p>
                <p className="text-gray-400 mt-0.5">{business.city} - الشارع الرئيسي</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-300">
              <i className="fa-solid fa-clock text-amber-400 mt-0.5"></i>
              <div>
                <p className="font-bold text-white">ساعات العمل</p>
                <p className="text-emerald-400 font-bold mt-0.5">08:00 صباحاً - 09:00 مساءً</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-300">
              <i className="fa-solid fa-circle-check text-amber-400 mt-0.5"></i>
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
