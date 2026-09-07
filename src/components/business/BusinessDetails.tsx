import React, { useState } from 'react';
import {
  Star, MapPin, Phone, ArrowRight, Share2, ShieldCheck, CheckCircle2,
  MessageCircle, X, ZoomIn, Bed, Wifi, Car, Stethoscope, Sparkles,
  Users, Truck, Gem, Award, Send
} from 'lucide-react';
import { BusinessItem } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';

interface BusinessDetailsProps {
  business: BusinessItem;
  onBack: () => void;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSent, setReviewSent] = useState<boolean>(false);

  const imagesList = Array.isArray(business.images) && business.images.length > 0
    ? business.images
    : [business.coverImage];

  const feat = (business.sectionsConfig as any)?.features || {};

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text: `اطلع على تقييم وتفاصيل ${business.name} على دليل اليمن الوطني`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ رابط المنشأة بنجاح!');
      }
    } catch (e) {
      console.warn('Share canceled:', e);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSent(true);
    setTimeout(() => {
      setReviewName('');
      setReviewComment('');
    }, 2000);
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6 font-['Cairo',sans-serif]">
      {/* 🌟 1. إعلان البنر العلوي */}
      <div className="w-full">
        <AdBanner placementId="1" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition border border-zinc-800 shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع للقائمة</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition border border-zinc-800"
        >
          <Share2 className="w-4 h-4 text-amber-400" />
          <span>مشاركة</span>
        </button>
      </div>

      {/* الهيدر البانورامي والشعار */}
      <div className="relative bg-[#0B0F19] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="h-64 sm:h-96 w-full bg-zinc-900 relative">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-20 sm:-mt-24 relative z-10">
          <div className="flex items-end gap-5">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[#0B0F19] p-2 shadow-2xl border-2 border-[#FFC500]/50 shrink-0">
              <img src={business.logo} alt={business.name} className="w-full h-full object-contain rounded-2xl" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {business.name}
                </h1>
                {business.isVerified ? (
                  <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> موثّق معتمد
                  </span>
                ) : (
                  <span className="bg-amber-500 text-zinc-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> غير مطالب به
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1 text-amber-400 font-black">
                  <Star className="w-4 h-4 fill-amber-400" /> {business.rating} ({business.reviewsCount} تقييم)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{business.address || business.cityId || 'الجمهورية اليمنية'}</span>
                </span>
              </div>
            </div>
          </div>

          {!business.isVerified && (
            <div className="w-full sm:w-auto">
              <a
                href={`https://wa.me/967770000000?text=${encodeURIComponent('السلام عليكم، أرغب بطلب إثبات ملكية وإدارة المنشأة: ' + business.name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-[#FFC500] text-zinc-950 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl hover:opacity-95 transition"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>هل أنت المالك؟ اثبت ملكيتك فوراً</span>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0B0F19] p-6 rounded-3xl border border-zinc-800 shadow-md">
            <h2 className="text-base font-black text-white mb-3 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Award className="w-5 h-5 text-[#FFC500]" />
              <span>نبذة عن المنشأة والخدمات</span>
            </h2>
            <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
              {business.description || 'منشأة يمنية رائدة تقدم أرقى الخدمات والمنتجات لعملائها بأعلى معايير الجودة والالتزام.'}
            </p>
          </div>

          <div className="bg-[#0B0F19] p-6 rounded-3xl border border-zinc-800 shadow-md">
            <h2 className="text-base font-black text-white mb-4 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>المرافق والخدمات المتوفرة</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {feat.has_wifi && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Wifi className="w-4 h-4 text-indigo-400" />
                  <span>واي فاي مجاني</span>
                </div>
              )}
              {feat.has_pool && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Waves className="w-4 h-4 text-blue-400" />
                  <span>مسبح خاص/عام</span>
                </div>
              )}
              {feat.has_parking && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span>مواقف سيارات</span>
                </div>
              )}
              {feat.has_emergency && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Stethoscope className="w-4 h-4 text-red-400" />
                  <span>طوارئ 24 ساعة</span>
                </div>
              )}
              {feat.has_delivery && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>خدمة توصيل سريعة</span>
                </div>
              )}
              {feat.has_family_sections && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>أقسام عوائل مستقلة</span>
                </div>
              )}
              {feat.rooms_count > 0 && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Bed className="w-4 h-4 text-amber-400" />
                  <span>{feat.rooms_count} غرفة وجناح</span>
                </div>
              )}
              {feat.gold_carat && (
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-200">
                  <Gem className="w-4 h-4 text-yellow-400" />
                  <span>ذهب عيار {feat.gold_carat}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0B0F19] p-6 rounded-3xl border border-zinc-800 shadow-md">
            <h2 className="text-base font-black text-white mb-4 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <ZoomIn className="w-5 h-5 text-blue-400" />
              <span>معرض الصور والمرافق ({imagesList.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagesList.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="h-28 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer relative group"
                >
                  <img
                    src={img}
                    alt={`صورة ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <ZoomIn className="w-6 h-6 text-[#FFC500]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0B0F19] p-6 rounded-3xl border border-zinc-800 shadow-md space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>تقييمات وآراء العملاء</span>
            </h2>

            {reviewSent ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold text-center">
                شكراً لك! تم إرسال تقييمك بنجاح وسيتم اعتماده بعد المراجعة.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <p className="text-xs font-bold text-zinc-300">أضف تقييمك وتجربتك لهذه المنشأة:</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                      key={num}
                      onClick={() => setReviewRating(num)}
                      className={`w-6 h-6 cursor-pointer ${num <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="اسمك الكامل"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full bg-[#0E1422] border border-zinc-800 text-zinc-100 placeholder-zinc-500 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#FFC500]"
                />
                <textarea
                  placeholder="اكتب تفاصيل تجربتك بكل أمانة..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0E1422] border border-zinc-800 text-zinc-100 placeholder-zinc-500 p-3 rounded-xl text-xs outline-none focus:border-[#FFC500]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FFC500] hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال التقييم</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0B0F19] p-6 rounded-3xl border border-zinc-800 shadow-md sticky top-20 space-y-5">
            <h3 className="font-black text-white pb-3 border-b border-zinc-800 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>التواصل والحجز المباشر</span>
            </h3>

            <div className="space-y-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg text-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
              )}

              {(business.whatsapp || business.phone) && (
                <a
                  href={`https://wa.me/${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg text-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة واتساب سريعة</span>
                </a>
              )}
            </div>

            <div className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">ساعات العمل:</span>
                <span className="font-bold text-zinc-200">
                  {(business.sectionsConfig as any)?.working_hours || 'على مدار 24 ساعة'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">المدينة / الفرع:</span>
                <span className="font-bold text-zinc-200">{business.cityId || 'المركز الرئيسي'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">حالة الاعتماد:</span>
                <span className={`font-black ${business.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {business.isVerified ? 'موثق ومعتمد رسمي' : 'غير مطالب به'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full pt-4">
        <AdBanner placementId="3" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 left-0 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="تكبير" className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl border border-zinc-700" />
          </div>
        </div>
      )}
    </div>
  );
};
