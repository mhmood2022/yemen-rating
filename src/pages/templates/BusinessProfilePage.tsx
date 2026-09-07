import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, ArrowRight, Share2, CheckCircle2,
  X, ZoomIn, Bed, Wifi, Car, Stethoscope, Users, Truck, Gem,
  Award, Send, Loader2, Frown, Waves, Clock
} from 'lucide-react';
import { AdBanner } from '../../components/common/AdBanner';
import { supabase } from '../../lib/supabase';

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // جلب المنشأة الآمن من Supabase بدون أخطاء الـ UUID
  useEffect(() => {
    let isMounted = true;
    const fetchBusiness = async () => {
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

        let { data, error } = await query.maybeSingle();

        // محاولة بديلة إذا كان الـ slug مسجلاً كـ id
        if (!data && !isUuid) {
          const { data: fallbackData } = await supabase.from('businesses').select('*').eq('name', decodeURIComponent(slug)).maybeSingle();
          data = fallbackData;
        }

        if (!error && data && isMounted) {
          setBusiness(data);
        } else if (isMounted) {
          setBusiness(null);
        }
      } catch (err) {
        console.error('Fetch business error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusiness();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif]">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFC500] mb-2" />
        <p className="text-xs text-zinc-400 font-bold">جاري تحميل بيانات المنشأة...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center font-['Cairo',sans-serif]">
        <Frown className="w-16 h-16 mx-auto text-zinc-600 mb-3" />
        <h2 className="text-lg font-bold text-zinc-200 mb-2">المنشأة غير موجودة أو قيد المراجعة</h2>
        <button
          onClick={() => navigate('/businesses')}
          className="px-5 py-2 bg-[#FFC500] text-zinc-950 font-black rounded-xl text-xs mt-3"
        >
          العودة لدليل المنشآت
        </button>
      </div>
    );
  }

  const feat = business.sections_config?.features || {};
  const galleryList = Array.isArray(business.gallery_urls) ? business.gallery_urls.filter((u: any) => typeof u === 'string' && u.length > 0) : [];
  const hasRating = Number(business.rating) > 0;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-6 py-5 space-y-6 font-['Cairo',sans-serif] text-zinc-100">
      {/* إعلان البنر العلوي */}
      <div className="w-full">
        <AdBanner placementId="1" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition border border-zinc-800 shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع</span>
        </button>
      </div>

      {/* الهيدر والغلاف */}
      <div className="relative bg-[#0B0F19] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="h-56 sm:h-80 w-full bg-zinc-900 relative">
          {business.cover_url ? (
            <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover opacity-85" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-600 text-xs">لا يوجد غلاف معتمد</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
        </div>

        <div className="p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex items-end gap-4">
            {business.logo_url && (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[#0B0F19] p-1.5 shadow-2xl border border-zinc-700 shrink-0">
                <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain rounded-xl" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black text-white">{business.name}</h1>
                {business.is_verified === true && (
                  <span className="bg-emerald-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> معتمد موثق
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 flex-wrap">
                {hasRating && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {Number(business.rating).toFixed(1)}
                  </span>
                )}
                {(business.city || business.address) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{business.address || business.city}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تفاصيل المنشأة الصافية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {business.description && (
            <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-2 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <Award className="w-4 h-4 text-[#FFC500]" />
                <span>عن المنشأة والخدمات</span>
              </h2>
              <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                {business.description}
              </p>
            </div>
          )}

          {/* ميزات النشاط المدخلة فقط */}
          {Object.values(feat).some(val => !!val) && (
            <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-3 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <span>المرافق والخدمات المسجلة</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {feat.has_wifi && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Wifi className="w-4 h-4 text-indigo-400" />
                    <span>واي فاي مجاني</span>
                  </div>
                )}
                {feat.has_pool && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Waves className="w-4 h-4 text-blue-400" />
                    <span>مسبح</span>
                  </div>
                )}
                {feat.has_parking && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>مواقف سيارات</span>
                  </div>
                )}
                {feat.has_emergency && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Stethoscope className="w-4 h-4 text-red-400" />
                    <span>طوارئ 24 ساعة</span>
                  </div>
                )}
                {feat.has_delivery && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>خدمة توصيل</span>
                  </div>
                )}
                {feat.has_family_sections && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>قسم عوائل</span>
                  </div>
                )}
                {feat.rooms_count > 0 && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Bed className="w-4 h-4 text-amber-400" />
                    <span>{feat.rooms_count} غرفة</span>
                  </div>
                )}
                {feat.gold_carat && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Gem className="w-4 h-4 text-yellow-400" />
                    <span>ذهب عيار {feat.gold_carat}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ألبوم الصور */}
          {galleryList.length > 0 && (
            <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-3 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <ZoomIn className="w-4 h-4 text-blue-400" />
                <span>معرض الصور ({galleryList.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {galleryList.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="h-24 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer relative group"
                  >
                    <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* العمود الأيسر: أزرار التواصل وأوقات الدوام المعتمدة */}
        <div className="space-y-5">
          <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md space-y-4">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>معلومات التواصل</span>
            </h3>

            <div className="space-y-2.5">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition">
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال: {business.phone}</span>
                </a>
              )}

              {(business.whatsapp || business.phone) && (
                <a href={`https://wa.me/${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition">
                  <span>محادثة واتساب</span>
                </a>
              )}
            </div>

            {business.sections_config?.working_hours && (
              <div className="border-t border-zinc-800 pt-3 text-xs flex items-center justify-between text-zinc-300">
                <span className="text-zinc-500">ساعات الدوام:</span>
                <span className="font-bold">{business.sections_config.working_hours}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. إعلان البنر السفلي */}
      <div className="w-full pt-2">
        <AdBanner placementId="3" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      {/* نافذة تكبير الصورة */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-10 left-0 text-white p-2">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="تكبير" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-zinc-700" />
          </div>
        </div>
      )}
    </div>
  );
};
