import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building, MapPin, ArrowRight, Lock, Unlock, Maximize2, BedDouble, AlertCircle, X, Camera, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../../components/common/AdBanner';

export const PropertyDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // تمرير الصور باللمس وعارض X بكامل الشاشة
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef(0);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/properties');
    }
  };

  useEffect(() => {
    async function fetchProperty() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', slug)
          .maybeSingle();

        if (error) throw error;
        setProperty(data);
      } catch (err: any) {
        setError(err.message || 'تعذر تحميل بيانات العقار');
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [slug]);

  const images: string[] = Array.isArray(property?.images) ? property.images : [];

  const onImgTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onImgTouchEnd = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-black flex items-center justify-center font-['Tahoma',sans-serif] text-[#71767B]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#FFC500] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-white">جاري تحميل العقار...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div dir="rtl" className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center font-['Tahoma',sans-serif] text-white">
        <AlertCircle className="w-10 h-10 text-[#FFC500] mb-3" />
        <p className="text-sm font-bold">لم يتم العثور على العقار المطلوب</p>
        <button
          onClick={handleGoBack}
          className="mt-4 px-5 py-2 bg-[#FFC500] text-black font-bold rounded-full text-xs"
        >
          رجوع
        </button>
      </div>
    );
  }

  const dealType = property.deal_type || property.dealType || 'عقار';
  const propType = property.property_type || property.propertyType || 'عقار';

  return (
    <div dir="rtl" className="min-h-screen bg-black text-white font-['Tahoma',sans-serif] pb-20">
      {/* شريط X العلوي الثابت */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-[#2F3336]/50 px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="w-9 h-9 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition cursor-pointer"
            title="رجوع"
          >
            <ArrowRight size={18} />
          </button>
          <span className="text-[15px] font-bold text-white">تفاصيل العقار</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-white text-black">
            {dealType}
          </span>
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full border border-[#2F3336] text-[#E7E9EA]">
            {propType}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto divide-y divide-[#2F3336]/40">
        <div className="px-3 pt-2.5 pb-1.5">
          <AdBanner placementId="5" />
        </div>

        {/* منشور العقار بنكهة X */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 text-[#FFC500]">
              <Building size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-white text-[14.5px]">{propType} · {dealType}</span>
                <ShieldCheck size={14} className="text-[#FFC500] shrink-0" />
              </div>
              <div className="text-[12px] text-[#71767B] flex items-center gap-1">
                <MapPin size={12} />
                <span>@{property.city}{property.location_details ? ` · ${property.location_details}` : ''}</span>
              </div>
            </div>
          </div>

          <h1 className="text-[16px] font-bold text-white leading-relaxed">
            {property.title}
          </h1>

          <div className="text-[15px] font-bold text-[#FFC500] font-mono">
            {property.price ? `${property.price.toLocaleString()} ${property.currency || 'YER'}` : 'السعر عند المعاينة'}
          </div>

          <div className="flex flex-wrap gap-2 text-[12px]">
            {(property.area_m2 || property.area) && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#2F3336] text-[#E7E9EA]">
                <Maximize2 size={12} className="text-[#FFC500]" />
                المساحة: {property.area_m2 || property.area} م²
              </span>
            )}
            {property.rooms && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#2F3336] text-[#E7E9EA]">
                <BedDouble size={12} className="text-[#FFC500]" />
                الغرف: {property.rooms}
              </span>
            )}
          </div>

          {/* معرض صور بنمط X مع التمرير باللمس */}
          {images.length > 0 ? (
            <div className="space-y-2">
              <div
                className="relative rounded-2xl overflow-hidden border border-[#2F3336]/60 bg-black cursor-pointer select-none"
                onTouchStart={onImgTouchStart}
                onTouchEnd={onImgTouchEnd}
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={images[activeImageIndex]}
                  alt={property.title}
                  className="w-full max-h-[400px] object-cover transition-all duration-200"
                />
                {images.length > 1 && (
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[11px] font-bold border border-white/10 flex items-center gap-1">
                    <Camera size={11} /> {activeImageIndex + 1} / {images.length}
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-0.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-[#2F3336]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-44 bg-black rounded-2xl border border-[#2F3336]/60 flex items-center justify-center text-[#71767B]">
              <Building className="w-10 h-10 opacity-40" />
            </div>
          )}
        </div>

        {/* زر طلب المعاينة بنمط X */}
        <div className="p-3.5">
          {isRevealed ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Unlock className="w-4 h-4" />
                <span>تم توجيه طلبك إلى فريق وساطة يمن ريتنج للمعاينة</span>
              </div>
              <p className="text-[#D6D9DB]">سيقوم وسيط المنصة المعتمد بالتنسيق معك فوراً للمعاينة الميدانية.</p>
            </div>
          ) : (
            <button
              onClick={() => setIsRevealed(true)}
              className="w-full py-2.5 bg-[#FFC500] hover:bg-[#e6b100] text-black font-bold rounded-full text-[13px] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>طلب معاينة العقار عبر منصة يمن ريتنج</span>
            </button>
          )}
        </div>
      </div>

      {/* عارض X بكامل الشاشة مع التمرير باللمس */}
      {isLightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col justify-between p-4 select-none"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={onImgTouchStart}
          onTouchEnd={onImgTouchEnd}
        >
          <div className="flex justify-between items-center pt-1" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-[#71767B] font-mono">
              {activeImageIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeImageIndex]}
              alt={property.title}
              className="max-h-[78vh] max-w-full object-contain rounded-2xl"
            />
          </div>

          {images.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 pb-4" onClick={(e) => e.stopPropagation()}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-[#2F3336]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
