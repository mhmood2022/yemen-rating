import React, { useState, useRef } from 'react';
import { 
  Building2, MapPin, Phone, Globe, Mail, 
  MessageCircle, Star, ArrowRight, Check, Camera, 
  X, ExternalLink, Megaphone, Tag
} from 'lucide-react';
import { BusinessEntity } from '../../types/schema.types';
import { BusinessService } from '../../services/platformServices';
import { YRBadge } from '../../components/common/YRBadge';
import { AdBanner } from '../../components/common/AdBanner';
import { YRReviewSystem } from '../../components/common/YRReviewSystem';

export const BusinessProfilePage: React.FC<{
  businessData?: BusinessEntity;
  onBack?: () => void;
  onNavigateAd?: () => void;
}> = ({
  businessData = BusinessService.getDemoRecord(),
  onBack = () => window.history.back(),
  onNavigateAd = () => {}
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const gallery = businessData.media.filter(m => m.media_type === 'image');

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="4" className="mb-1" />

      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع</span>
        </button>

        <button
          onClick={onNavigateAd}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFC500] to-yellow-400 text-black font-black text-[11px] hover:opacity-90 transition-all flex items-center gap-1 shadow-md shadow-[#FFC500]/20"
        >
          <Megaphone size={12} />
          <span>أعلن هنا (YR Ads)</span>
        </button>
      </div>

      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl relative">
        <div className="relative h-44 sm:h-64 w-full bg-[#161619]">
          <img src={businessData.cover_url} alt={businessData.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-black/30" />
        </div>

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

            <div className="flex items-center gap-1.5 bg-[#161619] p-2 px-3 rounded-xl border border-[#27272A] w-fit font-mono">
              <Star size={15} className="text-[#FFC500] fill-[#FFC500]" />
              <b className="text-xs font-black text-white">{businessData.rating_summary.average}</b>
              <span className="text-[10px] text-zinc-400 font-['Cairo']">({businessData.rating_summary.count} تقييم)</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed pt-1 font-medium">
            {businessData.description}
          </p>

          <div className="pt-2.5 border-t border-[#222226] flex items-center gap-2 flex-wrap">
            {businessData.phone && (
              <a href={`tel:${businessData.phone}`} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#FFC500] text-xs font-bold text-white flex items-center gap-1.5">
                <Phone size={13} className="text-[#FFC500]" />
                <span>اتصال: {businessData.phone}</span>
              </a>
            )}
            {businessData.whatsapp && (
              <a href={`https://wa.me/${businessData.whatsapp}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-[#16A34A]/20 border border-[#16A34A]/40 text-xs font-bold text-[#16A34A] hover:bg-[#16A34A] hover:text-white flex items-center gap-1.5">
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            )}
            {businessData.website_url && (
              <a href={businessData.website_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#2EA5FF] text-xs font-bold text-[#2EA5FF] flex items-center gap-1.5">
                <Globe size={13} />
                <span>الموقع الرسمي</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* باقة الخدمات والمنتجات */}
      <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-[#222226] space-y-2.5 shadow-xl">
        <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 border-b border-[#222226] pb-2">
          <Tag size={14} className="text-[#FFC500]" />
          الخدمات والمنتجات الرئيسية
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

      {/* معرض الصور والتقييمات */}
      <YRReviewSystem
        entityType="business"
        entityId={businessData.id}
        initialReviews={businessData.reviews}
      />
    </div>
  );
};
