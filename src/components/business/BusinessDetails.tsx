import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight, 
  Share2, 
  Heart,
  ImageIcon,
  Send,
  Building
} from 'lucide-react';
import { BusinessItem, Review, SAMPLE_ADS } from '../../data/mockData';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import { AdBanner } from '../common/AdBanner';

interface BusinessDetailsProps {
  business: BusinessItem;
  onBack: () => void;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business, onBack }) => {
  const [reviewsList, setReviewsList] = useState<Review[]>(business.reviews);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const category = OFFICIAL_CATEGORIES.find(c => c.slug === business.categorySlug);

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
    <div dir="rtl" className="space-y-6 pb-12">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للنتائج</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-lg border transition-colors ${
              isSaved ? 'bg-amber-400 text-zinc-950 border-amber-400' : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
            title="حفظ في المفضلة"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-zinc-950' : ''}`} />
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="مشاركة الرابط"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Cover & Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
        
        {/* Cover Photo */}
        <div className="h-56 sm:h-72 md:h-80 w-full bg-zinc-800 relative">
          <img src={business.coverImage} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        {/* Business Info Overlay */}
        <div className="relative p-5 sm:p-7 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          
          {/* Business Logo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-950 border-2 border-zinc-700 overflow-hidden shadow-2xl flex-shrink-0">
            <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">{business.name}</h1>
              {business.isVerified && (
                <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  موثق رسمياً
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-400 flex-wrap">
              <span className="bg-zinc-800 px-2.5 py-1 rounded-lg text-amber-300 font-medium">
                {category?.name || 'الخدمات'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-zinc-500" />
                {business.address}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-amber-400 text-zinc-950 text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-zinc-950" />
                <span>{business.rating}</span>
              </div>
              <span className="text-xs text-zinc-400">
                بناءً على ({reviewsList.length} تقييم حقيقي)
              </span>
            </div>
          </div>

          {/* Add Review CTA */}
          <div className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>أضف تقييمك</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Grid: Details + Sidebar Ad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Description + Gallery + Reviews */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Section */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              عن المنشأة
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {business.description}
            </p>
          </div>

          {/* Media Gallery */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              معرض الصور
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {business.gallery.map((img, i) => (
                <div key={i} className="h-32 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700/60 group">
                  <img src={img} alt={`معرض الصور ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>

          {/* In-feed Ad */}
          <AdBanner ad={SAMPLE_ADS[1]} type="in-feed" />

          {/* Customer Reviews Section */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                آراء وتقييمات العملاء ({reviewsList.length})
              </h2>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="text-xs text-amber-400 hover:underline"
              >
                + كتابة مراجعة
              </button>
            </div>

            <div className="space-y-3 divide-y divide-zinc-800/60">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="pt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {rev.userName.charAt(0)}
                      </div>
                      <span className="font-semibold text-xs text-white">{rev.userName}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-3.5 h-3.5 ${
                          index < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-zinc-300 leading-normal">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Contact & Location Info */}
        <div className="space-y-6">
          
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">بيانات التواصل وأوقات العمل</h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-zinc-300">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-zinc-500">رقم الهاتف</span>
                  <a href={`tel:${business.phone}`} className="font-mono hover:text-amber-400">{business.phone}</a>
                </div>
              </div>

              {business.whatsapp && (
                <div className="flex items-start gap-3 text-zinc-300">
                  <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] text-zinc-500">واتساب المباشر</span>
                    <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer" className="font-mono text-emerald-400 hover:underline">
                      {business.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 text-zinc-300">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-zinc-500">أوقات العمل</span>
                  <span>{business.workingHours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-zinc-500">الموقع الجغرافي</span>
                  <span>{business.address}</span>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-32 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-1">
              <MapPin className="w-6 h-6 text-zinc-600" />
              <span>الخريطة التفاعلية متاحة قريباً</span>
            </div>

          </div>

        </div>

      </div>

      {/* Add Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">إضافة تقييم لـ {business.name}</h3>
            
            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">اسمك الكريم</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="مثال: أحمد عبدالكريم"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">تقييمك بالنجوم</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400' : 'text-zinc-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 mr-2">{newRating} من 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">تفاصيل تجربتك أو ملاحظاتك</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب رأيك بكل شفافية لمساعدة الآخرين..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر التقييم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
