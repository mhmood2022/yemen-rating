import React, { useState, useRef } from 'react';
import { 
  Building2, MapPin, Phone, Globe, Mail, 
  MessageCircle, Star, ShieldCheck, ArrowRight, 
  Check, Camera, X, ExternalLink, 
  Sparkles, Megaphone, Send, Clock, User
} from 'lucide-react';
import { YRBadge, BadgeType } from '../common/YRBadge';
import { AdBanner } from '../common/AdBanner';

export interface BankProfileData {
  id: string;
  name: string;
  type: 'bank' | 'exchange' | 'wallet' | 'remittance';
  categoryLabel: string;
  badgeType: BadgeType;
  coverImage?: string;
  logoImage?: string;
  rating: number;
  reviewsCount: number;
  city: string;
  address: string;
  branchesCount: number;
  atmsCount?: number;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  services: string[];
  galleryImages: string[];
  description: string;
}

interface ReviewItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'م. سالم الكاف',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'خدمة مصرفية ممتازة وسرعة في إنجاز الحوالات عبر التطبيق، وانتشار واسع لأجهزة الصراف الآلي.',
    createdAt: 'منذ يومين'
  },
  {
    id: 'rev-2',
    authorName: 'أحمد الوصابي',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'تعامل احترافي وخدمة عملاء متجاوبة على مدار الساعة.',
    createdAt: 'منذ أسبوع'
  }
];

export const BankProfileView: React.FC<{
  bank: BankProfileData;
  onBack: () => void;
  onNavigateAd?: () => void;
}> = ({ bank, onBack, onNavigateAd = () => {} }) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [userRating, setUserRating] = useState(5);
  const [userName, setUserName] = useState('');
  const [userComment, setUserComment] = useState('');
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);

  const displayGallery = bank.galleryImages && bank.galleryImages.length > 0 
    ? bank.galleryImages 
    : [
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85'
      ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setActiveGalleryIndex(prev => (prev + 1) % displayGallery.length);
      } else {
        setActiveGalleryIndex(prev => (prev - 1 + displayGallery.length) % displayGallery.length);
      }
    }
    touchStartX.current = null;
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      authorName: userName.trim(),
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: userRating,
      comment: userComment.trim(),
      createdAt: 'الآن'
    };

    setReviews(prev => [newReview, ...prev]);
    setUserName('');
    setUserComment('');
    setUserRating(5);
    setReviewSubmittedToast(true);
    setTimeout(() => setReviewSubmittedToast(false), 3500);
  };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      {/* إعلان البانر #4 */}
      <AdBanner placementId="4" className="mb-1" />

      {/* شريط الرجوع وزر أعلن هنا */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button
          onClick={onBack}
          className="px-3 py-1 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للبنوك والمحافظ</span>
        </button>

        <button
          onClick={onNavigateAd}
          className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FFC500] to-yellow-400 text-black font-black text-[11px] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-[#FFC500]/20 cursor-pointer"
        >
          <Megaphone size={12} />
          <span>أعلن هنا (YR Ads)</span>
        </button>
      </div>

      {reviewSubmittedToast && (
        <div className="p-2.5 bg-[#16A34A]/20 border border-[#16A34A] rounded-xl text-xs font-bold text-white flex items-center gap-2 animate-fade-in">
          <Sparkles size={15} className="text-[#16A34A]" />
          <span>تم إرسال تقييمك بنجاح ونشره في صفحة {bank.name}</span>
        </div>
      )}

      {/* كرت الغلاف والشعار ومعلومات البنك الأساسية (بدون أسعار صرف) */}
      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl relative">
        
        {/* الغلاف العريض */}
        <div className="relative h-40 sm:h-60 w-full bg-[#161619] overflow-hidden">
          <img 
            src={bank.coverImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1400&auto=format&fit=crop&q=85'} 
            alt={bank.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-black/30" />
        </div>

        {/* الشعار واسم البنك ملتصقة به الشارة */}
        <div className="p-3.5 sm:p-5 relative -mt-12 sm:-mt-14 z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            
            <div className="flex items-end gap-3">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#0F0F12] border-2 border-[#FFC500] p-1 shadow-2xl shrink-0 overflow-hidden">
                <img 
                  src={bank.logoImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=85'} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-lg font-black text-white leading-tight">
                    {bank.name}
                  </h1>
                  <YRBadge type={bank.badgeType || 'gold'} size={18} showTooltip />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] flex-wrap">
                  <span className="px-1.5 py-0.2 rounded bg-[#FFC500]/15 text-[#FFC500] font-bold">
                    {bank.categoryLabel}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><MapPin size={11} className="text-[#FFC500]" /> {bank.city}</span>
                </div>
              </div>
            </div>

            {/* التقييم */}
            <div className="flex items-center gap-1.5 bg-[#161619] p-1.5 px-2.5 rounded-xl border border-[#27272A] w-fit">
              <Star size={14} className="text-[#FFC500] fill-[#FFC500]" />
              <b className="text-xs font-black text-white font-mono">{bank.rating.toFixed(1)}</b>
              <span className="text-[9px] text-[#9CA3AF]">({bank.reviewsCount} تقييم)</span>
            </div>

          </div>

          {bank.description && (
            <p className="text-xs text-[#D1D5DB] leading-relaxed pt-0.5 font-medium">
              {bank.description}
            </p>
          )}

          {/* وسائل التواصل السريع */}
          <div className="pt-2.5 border-t border-[#222226] flex items-center gap-2 flex-wrap">
            {bank.phone && (
              <a
                href={`tel:${bank.phone}`}
                className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#FFC500] text-xs font-bold text-white flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Phone size={13} className="text-[#FFC500]" />
                <span>اتصال: {bank.phone}</span>
              </a>
            )}

            {bank.whatsapp && (
              <a
                href={`https://wa.me/${bank.whatsapp}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن خدمات ${bank.name} عبر منصة يمن ريتغ`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#16A34A]/20 border border-[#16A34A]/40 text-xs font-bold text-[#16A34A] hover:bg-[#16A34A] hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
              >
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            )}

            {bank.website && (
              <a
                href={bank.website}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#2EA5FF] text-xs font-bold text-[#2EA5FF] flex items-center gap-1.5 transition-all"
              >
                <Globe size={13} />
                <span>الموقع الرسمي</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

        </div>
      </div>

      {/* شبكة أرقام الفروع والصرافات الآلية */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-center">
        <div className="p-2.5 rounded-xl bg-[#0F0F12] border border-[#222226]">
          <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">شبكة الفروع المعتمدة</span>
          <b className="text-xs text-white font-bold">{bank.branchesCount} فرع</b>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0F0F12] border border-[#222226]">
          <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">أجهزة الصراف ATM</span>
          <b className="text-xs text-white font-bold">{bank.atmsCount ? `${bank.atmsCount} صراف` : 'متوفر لدى الوكلاء'}</b>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0F0F12] border border-[#222226] col-span-2 sm:col-span-1">
          <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">المركز الرئيسي</span>
          <b className="text-xs text-gray-200 font-bold font-['Cairo']">{bank.city.split('—')[0]}</b>
        </div>
      </div>

      {/* قسم الخدمات المصرفية والحلول */}
      <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-[#222226] space-y-2.5 shadow-xl">
        <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 border-b border-[#222226] pb-2">
          <Building2 size={14} className="text-[#FFC500]" />
          الخدمات المصرفية والحلول المتاحة
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {bank.services.map((srv, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-[#161619] border border-[#27272A] flex items-center gap-2 text-xs text-gray-200">
              <Check size={13} className="text-[#FFC500] shrink-0" />
              <span>{srv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* معرض الصور باللمس */}
      <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-[#222226] space-y-2.5 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#222226] pb-1.5">
          <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
            <Camera size={14} className="text-[#FFC500]" />
            معرض الصور والفروع ({displayGallery.length} صور)
          </h3>
          <span className="text-[9.5px] text-[#9CA3AF]">اضغط للتكبير</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {displayGallery.map((img, idx) => (
            <div
              key={idx}
              onClick={() => { setActiveGalleryIndex(idx); setIsLightboxOpen(true); }}
              className="h-24 sm:h-32 rounded-xl overflow-hidden border border-[#27272A] hover:border-[#FFC500] cursor-pointer transition-all active:scale-95 relative"
            >
              <img src={img} alt="Gallery" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* قسم التقييمات والمراجعات */}
      <div className="bg-[#0F0F12] p-3.5 sm:p-4 rounded-2xl border border-[#222226] space-y-3 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#222226] pb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <Star size={14} className="text-[#FFC500]" fill="#FFC500" />
              التقييمات والمراجعات ({reviews.length})
            </h3>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-[#FFC500] font-black">
            <Star size={13} fill="#FFC500" />
            <span>{bank.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {/* نموذج إضافة تقييم */}
        <form onSubmit={handleReviewSubmit} className="p-3 bg-[#161619] rounded-xl border border-[#27272A] space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white">أضف تقييمك:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  className="focus:outline-none cursor-pointer"
                >
                  <Star 
                    size={16} 
                    className={star <= userRating ? 'text-[#FFC500] fill-[#FFC500]' : 'text-gray-600'} 
                  />
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            required
            placeholder="اسمك الكامل..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-[#0F0F12] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
          />

          <textarea
            rows={2}
            required
            placeholder="اكتب تجربتك ورأيك..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            className="w-full bg-[#0F0F12] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
            >
              <Send size={12} />
              <span>إرسال التقييم</span>
            </button>
          </div>
        </form>

        {/* استعراض التقييمات المنشورة بالصور الحقيقية */}
        <div className="space-y-2">
          {reviews.map(rev => (
            <div key={rev.id} className="p-2.5 bg-[#161619] rounded-xl border border-[#27272A] space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={rev.authorAvatar} alt={rev.authorName} className="w-6 h-6 rounded-full object-cover border border-[#FFC500]/40" />
                  <h5 className="text-[11px] font-bold text-white">{rev.authorName}</h5>
                </div>
                <div className="flex text-[#FFC500] text-[10px]">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed font-medium pr-8">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* عارض الصور باللمس Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-400 font-mono">
              {activeGalleryIndex + 1} من {displayGallery.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="px-3 py-1 rounded-xl bg-[#18181C] text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold"
            >
              رجوع
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4" onClick={e => e.stopPropagation()}>
            <img 
              src={displayGallery[activeGalleryIndex]} 
              alt="Fullscreen" 
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl" 
            />
          </div>

          <div className="flex justify-center items-center gap-1.5 pb-4" onClick={e => e.stopPropagation()}>
            {displayGallery.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${
                  activeGalleryIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-gray-700'
                }`} 
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
