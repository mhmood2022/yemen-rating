import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, ArrowRight, ShieldCheck,
  X, ZoomIn, Bed, Wifi, Car, Stethoscope, Users, Truck, Gem,
  Loader2, Frown, Waves, MessageCircle, Send, Heart
} from 'lucide-react';
import { AdBanner } from '../../components/common/AdBanner';
import { supabase } from '../../lib/supabase';


function OfficialVerifiedBadge({ type = 'gold', size = 18 }: { type?: string; size?: number }) {
  let badgeColor = '#FFC500';
  if (type === 'blue') badgeColor = '#1D9BF0';
  if (type === 'silver' || type === 'gray') badgeColor = '#9CA3AF';

  return (
    <svg
      className="inline-block select-none shrink-0 align-middle"
      style={{ width: size, height: size, color: badgeColor }}
      viewBox="0 0 24 24"
      title="موثق رسمياً"
    >
      <path
        d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.15-.44.24-.91.24-1.4 0-2.21-1.79-4-4-4-.49 0-.96.08-1.4.24C14.55 2.48 13.18 1.6 11.6 1.6c-1.58 0-2.95.88-3.6 2.15-.44-.16-.91-.25-1.4-.25-2.21 0-4 1.79-4 4 0 .49.08.96.24 1.4C1.58 9.55.7 10.92.7 12.5c0 1.58.88 2.95 2.15 3.6-.16.44-.25.91-.25 1.4 0 2.21 1.79 4 4 4 .49 0 .96-.08 1.4-.24.65 1.27 2.02 2.14 3.6 2.14 1.58 0 2.95-.87 3.6-2.14.44.16.91.24 1.4.24 2.21 0 4-1.79 4-4 0-.49-.08-.96-.24-1.4 1.27-.65 2.14-2.02 2.14-3.6z"
        fill="currentColor"
      />
      <path
        d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.9-5.9 1.4 1.4-7.3 7.3z"
        fill="#FFFFFF"
      />
    </svg>
  );
}


export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'services' | 'reviews' | 'contact'>('photos');

  // نظام التقييم الحقيقي المربوط بقاعدة البيانات
  const [reviews, setReviews] = useState<any[]>([]);
  const [userStars, setUserStars] = useState<number>(5);
  const [userName, setUserName] = useState<string>('');
  const [userComment, setUserComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBusinessAndReviews = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

        let query = supabase.from('businesses').select('*');
        if (isUuid) {
          query = query.eq('id', slug);
        } else {
          query = query.eq('slug', slug);
        }

        let { data: bData, error } = await query.maybeSingle();

        if (!bData && !isUuid) {
          const { data: fallbackData } = await supabase.from('businesses').select('*').eq('name', decodeURIComponent(slug)).maybeSingle();
          bData = fallbackData;
        }

        if (bData && isMounted) {
          setBusiness(bData);

          // جلب التقييمات الحقيقية من جدول reviews
          const { data: rData } = await supabase
            .from('reviews')
            .select('*')
            .eq('entity_id', bData.id)
            .order('created_at', { ascending: false });

          setReviews(rData || []);
        } else if (isMounted) {
          setBusiness(null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusinessAndReviews();
    return () => { isMounted = false; };
  }, [slug]);

  // إرسال تقييم حقيقي لقاعدة البيانات
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !business) return;
    setSubmittingReview(true);

    try {
      const newReview = {
        entity_id: business.id,
        entity_type: 'business',
        user_name: userName.trim(),
        rating: userStars,
        comment: userComment.trim() || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('reviews').insert([newReview]);
      if (!error) {
        setReviews([newReview, ...reviews]);
        setReviewSuccess(true);
        setUserName('');
        setUserComment('');
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif] bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFC500] mb-2" />
        <p className="text-xs text-zinc-400 font-bold">جاري تحميل بيانات المنشأة...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center font-['Cairo',sans-serif] bg-black">
        <Frown className="w-16 h-16 mx-auto text-zinc-600 mb-3" />
        <h2 className="text-lg font-bold text-zinc-200 mb-2">المنشأة غير موجودة</h2>
        <button
          onClick={() => navigate('/businesses')}
          className="px-5 py-2 bg-[#FFC500] text-zinc-950 font-black rounded-xl text-xs mt-3"
        >
          العودة للدليل
        </button>
      </div>
    );
  }

  const isVerified = business.is_verified === true;
  const feat = business.sections_config?.features || {};
  const galleryList = Array.isArray(business.gallery_urls) ? business.gallery_urls.filter((u: any) => typeof u === 'string' && u.length > 0) : [];
  const ratingCount = reviews.length || Number(business.review_count) || 0;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, cur) => acc + (Number(cur.rating) || 5), 0) / reviews.length).toFixed(1)
    : (Number(business.rating) > 0 ? Number(business.rating).toFixed(1) : null);

  return (
    <main dir="rtl" className="w-full max-w-md md:max-w-3xl lg:max-w-4xl min-h-screen bg-black flex flex-col pb-12 select-none relative mx-auto md:px-4 font-['Cairo',sans-serif] text-zinc-100">
      {/* 1. غلاف المنشأة الانسيابي مع زر الرجوع الأيقوني الفاخر */}
      <div className="relative w-full h-44 sm:h-52 md:h-60 rounded-none md:rounded-2xl bg-gradient-to-r from-[#002244] via-[#003B73] to-[#0A4D80] flex items-center justify-center overflow-hidden mt-0 md:mt-3 shadow-lg">
        {business.cover_url ? (
          <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">لا يوجد غلاف معتمد</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <button
          type="button"
          onClick={() => window.history.length > 1 ? window.history.back() : navigate('/businesses')}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-[#FFC500] flex items-center justify-center transition active:scale-90 shadow-md cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. الشعار متداخل في اليمين (-mt-10) + زر إثبات الملكية في اليسار */}
      <div className="px-4 relative flex items-end justify-between -mt-10 mb-2">
        <div className="relative order-1">
          <div className="w-20 h-20 rounded-2xl shadow-2xl border-2 border-black flex items-center justify-center overflow-hidden bg-[#0B0F17]">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain p-1" />
            ) : (
              <Store className="w-8 h-8 text-zinc-600" />
            )}
          </div>
        </div>

        <div className="order-2 mb-1">
          {!isVerified && (
            <a
              href={`https://wa.me/967770000000?text=${encodeURIComponent('طلب إثبات ملكية المنشأة: ' + business.name)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#EF4444] hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg transition active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>إثبات الملكية</span>
            </a>
          )}
        </div>
      </div>

      {/* 3. بيانات المنشأة الأساسية بانسيابية تامة وبدون أي مربعات معزولة */}
      <div className="px-4 space-y-1.5 text-right">
        <div className="inline-flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl font-black text-white leading-snug inline">
            {business.name}
          </h1>
          {isVerified && <OfficialVerifiedBadge type={business.badge_type || 'gold'} size={20} />}
        </div>

        {/* سطر التقييمات الطبيعي */}
        <div className="flex items-center justify-start gap-1.5 text-[#FFC500] text-xs font-bold">
          <span className="text-white font-medium text-[11px]">★التقييمات</span>
          <Star className="w-3.5 h-3.5 fill-[#FFC500]" />
          {avgRating ? (
            <>
              <span className="text-white text-sm font-black">{avgRating}</span>
              <span className="text-zinc-400 font-normal text-[11px]">({ratingCount} تقييم)</span>
            </>
          ) : (
            <span className="text-zinc-400 font-normal text-[11px]">لا توجد تقييمات بعد</span>
          )}
        </div>

        {/* النبذة الانسيابية المتصلة مباشرة */}
        {business.description && (
          <p className="text-zinc-300 text-xs leading-relaxed font-medium pt-1">
            {business.description}
          </p>
        )}

        {/* أوسمة الموقع والمدينة والنشاط */}
        <div className="flex items-center justify-start gap-3 text-xs font-semibold text-zinc-400 pt-1 pb-2 flex-wrap">
          {(business.city || business.address) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFC500]" />
              <span>{business.address || business.city}</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. شريط التبويبات الفاخر المطابق لصفحة البنك (الصورة 2) */}
      <div className="px-4 border-b border-zinc-900 mt-2">
        <div className="flex items-center gap-6 text-xs font-black">
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-2.5 transition relative ${
              activeTab === 'photos' ? 'text-[#FFC500]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            معرض الصور
            {activeTab === 'photos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`pb-2.5 transition relative ${
              activeTab === 'services' ? 'text-[#FFC500]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            المرافق والخدمات
            {activeTab === 'services' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 transition relative ${
              activeTab === 'reviews' ? 'text-[#FFC500]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            التقييمات ({ratingCount})
            {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`pb-2.5 transition relative ${
              activeTab === 'contact' ? 'text-[#FFC500]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            التواصل والدوام
            {activeTab === 'contact' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
          </button>
        </div>
      </div>

      {/* 5. محتوى التبويبات الانسيابي */}
      <div className="px-4 pt-4">
        {/* تبويب الصور: شبكة بوسترات نظيفة (مثل بوسترات الكريمي في الصورة 2) */}
        {activeTab === 'photos' && (
          <div>
            {galleryList.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {galleryList.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-[#FFC500]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-zinc-500 py-10">لا توجد صور إضافية لهذه المنشأة</p>
            )}
          </div>
        )}

        {/* تبويب الخدمات والمرافق */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {feat.rooms_count > 0 && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Bed className="w-4 h-4 text-amber-400" /> <span>{feat.rooms_count} غرفة</span>
                </div>
              )}
              {feat.has_pool && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Waves className="w-4 h-4 text-blue-400" /> <span>مسبح متوفر</span>
                </div>
              )}
              {feat.has_wifi && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Wifi className="w-4 h-4 text-indigo-400" /> <span>واي فاي مجاني</span>
                </div>
              )}
              {feat.has_parking && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Car className="w-4 h-4 text-emerald-400" /> <span>مواقف سيارات</span>
                </div>
              )}
              {feat.has_emergency && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Stethoscope className="w-4 h-4 text-red-400" /> <span>طوارئ 24 ساعة</span>
                </div>
              )}
              {feat.has_delivery && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Truck className="w-4 h-4 text-emerald-400" /> <span>خدمة توصيل</span>
                </div>
              )}
              {feat.has_family_sections && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Users className="w-4 h-4 text-amber-400" /> <span>أقسام عوائل</span>
                </div>
              )}
              {feat.gold_carat && (
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                  <Gem className="w-4 h-4 text-yellow-400" /> <span>ذهب عيار {feat.gold_carat}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* تبويب التقييمات: نظام حقيقي كامل مع نموذج الإرسال المتصل بـ Supabase */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            {/* نموذج التقييم الحقيقي */}
            <form onSubmit={handleSubmitReview} className="bg-[#0B0F17] p-4 rounded-2xl border border-zinc-800/90 space-y-3">
              <h3 className="text-xs font-black text-white">هل تعاملت مع هذه المنشأة؟ شارك تجربتك الحقيقية:</h3>

              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    onClick={() => setUserStars(s)}
                    className={`w-6 h-6 cursor-pointer ${s <= userStars ? 'text-[#FFC500] fill-[#FFC500]' : 'text-zinc-700'}`}
                  />
                ))}
              </div>

              <input
                type="text"
                placeholder="اسمك الكريم"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full bg-black border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 px-3.5 py-2.5 rounded-xl text-xs outline-none transition"
              />

              <textarea
                placeholder="اكتب ملاحظاتك وتجربتك بأمانة..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows={2}
                className="w-full bg-black border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 p-3 rounded-xl text-xs outline-none transition"
              />

              {reviewSuccess && (
                <p className="text-emerald-400 text-xs font-bold text-center">تم إرسال تقييمك وحفظه بنجاح!</p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-[#FFC500] hover:bg-amber-400 text-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'جاري الإرسال...' : 'قيّم هذه المنشأة'}</span>
              </button>
            </form>

            {/* قائمة التقييمات المحفوظة */}
            <div className="space-y-2.5">
              {reviews.map((rev, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rev.user_name}</span>
                    <div className="flex text-[#FFC500] text-xs">
                      {Array.from({ length: Number(rev.rating) || 5 }).map((_, si) => (
                        <Star key={si} className="w-3 h-3 fill-[#FFC500]" />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-xs text-zinc-300 leading-relaxed">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تبويب التواصل والدوام */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي مباشر: {business.phone}</span>
                </a>
              )}

              {(business.whatsapp || business.phone) && (
                <a
                  href={`https://wa.me/${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة واتساب سريعة</span>
                </a>
              )}
            </div>

            {business.sections_config?.working_hours && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-xs flex items-center justify-between text-zinc-300">
                <span className="text-zinc-500">ساعات الدوام:</span>
                <span className="font-bold text-white">{business.sections_config.working_hours}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <AdBanner placementId="3" className="mt-6 px-4" />

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-2xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-10 left-0 text-white p-2">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-zinc-800" />
          </div>
        </div>
      )}
    </main>
  );
};
