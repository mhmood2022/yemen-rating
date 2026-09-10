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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  if (!business) {
    return (
      <div className="min-h-screen bg-[#09090D] text-white p-6 text-center dir-rtl flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4 text-amber-400 text-2xl">
          <i className="fa-solid fa-building-circle-exclamation"></i>
        </div>
        <h2 className="text-lg font-bold mb-2">لم يتم العثور على النشاط التجاري</h2>
        <button onClick={onBack} className="bg-amber-400 text-black px-6 py-2 rounded-xl font-bold text-xs mt-4">
          العودة للرئيسية
        </button>
      </div>
    );
  }

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

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم إرسال تقييمك بنجاح وسيتم عرضه مباشرة!');
    setShowReviewModal(false);
    setReviewText('');
  };

  return (
    <div className="min-h-screen bg-[#09090D] text-white dir-rtl pb-20 font-sans">
      
      {/* Top Header Bar */}
      <header className="bg-[#111118]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-amber-400 transition bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"
          >
            <i className="fa-solid fa-arrow-right text-xs"></i>
            <span>العودة للنتائج</span>
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSaved(!isSaved)} 
              className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isSaved ? 'bg-amber-400/25 border-amber-400 text-amber-400' : 'bg-white/5 border-white/10 text-gray-300'
              }`}
            >
              <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-xs`}></i>
              <span>{isSaved ? 'محفوظ' : 'حفظ'}</span>
            </button>
            <button className="h-8 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold flex items-center gap-1.5">
              <i className="fa-solid fa-share-nodes text-xs"></i>
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-4 space-y-5">

        {/* Cover Photo */}
        <div className="h-48 md:h-64 w-full rounded-2xl overflow-hidden border border-white/10 relative bg-[#14141D] shadow-xl">
          <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
            <i className="fa-solid fa-camera text-amber-400"></i>
            <span>12 صورة</span>
          </div>
        </div>

        {/* Unified Single Card Header (X / Twitter Style Layout) */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4">
          
          <div className="flex items-start gap-3">
            
            {/* Top Right Logo (No Yellow Stroke) */}
            <div className="w-16 h-16 rounded-xl bg-[#09090D] overflow-hidden shrink-0 shadow-md border border-white/5">
              <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
            </div>

            {/* Name, Verified Badge & Stars Rating */}
            <div className="space-y-1.5 flex-1 pt-0.5">
              
              {/* Name + Badge (X Style) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
                  {business.name}
                </h1>
                <VerifiedBadge type="gold" size={16} />
              </div>

              {/* Gold Stars & Status Row */}
              <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                
                {/* Visible 5 Gold Stars Rating */}
                <div className="flex items-center gap-1 bg-[#09090D] border border-white/10 px-2 py-0.5 rounded-lg">
                  <div className="flex items-center gap-0.5">
                    {renderStars(business.rating)}
                  </div>
                  <span className="text-amber-400 font-bold text-xs mr-1">{business.rating}</span>
                  <span className="text-gray-400 text-[10px]">(48)</span>
                </div>

                {/* Status Badge */}
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  مفتوح الآن
                </span>

              </div>

            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 h-10 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>واتساب</span>
              </a>
            )}
            <button 
              onClick={() => setShowReviewModal(true)}
              className="flex-1 h-10 rounded-xl font-bold text-xs bg-amber-400 text-black hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-star text-xs"></i>
              <span>أضف مراجعة</span>
            </button>
          </div>

        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-white/10 flex items-center gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition flex items-center gap-2 border-b-2 ${activeTab === 'overview' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'}`}
          >
            <i className="fa-solid fa-circle-info"></i> نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition flex items-center gap-2 border-b-2 ${activeTab === 'reviews' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'}`}
          >
            <i className="fa-solid fa-star"></i> المراجعات والتقييمات (48)
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 transition flex items-center gap-2 border-b-2 ${activeTab === 'services' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'}`}
          >
            <i className="fa-solid fa-list-check"></i> الخدمات والمنتجات
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 transition flex items-center gap-2 border-b-2 ${activeTab === 'photos' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400'}`}
          >
            <i className="fa-solid fa-images"></i> معرض الصور
          </button>
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
              <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <i className="fa-solid fa-align-right"></i> عن النشاط التجاري
                </h3>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{business.description || "لا يوجد وصف إضافي متاح."}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <i className="fa-solid fa-comments"></i> آراء العملاء
                </h3>
                <div className="space-y-3">
                  <div className="border-b border-white/5 pb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 font-bold text-xs flex items-center justify-center">م</div>
                        <span className="text-xs font-bold text-white">مهندس علي المقطري</span>
                        <VerifiedBadge type="blue" size={13} />
                      </div>
                      <div className="flex items-center gap-0.5">{renderStars(5)}</div>
                    </div>
                    <p className="text-xs text-gray-300 pr-9">مكان ممتاز وخدمة رائعة جداً، أنصح بالتعامل معهم.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <i className="fa-solid fa-list-check"></i> قائمة الخدمات
                </h3>
                <p className="text-xs text-gray-300">يتم تقديم خدمات متميزة بمعايير عالية الجودة وضمان كامل.</p>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <i className="fa-solid fa-images"></i> صور المكان
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <img src={business.cover_url} alt="img" className="h-28 rounded-xl object-cover w-full border border-white/10" />
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#111118] border border-white/10 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-amber-400 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <i className="fa-solid fa-address-card"></i> معلومات التواصل
              </h3>
              <p className="text-xs text-emerald-400 flex items-center gap-2">
                <i className="fa-solid fa-clock"></i> 08:00 صباحاً - 09:00 مساءً
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Interactive Rating Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14141D] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-amber-400">تقييم النشاط التجاري</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-white">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">اختر عدد النجوم:</label>
                <div className="flex items-center justify-center gap-2 py-2 bg-[#09090D] rounded-xl border border-white/5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="text-xl transition transform hover:scale-125"
                    >
                      <i className={`${star <= userRating ? 'fa-solid text-amber-400' : 'fa-regular text-gray-600'} fa-star`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">تعليقك أو تجربتك:</label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="اكتب تفاصيل تجربتك هنا..."
                  className="w-full bg-[#09090D] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-black py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-400/20"
                >
                  إرسال التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
