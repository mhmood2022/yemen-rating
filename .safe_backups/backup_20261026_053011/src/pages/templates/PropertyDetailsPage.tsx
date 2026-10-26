import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building, MapPin, ArrowRight, Lock, Unlock, Maximize2, BedDouble, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../../components/common/AdBanner';

export const PropertyDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

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

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[50vh] flex items-center justify-center font-['Cairo'] text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          <span>جاري تحميل العقار...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-8 text-center font-['Cairo'] text-white">
        <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
        <p className="text-base font-bold">لم يتم العثور على العقار المطلوب</p>
        <button
          onClick={() => navigate('/properties')}
          className="mt-4 px-4 py-2 bg-[#162238] border border-[#D4AF37]/50 text-[#D4AF37] rounded-lg text-xs"
        >
          العودة لقائمة العقارات
        </button>
      </div>
    );
  }

  const images: string[] = Array.isArray(property.images) ? property.images : [];

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="5" className="mb-2" />

      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <button
          onClick={() => navigate('/properties')}
          className="px-3 py-1.5 rounded-lg bg-[#162238] border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1325] transition-all flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rtl:rotate-180" />
          <span>الرجوع للعقارات</span>
        </button>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded bg-[#D4AF37] text-[#0B1325]">
            {property.deal_type || property.dealType || 'عقار'}
          </span>
          <span className="px-2.5 py-1 text-xs font-bold rounded bg-[#0B1325] text-white border border-slate-700">
            {property.property_type || property.propertyType}
          </span>
        </div>
      </div>

      <div className="bg-[#162238] rounded-2xl border border-slate-700/70 p-4 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            {images.length > 0 ? (
              <div className="rounded-xl overflow-hidden bg-[#0B1325] border border-slate-700 h-64 sm:h-80">
                <img src={images[0]} alt={property.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-64 sm:h-80 bg-[#0B1325] rounded-xl border border-slate-700 flex items-center justify-center">
                <Building className="w-16 h-16 text-slate-600" />
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>{property.city} {property.location_details ? `- ${property.location_details}` : ''}</span>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-300">
                {(property.area_m2 || property.area) && (
                  <div className="flex items-center gap-1.5 bg-[#0B1325] px-3 py-1.5 rounded-lg border border-slate-700">
                    <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>المساحة: {property.area_m2 || property.area} م²</span>
                  </div>
                )}
                {property.rooms && (
                  <div className="flex items-center gap-1.5 bg-[#0B1325] px-3 py-1.5 rounded-lg border border-slate-700">
                    <BedDouble className="w-4 h-4 text-[#D4AF37]" />
                    <span>الغرف: {property.rooms}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0B1325] p-4 rounded-xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">القيمة الإجمالية:</span>
                <span className="text-base sm:text-lg font-black text-[#D4AF37]">
                  {property.price ? `${property.price.toLocaleString()} ${property.currency || 'YER'}` : 'عند المعاينة'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800">
                {isRevealed ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Unlock className="w-4 h-4" />
                      <span>تم توجيه طلبك إلى فريق وساطة يمن ريتغ للمعاينة</span>
                    </div>
                    <p className="text-slate-300">سيقوم وسيط المنصة المعتمد بالتنسيق معك فوراً للمعاينة الميدانية.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsRevealed(true)}
                    className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#c5a230] text-[#0B1325] font-black rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>طلب معاينة العقار عبر منصة يمن ريتغ</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
