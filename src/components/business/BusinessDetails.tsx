import { AdBanner } from "../common/AdBanner";
import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  MessageSquare, 
  ArrowRight, 
  Share2, 
  Heart, 
  Globe, 
  ShieldCheck, 
  Send,
  CheckCircle,
  ImageIcon,
  X,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { BusinessItem, Review } from '../../data/mockData';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface BusinessDetailsProps {
  business: BusinessItem;
  onBack: () => void;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business, onBack }) => {
  const [reviewsList, setReviewsList] = useState<Review[]>(business.reviews || []);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  // عارض الصور المكبرة وخاصية التقريب
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const category = OFFICIAL_CATEGORIES.find(c => c.slug === business.categorySlug);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newUserName.trim()) return;

    const newRev: Review = {
      id: `r-${Date.now()}`,
      userName: newUserName,
      rating: newRating,
      date: 'الآن',
      comment: newComment
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewComment('');
    setNewUserName('');
    setIsReviewModalOpen(false);
  };

  return (
    <div dir="rtl" className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-5 pb-16 px-1 sm:px-0">
      {/* مكوّن إعلانات YR Ads الموضع #4 - أعلى صفحة الشركة */} 
      <AdBanner placementId="4" className="mb-4" />
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-yellow-400 hover:text-yellow-300 hover:border-zinc-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-[#f5b800]" />
          <span>الرجوع إلى النتائج</span>
        </button>

        {copiedNotification && (
          <span className="text-[10px] sm:text-[11px] bg-[#f5b800]/10 text-[#f5b800] border border-[#f5b800]/30 px-2.5 py-1 rounded-lg truncate font-bold">
            تم نسخ الرابط!
          </span>
        )}
      </div>

      {/* 1. رأس المنشأة (الغلاف والشعار والهوية) */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#151515] shadow-2xl">
        
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-72 md:h-80 w-full bg-[#1e1e1e] overflow-hidden">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#151515]" />
        </div>

        {/* Business Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-5 px-4 sm:px-6 pb-4 sm:pb-6 -mt-14 sm:-mt-20 relative z-10 text-center sm:text-right">
          
          {/* Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#222] border-4 border-[#151515] overflow-hidden shadow-2xl flex-shrink-0">
            <img
              src={business.logo}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-1.5 pb-1 w-full min-w-0">
            <div className="flex items-center justify-center sm:justify-start flex-wrap gap-1.5 sm:gap-2">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
                {business.name}
              </h1>
              {business.isVerified && (
                <VerifiedBadge type={business.badgeType || 'gold'} size="md" />
              )}
            </div>

            <div className="text-xs sm:text-sm text-zinc-400 flex items-center justify-center sm:justify-start flex-wrap gap-1">
              <span>{category?.name || 'الخدمات'}</span>
              <span className="text-zinc-600">·</span>
              <span className="truncate max-w-xs">{business.address}</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 pt-0.5">
              <span className="text-[#f5b800] tracking-wider text-xs sm:text-sm">★★★★★</span>
              <span className="font-bold text-xs sm:text-sm text-white font-mono">{business.rating}</span>
              <span className="text-[11px] sm:text-xs text-zinc-400">({reviewsList.length} تقييم)</span>
            </div>
          </div>

        </div>

        {/* Action Buttons Bar */}
        <div className="p-3 sm:px-6 sm:pb-6 sm:pt-2 border-t border-zinc-800/80">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center sm:justify-start gap-2">
            
            <a
              href={`tel:${business.phone}`}
              className="px-3 sm:px-4 py-2 bg-[#f5b800] hover:bg-[#e5aa00] text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>اتصال</span>
            </a>

            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 sm:px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              onClick={() => window.scrollTo({ top: 650, behavior: 'smooth' })}
              className="px-3 sm:px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#f5b800]" />
              <span>الموقع</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 sm:px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`px-3 sm:px-4 py-2 border text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                isSaved
                  ? 'bg-[#f5b800] text-zinc-950 border-[#f5b800] font-bold'
                  : 'bg-[#202020] hover:bg-zinc-800 text-zinc-200 border-zinc-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-zinc-950' : ''}`} />
              <span>{isSaved ? 'تم الحفظ' : 'حفظ'}</span>
            </button>

            <button
              onClick={() => window.open('#', '_blank')}
              className="px-3 sm:px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>الموقع الإلكتروني</span>
            </button>

            <button
              onClick={() => setClaimModalOpen(true)}
              className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-400 hover:text-[#f5b800] border border-zinc-700 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>المطالبة بالملكية</span>
            </button>

          </div>
        </div>

      </section>

      {/* 2. تفاصيل المنشأة ومعرض الـ 4 صور */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* العمود الرئيسي (2fr): عن المنشأة، الخدمات، ومعرض الـ 4 صور التفاعلي */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          
          {/* About */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">عن المنشأة</h2>
            <p className="text-xs sm:text-sm text-[#c7c7c7] leading-relaxed">
              {business.description}
            </p>
          </section>

          {/* Services */}
          {business.amenities && business.amenities.length > 0 && (
            <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white">الخدمات والمميزات</h2>
              <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                {business.amenities.join(' · ')}
              </p>
            </section>
          )}

          {/* 📸 معرض الـ 4 صور مع إمكانية التكبير والمعاينة */}
          {business.gallery && business.gallery.length > 0 && (
            <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#f5b800]" />
                  <span>معرض الصور (4 صور)</span>
                </h2>
                <span className="text-xs text-[#f5b800] font-semibold">انقر على أي صورة لتكبيرها</span>
              </div>

              {/* شبكة الصور الأربع */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {business.gallery.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveLightboxIndex(i);
                      setIsZoomed(false);
                    }}
                    className="relative h-28 sm:h-36 rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800 cursor-pointer group shadow-md"
                  >
                    <img
                      src={img}
                      alt={`${business.name} ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-1.5 right-1.5 bg-zinc-950/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 font-mono flex items-center gap-1">
                      <ZoomIn className="w-2.5 h-2.5 text-[#f5b800]" />
                      <span>{i + 1}/4</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews & Ratings */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 sm:pb-3">
              <h2 className="text-base sm:text-lg font-bold text-white">التقييمات والمراجعات</h2>
              <span className="text-xs text-zinc-400">({reviewsList.length} مراجعة)</span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs sm:text-sm text-white">{rev.userName}</div>
                    <span className="text-[10px] sm:text-[11px] text-zinc-500">{rev.date}</span>
                  </div>
                  <div className="text-[#f5b800] text-xs tracking-wider">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#f5b800] hover:bg-[#e5aa00] text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-3.5 h-3.5 fill-zinc-950" />
              <span>أضف تقييمك</span>
            </button>
          </section>

        </div>

        {/* العمود الجانبي (1fr): التواصل وأوقات العمل والموقع */}
        <aside className="space-y-4 sm:space-y-5">
          
          <div className="min-h-[100px] sm:min-h-[120px] border border-dashed border-zinc-700/80 rounded-xl bg-[#151515]/60 flex items-center justify-center text-zinc-500 text-xs font-medium">
            مساحة الإعلان
          </div>

          {/* Contact Information */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3">
            <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
              معلومات التواصل
            </h2>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2.5 py-2 border-b border-zinc-800/60 text-zinc-300">
                <Phone className="w-4 h-4 text-[#f5b800] flex-shrink-0" />
                <a href={`tel:${business.phone}`} className="font-mono hover:text-[#f5b800]">{business.phone}</a>
              </div>

              {business.whatsapp && (
                <div className="flex items-center gap-2.5 py-2 border-b border-zinc-800/60 text-zinc-300">
                  <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer" className="font-mono text-emerald-400 hover:underline">
                    {business.whatsapp}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2.5 py-2 border-b border-zinc-800/60 text-zinc-300">
                <MapPin className="w-4 h-4 text-[#f5b800] flex-shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>

              <div className="flex items-center gap-2.5 py-2 text-zinc-300">
                <Globe className="w-4 h-4 text-[#f5b800] flex-shrink-0" />
                <span>الموقع الإلكتروني متاح</span>
              </div>
            </div>
          </section>

          {/* Location Map */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3">
            <h2 className="text-base font-bold text-white">موقع المنشأة</h2>
            <div className="h-32 sm:h-36 rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-1">
              <MapPin className="w-5 h-5 text-zinc-600" />
              <span>الخريطة التفاعلية</span>
            </div>
          </section>

          {/* Working Hours */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f5b800]" />
              <span>أوقات العمل</span>
            </h2>
            <div className="text-xs text-zinc-300 space-y-1 leading-relaxed pt-1">
              <p>{business.workingHours}</p>
            </div>
          </section>

        </aside>

      </div>

      {/* 🔍 عارض الصور المكبرة لجميع المنشآت مع خاصية التقريب (Zoom In / Zoom Out) */}
      {activeLightboxIndex !== null && business.gallery && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            
            {/* الشريط العلوي للتحكم */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs sm:text-sm font-mono font-bold bg-zinc-900/80 px-3 py-1 rounded-xl border border-zinc-800">
                صورة {activeLightboxIndex + 1} من {business.gallery.length}
              </span>

              <div className="flex items-center gap-2">
                {/* زر التقريب / التصغير */}
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${
                    isZoomed 
                      ? 'bg-[#f5b800] text-zinc-950 border-[#f5b800]' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'
                  }`}
                  title={isZoomed ? 'إلغاء التقريب' : 'تقريب الصورة'}
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isZoomed ? 'تصغير' : 'تقريب'}</span>
                </button>

                {/* زر الإغلاق */}
                <button
                  onClick={() => {
                    setActiveLightboxIndex(null);
                    setIsZoomed(false);
                  }}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* الصورة المعروضة مع دعم التكبير */}
            <div className="w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800 relative">
              <img
                src={business.gallery[activeLightboxIndex]}
                alt={`${business.name} ${activeLightboxIndex + 1}`}
                onClick={() => setIsZoomed(!isZoomed)}
                className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
              />
            </div>

            {/* شريط التنقل بين الصور الأربع */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => {
                  setActiveLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : business.gallery.length - 1));
                  setIsZoomed(false);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 hover:bg-[#f5b800] hover:text-zinc-950 text-white border border-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <div className="flex items-center gap-2">
                {business.gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveLightboxIndex(i);
                      setIsZoomed(false);
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      activeLightboxIndex === i ? 'bg-[#f5b800] w-6' : 'bg-zinc-700 w-2.5'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveLightboxIndex((prev) => (prev! < business.gallery.length - 1 ? prev! + 1 : 0));
                  setIsZoomed(false);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 hover:bg-[#f5b800] hover:text-zinc-950 text-white border border-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">إضافة تقييم لـ {business.name}</h3>
            
            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">اسمك الكامل</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">التقييم</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-[#f5b800] focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-[#f5b800]' : 'text-zinc-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#f5b800] mr-2">{newRating} من 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">تفاصيل المراجعة</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تقييمك عن الخدمة والتجربة..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#f5b800] hover:bg-[#e5aa00] text-zinc-950 font-bold text-xs"
                >
                  نشر التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Business Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">المطالبة بملكية منشأة: {business.name}</h3>
            
            {claimSuccess ? (
              <div className="p-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>تم إرسال طلب المطالبة بنجاح، سيتواصل معك فريق التحقق.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setClaimSuccess(true);
                  setTimeout(() => {
                    setClaimSuccess(false);
                    setClaimModalOpen(false);
                  }, 2500);
                }}
                className="space-y-3 text-xs text-zinc-300"
              >
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  إذا كنت المالك الرسمي أو المفوض لهذه المنشأة، يرجى تزويدنا ببيانات التواصل لإتمام التحقق ومنحك إدارة الصفحة.
                </p>
                <div>
                  <label className="block text-zinc-400 mb-1">اسم المسؤول</label>
                  <input type="text" required placeholder="الاسم الكامل" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#f5b800]" />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">رقم الهاتف / الواتساب</label>
                  <input type="tel" required placeholder="777000000" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#f5b800]" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setClaimModalOpen(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white">إلغاء</button>
                  <button type="submit" className="px-4 py-2 bg-[#f5b800] text-zinc-950 font-bold rounded-lg hover:bg-[#e5aa00]">إرسال الطلب</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default BusinessDetails;
