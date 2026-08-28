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
  ImageIcon,
  Send,
  Building2,
  Sparkles,
  Check,
  Eye
} from 'lucide-react';
import { BusinessItem, Review } from '../../data/mockData';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import { VerifiedBadge } from '../common/VerifiedBadge';

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
  const [copiedNotification, setCopiedNotification] = useState(false);

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
    <div dir="rtl" className="space-y-6 pb-16">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors shadow-sm"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>الرجوع إلى القائمة</span>
        </button>

        <div className="flex items-center gap-2">
          {copiedNotification && (
            <span className="text-[11px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2.5 py-1 rounded-lg">
              تم نسخ الرابط بنجاح!
            </span>
          )}
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
              isSaved
                ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md font-bold'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-zinc-950' : ''}`} />
            <span>{isSaved ? 'تم الحفظ' : 'حفظ'}</span>
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="مشاركة"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Integrated Business Header Frame */}
      <div className="rounded-3xl overflow-hidden bg-zinc-900/90 border border-zinc-800 shadow-2xl">
        
        {/* Cover Hero Photo */}
        <div className="relative h-60 sm:h-72 md:h-84 w-full bg-zinc-800 overflow-hidden">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-zinc-300 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              {business.stats.viewsCount.toLocaleString()} مشاهدة
            </span>
          </div>
        </div>

        {/* Cohesive Identity Card Body */}
        <div className="p-5 sm:p-7 -mt-16 sm:-mt-20 relative space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 border-b border-zinc-800/80 pb-6">
            
            {/* Logo + Name & Aligned Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full md:w-auto">
              
              {/* Business Logo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-950 border-2 border-zinc-700 p-1 overflow-hidden shadow-2xl flex-shrink-0">
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Title & Neatly Anchored Badge at the exact end of name */}
              <div className="space-y-2 flex-1">
                
                {/* Title + Verification Badge */}
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight inline-flex items-center gap-2 flex-wrap">
                    <span>{business.name}</span>
                    {business.isVerified && (
                      <VerifiedBadge type={business.badgeType} size="lg" />
                    )}
                  </h1>
                </div>

                {/* Subtitle / Category / Location */}
                <div className="flex items-center flex-wrap gap-3 text-xs text-zinc-400">
                  <span className="bg-zinc-800 text-amber-300 px-2.5 py-1 rounded-lg font-medium border border-zinc-700/60">
                    {category?.name || 'الخدمات'}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{business.address}</span>
                  </span>
                </div>

                {/* Rating Overview */}
                <div className="flex items-center gap-3 pt-0.5">
                  <div className="flex items-center gap-1 bg-amber-400 text-zinc-950 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-md shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-zinc-950" />
                    <span>{business.rating}</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    ({reviewsList.length} تقييم حقيقي)
                  </span>
                </div>

              </div>

            </div>

            {/* Quick Interactive Actions */}
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap flex-shrink-0">
              <a
                href={`tel:${business.phone}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>اتصال مباشر</span>
              </a>

              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>واتساب</span>
                </a>
              )}

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/10 transition-all"
              >
                <Star className="w-4 h-4 fill-zinc-950" />
                <span>أضف تقييمك</span>
              </button>
            </div>

          </div>

          {/* Unified Page Body: Two Columns Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Right 2 Columns: Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. About the Establishment */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>نبذة عن المنشأة والخدمات</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                  {business.description}
                </p>
              </div>

              {/* 2. Services & Amenities */}
              {business.amenities && business.amenities.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>المميزات والخدمات المتوفرة</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {business.amenities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-200"
                      >
                        <div className="w-5 h-5 rounded-md bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Photo Gallery */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>معرض الصور والوسائط</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {business.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="h-32 sm:h-36 rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800/80 group shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`${business.name} ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Customer Reviews Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>آراء وتقييمات العملاء ({reviewsList.length})</span>
                  </h2>
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    + أضف مراجعة جديدة
                  </button>
                </div>

                <div className="space-y-3">
                  {reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                            {rev.userName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-white">{rev.userName}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-3.5 h-3.5 ${
                              index < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-800'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Left 1 Column: Contact Specs */}
            <div className="space-y-4">
              
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 space-y-4">
                <h3 className="text-xs font-bold text-white border-b border-zinc-800/80 pb-2.5 tracking-wide">
                  معلومات التواصل وأوقات العمل
                </h3>

                <div className="space-y-3 text-xs">
                  
                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <Phone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-zinc-500">الهاتف المباشر</span>
                      <a href={`tel:${business.phone}`} className="font-mono text-zinc-200 hover:text-amber-400">
                        {business.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-zinc-500">ساعات العمل</span>
                      <span className="text-zinc-200">{business.workingHours}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-zinc-500">العنوان بالتفصيل</span>
                      <span className="text-zinc-200">{business.address}</span>
                    </div>
                  </div>

                </div>

                {/* Map Interactive Placeholder */}
                <div className="h-32 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-1">
                  <MapPin className="w-5 h-5 text-zinc-600" />
                  <span className="text-[11px]">موقع المنشأة على الخريطة</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">إضافة تقييم لـ {business.name}</h3>
            
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
                <label className="block text-xs text-zinc-400 mb-1">التقييم بالنجوم</label>
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
                <label className="block text-xs text-zinc-400 mb-1">تفاصيل تجربتك أو ملاحظاتك</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب رأيك بكل شفافية..."
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
