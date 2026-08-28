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
  ExternalLink
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
    <div dir="rtl" className="max-w-6xl mx-auto space-y-5 pb-16">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>الرجوع إلى النتائج</span>
        </button>

        {copiedNotification && (
          <span className="text-[11px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-lg">
            تم نسخ رابط المنشأة بنجاح!
          </span>
        )}
      </div>

      {/* 1. Business Header Section (Cover + Info + Actions) */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#151515] shadow-2xl">
        
        {/* Cover Photo */}
        <div className="relative h-60 sm:h-72 md:h-80 w-full bg-[#1e1e1e] overflow-hidden">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#151515]" />
        </div>

        {/* Business Identity Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 px-6 pb-6 -mt-16 sm:-mt-20 relative z-10 text-center sm:text-right">
          
          {/* Logo */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#222] border-4 border-[#151515] overflow-hidden shadow-2xl flex-shrink-0">
            <img
              src={business.logo}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Identity Details */}
          <div className="flex-1 space-y-1.5 pb-1">
            <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {business.name}
              </h1>
              {business.isVerified && (
                <VerifiedBadge type={business.badgeType || 'gold'} size="md" />
              )}
            </div>

            <div className="text-xs sm:text-sm text-zinc-400">
              <span>{category?.name || 'الخدمات'}</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span>{business.address}</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-amber-400 tracking-wider text-sm">★★★★★</span>
              <span className="font-bold text-sm text-white font-mono">{business.rating}</span>
              <span className="text-xs text-zinc-400">({reviewsList.length} تقييم)</span>
            </div>
          </div>

        </div>

        {/* Actions Button Bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 px-6 pb-6 pt-2 border-t border-zinc-800/80">
          
          <a
            href={`tel:${business.phone}`}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>اتصال</span>
          </a>

          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            className="px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>الموقع</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة</span>
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`px-4 py-2 border text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
              isSaved
                ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                : 'bg-[#202020] hover:bg-zinc-800 text-zinc-200 border-zinc-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-zinc-950' : ''}`} />
            <span>{isSaved ? 'تم الحفظ' : 'حفظ'}</span>
          </button>

          <button
            onClick={() => window.open('#', '_blank')}
            className="px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>الموقع الإلكتروني</span>
          </button>

          <button
            onClick={() => setClaimModalOpen(true)}
            className="px-4 py-2 bg-[#202020] hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-700 text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>المطالبة بملكية المنشأة</span>
          </button>

        </div>

      </section>

      {/* 2. Main Grid Layout (2fr Main Content / 1fr Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Main Column (2fr) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* About Section */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-lg font-bold text-white">عن المنشأة</h2>
            <p className="text-xs sm:text-sm text-[#c7c7c7] leading-relaxed">
              {business.description}
            </p>
          </section>

          {/* Services Section */}
          {business.amenities && business.amenities.length > 0 && (
            <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white">الخدمات</h2>
              <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                {business.amenities.join(' · ')}
              </p>
            </section>
          )}

          {/* Photo Gallery Section */}
          {business.gallery && business.gallery.length > 0 && (
            <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white">معرض الصور</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {business.gallery.map((img, i) => (
                  <div key={i} className="h-36 rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800">
                    <img
                      src={img}
                      alt={`${business.name} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews & Ratings Section */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h2 className="text-lg font-bold text-white">التقييمات والمراجعات</h2>
              <span className="text-xs text-zinc-400">({reviewsList.length} مراجعة)</span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs sm:text-sm text-white">{rev.userName}</div>
                    <span className="text-[11px] text-zinc-500">{rev.date}</span>
                  </div>
                  <div className="text-amber-400 text-xs tracking-wider">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-3.5 h-3.5 fill-zinc-950" />
              <span>أضف تقييمك</span>
            </button>
          </section>

        </div>

        {/* Sidebar Column (1fr) */}
        <aside className="space-y-5">
          
          {/* Ad Slot (مساحة الإعلان) */}
          <div className="min-h-[120px] border border-dashed border-zinc-700/80 rounded-xl bg-[#151515]/60 flex items-center justify-center text-zinc-500 text-xs font-medium">
            مساحة الإعلان
          </div>

          {/* Contact Information Section */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2.5">
              معلومات التواصل
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 py-2 border-b border-zinc-800/60 text-zinc-300">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`tel:${business.phone}`} className="font-mono hover:text-amber-400">{business.phone}</a>
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
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{business.address}</span>
              </div>

              <div className="flex items-center gap-2.5 py-2 text-zinc-300">
                <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>الموقع الإلكتروني متاح</span>
              </div>
            </div>
          </section>

          {/* Business Location Section */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-white">موقع المنشأة</h2>
            <div className="h-36 rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-1">
              <MapPin className="w-5 h-5 text-zinc-600" />
              <span>الخريطة التفاعلية</span>
            </div>
          </section>

          {/* Working Hours Section */}
          <section className="bg-[#151515] border border-zinc-800 rounded-2xl p-5 space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>أوقات العمل</span>
            </h2>
            <div className="text-xs text-zinc-300 space-y-1 leading-relaxed pt-1">
              <p>{business.workingHours}</p>
            </div>
          </section>

        </aside>

      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
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
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-zinc-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 mr-2">{newRating} من 5</span>
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
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
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">المطالبة بملكية منشأة: {business.name}</h3>
            
            {claimSuccess ? (
              <div className="p-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
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
                <p className="text-[11px] text-zinc-400">
                  إذا كنت المالك الرسمي أو المفوض لهذه المنشأة، يرجى تزويدنا ببيانات التواصل لإتمام التحقق ومنحك إدارة الصفحة.
                </p>
                <div>
                  <label className="block text-zinc-400 mb-1">اسم المسؤول</label>
                  <input type="text" required placeholder="الاسم الكامل" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">رقم الهاتف / الواتساب</label>
                  <input type="tel" required placeholder="777000000" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-400" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setClaimModalOpen(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white">إلغاء</button>
                  <button type="submit" className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold rounded-lg hover:bg-amber-300">إرسال الطلب</button>
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
