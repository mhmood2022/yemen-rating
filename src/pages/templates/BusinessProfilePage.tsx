import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, Globe, Mail, 
  MessageCircle, Star, ArrowRight, Check, Camera, 
  X, ExternalLink, Megaphone, ShieldCheck, Tag, ShoppingBag, Clock
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

  // جلب بيانات المنشأة بحسب الـ slug أو السجل الافتراضي
  const businessData: BusinessEntity = initialData || BusinessService.getDemoRecord();

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
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

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص #4 */}
      <AdBanner placementId="4" className="mb-1" />

      {/* 2. شريط الرجوع وزر المطالبة بالملكية وزر أعلن هنا */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5 flex-wrap gap-2">
        <button
          onClick={() => navigate('/businesses')}
          className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للمنشآت</span>
        </button>

        <div className="flex items-center gap-2">
          {/* زر المطالبة بملكية الصفحة */}
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-zinc-700 hover:border-[#FFC500] text-zinc-300 hover:text-[#FFC500] text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} className="text-[#FFC500]" />
            <span>المطالبة بملكية الصفحة</span>
          </button>

          <button
            onClick={() => navigate('/admin/ads/generator')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFC500] to-yellow-400 text-black font-black text-[11px] hover:opacity-90 transition-all flex items-center gap-1 shadow-md shadow-[#FFC500]/20 cursor-pointer"
          >
            <Megaphone size={12} />
            <span>أعلن هنا (YR Ads)</span>
          </button>
        </div>
      </div>

      {/* 3. كرت الغلاف والشعار ومعلومات المنشأة والشارة */}
      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl relative">
        
        {/* صورة الغلاف العريضة Cover Image */}
        <div className="relative h-44 sm:h-64 w-full bg-[#161619] overflow-hidden">
          <img src={businessData.cover_url} alt={businessData.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-black/30" />
        </div>

        {/* الشعار متداخل بدقة + اسم المنشأة + الشارة */}
        <div className="p-4 sm:p-5 relative -mt-12 sm:-mt-14 z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            
            <div className="flex items-end gap-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0F0F12] border-2 border-[#FFC500] p-1 shadow-2xl shrink-0 overflow-hidden">
                <img src={businessData.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-lg font-black text-white leading-tight">
                    {businessData.name}
                  </h1>
                  <YRBadge type={businessData.badge_type || 'gold'} size={18} showTooltip />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                  <span className="px-2 py-0.2 rounded bg-[#FFC500]/15 text-[#FFC500] font-bold">
                    {businessData.category_label}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><MapPin size={11} className="text-[#FFC500]" /> {businessData.city_name}</span>
                </div>
              </div>
            </div>

            {/* التقييم المحسوب رياضياً من المراجعات */}
            <div className="flex items-center gap-1.5 bg-[#161619] p-2 px-3 rounded-xl border border-[#27272A] w-fit font-mono">
              <Star size={15} className="text-[#FFC500] fill-[#FFC500]" />
              <b className="text-xs font-black text-white">{businessData.rating_summary.average}</b>
              <span className="text-[10px] text-zinc-400 font-['Cairo']">({businessData.rating_summary.count} تقييم)</span>
            </div>

          </div>

          <p className="text-xs text-zinc-300 leading-relaxed pt-1 font-medium">
            {businessData.description}
          </p>

          {/* وسائل التواصل الفورية */}
          <div className="pt-2.5 border-t border-[#222226] flex items-center gap-2 flex-wrap">
            {businessData.phone && (
              <a href={`tel:${businessData.phone}`} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#FFC500] text-xs font-bold text-white flex items-center gap-1.5 active:scale-95">
                <Phone size={13} className="text-[#FFC500]" />
                <span>اتصال: {businessData.phone}</span>
              </a>
            )}

            {businessData.whatsapp && (
              <a href={`https://wa.me/${businessData.whatsapp}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-[#16A34A]/20 border border-[#16A34A]/40 text-xs font-bold text-[#16A34A] hover:bg-[#16A34A] hover:text-white flex items-center gap-1.5 active:scale-95">
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            )}

            {businessData.website_url && (
              <a href={businessData.website_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#2EA5FF] text-xs font-bold text-[#2EA5FF] flex items-center gap-1.5">
                <Globe size={13} />
                <span>الموقع الرسمي</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

        </div>
      </div>

      {/* 4. باقة الخدمات والمنتجات أو المنيو مع الأسعار بالريال اليمني */}
      <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-[#222226] space-y-2.5 shadow-xl">
        <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 border-b border-[#222226] pb-2">
          <Tag size={14} className="text-[#FFC500]" />
          الخدمات والمنتجات وقائمة الأسعار
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {businessData.services.map((srv, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A] flex justify-between items-center text-xs">
              <span className="font-bold text-white">{srv.name}</span>
              {srv.price && (
                <div className="font-mono font-bold text-[#FFC500]">
                  {srv.price.toLocaleString()} <span className="text-[10px]">{srv.currency || 'YER'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. معرض الصور باللمس (Gallery) */}
      {gallery.length > 0 && (
        <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-[#222226] space-y-2.5 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#222226] pb-1.5">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <Camera size={14} className="text-[#FFC500]" />
              معرض الصور ({gallery.length} صور)
            </h3>
            <span className="text-[9.5px] text-zinc-400">اضغط للتكبير</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {gallery.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => { setActiveGalleryIndex(idx); setIsLightboxOpen(true); }}
                className="h-24 sm:h-32 rounded-xl overflow-hidden border border-[#27272A] hover:border-[#FFC500] cursor-pointer transition-all active:scale-95"
              >
                <img src={img.file_url} alt="Gallery" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. محرك التقييمات والمراجعات الحسابي الحقيقي */}
      <YRReviewSystem
        entityType="business"
        entityId={businessData.id}
        initialReviews={businessData.reviews}
      />

      {/* 7. نافذة المطالبة بالملكية Claim Ownership */}
      <ClaimOwnershipModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        entityId={businessData.id}
        entityName={businessData.name}
        entityType="business"
      />

      {/* 8. عارض الصور باللمس Lightbox */}
      {isLightboxOpen && gallery.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-zinc-400 font-mono">{activeGalleryIndex + 1} من {gallery.length}</span>
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
