import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { mapBusinessToPage, BusinessPageRecord } from '../../services/businessPageService';
import { XMarketItem, XMarketDetailView, XImageLightbox } from '../../components/common/XMarketUI';
import { BadgeType } from '../../components/common/VerifiedBadge';

export const PropertyDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any | null>(null);
  const [biz, setBiz] = useState<BusinessPageRecord | null>(null);
  const [prof, setProf] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleGoBack = () => window.history.length > 1 ? navigate(-1) : navigate('/properties');

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

        if (data) {
          const oid = data.owner_user_id || data.owner_id;
          const [bRes, pRes] = await Promise.all([
            data.business_id
              ? supabase.from('businesses').select('*').eq('id', data.business_id).maybeSingle()
              : oid
                ? supabase.from('businesses').select('*').eq('owner_user_id', oid).limit(1).maybeSingle()
                : Promise.resolve({ data: null }),
            oid
              ? supabase.from('profiles').select('id, full_name, avatar_url, phone, email').eq('id', oid).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);
          if (bRes?.data) setBiz(mapBusinessToPage(bRes.data));
          if (pRes?.data) setProf(pRes.data);
        }
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
      <div dir="rtl" className="min-h-screen bg-black flex items-center justify-center font-['Tahoma',sans-serif]">
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
        <button onClick={handleGoBack} className="mt-4 px-5 py-2 bg-[#FFC500] text-black font-bold rounded-full text-xs">رجوع</button>
      </div>
    );
  }

  const rawDt = property.deal_type || property.dealType || property.listing_type;
  const dt = rawDt === 'SALE' ? 'بيع' : rawDt === 'RENT' ? 'إيجار' : (rawDt || 'متاح');
  const pt = property.property_type || property.propertyType || 'عقار';
  const area = property.area_sqm || property.area_m2 || property.area;
  const rooms = property.bedrooms || property.rooms;
  const images: string[] = Array.isArray(property.image_urls)
    ? property.image_urls
    : (Array.isArray(property.images) ? property.images : []);

  const xItem: XMarketItem = {
    id: property.id,
    detailPath: `/properties/${property.id}`,
    actionLabel: images.length > 0 ? `عرض الصور (${images.length})` : 'التفاصيل',
    actionIcon: images.length > 0 ? <Camera size={14.5} /> : undefined,
    onAction: () => { if (images.length > 0) setIsLightboxOpen(true); },
    authorName: biz?.name || prof?.full_name || `${pt} (${dt})`,
    authorUsername: biz?.username || (prof?.email ? prof.email.split('@')[0] : (property.city || 'realestate')),
    authorAvatar: biz?.avatarUrl || prof?.avatar_url || '',
    badgeType: biz ? ((biz.verificationType as BadgeType) || (biz.isVerified ? 'gold' : 'none')) : 'none',
    businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined,
    createdAt: property.created_at,
    title: property.title,
    priceText: property.price ? `${Number(property.price).toLocaleString()} ${property.currency || 'YER'}` : 'عند المعاينة',
    description: property.district || property.description || property.location_details || '',
    metaParts: [
      `${pt} · ${dt}`,
      area ? `${area} م²` : '',
      rooms ? `${rooms} غرف` : '',
      property.city || '',
    ].filter(Boolean),
    tagLabel: `${pt} · ${dt}`,
    images,
    city: property.city,
    phone: property.phone || biz?.phone || prof?.phone || '',
  };

  return (
    <div dir="rtl" className="min-h-screen bg-black text-white font-['Tahoma',sans-serif]">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] bg-[#FFC500] text-black px-4 py-2 rounded-xl font-bold text-xs shadow-2xl">{toast}</div>}
      <XMarketDetailView
        item={xItem}
        activeImageIndex={activeImageIndex}
        onChangeImageIndex={setActiveImageIndex}
        onBack={handleGoBack}
        onOpenLightbox={() => setIsLightboxOpen(true)}
        onShare={() => {
          navigator.clipboard?.writeText(window.location.href);
          setToast('تم نسخ الرابط');
          setTimeout(() => setToast(null), 2500);
        }}
      />
      <XImageLightbox
        isOpen={isLightboxOpen}
        item={xItem}
        activeIndex={activeImageIndex}
        onChangeIndex={setActiveImageIndex}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
};
