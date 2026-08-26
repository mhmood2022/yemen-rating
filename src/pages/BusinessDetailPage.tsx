import React, { useState } from 'react';
import { YRBusiness } from '../types/database.types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

interface BusinessDetailPageProps {
  business: YRBusiness | null;
  onBack: () => void;
}

export const BusinessDetailPage: React.FC<BusinessDetailPageProps> = ({ business, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'services' | 'photos'>('overview');
  const [isSaved, setIsSaved] = useState(false);

  if (!business) {
    return (
      <div className="min-h-screen bg-[#09090D] text-white p-6 text-center dir-rtl flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4 text-amber-400 text-2xl">
          <i className="fa-solid fa-building-circle-exclamation"></i>
        </div>
        <h2 className="text-lg font-bold mb-2">لم يتم العثور على النشاط التجاري</h2>
        <p className="text-xs text-gray-400 mb-6">قد يكون تم حذف الصفحة أو أن الرابط غير صحيح.</p>
        <button onClick={onBack} className="bg-amber-400 hover:bg-amber-300 text-black px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-lg shadow-amber-400/20 flex items-center gap-2">
          <i className="fa-solid fa-arrow-right"></i>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // Render Gold Stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fa-solid fa-star text-amber-400 text-[11px]"></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star text-gray-600 text-[11px]"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-[#09090D] text-white dir-rtl pb-20 font-sans selection:bg-amber-400 selection:text-black">
      
      {/* Dynamic Top Header Bar */}
      <header className="bg-[#111118]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-amber-400 transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5"
          >
            <i className="fa-solid fa-arrow-right text-xs"></i>
            <span>العودة للنتائج</span>
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSaved(!isSaved)} 
              className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isSaved 
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-400' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/50 hover:text-amber-400'
              }`}
            >
              <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-xs`}></i>
              <span>{isSaved ? 'تم الحفظ' : 'حفظ'}</span>
            </button>

            <button className="h-8 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:border-amber-400/50 hover:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition">
              <i className="fa-solid fa-share-nodes text-xs"></i>
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-4 space-y-6">

        {/* Cover Photo Frame */}
        <div className="h-48 md:h-72 w-full rounded-2xl overflow-hidden border border-white/10 relative bg-[#14141D] group shadow-2xl">
          <img 
            src={business.cover_url} 
            alt={business.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090D] via-transparent to-transparent opacity-80"></div>
          
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
            <i className="fa-solid fa-camera text-amber-400"></i>
            <span>12 صورة</span>
          </div>
        </div>

        {/* Header Hero Profile Card */}
        <div className="relative -mt-12 md:-mt-16 z-20">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl space-y-5">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              
              <div className="flex items-start md:items-center gap-4">
                {/* Logo Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-amber-400/80 bg-[#09090D] p-1 overflow-hidden shrink-0 shadow-xl relative">
                  <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  {/* Name + Verified Badge */}
                  <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-1.5 flex-wrap">
                    <span>{business.name}</span>
                    <VerifiedBadge type="gold" size={20} />
                  </h1>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300 pt-1">
                    
                    {/* Category Tag */}
                    <span className="bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <i className="fa-solid fa-tag text-[9px]"></i>
                      {business.category_name}
                    </span>

                    {/* Rating Stars Card */}
                    <div className="flex items-center gap-1.5 bg-[#09090D] border border-white/10 px-2.5 py-0.5 rounded-lg">
                      <div className="flex items-center gap-0.5">{renderStars(business.rating)}</div>
                      <span className="text-amber-400 font-black text-xs">{business.rating}</span>
                      <span className="text-gray-500 text-[10px]">(48 تقييم)</span>
                    </div>

                    {/* Location Badge */}
                    <span className="flex items-center gap-1 text-gray-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-lg text-[11px]">
                      <i className="fa-solid fa-location-dot text-amber-400 text-[10px]"></i>
                      {business.city}
                    </span>

                    {/* Status Badge */}
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      مفتوح الآن
                    </span>

                  </div>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0">
                {business.whatsapp && (
                  <a
                    href={`https://wa.me/${business.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 md:flex-none h-11 px-5 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    <i className="fa-brands fa-whatsapp text-base"></i>
                    <span>واتساب</span>
                  </a>
                )}

                <button className="flex-1 md:flex-none h-11 px-5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20">
                  <i className="fa-solid fa-pen-to-square text-xs"></i>
                  <span>أضف مراجعة</span>
                </button>

                <button className="h-11 px-3.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition flex items-center justify-center gap-1.5" title="مطالبة بالملكية">
                  <i className="fa-solid fa-shield-halved text-xs text-amber-400"></i>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Content Tabs Navigation */}
        <div className="border-b border-white/10 flex items-center gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 transition flex items-center gap-2 shrink-0 border-b-2 relative ${
              activeTab === 'overview' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-circle-info"></i>
            <span>نظرة عامة</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3.5 transition flex items-center gap-2 shrink-0 border-b-2 relative ${
              activeTab === 'reviews' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-star"></i>
            <span>المراجعات والتقييمات</span>
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] px-1.5 py-0.2 rounded-full">48</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3.5 transition flex items-center gap-2 shrink-0 border-b-2 relative ${
              activeTab === 'services' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-list-check"></i>
            <span>الخدمات والمنتجات</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3.5 transition flex items-center gap-2 shrink-0 border-b-2 relative ${
              activeTab === 'photos' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-images"></i>
            <span>معرض الصور</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Body Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* About Section */}
                <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <i className="fa-solid fa-align-right text-xs"></i>
                      <span>عن النشاط التجاري</span>
                    </h3>
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                    {business.description || "لم يتم إضافة وصف مفصل لهذا النشاط التجاري حتى الآن."}
                  </p>
                </div>

                {/* Features & Highlights */}
                <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-3 shadow-lg">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-3">
                    <i className="fa-solid fa-sparkles text-xs"></i>
                    <span>مميزات وخدمات المكان</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {[
                      { icon: 'fa-wifi', label: 'واي فاي مجاني' },
                      { icon: 'fa-square-parking', label: 'موقف سيارات' },
                      { icon: 'fa-credit-card', label: 'الدفع الإلكتروني' },
                      { icon: 'fa-headset', label: 'دعم عالي الجودة' },
                      { icon: 'fa-shield-heart', label: 'ضمان وتوثيق' },
                      { icon: 'fa-truck-fast', label: 'خدمة التوصيل' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-gray-300">
                        <i className={`fa-solid ${item.icon} text-amber-400 text-xs`}></i>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                
                {/* Add Review Trigger Box */}
                <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-white">هل قمت بزيارة أو التعامل مع هذا المكان؟</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">شارِك تجربتك لتقييم النشاط ومساعدة الآخرين.</p>
                  </div>
                  <button className="bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 rounded-xl text-xs font-bold transition shrink-0">
                    كتابة مراجعة
                  </button>
                </div>

                {/* Review Item Cards */}
                <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-6 shadow-lg">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-3">
                    <i className="fa-solid fa-comments text-xs"></i>
                    <span>مراجعات العملاء</span>
                  </h3>

                  {/* Sample Review 1 */}
                  <div className="border-b border-white/5 pb-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs shadow-inner">
                          م
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">مهندس علي المقطري</h4>
                            <VerifiedBadge type="blue" size={14} />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex items-center gap-0.5">{renderStars(5)}</div>
                            <span className="text-[10px] text-gray-400">| منذ 3 أيام</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                        زبون موثق
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed pr-2">
                      خدمة احترافية جداً وتعامل راقي من طاقم العمل. أنصح بشدة بالتعامل معهم والتجربة كانت ممتازة وسريعة.
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <button className="hover:text-amber-400 transition flex items-center gap-1">
                        <i className="fa-regular fa-thumbs-up"></i>
                        <span>مفيد (5)</span>
                      </button>
                      <button className="hover:text-amber-400 transition flex items-center gap-1">
                        <i className="fa-regular fa-comment"></i>
                        <span>رد</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: SERVICES */}
            {activeTab === 'services' && (
              <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-3">
                  <i className="fa-solid fa-boxes-packing text-xs"></i>
                  <span>الخدمات والمنتجات المتاحة</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { title: 'الاستشارات المباشرة', desc: 'توفير استشارات متخصصة وتنفيذ الخدمة وفق أعلى المعايير.' },
                    { title: 'خدمات التوريد والتركيب', desc: 'توريد مع الضمان الكامل لكافة المكونات المعتمدة.' }
                  ].map((srv, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <i className="fa-solid fa-circle-check text-amber-400 text-[10px]"></i>
                          {srv.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-1">{srv.desc}</p>
                      </div>
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg shrink-0">
                        حسب الطلب
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PHOTOS */}
            {activeTab === 'photos' && (
              <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-3">
                  <i className="fa-solid fa-images text-xs"></i>
                  <span>معرض الصور</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="h-32 rounded-xl overflow-hidden border border-white/10">
                    <img src={business.cover_url} alt="Cover" className="w-full h-full object-cover hover:scale-110 transition duration-500" />
                  </div>
                  <div className="h-32 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 text-xs font-bold cursor-pointer hover:border-amber-400 transition gap-2">
                    <i className="fa-solid fa-cloud-arrow-up text-amber-400 text-xl"></i>
                    <span>إضافة صورة جديدة</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* Contact Information Box */}
            <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-amber-400 border-b border-white/5 pb-3 flex items-center gap-2">
                <i className="fa-solid fa-address-book"></i>
                <span>معلومات التواصل والموقع</span>
              </h3>

              <div className="space-y-3.5 text-xs text-gray-300">
                
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <p className="font-bold text-white text-[11px]">العنوان الجغرافي</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{business.city} - الشارع الرئيسي</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <p className="font-bold text-white text-[11px]">ساعات العمل</p>
                    <p className="text-emerald-400 font-bold text-[11px] mt-0.5">08:00 صباحاً - 09:00 مساءً</p>
                  </div>
                </div>

                {/* Verification & Trust */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <p className="font-bold text-white text-[11px]">حالة التوثيق</p>
                    <p className="text-gray-400 text-[11px] mt-0.5 flex items-center gap-1">
                      <span>منشأة رسمية موثقة</span>
                      <VerifiedBadge type="gold" size={13} />
                    </p>
                  </div>
                </div>

              </div>

              {/* Get Directions Button */}
              <button className="w-full mt-2 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 border border-amber-400/30 text-xs font-bold transition flex items-center justify-center gap-2">
                <i className="fa-solid fa-map-location-dot"></i>
                <span>عرض على الخريطة</span>
              </button>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
