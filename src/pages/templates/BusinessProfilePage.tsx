import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, Globe, Mail, 
  MessageCircle, Star, ArrowRight, Check, Camera, 
  X, ExternalLink, Megaphone, ShieldCheck, Tag, 
  Share2, Info, CheckCircle2
} from 'lucide-react';
import { BusinessEntity } from '../../types/schema.types';
import { BusinessService } from '../../services/platformServices';
import { YRBadge } from '../../components/common/YRBadge';
import { AdBanner } from '../../components/common/AdBanner';
import { YRReviewSystem } from '../../components/common/YRReviewSystem';
import { ClaimOwnershipModal } from '../../components/claim/ClaimOwnershipModal';

export const BusinessProfilePage: React.FC<{
  initialData?: BusinessEntity;
}> = ({ initialData }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const businessData: BusinessEntity = initialData || BusinessService.getDemoRecord();

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const gallery = businessData.media.filter(m => m.media_type === 'image');

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || gallery.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) setActiveGalleryIndex(prev => (prev + 1) % gallery.length);
      else setActiveGalleryIndex(prev => (prev - 1 + gallery.length) % gallery.length);
    }
    touchStartX.current = null;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر #4 */}
      <AdBanner placementId="4" className="mb-1" />

      {/* 2. شريط التنقل العلوي الأنيق */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-xl bg-[#121215] border border-[#27272A] hover:border-[#FFC500] text-xs font-bold text-gray-200 hover:text-[#FFC500] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight size={14} className="rtl:rotate-180" />
          <span>رجوع</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#121215] border border-[#27272A] hover:border-[#FFC500] text-gray-300 hover:text-[#FFC500] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} className="text-[#FFC500]" />
            <span>توثيق الملكية</span>
          </button>

          <button
            onClick={() => navigate('/admin/ads/generator')}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 shadow-md shadow-[#FFC500]/20 cursor-pointer"
          >
            <Megaphone size={13} />
            <span>أعلن هنا</span>
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="p-2.5 bg-[#16A34A]/20 border border-[#16A34A] rounded-xl text-xs font-bold text-white flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-[#16A34A]" />
          <span>تم نسخ رابط صفحة المنشأة بنجاح</span>
        </div>
      )}

      {/* 3. كرت المنشأة الرئيسي المصمم بالمعايير العالمية */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] overflow-hidden shadow-xl">
        
        {/* صورة الغلاف العريضة */}
        <div className="relative h-36 sm:h-52 w-full bg-[#161619] overflow-hidden">
          <img 
            src={businessData.cover_url} 
            alt={businessData.name} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-transparent" />
        </div>

        {/* جسم الهيدر والشعار بدون ستروك أصفر مشوه */}
        <div className="p-4 sm:p-5 relative -mt-10 sm:-mt-12 space-y-3.5">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            
            {/* الشعار والاسم والمعلومات الملتصقة */}
            <div className="flex items-end gap-3.5">
              {/* شعار نظيف بدون ستروك أصفر */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#121215] border border-[#27272A] p-1 shadow-2xl shrink-0 overflow-hidden">
                <img 
                  src={businessData.logo_url} 
                  alt={businessData.name} 
                  className="w-full h-full object-cover rounded-xl" 
                />
              </div>

              <div className="space-y-1">
                {/* اسم المنشأة والشارة ملتصقة في سطر واحد */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-lg font-black text-white leading-tight">
                    {businessData.name}
                  </h1>
                  <YRBadge type={businessData.badge_type || 'gold'} size={18} showTooltip />
                </div>

                {/* التصنيف والموقع والتقييم المتناسق */}
                <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] flex-wrap">
                  <span className="px-2 py-0.2 rounded-md bg-[#18181C] text-gray-300 font-bold border border-[#27272A]">
                    {businessData.category_label}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-gray-300">
                    <MapPin size={11} className="text-[#FFC500]" /> {businessData.city_name}
                  </span>
                  <span>•</span>
                  <span className="text-[#FFC500] font-bold flex items-center gap-0.5 font-mono">
                    ★ {businessData.rating_summary.average.toFixed(1)} ({businessData.rating_summary.count})
                  </span>
                </div>
              </div>
            </div>

            {/* زر المشاركة */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#FFC500] text-gray-300 hover:text-white transition-all w-fit"
              title="مشاركة الصفحة"
            >
              <Share2 size={14} />
            </button>
          </div>

          {/* 4. شريط الإجراءات والتواصل الموحد والمتناسق */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1F2937]">
            {businessData.phone && (
              <a
                href={`tel:${businessData.phone}`}
                className="py-2 px-3 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#FFC500] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Phone size={13} className="text-[#FFC500]" />
                <span>اتصال</span>
              </a>
            )}

            {businessData.whatsapp && (
              <a
                href={`https://wa.me/${businessData.whatsapp}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن خدمات ${businessData.name} عبر منصة يمن ريتغ`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#16A34A] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <MessageCircle size={13} className="text-[#16A34A]" />
                <span>واتساب</span>
              </a>
            )}

            {businessData.website_url && (
              <a
                href={businessData.website_url}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#2EA5FF] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Globe size={13} className="text-[#2EA5FF]" />
                <span>الموقع</span>
              </a>
            )}

            {businessData.address && (
              <div className="py-2 px-3 rounded-xl bg-[#161619] border border-[#27272A] text-xs font-bold text-gray-300 flex items-center justify-center gap-1 col-span-3 sm:col-span-1 truncate">
                <MapPin size={13} className="text-[#FFC500] shrink-0" />
                <span className="truncate">{businessData.address.split('—')[0]}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. نبذة عن المنشأة */}
      {businessData.description && (
        <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#222226] space-y-1.5 shadow-md">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Info size={14} className="text-[#FFC500]" /> عن المنشأة
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-medium">
            {businessData.description}
          </p>
        </div>
      )}

      {/* 6. قائمة الخدمات والأسعار المنظمة بدقة */}
      {businessData.services && businessData.services.length > 0 && (
        <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#222226] space-y-2.5 shadow-md">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
            <Tag size={14} className="text-[#FFC500]" /> الخدمات والأسعار
          </h3>

          <div className="space-y-1.5">
            {businessData.services.map((srv, idx) => (
              <div 
                key={idx} 
                className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A] flex items-center justify-between text-xs"
              >
                <span className="font-bold text-white">{srv.name}</span>
                {srv.price && (
                  <div className="font-mono font-bold text-white flex items-baseline gap-1">
                    <span>{srv.price.toLocaleString()}</span>
                    <span className="text-[#FFC500] font-black text-[11px]">﷼</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. معرض الصور باللمس */}
      {gallery.length > 0 && (
        <div className="bg-[#0F0F12] p-4 rounded-2xl border border-[#222226] space-y-2.5 shadow-md">
          <div className="flex justify-between items-center border-b border-[#1F2937] pb-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Camera size={14} className="text-[#FFC500]" /> معرض الصور ({gallery.length})
            </h3>
            <span className="text-[10px] text-gray-400">اضغط للتكبير</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {gallery.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => { setActiveGalleryIndex(idx); setIsLightboxOpen(true); }}
                className="h-28 sm:h-36 rounded-xl overflow-hidden border border-[#27272A] hover:border-[#FFC500] cursor-pointer transition-all active:scale-95"
              >
                <img src={img.file_url} alt="Gallery" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. محرك التقييمات والمراجعات الحسابي الدقيق */}
      <YRReviewSystem
        entityType="business"
        entityId={businessData.id}
        initialReviews={businessData.reviews}
      />

      {/* 9. نافذة المطالبة بالملكية */}
      <ClaimOwnershipModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        entityId={businessData.id}
        entityName={businessData.name}
        entityType="business"
      />

      {/* عارض الصور باللمس Lightbox */}
      {isLightboxOpen && gallery.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-400 font-mono">{activeGalleryIndex + 1} من {gallery.length}</span>
            <button onClick={() => setIsLightboxOpen(false)} className="px-3 py-1 rounded-xl bg-[#18181C] text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold">رجوع</button>
          </div>
          <div className="flex-1 flex items-center justify-center py-4" onClick={e => e.stopPropagation()}>
            <img src={gallery[activeGalleryIndex].file_url} alt="Fullscreen" className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
};
